"use client";

import { useState } from "react";
import { Search, BookOpen, TrendingUp, TrendingDown, Info, ChevronDown, ChevronUp, BarChart3, Target, Shield, DollarSign, Percent } from "lucide-react";

interface RatioDefinition {
  name: string;
  abbreviation: string;
  category: string;
  formula: string;
  value: string;
  interpretation: string;
  whyItMatters: string;
  goodRange: string;
  example: string;
  relatedRatios: string[];
  icon: string;
}

const RATIO_CATEGORIES = ["All", "Valuation", "Profitability", "Liquidity", "Leverage", "Efficiency", "Growth"];

const RATIOS: RatioDefinition[] = [
  {
    name: "Price-to-Earnings Ratio",
    abbreviation: "P/E",
    category: "Valuation",
    formula: "Stock Price ÷ Earnings Per Share (EPS)",
    value: "Apple: 33.5x",
    interpretation: "You're paying $33.50 for every $1 of Apple's annual earnings. A high P/E suggests investors expect strong future growth. A low P/E might mean the stock is cheap — or that investors see trouble ahead.",
    whyItMatters: "P/E is the first ratio most investors check. It gives you a quick read on whether the market is pricing a stock for growth or value. Compare it to the industry average — if a company's P/E is way above peers, there should be a growth story to justify it.",
    goodRange: "S&P 500 average: 15-20x. Growth stocks: 25-50x. Value stocks: 8-15x. Negative P/E = company is unprofitable.",
    example: "NVDA trades at 65x P/E because investors expect AI chip revenue to keep growing 50%+/year. WMT trades at 28x — more modest growth but extremely stable.",
    relatedRatios: ["PEG Ratio", "Forward P/E", "Earnings Yield"],
    icon: "💰",
  },
  {
    name: "Price-to-Earnings-Growth",
    abbreviation: "PEG",
    category: "Valuation",
    formula: "P/E Ratio ÷ Expected Annual EPS Growth Rate",
    value: "Apple: 2.1x",
    interpretation: "A PEG of 1.0 means the stock is fairly valued relative to its growth. Below 1.0 suggests undervaluation. Above 2.0 may indicate overvaluation — unless there's an exceptionally strong moat.",
    whyItMatters: "PEG fixes the biggest weakness of P/E by accounting for growth. A stock with P/E of 40 and 40% growth (PEG = 1.0) is cheaper than one with P/E of 20 and 10% growth (PEG = 2.0).",
    goodRange: "Below 1.0: Potentially undervalued. 1.0-1.5: Fairly valued. Above 2.0: Potentially expensive.",
    example: "Peter Lynch popularized this ratio. He looked for stocks with PEG below 1.0 — growing fast but still reasonably priced.",
    relatedRatios: ["P/E Ratio", "EPS Growth Rate"],
    icon: "📈",
  },
  {
    name: "Price-to-Sales Ratio",
    abbreviation: "P/S",
    category: "Valuation",
    formula: "Market Capitalization ÷ Total Revenue",
    value: "Apple: 8.3x",
    interpretation: "Investors are paying $8.30 for every $1 of Apple's annual revenue. P/S is especially useful for unprofitable companies where P/E doesn't work (negative earnings make P/E meaningless).",
    whyItMatters: "Revenue is much harder to manipulate than earnings. P/S gives you a cleaner signal for companies that are investing heavily in growth and not yet profitable.",
    goodRange: "Below 1.0: Potentially undervalued. 1-5x: Reasonable for most sectors. Above 10x: Only justified by very high margins and growth.",
    example: "When Snowflake (SNOW) IPO'd at 100x P/S, investors were betting on massive future revenue growth from cloud data. High-margin SaaS companies often trade at 10-20x P/S.",
    relatedRatios: ["P/E Ratio", "EV/Revenue"],
    icon: "🏷️",
  },
  {
    name: "Price-to-Book Ratio",
    abbreviation: "P/B",
    category: "Valuation",
    formula: "Stock Price ÷ Book Value Per Share",
    value: "Apple: 62.4x",
    interpretation: "You're paying 62x the book value (assets minus liabilities) for Apple shares. Tech companies often have high P/B because their real value is in intellectual property and brand — not physical assets on the balance sheet.",
    whyItMatters: "P/B is most useful for asset-heavy industries like banks, insurance, and real estate. A bank trading below 1.0x P/B might be undervalued — or might have bad loans hidden on its books.",
    goodRange: "Banks: 1.0-2.0x typical. Tech: 5-50x common (intangible assets). Below 1.0: Trading below liquidation value.",
    example: "During the 2008 crisis, many banks traded below 1.0x P/B — investors feared their assets were worth less than stated. Warren Buffett bought Goldman Sachs at that point.",
    relatedRatios: ["Return on Equity", "Tangible Book Value"],
    icon: "📚",
  },
  {
    name: "Enterprise Value to EBITDA",
    abbreviation: "EV/EBITDA",
    category: "Valuation",
    formula: "(Market Cap + Total Debt − Cash) ÷ EBITDA",
    value: "Apple: 26.1x",
    interpretation: "EV/EBITDA accounts for a company's debt and cash, making it better than P/E for comparing companies with different capital structures. A leveraged buyout firm would pay off the debt from EBITDA.",
    whyItMatters: "This is the preferred valuation metric for M&A analysis and private equity. When a company acquires another, they take on the target's debt — EV reflects the true acquisition price.",
    goodRange: "Below 10x: Potentially cheap. 10-15x: Fair for most sectors. 15-25x: Growth premium. Above 25x: Very expensive.",
    example: "When Elon Musk bought Twitter, he paid roughly 26x EV/EBITDA — considered expensive for a social media company with slowing growth.",
    relatedRatios: ["P/E Ratio", "EV/Revenue", "EBITDA Margin"],
    icon: "🏢",
  },
  {
    name: "Return on Equity",
    abbreviation: "ROE",
    category: "Profitability",
    formula: "Net Income ÷ Shareholders' Equity × 100",
    value: "Apple: 157%",
    interpretation: "Apple generates $1.57 in profit for every $1 of shareholders' equity. Extremely high ROE can indicate a very profitable business — but also high leverage (more debt = less equity in the denominator).",
    whyItMatters: "ROE measures how efficiently management uses shareholder capital to generate profit. Consistently high ROE (above 15%) indicates a competitive moat. Buffett loves companies with ROE above 20%.",
    goodRange: "Above 20%: Excellent. 15-20%: Good. 10-15%: Average. Below 10%: Poor capital efficiency.",
    example: "Apple's 157% ROE is partly because they've bought back so much stock that equity is very low relative to earnings. Compare to a bank like JPM at ~15% ROE — still excellent for banking.",
    relatedRatios: ["Return on Assets", "Return on Invested Capital", "Debt-to-Equity"],
    icon: "🎯",
  },
  {
    name: "Return on Assets",
    abbreviation: "ROA",
    category: "Profitability",
    formula: "Net Income ÷ Total Assets × 100",
    value: "Apple: 28.5%",
    interpretation: "Apple generates $0.285 in profit for every $1 of assets it owns. ROA strips out the effects of leverage, giving a cleaner picture of operational efficiency than ROE.",
    whyItMatters: "ROA tells you how efficiently a company uses all its resources (not just equity) to generate profit. It's especially useful for comparing companies in the same industry with different levels of debt.",
    goodRange: "Above 10%: Excellent. 5-10%: Good. 2-5%: Average for asset-heavy industries. Below 2%: Weak.",
    example: "Software companies often have ROA above 15% because they don't need factories or inventory. Airlines and utilities might have ROA of 2-3% because they need massive physical assets.",
    relatedRatios: ["Return on Equity", "Asset Turnover", "Net Margin"],
    icon: "⚡",
  },
  {
    name: "Net Profit Margin",
    abbreviation: "Net Margin",
    category: "Profitability",
    formula: "Net Income ÷ Revenue × 100",
    value: "Apple: 24.0%",
    interpretation: "Apple keeps $0.24 as profit from every $1 of revenue after all expenses, taxes, and interest. This is excellent — most companies operate at 5-15% net margin.",
    whyItMatters: "Net margin shows the bottom-line profitability. A company with high and expanding margins has pricing power and operating leverage — it can grow profits faster than revenue.",
    goodRange: "Above 20%: Exceptional (tech, pharma). 10-20%: Strong. 5-10%: Average. Below 5%: Thin margins (retail, airlines).",
    example: "Microsoft has ~35% net margin because software has near-zero marginal costs. Walmart operates at ~2.5% margin but makes it up on enormous volume — $600B+ revenue.",
    relatedRatios: ["Gross Margin", "Operating Margin", "EBITDA Margin"],
    icon: "💎",
  },
  {
    name: "Gross Profit Margin",
    abbreviation: "Gross Margin",
    category: "Profitability",
    formula: "(Revenue − Cost of Goods Sold) ÷ Revenue × 100",
    value: "Apple: 46.2%",
    interpretation: "Apple retains $0.46 from every $1 of revenue after paying for the direct cost of making its products. The remaining 54 cents covers R&D, marketing, salaries, and other operating expenses.",
    whyItMatters: "Gross margin reveals pricing power. A company that can charge premium prices relative to production costs has a moat. Declining gross margins often signal increasing competition or rising input costs.",
    goodRange: "Software: 70-90%. Consumer tech: 35-50%. Retail: 25-35%. Grocery: 25-30%.",
    example: "Luxury brand Hermès has 70%+ gross margins — customers pay huge premiums for the brand. Costco operates at ~13% because their model is high volume, low markup.",
    relatedRatios: ["Net Margin", "Operating Margin", "Cost of Revenue"],
    icon: "📊",
  },
  {
    name: "Current Ratio",
    abbreviation: "CR",
    category: "Liquidity",
    formula: "Current Assets ÷ Current Liabilities",
    value: "Apple: 0.87x",
    interpretation: "Apple has $0.87 in short-term assets for every $1 of short-term obligations. Below 1.0 seems concerning, but Apple's massive cash flow generation means it can easily cover obligations.",
    whyItMatters: "Current ratio measures whether a company can pay its bills due within the next 12 months. It's a basic solvency check — if this drops too low, the company may face a liquidity crisis.",
    goodRange: "1.5-3.0: Healthy. 1.0-1.5: Adequate. Below 1.0: May need monitoring. Above 3.0: May be holding too much idle cash.",
    example: "During COVID, airlines saw current ratios plunge below 0.5 as revenue evaporated but bills kept coming. Many needed government bailouts to survive.",
    relatedRatios: ["Quick Ratio", "Cash Ratio", "Working Capital"],
    icon: "💧",
  },
  {
    name: "Debt-to-Equity Ratio",
    abbreviation: "D/E",
    category: "Leverage",
    formula: "Total Debt ÷ Shareholders' Equity",
    value: "Apple: 1.87x",
    interpretation: "Apple has $1.87 of debt for every $1 of equity. This seems high, but Apple borrows at very low rates and uses cheap debt to fund buybacks rather than repatriating overseas cash.",
    whyItMatters: "D/E shows how much a company relies on borrowed money. High debt amplifies returns in good times but magnifies losses in downturns. It's the financial equivalent of leverage in physics.",
    goodRange: "Below 0.5: Conservative. 0.5-1.0: Moderate. 1.0-2.0: Aggressive. Above 2.0: Highly leveraged.",
    example: "Utilities often have D/E of 1.5-2.5 because their stable cash flows can support heavy debt. Tech startups should have low D/E because their revenue is uncertain.",
    relatedRatios: ["Interest Coverage", "Debt-to-Assets", "Net Debt/EBITDA"],
    icon: "⚖️",
  },
  {
    name: "Interest Coverage Ratio",
    abbreviation: "ICR",
    category: "Leverage",
    formula: "EBIT ÷ Interest Expense",
    value: "Apple: 29.2x",
    interpretation: "Apple earns 29x more than it needs to cover interest payments — extremely safe. This means Apple could see earnings drop 96% and still be able to pay its interest bills.",
    whyItMatters: "If this ratio drops below 1.5, the company may struggle to meet interest payments, raising bankruptcy risk. Lenders and credit rating agencies watch this closely.",
    goodRange: "Above 10x: Very safe. 5-10x: Comfortable. 2-5x: Adequate. Below 1.5: Danger zone.",
    example: "Before going bankrupt, many companies see interest coverage drop below 1.0 — they literally can't afford their debt payments from operating income. This happened to many oil companies when crude crashed in 2020.",
    relatedRatios: ["Debt-to-Equity", "Net Debt/EBITDA", "Free Cash Flow"],
    icon: "🛡️",
  },
  {
    name: "Dividend Yield",
    abbreviation: "Div Yield",
    category: "Efficiency",
    formula: "Annual Dividends Per Share ÷ Stock Price × 100",
    value: "Apple: 0.47%",
    interpretation: "For every $100 invested in Apple, you'd receive $0.47 in annual dividends. Apple's yield is low because it prioritizes buybacks over dividends, and its stock price has risen so much.",
    whyItMatters: "Dividend yield is passive income from your investment. For retirees, high-yield stocks provide regular cash. For growth investors, a low yield reinvested can compound significantly over decades.",
    goodRange: "Growth stocks: 0-1.5%. Balanced: 1.5-3%. Income: 3-5%. Above 6%: May be unsustainable (dividend trap).",
    example: "AT&T offered 7%+ yield for years but eventually had to cut the dividend. Very high yields can be a trap — the price may be dropping because the business is deteriorating.",
    relatedRatios: ["Payout Ratio", "Dividend Growth Rate", "Free Cash Flow Yield"],
    icon: "🌱",
  },
  {
    name: "Free Cash Flow Yield",
    abbreviation: "FCF Yield",
    category: "Efficiency",
    formula: "Free Cash Flow Per Share ÷ Stock Price × 100",
    value: "Apple: 3.24%",
    interpretation: "Apple generates free cash equal to 3.24% of its market value each year. This cash can be returned to shareholders via dividends and buybacks, or reinvested in the business.",
    whyItMatters: "FCF yield tells you the real cash return the business generates relative to its price. A high FCF yield means the company is a cash machine relative to its valuation — often a sign of undervaluation.",
    goodRange: "Above 8%: Potentially undervalued. 4-8%: Fair. 2-4%: Growth premium. Below 2%: Expensive.",
    example: "Meta (META) had an FCF yield above 8% in late 2022 when investors feared the metaverse spending. Those who bought based on FCF yield saw massive returns as the stock tripled.",
    relatedRatios: ["Dividend Yield", "Earnings Yield", "P/FCF"],
    icon: "💵",
  },
  {
    name: "Revenue Growth Rate",
    abbreviation: "Rev Growth",
    category: "Growth",
    formula: "(Current Revenue − Prior Revenue) ÷ Prior Revenue × 100",
    value: "Apple: 2.0% YoY",
    interpretation: "Apple's revenue grew 2% year-over-year — modest for a tech giant but impressive given its massive $391B revenue base. Growing a small company fast is easy; growing a $3T company at all is hard.",
    whyItMatters: "Revenue growth is the lifeblood of stock appreciation. Without top-line growth, a company must rely on margin expansion or financial engineering (buybacks) to grow EPS.",
    goodRange: "High growth: 20%+. Moderate: 10-20%. Slow: 0-10%. Declining: Negative (red flag).",
    example: "NVDA grew revenue 122% in 2024 thanks to AI chip demand — that's why its stock tripled. Meanwhile, Intel's revenue declined 14%, and its stock suffered.",
    relatedRatios: ["EPS Growth", "EBITDA Growth", "P/S Ratio"],
    icon: "🚀",
  },
  {
    name: "Earnings Per Share Growth",
    abbreviation: "EPS Growth",
    category: "Growth",
    formula: "(Current EPS − Prior EPS) ÷ Prior EPS × 100",
    value: "Apple: 9.5% YoY",
    interpretation: "Apple's earnings per share grew 9.5% — faster than revenue (2%) because of margin expansion and share buybacks reducing the denominator. This is financial engineering at its finest.",
    whyItMatters: "EPS growth is the single most important driver of stock prices over time. Companies that consistently grow EPS at 15%+ tend to deliver exceptional long-term returns.",
    goodRange: "Above 20%: High growth. 10-20%: Solid. 5-10%: Moderate. Negative: Earnings declining.",
    example: "Over 30 years, Berkshire Hathaway grew book value per share at ~20%/year. That consistent compounding turned a $10,000 investment into over $2 million.",
    relatedRatios: ["Revenue Growth", "PEG Ratio", "Net Margin Trend"],
    icon: "📈",
  },
];

export default function RatioExplainer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedRatio, setExpandedRatio] = useState<string | null>(null);

  const filtered = RATIOS.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.abbreviation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
          <BookOpen size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">Financial Ratio Guide</h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            {RATIOS.length} essential ratios with real examples
          </p>
        </div>
      </div>

      {/* Educational Banner */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-cyan-50 border border-cyan-100">
        <Info size={14} className="text-cyan-600 mt-0.5 shrink-0" />
        <div className="text-xs text-cyan-800 leading-relaxed">
          <strong>How to use this guide:</strong> Each ratio includes Apple (AAPL) as a real-world example, the formula, what good/bad looks like, and why professional analysts care about it. Tap any ratio to expand the full breakdown.
        </div>
      </div>

      {/* Search + Category Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search ratios... (e.g., P/E, ROE, margin)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:border-[var(--color-brand)]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RATIO_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[var(--color-brand)] text-white shadow-sm"
                  : "bg-white border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-[var(--color-text-muted)]">
        Showing <span className="font-semibold text-[var(--color-brand)]">{filtered.length}</span> ratios
        {activeCategory !== "All" && ` in ${activeCategory}`}
      </p>

      {/* Ratio Cards */}
      <div className="space-y-2.5">
        {filtered.map((ratio) => {
          const isExpanded = expandedRatio === ratio.abbreviation;

          return (
            <div
              key={ratio.abbreviation}
              className={`bg-white border rounded-xl overflow-hidden transition-all ${
                isExpanded ? "border-[var(--color-brand)]/30 shadow-md" : "border-[var(--color-border)]"
              }`}
            >
              {/* Card Header */}
              <button
                onClick={() => setExpandedRatio(isExpanded ? null : ratio.abbreviation)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--color-surface-hover)]/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0">{ratio.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">
                        {ratio.abbreviation}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] truncate">
                        {ratio.name}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                      {ratio.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--color-surface-card)] text-[var(--color-text-muted)]">
                    {ratio.category}
                  </span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-[var(--color-border)] pt-4 space-y-4 animate-fade-in-up">
                  {/* Formula */}
                  <div className="bg-[var(--color-surface)] rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Formula</p>
                    <p className="text-sm font-mono font-semibold text-[var(--color-text-primary)]">{ratio.formula}</p>
                  </div>

                  {/* Interpretation */}
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">What This Means</p>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{ratio.interpretation}</p>
                  </div>

                  {/* Why It Matters */}
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Why Analysts Care</p>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{ratio.whyItMatters}</p>
                  </div>

                  {/* Good Range */}
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Typical Ranges</p>
                    <p className="text-xs text-emerald-800 leading-relaxed">{ratio.goodRange}</p>
                  </div>

                  {/* Real Example */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mb-1">Real-World Example</p>
                    <p className="text-xs text-blue-800 leading-relaxed">{ratio.example}</p>
                  </div>

                  {/* Related Ratios */}
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">Related Ratios</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ratio.relatedRatios.map((r) => (
                        <span
                          key={r}
                          className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <Search size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No ratios found matching your search</p>
        </div>
      )}
    </div>
  );
}
