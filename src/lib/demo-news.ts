function newsUrl(title: string, site: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(title + " " + site)}&tbm=nws`;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

export const DEMO_NEWS_AAPL = [
  {
    symbol: "AAPL",
    publishedDate: hoursAgo(2),
    title: "Apple Intelligence: How AI Could Add $30 Per Share to Apple's Valuation",
    image: "",
    site: "Seeking Alpha",
    text: "Apple's new AI strategy could significantly boost services revenue and hardware upgrade cycles, analysts say.",
    url: newsUrl("Apple Intelligence AI Valuation", "Seeking Alpha"),
  },
  {
    symbol: "AAPL",
    publishedDate: hoursAgo(6),
    title: "Apple Reaches $3.3 Trillion Market Cap as Rally Continues",
    image: "",
    site: "Bloomberg",
    text: "Shares rose 1.7% as investors continue to bet on the company's AI ambitions.",
    url: newsUrl("Apple 3.3 Trillion Market Cap Rally", "Bloomberg"),
  },
  {
    symbol: "AAPL",
    publishedDate: hoursAgo(18),
    title: "Why Apple's Partnership with OpenAI Changes Everything",
    image: "",
    site: "CNBC",
    text: "The integration of ChatGPT into Siri represents a fundamental shift in Apple's AI approach.",
    url: newsUrl("Apple OpenAI Partnership ChatGPT Siri", "CNBC"),
  },
  {
    symbol: "AAPL",
    publishedDate: hoursAgo(26),
    title: "Apple's Services Revenue on Track to Hit $100B Annually",
    image: "",
    site: "Reuters",
    text: "App Store, iCloud, Apple Music, and Apple TV+ continue to drive recurring revenue growth.",
    url: newsUrl("Apple Services Revenue 100 Billion", "Reuters"),
  },
  {
    symbol: "AAPL",
    publishedDate: hoursAgo(48),
    title: "iPhone 17 Supply Chain Ramps Up Ahead of September Launch",
    image: "",
    site: "Nikkei Asia",
    text: "Suppliers in Asia report increased orders suggesting Apple expects strong demand for AI-enabled iPhones.",
    url: newsUrl("iPhone 17 Supply Chain September Launch", "Nikkei Asia"),
  },
  {
    symbol: "AAPL",
    publishedDate: hoursAgo(60),
    title: "EU Regulators Approve Apple's DMA Compliance Plan with Conditions",
    image: "",
    site: "Financial Times",
    text: "Apple's proposed changes to App Store policies in Europe receive conditional approval from regulators.",
    url: newsUrl("Apple EU DMA Compliance App Store", "Financial Times"),
  },
  {
    symbol: "AAPL",
    publishedDate: hoursAgo(72),
    title: "Analyst Upgrades: 5 Wall Street Firms Raise Apple Price Targets",
    image: "",
    site: "MarketWatch",
    text: "Average price target moves to $240, with the highest at $275, driven by AI monetization potential.",
    url: newsUrl("Apple Price Target Upgrades", "MarketWatch"),
  },
  {
    symbol: "AAPL",
    publishedDate: hoursAgo(96),
    title: "Apple Vision Pro Sales Slow but Strategic Value Remains High",
    image: "",
    site: "The Verge",
    text: "Despite slower-than-expected sales, Apple maintains that spatial computing is a long-term investment.",
    url: newsUrl("Apple Vision Pro Sales Strategic Value", "The Verge"),
  },
];

export const DEMO_NEWS_GENERAL = [
  {
    symbol: "SPY",
    publishedDate: hoursAgo(1),
    title: "S&P 500 Hits New All-Time High as Tech Rally Broadens",
    image: "",
    site: "Wall Street Journal",
    text: "The benchmark index closed at a record as gains spread beyond mega-cap tech stocks.",
    url: newsUrl("S&P 500 All Time High Tech Rally", "Wall Street Journal"),
  },
  {
    symbol: "NVDA",
    publishedDate: hoursAgo(4),
    title: "NVIDIA Briefly Becomes World's Most Valuable Company",
    image: "",
    site: "Bloomberg",
    text: "The chipmaker's market cap surpassed $3.3 trillion, driven by insatiable AI chip demand.",
    url: newsUrl("NVIDIA Most Valuable Company Market Cap", "Bloomberg"),
  },
  {
    symbol: "FED",
    publishedDate: hoursAgo(8),
    title: "Fed Officials Signal Rate Cuts Still Possible This Year",
    image: "",
    site: "Reuters",
    text: "Several Federal Reserve governors indicated they still see room for a rate reduction this year.",
    url: newsUrl("Fed Rate Cut Officials Signal", "Reuters"),
  },
  {
    symbol: "TSLA",
    publishedDate: hoursAgo(22),
    title: "Tesla Shareholders Approve Elon Musk's Compensation Plan",
    image: "",
    site: "CNBC",
    text: "In a closely watched vote, Tesla shareholders backed the CEO's compensation plan.",
    url: newsUrl("Tesla Shareholders Elon Musk Pay Package", "CNBC"),
  },
  {
    symbol: "META",
    publishedDate: hoursAgo(30),
    title: "Meta's Ad Revenue Surges as AI-Powered Targeting Improves ROI",
    image: "",
    site: "Financial Times",
    text: "Advertisers report significantly better returns from Meta's AI-enhanced ad platform.",
    url: newsUrl("Meta Ad Revenue AI Powered Targeting", "Financial Times"),
  },
  {
    symbol: "CRYPTO",
    publishedDate: hoursAgo(48),
    title: "Bitcoin Holds Above $100,000 as ETF Inflows Continue",
    image: "",
    site: "CoinDesk",
    text: "Spot Bitcoin ETFs saw $500M in net inflows this week, supporting price stability.",
    url: newsUrl("Bitcoin 100000 ETF Inflows", "CoinDesk"),
  },
];
