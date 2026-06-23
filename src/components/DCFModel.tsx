"use client";

import { useState, useMemo } from "react";
import type { StockData } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Calculator, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  data: StockData;
}

interface Assumptions {
  revenueGrowth: number;
  terminalGrowth: number;
  operatingMargin: number;
  taxRate: number;
  wacc: number;
  projectionYears: number;
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-[var(--color-text-secondary)]">
          {label}
        </label>
        <span className="text-xs font-medium tabular-nums text-[var(--color-text-primary)]">
          {value.toFixed(step < 1 ? 1 : 0)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[var(--color-border)] accent-[var(--color-brand)]"
      />
      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-0.5">
        <span>
          {min}
          {suffix}
        </span>
        <span>
          {max}
          {suffix}
        </span>
      </div>
    </div>
  );
}

export default function DCFModel({ data }: Props) {
  const { income, quote, profile, metrics } = data;

  const latestRevenue = income[0]?.revenue ?? 0;
  const latestMargin = income[0]?.operatingIncomeRatio ?? 0.25;
  const sharesOutstanding = latestRevenue > 0 && metrics.revenuePerShareTTM > 0
    ? latestRevenue / metrics.revenuePerShareTTM
    : 15000000000;

  // Seed the default growth from the company's REAL historical revenue CAGR
  // (income is newest-first) rather than a flat 8% for every company — that
  // flat default valued hyper-growers like NVDA as if they grew 8% forever,
  // producing absurd "overvalued" verdicts. Fall back to the TTM growth, then 8%.
  const seededGrowth = (() => {
    const newest = income[0]?.revenue ?? 0;
    const oldest = income[income.length - 1]?.revenue ?? 0;
    const years = income.length - 1;
    if (newest > 0 && oldest > 0 && years >= 1) {
      const cagr = ((newest / oldest) ** (1 / years) - 1) * 100;
      if (isFinite(cagr)) return Math.max(-10, Math.min(40, cagr));
    }
    const ttm = (metrics.revenueGrowthTTM ?? 0) * 100;
    if (ttm > 0) return Math.max(-10, Math.min(40, ttm));
    return 8;
  })();

  const [assumptions, setAssumptions] = useState<Assumptions>({
    revenueGrowth: +seededGrowth.toFixed(1),
    terminalGrowth: 2.5,
    operatingMargin: +(latestMargin * 100).toFixed(1),
    taxRate: 21,
    wacc: 10,
    projectionYears: 5,
  });

  const [showDetails, setShowDetails] = useState(false);

  const update = (key: keyof Assumptions, value: number) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  };

  const dcfResult = useMemo(() => {
    const {
      revenueGrowth,
      terminalGrowth,
      operatingMargin,
      taxRate,
      wacc,
      projectionYears,
    } = assumptions;

    const growthRate = revenueGrowth / 100;
    const margin = operatingMargin / 100;
    const tax = taxRate / 100;
    const discount = wacc / 100;
    const termGrowth = terminalGrowth / 100;

    const projections = [];
    let currentRevenue = latestRevenue;

    for (let year = 1; year <= projectionYears; year++) {
      // Fade growth linearly from the starting rate toward terminal growth.
      // No company sustains peak growth forever, so a flat high rate would
      // wildly overvalue and a flat low rate would undervalue. The slider sets
      // the Year-1 rate; later years glide toward the terminal rate.
      const t = projectionYears > 1 ? (year - 1) / (projectionYears - 1) : 0;
      const yearGrowth = growthRate + (termGrowth - growthRate) * t;
      currentRevenue *= 1 + yearGrowth;
      const operatingIncome = currentRevenue * margin;
      const nopat = operatingIncome * (1 - tax);
      const fcf = nopat * 0.85;
      const discountFactor = 1 / Math.pow(1 + discount, year);
      const pvFcf = fcf * discountFactor;

      projections.push({
        year,
        revenue: currentRevenue,
        operatingIncome,
        nopat,
        fcf,
        discountFactor,
        pvFcf,
      });
    }

    const lastFcf = projections[projections.length - 1]?.fcf ?? 0;
    const terminalValue =
      (lastFcf * (1 + termGrowth)) / (discount - termGrowth);
    const pvTerminal =
      terminalValue / Math.pow(1 + discount, projectionYears);

    const totalPvFcf = projections.reduce((sum, p) => sum + p.pvFcf, 0);
    const enterpriseValue = totalPvFcf + pvTerminal;
    const netDebt = (metrics.debtToEquityTTM ?? 0) > 0
      ? enterpriseValue * 0.05
      : 0;
    const equityValue = enterpriseValue - netDebt;
    const fairValue = equityValue / sharesOutstanding;

    const upside = ((fairValue - quote.price) / quote.price) * 100;

    return {
      projections,
      terminalValue,
      pvTerminal,
      totalPvFcf,
      enterpriseValue,
      equityValue,
      fairValue,
      upside,
      sharesOutstanding,
    };
  }, [assumptions, latestRevenue, quote.price, sharesOutstanding, metrics.debtToEquityTTM]);

  const verdictColor =
    dcfResult.upside > 15
      ? "var(--color-positive)"
      : dcfResult.upside < -15
      ? "var(--color-negative)"
      : "var(--color-warning)";

  const verdictLabel =
    dcfResult.upside > 15
      ? "Undervalued"
      : dcfResult.upside < -15
      ? "Overvalued"
      : "Fairly Valued";

  const VerdictIcon =
    dcfResult.upside > 15
      ? TrendingUp
      : dcfResult.upside < -15
      ? TrendingDown
      : Minus;

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-[var(--color-brand)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            DCF Valuation Model
          </h3>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Discounted Cash Flow analysis with adjustable assumptions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-[var(--color-border)]">
        {/* Assumptions Panel */}
        <div className="p-5 space-y-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Assumptions
          </p>
          <SliderInput
            label="Initial Revenue Growth (Yr 1)"
            value={assumptions.revenueGrowth}
            min={-10}
            max={40}
            step={0.5}
            suffix="%"
            onChange={(v) => update("revenueGrowth", v)}
          />
          <p className="-mt-3 text-[10px] text-[var(--color-text-muted)]">
            Seeded from {profile.companyName.split(" ")[0]}&rsquo;s historical
            growth; fades toward the terminal rate over {assumptions.projectionYears} years.
          </p>
          <SliderInput
            label="Operating Margin"
            value={assumptions.operatingMargin}
            min={5}
            max={60}
            step={0.5}
            suffix="%"
            onChange={(v) => update("operatingMargin", v)}
          />
          <SliderInput
            label="WACC (Discount Rate)"
            value={assumptions.wacc}
            min={5}
            max={20}
            step={0.5}
            suffix="%"
            onChange={(v) => update("wacc", v)}
          />
          <SliderInput
            label="Terminal Growth Rate"
            value={assumptions.terminalGrowth}
            min={0}
            max={5}
            step={0.5}
            suffix="%"
            onChange={(v) => update("terminalGrowth", v)}
          />
          <SliderInput
            label="Tax Rate"
            value={assumptions.taxRate}
            min={0}
            max={40}
            step={1}
            suffix="%"
            onChange={(v) => update("taxRate", v)}
          />
        </div>

        {/* Result Panel */}
        <div className="p-5 flex flex-col items-center justify-center border-t lg:border-t-0 border-[var(--color-border)]">
          <div className="text-center space-y-4">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">
                Intrinsic Value per Share
              </p>
              <p className="text-4xl font-bold tabular-nums text-[var(--color-text-primary)]">
                ${dcfResult.fairValue.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1">
              <p className="text-xs text-[var(--color-text-muted)]">
                Current Price:
              </p>
              <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                ${quote.price.toFixed(2)}
              </p>
            </div>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                backgroundColor: `color-mix(in srgb, ${verdictColor} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${verdictColor} 25%, transparent)`,
              }}
            >
              <VerdictIcon size={16} style={{ color: verdictColor }} />
              <span
                className="text-sm font-semibold"
                style={{ color: verdictColor }}
              >
                {verdictLabel}
              </span>
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: verdictColor }}
              >
                ({dcfResult.upside >= 0 ? "+" : ""}
                {dcfResult.upside.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="p-5 border-t lg:border-t-0 border-[var(--color-border)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
            Valuation Breakdown
          </p>
          <div className="space-y-3">
            {[
              { label: "PV of Cash Flows", value: dcfResult.totalPvFcf },
              { label: "PV of Terminal Value", value: dcfResult.pvTerminal },
              { label: "Enterprise Value", value: dcfResult.enterpriseValue },
              { label: "Equity Value", value: dcfResult.equityValue },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-b-0"
              >
                <span className="text-xs text-[var(--color-text-muted)]">
                  {item.label}
                </span>
                <span className="text-xs font-medium tabular-nums text-[var(--color-text-secondary)]">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-[var(--color-text-muted)]">
                Terminal Value % of EV
              </span>
              <span className="text-xs font-medium tabular-nums text-[var(--color-text-secondary)]">
                {(
                  (dcfResult.pvTerminal / dcfResult.enterpriseValue) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Table Toggle */}
      <div className="border-t border-[var(--color-border)]">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-5 py-3 flex items-center justify-between text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          <span>
            {showDetails ? "Hide" : "Show"} Year-by-Year Projections
          </span>
          {showDetails ? (
            <ChevronUp size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </button>

        {showDetails && (
          <div className="overflow-x-auto border-t border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2.5 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Year
                  </th>
                  <th className="text-right py-2.5 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="text-right py-2.5 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Op. Income
                  </th>
                  <th className="text-right py-2.5 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    NOPAT
                  </th>
                  <th className="text-right py-2.5 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    FCF
                  </th>
                  <th className="text-right py-2.5 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    PV of FCF
                  </th>
                </tr>
              </thead>
              <tbody>
                {dcfResult.projections.map((p) => (
                  <tr
                    key={p.year}
                    className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <td className="py-2 px-5 text-[var(--color-text-secondary)]">
                      Year {p.year}
                    </td>
                    <td className="py-2 px-5 text-right tabular-nums text-[var(--color-text-secondary)]">
                      {formatCurrency(p.revenue)}
                    </td>
                    <td className="py-2 px-5 text-right tabular-nums text-[var(--color-text-secondary)]">
                      {formatCurrency(p.operatingIncome)}
                    </td>
                    <td className="py-2 px-5 text-right tabular-nums text-[var(--color-text-secondary)]">
                      {formatCurrency(p.nopat)}
                    </td>
                    <td className="py-2 px-5 text-right tabular-nums text-[var(--color-text-secondary)]">
                      {formatCurrency(p.fcf)}
                    </td>
                    <td className="py-2 px-5 text-right tabular-nums font-medium text-[var(--color-text-primary)]">
                      {formatCurrency(p.pvFcf)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-[var(--color-surface)]/40">
                  <td className="py-2 px-5 text-[var(--color-text-secondary)] font-medium">
                    Terminal
                  </td>
                  <td colSpan={4} />
                  <td className="py-2 px-5 text-right tabular-nums font-bold text-[var(--color-brand)]">
                    {formatCurrency(dcfResult.pvTerminal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
