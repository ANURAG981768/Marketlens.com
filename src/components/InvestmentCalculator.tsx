"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  Percent,
  PiggyBank,
  ArrowRight,
  Info,
} from "lucide-react";

type CalcMode = "compound" | "dca" | "goal";

function formatCur(v: number): string {
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

export default function InvestmentCalculator() {
  const [mode, setMode] = useState<CalcMode>("compound");

  // Compound Growth
  const [initial, setInitial] = useState("10000");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("20");
  const [contribution, setContribution] = useState("200");

  // DCA
  const [dcaMonthly, setDcaMonthly] = useState("500");
  const [dcaRate, setDcaRate] = useState("10");
  const [dcaYears, setDcaYears] = useState("20");

  // Goal
  const [goalTarget, setGoalTarget] = useState("1000000");
  const [goalRate, setGoalRate] = useState("10");
  const [goalYears, setGoalYears] = useState("25");
  const [goalInitial, setGoalInitial] = useState("5000");

  const compoundResult = useMemo(() => {
    const p = parseFloat(initial) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = parseInt(years) || 0;
    const c = parseFloat(contribution) || 0;

    const breakdown: { year: number; balance: number; invested: number; gains: number }[] = [];
    let balance = p;
    let totalInvested = p;

    for (let y = 1; y <= n; y++) {
      balance = balance * (1 + r) + c * 12;
      totalInvested += c * 12;
      breakdown.push({
        year: y,
        balance,
        invested: totalInvested,
        gains: balance - totalInvested,
      });
    }

    return {
      finalBalance: balance,
      totalInvested,
      totalGains: balance - totalInvested,
      breakdown,
    };
  }, [initial, rate, years, contribution]);

  const dcaResult = useMemo(() => {
    const monthly = parseFloat(dcaMonthly) || 0;
    const r = (parseFloat(dcaRate) || 0) / 100 / 12;
    const months = (parseInt(dcaYears) || 0) * 12;

    let balance = 0;
    const totalInvested = monthly * months;

    for (let m = 1; m <= months; m++) {
      balance = (balance + monthly) * (1 + r);
    }

    return {
      finalBalance: balance,
      totalInvested,
      totalGains: balance - totalInvested,
      monthlyAmount: monthly,
    };
  }, [dcaMonthly, dcaRate, dcaYears]);

  const goalResult = useMemo(() => {
    const target = parseFloat(goalTarget) || 0;
    const r = (parseFloat(goalRate) || 0) / 100 / 12;
    const months = (parseInt(goalYears) || 0) * 12;
    const init = parseFloat(goalInitial) || 0;

    if (months <= 0 || r <= 0) return { monthlyNeeded: 0, totalInvested: 0, totalGains: 0 };

    const futureInit = init * Math.pow(1 + r, months);
    const remaining = target - futureInit;

    const monthlyNeeded =
      remaining > 0 ? remaining / ((Math.pow(1 + r, months) - 1) / r) : 0;

    const totalInvested = init + monthlyNeeded * months;

    return {
      monthlyNeeded: Math.max(0, monthlyNeeded),
      totalInvested,
      totalGains: target - totalInvested,
    };
  }, [goalTarget, goalRate, goalYears, goalInitial]);

  const maxBalance = compoundResult.breakdown.length > 0
    ? Math.max(...compoundResult.breakdown.map((b) => b.balance))
    : 1;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center py-6 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
          <Calculator size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Investment Calculator</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          See the power of compound interest and plan your financial future
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-1.5 bg-[var(--color-surface-card)] p-1 rounded-xl mb-6 max-w-md mx-auto">
        {[
          { key: "compound" as CalcMode, label: "Compound Growth", icon: TrendingUp },
          { key: "dca" as CalcMode, label: "DCA Calculator", icon: PiggyBank },
          { key: "goal" as CalcMode, label: "Goal Planner", icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              mode === tab.key
                ? "bg-white text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 bg-white border border-[var(--color-border)] rounded-xl p-5 shadow-sm h-fit">
          {mode === "compound" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold mb-4">Compound Growth Calculator</h3>
              <div>
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                  Initial Investment
                </label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="number"
                    value={initial}
                    onChange={(e) => setInitial(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                  Monthly Contribution
                </label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="number"
                    value={contribution}
                    onChange={(e) => setContribution(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                    Annual Return %
                  </label>
                  <div className="relative">
                    <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                    Years
                  </label>
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                  />
                </div>
              </div>
              <div className="pt-2 flex items-start gap-2 text-[10px] text-[var(--color-text-muted)]">
                <Info size={12} className="shrink-0 mt-0.5" />
                S&P 500 historical average: ~10% annually. Adjust for different scenarios.
              </div>
            </div>
          )}

          {mode === "dca" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold mb-4">Dollar-Cost Averaging</h3>
              <div>
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                  Monthly Investment
                </label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="number"
                    value={dcaMonthly}
                    onChange={(e) => setDcaMonthly(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                    Annual Return %
                  </label>
                  <div className="relative">
                    <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="number"
                      value={dcaRate}
                      onChange={(e) => setDcaRate(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                    Years
                  </label>
                  <input
                    type="number"
                    value={dcaYears}
                    onChange={(e) => setDcaYears(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                  />
                </div>
              </div>
              <div className="pt-2 flex items-start gap-2 text-[10px] text-[var(--color-text-muted)]">
                <Info size={12} className="shrink-0 mt-0.5" />
                DCA reduces risk by investing a fixed amount at regular intervals regardless of price.
              </div>
            </div>
          )}

          {mode === "goal" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold mb-4">Goal Planner</h3>
              <div>
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                  Target Amount
                </label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                  Starting Amount
                </label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                  <input
                    type="number"
                    value={goalInitial}
                    onChange={(e) => setGoalInitial(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                    Annual Return %
                  </label>
                  <div className="relative">
                    <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input
                      type="number"
                      value={goalRate}
                      onChange={(e) => setGoalRate(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 block">
                    Years
                  </label>
                  <input
                    type="number"
                    value={goalYears}
                    onChange={(e) => setGoalYears(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/30"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          {mode === "compound" && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                    Final Balance
                  </p>
                  <p className="text-lg font-bold text-[var(--color-brand)]">
                    {formatCur(compoundResult.finalBalance)}
                  </p>
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                    Total Invested
                  </p>
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">
                    {formatCur(compoundResult.totalInvested)}
                  </p>
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                    Total Gains
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCur(compoundResult.totalGains)}
                  </p>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold mb-4">Growth Over Time</h4>
                <div className="space-y-1.5">
                  {compoundResult.breakdown
                    .filter((_, i) => {
                      const total = compoundResult.breakdown.length;
                      if (total <= 10) return true;
                      if (total <= 20) return i % 2 === 0 || i === total - 1;
                      return i % 5 === 0 || i === total - 1;
                    })
                    .map((row) => {
                      const investedPct = (row.invested / maxBalance) * 100;
                      const gainsPct = ((row.balance - row.invested) / maxBalance) * 100;
                      return (
                        <div key={row.year} className="flex items-center gap-3">
                          <span className="text-[10px] text-[var(--color-text-muted)] w-10 text-right shrink-0">
                            Yr {row.year}
                          </span>
                          <div className="flex-1 h-5 bg-[var(--color-surface-card)] rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-blue-400 transition-all"
                              style={{ width: `${investedPct}%` }}
                            />
                            <div
                              className="h-full bg-emerald-400 transition-all"
                              style={{ width: `${gainsPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold w-16 text-right shrink-0">
                            {formatCur(row.balance)}
                          </span>
                        </div>
                      );
                    })}
                </div>
                <div className="flex items-center gap-4 mt-3 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-400" />
                    <span className="text-[10px] text-[var(--color-text-muted)]">Invested</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                    <span className="text-[10px] text-[var(--color-text-muted)]">Gains</span>
                  </div>
                </div>
              </div>

              {/* Insight */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-xs text-emerald-700">
                  <span className="font-bold">The power of compounding:</span>{" "}
                  Your {formatCur(compoundResult.totalInvested)} invested grows to{" "}
                  {formatCur(compoundResult.finalBalance)} — that&apos;s{" "}
                  <span className="font-bold">
                    {compoundResult.totalInvested > 0
                      ? ((compoundResult.totalGains / compoundResult.totalInvested) * 100).toFixed(0)
                      : 0}
                    % in pure gains
                  </span>{" "}
                  from compound interest alone.
                </p>
              </div>
            </>
          )}

          {mode === "dca" && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                    Final Balance
                  </p>
                  <p className="text-lg font-bold text-[var(--color-brand)]">
                    {formatCur(dcaResult.finalBalance)}
                  </p>
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                    Total Invested
                  </p>
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">
                    {formatCur(dcaResult.totalInvested)}
                  </p>
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                    Total Gains
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatCur(dcaResult.totalGains)}
                  </p>
                </div>
              </div>

              {/* Pie-like breakdown */}
              <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold mb-4">Portfolio Breakdown</h4>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {(() => {
                        const total = dcaResult.finalBalance || 1;
                        const investedPct = (dcaResult.totalInvested / total) * 100;
                        const circumference = 2 * Math.PI * 40;
                        const investedLen = (investedPct / 100) * circumference;
                        const gainsLen = circumference - investedLen;
                        return (
                          <>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#60a5fa" strokeWidth="16"
                              strokeDasharray={`${investedLen} ${circumference}`}
                            />
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#34d399" strokeWidth="16"
                              strokeDasharray={`${gainsLen} ${circumference}`}
                              strokeDashoffset={`-${investedLen}`}
                            />
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-xs font-bold text-[var(--color-text-primary)]">
                        {dcaResult.totalInvested > 0
                          ? ((dcaResult.totalGains / dcaResult.totalInvested) * 100).toFixed(0)
                          : 0}
                        %<br />
                        <span className="text-[9px] font-normal text-[var(--color-text-muted)]">gains</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                        <span className="text-xs text-[var(--color-text-muted)]">Your Contributions</span>
                      </div>
                      <p className="text-sm font-bold">{formatCur(dcaResult.totalInvested)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                        <span className="text-xs text-[var(--color-text-muted)]">Investment Gains</span>
                      </div>
                      <p className="text-sm font-bold text-emerald-600">{formatCur(dcaResult.totalGains)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-blue-700">
                  <span className="font-bold">DCA strategy:</span>{" "}
                  By investing ${dcaMonthly}/month consistently for {dcaYears} years, you build{" "}
                  {formatCur(dcaResult.finalBalance)} — even without timing the market.
                </p>
              </div>
            </>
          )}

          {mode === "goal" && (
            <>
              <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm text-center">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                  Monthly Savings Needed
                </p>
                <p className="text-3xl font-bold text-[var(--color-brand)]">
                  ${goalResult.monthlyNeeded.toFixed(2)}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  per month to reach {formatCur(parseFloat(goalTarget) || 0)} in {goalYears} years
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                    Total You&apos;ll Invest
                  </p>
                  <p className="text-sm font-bold">{formatCur(goalResult.totalInvested)}</p>
                </div>
                <div className="bg-white border border-[var(--color-border)] rounded-xl p-4 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                    Market Will Add
                  </p>
                  <p className="text-sm font-bold text-emerald-600">{formatCur(goalResult.totalGains)}</p>
                </div>
              </div>

              <div className="bg-white border border-[var(--color-border)] rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-bold mb-3">Alternative Scenarios</h4>
                <div className="space-y-2">
                  {[5, 10, 15, 20, 30].map((yr) => {
                    const target = parseFloat(goalTarget) || 0;
                    const r = (parseFloat(goalRate) || 0) / 100 / 12;
                    const months = yr * 12;
                    const init = parseFloat(goalInitial) || 0;
                    if (months <= 0 || r <= 0) return null;
                    const futureInit = init * Math.pow(1 + r, months);
                    const remaining = target - futureInit;
                    const monthly = remaining > 0 ? remaining / ((Math.pow(1 + r, months) - 1) / r) : 0;

                    return (
                      <div key={yr} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                        <span className="text-xs text-[var(--color-text-secondary)]">{yr} years</span>
                        <span className="text-xs font-bold">
                          ${Math.max(0, monthly).toFixed(2)}/mo
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <p className="text-xs text-violet-700">
                  <span className="font-bold">Time is your greatest asset:</span>{" "}
                  Starting earlier dramatically reduces how much you need to save each month.
                  Compare the scenarios above to see the difference.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
