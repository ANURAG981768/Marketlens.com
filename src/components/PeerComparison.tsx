"use client";

import { formatRatio, formatPercent, formatCurrency, formatPrice } from "@/lib/format";
import { Crown } from "lucide-react";

interface PeerData {
  symbol: string;
  isTarget: boolean;
  profile: {
    companyName: string;
    industry: string;
    mktCap: number;
    price: number;
    changes: number;
  };
  metrics: {
    peRatioTTM: number;
    priceToSalesRatioTTM: number;
    pbRatioTTM: number;
    evToEbitdaTTM: number;
    returnOnEquityTTM: number;
    returnOnAssetsTTM: number;
    debtToEquityTTM: number;
    currentRatioTTM: number;
    dividendYieldTTM: number;
  };
}

interface Props {
  peers: PeerData[];
}

interface MetricDef {
  label: string;
  key: string;
  format: (v: number) => string;
  lowerBetter?: boolean;
}

const METRICS: MetricDef[] = [
  { label: "P/E Ratio", key: "peRatioTTM", format: formatRatio, lowerBetter: true },
  { label: "P/S Ratio", key: "priceToSalesRatioTTM", format: formatRatio, lowerBetter: true },
  { label: "P/B Ratio", key: "pbRatioTTM", format: formatRatio, lowerBetter: true },
  { label: "EV/EBITDA", key: "evToEbitdaTTM", format: formatRatio, lowerBetter: true },
  { label: "ROE", key: "returnOnEquityTTM", format: formatPercent },
  { label: "ROA", key: "returnOnAssetsTTM", format: formatPercent },
  { label: "Debt/Equity", key: "debtToEquityTTM", format: formatRatio, lowerBetter: true },
  { label: "Current Ratio", key: "currentRatioTTM", format: formatRatio },
  { label: "Div. Yield", key: "dividendYieldTTM", format: formatPercent },
];

function getBestIndex(values: number[], lowerBetter?: boolean): number {
  const valid = values.map((v, i) => ({ v, i })).filter((x) => isFinite(x.v) && x.v > 0);
  if (!valid.length) return -1;
  valid.sort((a, b) => (lowerBetter ? a.v - b.v : b.v - a.v));
  return valid[0].i;
}

export default function PeerComparison({ peers }: Props) {
  if (!peers.length) return null;

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden">
      <div className="p-5 border-b border-[var(--color-border)]">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Peer Comparison
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Side-by-side analysis against industry peers
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-3 px-5 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider sticky left-0 bg-[var(--color-surface-elevated)] z-10">
                Metric
              </th>
              {peers.map((peer) => (
                <th
                  key={peer.symbol}
                  className={`text-right py-3 px-5 text-xs font-medium uppercase tracking-wider whitespace-nowrap ${
                    peer.isTarget
                      ? "text-[var(--color-brand)] bg-[var(--color-brand)]/5"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  <div>{peer.symbol}</div>
                  <div className="font-normal normal-case text-[10px] mt-0.5 opacity-60">
                    {peer.profile.industry}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Market Cap row */}
            <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
              <td className="py-2.5 px-5 text-[var(--color-text-secondary)] sticky left-0 bg-[var(--color-surface-elevated)]">
                Market Cap
              </td>
              {peers.map((peer) => (
                <td
                  key={peer.symbol}
                  className={`py-2.5 px-5 text-right tabular-nums ${
                    peer.isTarget
                      ? "text-[var(--color-text-primary)] font-medium bg-[var(--color-brand)]/5"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {formatCurrency(peer.profile.mktCap)}
                </td>
              ))}
            </tr>
            {/* Price row */}
            <tr className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] transition-colors">
              <td className="py-2.5 px-5 text-[var(--color-text-secondary)] sticky left-0 bg-[var(--color-surface-elevated)]">
                Price
              </td>
              {peers.map((peer) => (
                <td
                  key={peer.symbol}
                  className={`py-2.5 px-5 text-right tabular-nums ${
                    peer.isTarget
                      ? "text-[var(--color-text-primary)] font-medium bg-[var(--color-brand)]/5"
                      : "text-[var(--color-text-secondary)]"
                  }`}
                >
                  {formatPrice(peer.profile.price)}
                </td>
              ))}
            </tr>
            {/* Metric rows */}
            {METRICS.map((metric) => {
              const values = peers.map(
                (p) => (p.metrics as Record<string, number>)[metric.key] ?? 0
              );
              const bestIdx = getBestIndex(values, metric.lowerBetter);

              return (
                <tr
                  key={metric.key}
                  className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <td className="py-2.5 px-5 text-[var(--color-text-secondary)] sticky left-0 bg-[var(--color-surface-elevated)]">
                    {metric.label}
                  </td>
                  {peers.map((peer, i) => {
                    const val =
                      (peer.metrics as Record<string, number>)[metric.key] ?? 0;
                    const isBest = i === bestIdx;
                    return (
                      <td
                        key={peer.symbol}
                        className={`py-2.5 px-5 text-right tabular-nums ${
                          peer.isTarget
                            ? "font-medium bg-[var(--color-brand)]/5"
                            : ""
                        } ${
                          isBest
                            ? "text-[var(--color-positive)]"
                            : peer.isTarget
                            ? "text-[var(--color-text-primary)]"
                            : "text-[var(--color-text-secondary)]"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {metric.format(val)}
                          {isBest && (
                            <Crown
                              size={11}
                              className="text-[var(--color-warning)]"
                            />
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
