"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Quote,
  Target,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Info,
  Star,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type EpsResult = "beat" | "miss" | "met";
type Sentiment = "bullish" | "bearish" | "mixed";

interface ManagementQuote {
  speaker: string;
  title: string;
  quote: string;
}

interface TranscriptSummary {
  keyHighlights: string[];
  revenueActual: string;
  revenueEstimate: string;
  revenueSurprise: string;
  epsActual: number;
  epsEstimate: number;
  managementCommentary: ManagementQuote[];
  forwardGuidance: string;
  analystSentiment: Sentiment;
  analystSentimentReasoning: string;
  keyRisks: string[];
}

interface EarningsCall {
  ticker: string;
  company: string;
  quarter: string;
  date: string;
  epsResult: EpsResult;
  summary: TranscriptSummary;
}

/* ------------------------------------------------------------------ */
/*  Demo Data                                                          */
/* ------------------------------------------------------------------ */

const EARNINGS_DATA: EarningsCall[] = [
  {
    ticker: "AAPL",
    company: "Apple Inc.",
    quarter: "Q2 FY2025",
    date: "May 1, 2025",
    epsResult: "beat",
    summary: {
      keyHighlights: [
        "iPhone revenue grew 2% YoY driven by iPhone 16e demand in emerging markets",
        "Services segment hit all-time record of $26.7B, up 12% YoY",
        "Apple Intelligence features drove measurable upgrade cycles in premium tiers",
        "Wearables returned to growth after two quarters of decline",
      ],
      revenueActual: "$95.4B",
      revenueEstimate: "$94.2B",
      revenueSurprise: "+1.3%",
      epsActual: 1.65,
      epsEstimate: 1.59,
      managementCommentary: [
        {
          speaker: "Tim Cook",
          title: "CEO",
          quote:
            "We're seeing incredible customer satisfaction with Apple Intelligence, and it's translating into real engagement across our ecosystem. Our installed base is now at an all-time high of over 2.35 billion active devices.",
        },
        {
          speaker: "Kevan Parekh",
          title: "CFO",
          quote:
            "Our services business continues to be a powerful growth engine. Paid subscriptions grew double digits, and we now have over 1.1 billion paid subscribers across our platform.",
        },
      ],
      forwardGuidance:
        "Management expects June quarter revenue growth in the low-to-mid single digits. Services growth expected to maintain double-digit trajectory. Gross margin guided to 46.5-47.5%. Capex on AI infrastructure projected at $4B-5B for the year.",
      analystSentiment: "bullish",
      analystSentimentReasoning:
        "Strong services momentum and AI-driven upgrade cycle provide durable growth catalysts. Margin expansion despite significant AI investment reassures investors.",
      keyRisks: [
        "China market remains competitive with Huawei gaining share in premium segment",
        "Regulatory headwinds from EU Digital Markets Act could impact App Store economics",
        "AI feature rollout pace may not match competitive offerings from Google and Samsung",
      ],
    },
  },
  {
    ticker: "MSFT",
    company: "Microsoft Corp.",
    quarter: "Q3 FY2025",
    date: "April 30, 2025",
    epsResult: "beat",
    summary: {
      keyHighlights: [
        "Intelligent Cloud revenue surged 21% to $26.8B, led by Azure growth of 33%",
        "Microsoft 365 Copilot now used by over 700K organizations globally",
        "LinkedIn revenue crossed $18B annual run-rate milestone",
        "Gaming revenue up 5% with Xbox content and services driving growth",
      ],
      revenueActual: "$70.1B",
      revenueEstimate: "$68.4B",
      revenueSurprise: "+2.5%",
      epsActual: 3.46,
      epsEstimate: 3.22,
      managementCommentary: [
        {
          speaker: "Satya Nadella",
          title: "CEO",
          quote:
            "We are moving from talking about AI to applying AI at scale. Every customer I talk to is focused on driving real business transformation, and the results we're seeing with Copilot adoption validate our platform approach.",
        },
        {
          speaker: "Amy Hood",
          title: "CFO",
          quote:
            "Azure's 33% constant currency growth reflects continued strong demand for our AI services. Importantly, we're seeing consumption growth across both existing and new workloads, which gives us confidence in the durability of this growth.",
        },
        {
          speaker: "Satya Nadella",
          title: "CEO",
          quote:
            "GitHub Copilot is fundamentally changing software development. We now have over 2.5 million paid subscribers, and developers using Copilot are writing code up to 55% faster.",
        },
      ],
      forwardGuidance:
        "Azure growth expected to accelerate in Q4 FY2025 to 34-35% driven by new AI capacity coming online. Full-year capex expected at $80B as data center buildout continues. Operating margins guided to expand 100-200bps for FY2026.",
      analystSentiment: "bullish",
      analystSentimentReasoning:
        "Azure AI momentum is inflecting positively. Copilot monetization validates enterprise AI willingness-to-pay. Heavy capex is a concern but current returns justify investment.",
      keyRisks: [
        "Massive $80B capex program creates execution risk if AI demand moderates",
        "Increasing competition from AWS Bedrock and Google Cloud AI platform",
        "Enterprise AI adoption cycle could be longer than current projections suggest",
      ],
    },
  },
  {
    ticker: "NVDA",
    company: "NVIDIA Corp.",
    quarter: "Q1 FY2026",
    date: "May 28, 2025",
    epsResult: "beat",
    summary: {
      keyHighlights: [
        "Data center revenue reached $39.2B, up 73% YoY as Blackwell ramp exceeded expectations",
        "Blackwell architecture generated $18.4B in revenue in its first full quarter",
        "Networking revenue grew 48% as InfiniBand and Spectrum-X demand surged",
        "Automotive segment grew 72% YoY driven by autonomous driving platform adoption",
      ],
      revenueActual: "$44.1B",
      revenueEstimate: "$43.3B",
      revenueSurprise: "+1.8%",
      epsActual: 0.96,
      epsEstimate: 0.89,
      managementCommentary: [
        {
          speaker: "Jensen Huang",
          title: "CEO",
          quote:
            "The next industrial revolution has begun. Companies and countries are investing in NVIDIA accelerated computing and AI factories to drive innovation. Blackwell demand is extraordinary and we are ramping supply as fast as we can.",
        },
        {
          speaker: "Colette Kress",
          title: "CFO",
          quote:
            "Our data center business reflects the broad adoption of accelerated computing. We're seeing demand from cloud service providers, enterprise customers, and sovereign AI initiatives worldwide. Our visibility into the next several quarters remains very strong.",
        },
      ],
      forwardGuidance:
        "Q2 FY2026 revenue guided to $45.5B plus or minus 2%, implying continued sequential growth. Next-gen Blackwell Ultra sampling to key customers. Gross margin expected to stabilize at 74-75% as Blackwell yields improve.",
      analystSentiment: "bullish",
      analystSentimentReasoning:
        "NVIDIA remains the undisputed AI infrastructure leader. Blackwell demand exceeds supply. Sovereign AI and enterprise adoption provide multi-year growth runway beyond hyperscaler spending.",
      keyRisks: [
        "Export restrictions to China reduced TAM by approximately $5B annually",
        "Custom silicon efforts by hyperscalers (Google TPUs, Amazon Trainium) could erode market share long-term",
        "Supply chain concentration with TSMC remains a single-point-of-failure risk",
      ],
    },
  },
  {
    ticker: "GOOGL",
    company: "Alphabet Inc.",
    quarter: "Q1 2025",
    date: "April 24, 2025",
    epsResult: "beat",
    summary: {
      keyHighlights: [
        "Google Cloud revenue grew 28% to $12.3B with improved operating margins of 17.8%",
        "Search revenue remained resilient at $50.7B despite AI competition concerns",
        "YouTube ad revenue exceeded $9.3B, driven by Shorts monetization improvements",
        "Waymo completed over 250K paid rides per week, establishing autonomous driving leadership",
      ],
      revenueActual: "$90.2B",
      revenueEstimate: "$89.1B",
      revenueSurprise: "+1.2%",
      epsActual: 2.18,
      epsEstimate: 2.01,
      managementCommentary: [
        {
          speaker: "Sundar Pichai",
          title: "CEO",
          quote:
            "Our AI-first approach is bearing fruit across every major product surface. AI Overviews in Search are driving increased engagement and query volume, and Gemini is becoming a core part of how people interact with Google.",
        },
        {
          speaker: "Ruth Porat",
          title: "President & CIO",
          quote:
            "We're pleased with Google Cloud's trajectory. The combination of our AI infrastructure leadership and Gemini's capabilities is resonating strongly with enterprise customers. We're committed to disciplined capital allocation as we scale.",
        },
      ],
      forwardGuidance:
        "Capex expected at $75B for 2025 as AI infrastructure buildout accelerates. Google Cloud growth expected to sustain mid-to-high 20s percentage growth. Search monetization improvements through AI-enhanced ad formats to roll out in Q2.",
      analystSentiment: "mixed",
      analystSentimentReasoning:
        "Search resilience and Cloud momentum are positives, but massive capex burden and regulatory overhang from DOJ antitrust case weigh on sentiment. Valuation remains attractive relative to peers.",
      keyRisks: [
        "DOJ antitrust remedies could require structural changes to Search distribution",
        "AI Overview cannibalization of traditional search ad clicks remains an ongoing concern",
        "Regulatory pressure in EU on data practices and AI model training",
      ],
    },
  },
  {
    ticker: "AMZN",
    company: "Amazon.com Inc.",
    quarter: "Q1 2025",
    date: "May 1, 2025",
    epsResult: "beat",
    summary: {
      keyHighlights: [
        "AWS revenue grew 19% to $29.3B with operating margin expanding to 38.2%",
        "North America retail operating margin hit record 6.1%, up from 4.8% a year ago",
        "Advertising business crossed $14.7B quarterly revenue, up 22% YoY",
        "Prime membership renewals at all-time high, with same-day delivery expanding to 120 new metros",
      ],
      revenueActual: "$155.7B",
      revenueEstimate: "$153.8B",
      revenueSurprise: "+1.2%",
      epsActual: 1.28,
      epsEstimate: 1.14,
      managementCommentary: [
        {
          speaker: "Andy Jassy",
          title: "CEO",
          quote:
            "We continue to see strong demand across our businesses. AWS is seeing a reacceleration driven by AI workloads, and our retail operations are delivering efficiency improvements that go straight to the bottom line. We're investing aggressively in the future while improving profitability today.",
        },
        {
          speaker: "Brian Olsavsky",
          title: "CFO",
          quote:
            "The operational leverage in our fulfillment network is ahead of schedule. Regionalization and same-day facilities are reducing cost-to-serve while improving delivery speed. This is showing up in both customer satisfaction scores and our margin profile.",
        },
      ],
      forwardGuidance:
        "Q2 operating income guided to $17.5-21.5B. AWS AI services backlog exceeds $110B. Capex for 2025 expected at $100B+, predominantly for AWS infrastructure including custom Trainium chips. Prime Day 2025 expected in July.",
      analystSentiment: "bullish",
      analystSentimentReasoning:
        "Margin expansion story remains intact across all segments. AWS reacceleration through AI workloads provides growth durability. Advertising continues to be an underappreciated profit driver.",
      keyRisks: [
        "Massive infrastructure spending could pressure free cash flow if AI demand plateaus",
        "FTC regulatory scrutiny on marketplace practices and labor conditions",
        "Tariff uncertainty and macroeconomic slowdown risk to consumer spending",
      ],
    },
  },
  {
    ticker: "META",
    company: "Meta Platforms Inc.",
    quarter: "Q1 2025",
    date: "April 30, 2025",
    epsResult: "beat",
    summary: {
      keyHighlights: [
        "Family of Apps daily active users surpassed 3.35 billion people globally",
        "Ad revenue grew 16% YoY to $41.4B driven by AI-powered ad targeting improvements",
        "Reality Labs losses narrowed to $3.8B as Quest 3S adoption exceeded expectations",
        "Meta AI assistant reached 1 billion monthly active users faster than any product in history",
      ],
      revenueActual: "$42.3B",
      revenueEstimate: "$41.2B",
      revenueSurprise: "+2.7%",
      epsActual: 5.62,
      epsEstimate: 5.12,
      managementCommentary: [
        {
          speaker: "Mark Zuckerberg",
          title: "CEO",
          quote:
            "Meta AI is now the most widely used AI assistant in the world, and it's becoming an important part of how people interact across our apps. Our AI investments are paying off both in our core ads business through better targeting, and in creating entirely new product experiences.",
        },
        {
          speaker: "Susan Li",
          title: "CFO",
          quote:
            "Our efficiency gains continue to drive operating leverage. We've improved ad delivery efficiency by over 20% year-over-year through AI model improvements while simultaneously investing heavily in next-generation capabilities.",
        },
      ],
      forwardGuidance:
        "Q2 2025 revenue guided to $43.5-46.5B. Full year 2025 capex expected at $60-65B, focused on AI compute infrastructure. Reels monetization per impression reaching parity with Feed by end of 2025. Llama 4 family planned for release in Q3.",
      analystSentiment: "bullish",
      analystSentimentReasoning:
        "Core ad business continues to benefit from AI efficiency gains. Open-source Llama strategy positions Meta uniquely in the AI ecosystem. Reality Labs losses, while significant, are becoming more manageable.",
      keyRisks: [
        "Reality Labs remains a multi-billion dollar drag on profitability with uncertain payoff timeline",
        "EU regulatory fines and potential ad-targeting restrictions under Digital Services Act",
        "TikTok ban reversal or regulatory changes could reignite competitive pressure",
      ],
    },
  },
  {
    ticker: "TSLA",
    company: "Tesla Inc.",
    quarter: "Q1 2025",
    date: "April 22, 2025",
    epsResult: "miss",
    summary: {
      keyHighlights: [
        "Vehicle deliveries of 336,681 units missed expectations of 370K, down 13% YoY",
        "Automotive gross margin compressed to 16.3% as price cuts continued globally",
        "Energy storage deployments hit record 10.4 GWh, up 154% YoY",
        "Robotaxi service launch in Austin generated significant media attention but limited revenue",
      ],
      revenueActual: "$19.3B",
      revenueEstimate: "$21.4B",
      revenueSurprise: "-9.8%",
      epsActual: 0.27,
      epsEstimate: 0.42,
      managementCommentary: [
        {
          speaker: "Elon Musk",
          title: "CEO",
          quote:
            "The short-term delivery numbers don't reflect where this company is headed. The autonomous driving revolution is real, and Tesla is leading it. Our robotaxi fleet will fundamentally transform the economics of this business in ways that make current delivery volumes look irrelevant.",
        },
        {
          speaker: "Vaibhav Taneja",
          title: "CFO",
          quote:
            "While vehicle margins are under pressure, our energy business is scaling rapidly with improving margins. We're also seeing meaningful cost improvements in our next-generation vehicle manufacturing processes that will benefit the second half of the year.",
        },
      ],
      forwardGuidance:
        "Model Y refresh ramp expected to drive sequential delivery improvement. Affordable model on track for H1 2026 production start. FSD supervised now available in China and Europe. Robotaxi rides in Austin expanding to additional geofenced zones.",
      analystSentiment: "mixed",
      analystSentimentReasoning:
        "Autonomous driving optionality is significant but near-term fundamentals are deteriorating. Energy storage provides diversification but cannot offset automotive margin compression. Valuation premium requires execution on autonomy promises.",
      keyRisks: [
        "Brand perception issues impacting demand in Europe and parts of North America",
        "Intense BEV competition from Chinese manufacturers eroding global market share",
        "Regulatory uncertainty around autonomous driving approval timelines",
      ],
    },
  },
  {
    ticker: "JPM",
    company: "JPMorgan Chase & Co.",
    quarter: "Q1 2025",
    date: "April 11, 2025",
    epsResult: "beat",
    summary: {
      keyHighlights: [
        "Net revenue reached $46.0B with record net interest income of $24.3B",
        "Investment banking fees surged 25% as M&A and IPO activity rebounded strongly",
        "Consumer credit quality remained healthy with net charge-offs below expectations",
        "CIB markets revenue of $9.7B reflected strong trading across fixed income and equities",
      ],
      revenueActual: "$46.0B",
      revenueEstimate: "$44.1B",
      revenueSurprise: "+4.3%",
      epsActual: 5.07,
      epsEstimate: 4.56,
      managementCommentary: [
        {
          speaker: "Jamie Dimon",
          title: "Chairman & CEO",
          quote:
            "The economy remains on solid footing, but I want to be clear that we see significant risks on the horizon. Geopolitical tensions, persistent inflation, and the impact of trade policy uncertainty require us to be prepared for a range of outcomes. We're building fortress-level capital for a reason.",
        },
        {
          speaker: "Jeremy Barnum",
          title: "CFO",
          quote:
            "Our results demonstrate the power of our diversified business model. Record NII, strong trading, and an investment banking rebound all contributed. Credit costs remain manageable, though we're prudently building reserves given the uncertain outlook.",
        },
      ],
      forwardGuidance:
        "Net interest income expected at $94B for full year 2025. Credit costs forecast at $9.5B with normalization continuing. Investment banking pipeline remains robust into Q2. Technology investment of $17B planned for 2025 including AI initiatives.",
      analystSentiment: "bullish",
      analystSentimentReasoning:
        "Dominant franchise across consumer and institutional businesses. NII strength, IB rebound, and disciplined expense management support premium valuation. Conservative credit provisioning builds confidence.",
      keyRisks: [
        "Potential recession would drive credit losses higher across consumer and commercial portfolios",
        "Regulatory environment under Basel III endgame could require higher capital buffers",
        "Net interest margin pressure if Fed cuts rates more aggressively than expected",
      ],
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function epsResultBadge(result: EpsResult) {
  switch (result) {
    case "beat":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-positive)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-positive)]">
          <TrendingUp className="h-3 w-3" /> Beat
        </span>
      );
    case "miss":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-negative)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-negative)]">
          <TrendingDown className="h-3 w-3" /> Miss
        </span>
      );
    case "met":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-text-muted)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-text-muted)]">
          <Minus className="h-3 w-3" /> Met
        </span>
      );
  }
}

function sentimentColor(s: Sentiment) {
  switch (s) {
    case "bullish":
      return "var(--color-positive)";
    case "bearish":
      return "var(--color-negative)";
    case "mixed":
      return "var(--color-warning, #f59e0b)";
  }
}

function sentimentPercent(s: Sentiment) {
  switch (s) {
    case "bullish":
      return 80;
    case "bearish":
      return 25;
    case "mixed":
      return 55;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EarningsTranscripts() {
  const [search, setSearch] = useState("");
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  const [showInfoBox, setShowInfoBox] = useState(true);

  const filtered = useMemo(() => {
    if (!search.trim()) return EARNINGS_DATA;
    const q = search.trim().toLowerCase();
    return EARNINGS_DATA.filter(
      (e) =>
        e.ticker.toLowerCase().includes(q) ||
        e.company.toLowerCase().includes(q)
    );
  }, [search]);

  function toggle(ticker: string) {
    setExpandedTicker((prev) => (prev === ticker ? null : ticker));
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileText className="h-5 w-5 text-[var(--color-brand)]" />
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Earnings Call Transcripts
          </h2>
        </div>
        <span className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-xs font-medium text-[var(--color-brand)]">
          AI Summaries
        </span>
      </div>

      {/* Educational info box */}
      {showInfoBox && (
        <div className="relative rounded-xl border border-[var(--color-brand)]/20 bg-[var(--color-brand)]/5 p-4">
          <button
            onClick={() => setShowInfoBox(false)}
            className="absolute right-3 top-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                What is an Earnings Call?
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                Every quarter, public companies hold an earnings call where the
                CEO and CFO discuss financial results with Wall Street analysts.
                They review revenue, profit, and forward guidance (what they
                expect next quarter). These calls move stock prices and are one
                of the most important events for investors. The summaries below
                are AI-generated highlights from recent calls so you can quickly
                understand what happened without reading 40-page transcripts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search / filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by ticker or company name..."
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-[var(--color-brand)] transition-colors"
        />
      </div>

      {/* Earnings list */}
      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
          No earnings calls match your search.
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((call) => {
          const isExpanded = expandedTicker === call.ticker;
          const s = call.summary;

          return (
            <div
              key={call.ticker}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden transition-shadow hover:shadow-sm"
            >
              {/* Card header — always visible */}
              <button
                onClick={() => toggle(call.ticker)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-elevated)] text-sm font-bold text-[var(--color-text-primary)]">
                    {call.ticker.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {call.ticker}
                      </span>
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {call.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mt-0.5">
                      <span>{call.quarter}</span>
                      <span className="text-[var(--color-border)]">|</span>
                      <span>{call.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {epsResultBadge(call.epsResult)}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-[var(--color-text-muted)]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
                  )}
                </div>
              </button>

              {/* Expanded transcript summary */}
              {isExpanded && (
                <div className="border-t border-[var(--color-border)] px-4 pb-5 pt-4 space-y-5">
                  {/* Sentiment meter */}
                  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                        Analyst Sentiment
                      </span>
                      <span
                        className="text-xs font-bold capitalize"
                        style={{ color: sentimentColor(s.analystSentiment) }}
                      >
                        {s.analystSentiment}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[var(--color-border)]">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${sentimentPercent(s.analystSentiment)}%`,
                          backgroundColor: sentimentColor(s.analystSentiment),
                        }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-[var(--color-text-muted)]">
                      <span>Bearish</span>
                      <span>Neutral</span>
                      <span>Bullish</span>
                    </div>
                  </div>

                  {/* Key Highlights */}
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-[var(--color-brand)]" />
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Key Highlights
                      </h3>
                    </div>
                    <ul className="space-y-1.5 pl-6">
                      {s.keyHighlights.map((h, i) => (
                        <li
                          key={i}
                          className="text-sm text-[var(--color-text-secondary)] list-disc"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Revenue & Earnings */}
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-[var(--color-brand)]" />
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Revenue & Earnings
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">
                          Revenue
                        </p>
                        <p className="text-lg font-bold text-[var(--color-text-primary)]">
                          {s.revenueActual}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Est. {s.revenueEstimate}
                        </p>
                        <span
                          className={`mt-1 inline-block text-xs font-semibold ${
                            s.revenueSurprise.startsWith("+")
                              ? "text-[var(--color-positive)]"
                              : "text-[var(--color-negative)]"
                          }`}
                        >
                          {s.revenueSurprise} surprise
                        </span>
                      </div>
                      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">
                          Earnings Per Share
                        </p>
                        <p className="text-lg font-bold text-[var(--color-text-primary)]">
                          ${s.epsActual.toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          Est. ${s.epsEstimate.toFixed(2)}
                        </p>
                        <span
                          className={`mt-1 inline-block text-xs font-semibold ${
                            s.epsActual >= s.epsEstimate
                              ? "text-[var(--color-positive)]"
                              : "text-[var(--color-negative)]"
                          }`}
                        >
                          {s.epsActual >= s.epsEstimate ? "+" : ""}
                          {(
                            ((s.epsActual - s.epsEstimate) / s.epsEstimate) *
                            100
                          ).toFixed(1)}
                          % surprise
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Management Commentary */}
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Quote className="h-4 w-4 text-[var(--color-brand)]" />
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Management Commentary
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {s.managementCommentary.map((q, i) => (
                        <div
                          key={i}
                          className="rounded-lg border-l-2 border-[var(--color-brand)] bg-[var(--color-surface-elevated)] p-3"
                        >
                          <p className="text-sm italic text-[var(--color-text-secondary)] leading-relaxed">
                            &ldquo;{q.quote}&rdquo;
                          </p>
                          <p className="mt-2 text-xs font-medium text-[var(--color-text-muted)]">
                            &mdash; {q.speaker}, {q.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Forward Guidance */}
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-[var(--color-brand)]" />
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Forward Guidance
                      </h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-3">
                      {s.forwardGuidance}
                    </p>
                  </section>

                  {/* Analyst Sentiment */}
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-[var(--color-brand)]" />
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Analyst Sentiment
                      </h3>
                    </div>
                    <div className="rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-sm font-semibold capitalize"
                          style={{
                            color: sentimentColor(s.analystSentiment),
                          }}
                        >
                          {s.analystSentiment}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                        {s.analystSentimentReasoning}
                      </p>
                    </div>
                  </section>

                  {/* Key Risks */}
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-[var(--color-negative)]" />
                      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                        Key Risks Mentioned
                      </h3>
                    </div>
                    <ul className="space-y-1.5 pl-6">
                      {s.keyRisks.map((r, i) => (
                        <li
                          key={i}
                          className="text-sm text-[var(--color-text-secondary)] list-disc"
                        >
                          {r}
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Disclaimer */}
                  <div className="flex items-start gap-2 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] p-3">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]" />
                    <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                      This summary is AI-generated for educational purposes and
                      may contain inaccuracies. Always refer to official SEC
                      filings and company investor relations pages for
                      authoritative information. Not investment advice.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
