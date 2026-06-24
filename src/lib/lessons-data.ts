export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  icon: string;
  sections: LessonSection[];
  relatedQuiz?: string;
}

export interface LessonSection {
  heading: string;
  content: string;
  keyTakeaway?: string;
  example?: string; // a concrete worked example with real numbers
}

export const LESSONS: Lesson[] = [
  {
    id: "intro-stock-market",
    title: "How the Stock Market Works",
    subtitle: "Understanding exchanges, shares, and why companies go public",
    duration: "8 min",
    difficulty: "Beginner",
    icon: "📊",
    relatedQuiz: "Stock Market Fundamentals",
    sections: [
      {
        heading: "What Is the Stock Market?",
        content: "The stock market is a network of exchanges where investors buy and sell shares of publicly traded companies. Think of it like a massive auction house — sellers list their shares at prices they're willing to accept, and buyers bid what they're willing to pay. When a buyer and seller agree on a price, a trade happens.\n\nThe two largest U.S. exchanges are the New York Stock Exchange (NYSE) and NASDAQ. Together, they list over 5,000 companies worth trillions of dollars. Other major exchanges include the London Stock Exchange (LSE), Tokyo Stock Exchange (TSE), and National Stock Exchange of India (NSE).",
        keyTakeaway: "The stock market is simply a marketplace where ownership stakes in companies are bought and sold between investors."
      },
      {
        heading: "What Is a Share of Stock?",
        content: "When you buy a share of stock, you're buying a tiny piece of ownership in that company. If Apple has 15 billion shares outstanding and you buy 100 shares, you own a microscopic fraction — but you're still a real owner.\n\nAs an owner (shareholder), you're entitled to a proportional share of the company's profits (through dividends) and you get to vote on major company decisions at shareholder meetings. If the company grows and becomes more valuable, your shares become worth more too.",
        keyTakeaway: "A share = ownership. You literally own a piece of the company, including a claim on its future earnings."
      },
      {
        heading: "Why Do Companies Go Public?",
        content: "Companies sell shares to the public through an Initial Public Offering (IPO) primarily to raise capital. This money funds expansion, research, acquisitions, or paying off debt. Going public also provides liquidity for early investors and employees who hold shares.\n\nFor example, when a startup's founders and venture capital investors want to cash out their investments, an IPO lets them sell their shares on the open market. The company also gains prestige, public accountability, and access to future capital through secondary offerings.",
        keyTakeaway: "Companies go public to raise money for growth and give early investors a way to sell their shares."
      },
      {
        heading: "How Stock Prices Move",
        content: "Stock prices are driven by supply and demand. If more people want to buy a stock than sell it, the price goes up. If more people want to sell, the price drops. But what drives that buying and selling?\n\nThe main factors are: (1) Company earnings — if a company reports better-than-expected profits, buyers rush in. (2) Economic conditions — interest rates, inflation, and GDP growth affect all stocks. (3) Industry trends — new technology or regulations can boost or hurt entire sectors. (4) Investor sentiment — fear and greed cause prices to overshoot in both directions.\n\nIn the short term, prices can be volatile and irrational. Over the long term, stock prices tend to track a company's actual earnings growth.",
        keyTakeaway: "Short-term prices are driven by sentiment and news. Long-term prices follow fundamental business performance."
      },
      {
        heading: "Bulls, Bears, and Market Cycles",
        content: "Markets move in cycles. A bull market is a sustained period of rising prices (generally 20%+ from recent lows), driven by optimism and economic expansion. A bear market is a decline of 20% or more, accompanied by pessimism and often economic contraction.\n\nSince 1950, the S&P 500 has experienced roughly 11 bear markets and 12 bull markets. The key lesson: bear markets are temporary. Every single one has been followed by a recovery that eventually reached new highs. Patient investors who stayed invested through downturns were rewarded.\n\nThis is why legendary investor Warren Buffett says: 'Be fearful when others are greedy, and greedy when others are fearful.'",
        keyTakeaway: "Markets cycle between optimism and pessimism. Historically, every bear market has been followed by a recovery."
      }
    ]
  },
  {
    id: "reading-financial-statements",
    title: "Reading Financial Statements",
    subtitle: "Decode the three core reports every investor must understand",
    duration: "12 min",
    difficulty: "Beginner",
    icon: "📋",
    relatedQuiz: "Financial Statements & Accounting",
    sections: [
      {
        heading: "The Three Financial Statements",
        content: "Every public company publishes three core financial statements every quarter: the Income Statement, the Balance Sheet, and the Cash Flow Statement. Together, they tell the complete story of a company's financial health.\n\nThink of it this way: The Income Statement shows how much money the company made (or lost) during the period. The Balance Sheet is a snapshot of everything the company owns and owes at a single moment. The Cash Flow Statement tracks where cash actually went — because profit on paper doesn't always mean cash in the bank.",
        keyTakeaway: "Three statements, three questions: How much did we earn? What do we own and owe? Where did the cash go?"
      },
      {
        heading: "The Income Statement (P&L)",
        content: "The Income Statement starts with Revenue (total sales) at the top and works down through expenses to arrive at Net Income (profit) at the bottom. That's why revenue is called the 'top line' and net income is the 'bottom line.'\n\nKey lines to watch:\n• Revenue — Is sales growing year over year?\n• Gross Profit — Revenue minus direct costs (Cost of Goods Sold). Shows pricing power.\n• Operating Income — Gross profit minus operating expenses (salaries, rent, R&D). Shows how efficiently the business runs.\n• Net Income — The final profit after all expenses, interest, and taxes.\n\nMargins matter more than raw numbers. A company with $1B revenue and 20% net margin is healthier than one with $5B revenue and 2% margin.",
        keyTakeaway: "Follow the money from top (revenue) to bottom (net income). Margins tell you more than raw numbers.",
        example: "A company posts $500M in revenue and $400M in total costs → Net income = $100M, so net margin = 100 ÷ 500 = 20%. Now compare a rival with $2B revenue but only $40M profit: its margin is just 40 ÷ 2,000 = 2%. The smaller company keeps 10× more of every sales dollar — far more efficient despite a quarter of the revenue."
      },
      {
        heading: "The Balance Sheet",
        content: "The Balance Sheet follows one fundamental equation: Assets = Liabilities + Shareholders' Equity. Assets are everything the company owns (cash, inventory, property, patents). Liabilities are everything it owes (loans, accounts payable, deferred revenue). Equity is what's left for shareholders.\n\nKey things to check:\n• Cash and equivalents — Can the company survive a downturn?\n• Total debt — How much has the company borrowed?\n• Current ratio (current assets ÷ current liabilities) — Can it pay bills due within a year? Above 1.0 is healthy.\n• Debt-to-equity ratio — How leveraged is the company? Below 1.0 is generally conservative.",
        keyTakeaway: "Assets = Liabilities + Equity. Focus on cash levels, debt load, and whether short-term obligations are covered."
      },
      {
        heading: "The Cash Flow Statement",
        content: "This is arguably the most important statement because cash is king. A company can report profits on the income statement while actually burning cash — that's a red flag.\n\nThe Cash Flow Statement has three sections:\n• Operating Cash Flow — Cash generated from the actual business. Should be positive and growing.\n• Investing Cash Flow — Cash spent on growth (buying equipment, acquiring companies). Usually negative, which is fine.\n• Financing Cash Flow — Cash from borrowing, issuing shares, or paying dividends.\n\nFree Cash Flow (FCF) = Operating Cash Flow − Capital Expenditures. This is the real money available to reward shareholders through dividends or buybacks.",
        keyTakeaway: "Profits can be manipulated; cash flow can't. Free Cash Flow is the truest measure of financial health.",
        example: "Suppose operating cash flow is $300M and the company spends $80M on equipment and facilities (capital expenditures). Free Cash Flow = $300M − $80M = $220M. That $220M is the real cash left over to pay dividends, buy back shares, or pay down debt — the cash that actually rewards shareholders."
      },
      {
        heading: "Red Flags to Watch For",
        content: "Here are warning signs that something may be wrong:\n\n1. Revenue growing but cash flow shrinking — the company might be booking revenue it hasn't collected.\n2. Debt growing faster than revenue — the company is borrowing to fund operations, not growth.\n3. Inventory piling up — products aren't selling, which may force future write-downs.\n4. Frequent 'one-time' charges — if every quarter has a special charge, those costs aren't really one-time.\n5. Accounts receivable growing much faster than revenue — customers aren't paying on time.\n\nNone of these alone means disaster, but multiple red flags together warrant caution.",
        keyTakeaway: "Always compare cash flow to reported earnings. When they diverge significantly, investigate why."
      }
    ]
  },
  {
    id: "valuation-basics",
    title: "How to Value a Stock",
    subtitle: "Master the key ratios and methods used by professional analysts",
    duration: "10 min",
    difficulty: "Intermediate",
    icon: "🎯",
    relatedQuiz: "Valuation & Analysis",
    sections: [
      {
        heading: "Why Valuation Matters",
        content: "A great company is not always a great investment. The price you pay determines your return. Buying an excellent company at an inflated price can lose you money, while buying an average company at a bargain price can be profitable.\n\nValuation answers one question: Is the current stock price justified by the company's fundamentals? If the stock is cheaper than its intrinsic value, it may be undervalued (a potential buy). If it's more expensive, it may be overvalued (a potential sell or avoid).\n\nWarren Buffett's teacher, Benjamin Graham, called the difference between price and intrinsic value the 'margin of safety' — the bigger the gap, the safer the investment.",
        keyTakeaway: "Price is what you pay, value is what you get. Great companies at bad prices can still be bad investments."
      },
      {
        heading: "P/E Ratio — The Starting Point",
        content: "The Price-to-Earnings (P/E) ratio is the most widely used valuation metric. It tells you how much investors are paying for each dollar of earnings:\n\nP/E = Stock Price ÷ Earnings Per Share\n\nA P/E of 20 means you're paying $20 for every $1 the company earns annually. Is that expensive? It depends on context:\n• The S&P 500 average is historically around 15-17x.\n• High-growth tech companies often trade at 30-50x because investors expect rapid earnings growth.\n• Slow-growth utilities might trade at 10-15x.\n\nAlways compare a company's P/E to its industry peers and its own historical average, not to the broad market.",
        keyTakeaway: "P/E tells you the price tag on earnings. Always compare to peers and historical averages, not in isolation.",
        example: "A stock trades at $50 and earns $2.50 per share → P/E = 50 ÷ 2.50 = 20. You're paying $20 for every $1 of annual profit. A competitor earning the same $2.50 but priced at $30 has a P/E of 12 — you'd get identical earnings for 40% less. All else equal, the second stock is the better value."
      },
      {
        heading: "Beyond P/E — Other Key Ratios",
        content: "No single ratio tells the whole story. Here are the others professionals use:\n\n• P/B (Price-to-Book): Price ÷ Book Value per share. Below 1.0 might indicate undervaluation (or a broken business). Good for banks and asset-heavy industries.\n\n• P/S (Price-to-Sales): Market Cap ÷ Revenue. Useful for unprofitable companies where P/E doesn't work. Lower is generally better.\n\n• PEG Ratio: P/E ÷ Expected Earnings Growth Rate. A PEG of 1.0 = fairly valued for its growth. Below 1.0 = potentially cheap.\n\n• EV/EBITDA: Enterprise Value ÷ EBITDA. Accounts for debt, making it better than P/E for comparing companies with different capital structures.\n\nUse multiple ratios together — if several all point to undervaluation, your confidence increases.",
        keyTakeaway: "Use multiple valuation ratios together. If P/E, PEG, and EV/EBITDA all agree, the signal is stronger.",
        example: "Why PEG matters: Stock A has a P/E of 30 but grows earnings 30% a year → PEG = 30 ÷ 30 = 1.0 (fairly priced for its growth). Stock B looks 'cheaper' at a P/E of 15, but only grows 5% → PEG = 15 ÷ 5 = 3.0. Once you account for growth, the lower-P/E stock is actually three times more expensive."
      },
      {
        heading: "Discounted Cash Flow (DCF)",
        content: "The DCF model is considered the gold standard of valuation by professional analysts. The idea is simple: a company's value equals all the cash it will generate in the future, discounted back to today's dollars.\n\nThe steps:\n1. Project future Free Cash Flow for 5-10 years\n2. Estimate a terminal value (the company's worth beyond the projection period)\n3. Discount all future cash flows to present value using WACC (weighted average cost of capital)\n4. Sum everything up = Intrinsic Value\n\nThe challenge: small changes in growth rate or discount rate assumptions can dramatically change the output. That's why analysts run multiple scenarios (bull, base, bear cases).\n\nMarketLens includes a built-in DCF calculator — try it on the Research tab when analyzing any stock.",
        keyTakeaway: "DCF values a company based on its future cash generation potential, discounted to today's value.",
        example: "Simplified DCF: a company generates $100M of free cash flow next year, growing 8% a year. Each future year is discounted back at a 10% rate (so $108M earned in year 2 is worth about $89M today). Sum ~10 years of discounted cash plus a terminal value and you might get an intrinsic value of $1.5B. If its market cap is $1.2B it looks ~20% undervalued; at $1.9B it's ~25% overvalued. Bump the discount rate from 10% to 11% and the value can drop by hundreds of millions — which is exactly why analysts run bull, base, and bear cases."
      }
    ]
  },
  {
    id: "technical-analysis-intro",
    title: "Introduction to Technical Analysis",
    subtitle: "Read charts, spot patterns, and understand market momentum",
    duration: "10 min",
    difficulty: "Intermediate",
    icon: "📈",
    relatedQuiz: "Technical Analysis & Charts",
    sections: [
      {
        heading: "What Is Technical Analysis?",
        content: "Technical analysis studies price movements and trading patterns to forecast future direction. While fundamental analysis asks 'What is the company worth?', technical analysis asks 'What is the market telling us about price direction?'\n\nThe core philosophy rests on three principles:\n1. Price discounts everything — all known information is already reflected in the stock price.\n2. Prices move in trends — once established, trends tend to continue until a clear reversal.\n3. History tends to repeat — price patterns recur because human psychology doesn't change.\n\nTechnical analysis is not fortune-telling. It's about identifying probabilities and managing risk based on historical price behavior.",
        keyTakeaway: "Technical analysis reads the market's behavior through price and volume patterns to identify probable future moves."
      },
      {
        heading: "Support and Resistance",
        content: "Support is a price level where buying interest is strong enough to prevent further decline — like a floor. Resistance is a level where selling pressure caps further gains — like a ceiling.\n\nThese levels form because of market memory. If a stock bounced off $100 three times before, traders remember. When it approaches $100 again, buyers step in expecting another bounce. This creates a self-fulfilling prophecy.\n\nWhen support breaks, it often becomes resistance (and vice versa). A stock that drops below $100 support may later struggle to get back above $100 — the former support is now a ceiling.\n\nThe more times a level is tested, the more significant it becomes. But eventually, all support and resistance levels break.",
        keyTakeaway: "Support = floor where buyers emerge. Resistance = ceiling where sellers emerge. Broken support becomes resistance."
      },
      {
        heading: "Moving Averages",
        content: "Moving averages smooth out price noise to reveal the underlying trend. The two most common are:\n\n• SMA (Simple Moving Average): Average of closing prices over N days. Each day is weighted equally.\n• EMA (Exponential Moving Average): Gives more weight to recent prices, reacting faster to new information.\n\nKey moving averages traders watch:\n• 50-day MA: The medium-term trend. Stocks above their 50-day MA are in an uptrend.\n• 200-day MA: The long-term trend. Widely watched by institutional investors.\n\nGolden Cross: When the 50-day MA crosses above the 200-day MA — a bullish signal suggesting a new uptrend.\nDeath Cross: When the 50-day crosses below the 200-day — a bearish signal.\n\nMoving averages work best in trending markets. They lag in choppy, sideways markets.",
        keyTakeaway: "The 50-day and 200-day moving averages define medium and long-term trends. Their crossovers signal major shifts.",
        example: "Golden cross in action: a stock's 50-day average sits at $95 while its 200-day average is at $98 (downtrend). As it rallies, the 50-day climbs and crosses above the 200-day — the 'golden cross,' which has often marked the start of sustained uptrends. The opposite — the 50-day falling below the 200-day — is the 'death cross.' Tip: open any stock's chart here, tap 'Trend lines,' and you can watch these two averages yourself."
      },
      {
        heading: "RSI and Momentum",
        content: "The Relative Strength Index (RSI) measures momentum on a scale of 0-100. It tells you whether recent price action has been overwhelmingly bullish or bearish.\n\n• RSI above 70: The stock may be 'overbought' — it's risen too fast and could pull back.\n• RSI below 30: The stock may be 'oversold' — it's fallen too far and could bounce.\n\nImportant: Overbought doesn't mean 'sell immediately.' Strong stocks can stay overbought for weeks during powerful uptrends. RSI divergence is more reliable — when the stock makes a new high but RSI makes a lower high, it suggests momentum is fading even though price is still rising.\n\nVolume confirms momentum. A price breakout on heavy volume is more likely to sustain than one on thin volume.",
        keyTakeaway: "RSI measures momentum speed. Overbought/oversold levels suggest potential reversals, but divergences are more reliable.",
        example: "Reading RSI: a stock jumps from $40 to $60 in three weeks and its RSI hits 82 — deeply 'overbought.' That's not an automatic sell, but it warns the move is stretched. If the stock then nudges to a new high of $62 while RSI only reaches 74 (a lower high), that 'bearish divergence' hints momentum is fading even as the price still rises — a classic early warning."
      }
    ]
  },
  {
    id: "risk-management",
    title: "Risk Management for Beginners",
    subtitle: "Protect your capital with the strategies professional traders use",
    duration: "8 min",
    difficulty: "Beginner",
    icon: "🛡️",
    relatedQuiz: "Risk Management & Diversification",
    sections: [
      {
        heading: "Why Risk Management Is Everything",
        content: "The most successful investors don't have the best stock picks — they have the best risk management. Consider this math: If you lose 50% of your portfolio, you need a 100% gain just to break even. If you lose 33%, you need a 50% gain. Losses compound faster than you think.\n\nWarren Buffett's Rule #1: Never lose money. Rule #2: Never forget Rule #1. He doesn't mean never have a losing trade — he means protect your capital so aggressively that no single mistake can ruin you.\n\nRisk management isn't about avoiding risk entirely. It's about taking calculated risks where the potential reward justifies the potential loss.",
        keyTakeaway: "Protecting capital is more important than growing it. A 50% loss requires a 100% gain to recover.",
        example: "The recovery math: a $10,000 portfolio that drops 50% falls to $5,000. To climb back to $10,000 you now need a +100% gain — not +50%. Compare the ladder: a 10% loss needs +11% to recover, a 20% loss needs +25%, a 33% loss needs +50%, and a 50% loss needs +100%. Losses get exponentially harder to undo, which is why avoiding the big drawdown beats chasing the big win."
      },
      {
        heading: "Diversification — Don't Put All Eggs in One Basket",
        content: "Diversification is the simplest and most powerful risk management tool. By spreading investments across different stocks, sectors, and asset classes, you reduce the impact of any single investment going wrong.\n\nKey principles:\n• Own stocks across different sectors (tech, healthcare, finance, consumer).\n• Mix growth stocks with value stocks and dividend payers.\n• Consider geographic diversification (U.S., international, emerging markets).\n• Add bonds for stability — they often rise when stocks fall.\n\nA well-diversified portfolio of 15-25 stocks across different sectors captures most of the market's returns while significantly reducing company-specific risk. Beyond 30 stocks, additional diversification benefits diminish rapidly.",
        keyTakeaway: "15-25 stocks across different sectors provides strong diversification. Beyond 30, benefits diminish.",
        example: "Why it matters: put $10,000 all into one stock that falls 40% and you lose $4,000. Spread the same $10,000 across 20 stocks ($500 each) and if one of them falls 40%, you lose just $200 — 2% of the portfolio — while the other 19 likely cushion the blow. Same bad event, a fraction of the damage. That's diversification doing its job."
      },
      {
        heading: "Position Sizing",
        content: "Position sizing determines how much of your portfolio to allocate to each investment. It's arguably more important than which stocks you pick.\n\nThe most common rules:\n• Never put more than 5-10% of your portfolio in a single stock.\n• New investors should cap individual positions at 3-5%.\n• Size positions based on conviction AND risk — a high-conviction, low-risk idea deserves more capital.\n\nThe 1% Rule (for active traders): Never risk more than 1% of your total account on a single trade. If your account is $10,000, your maximum loss on any trade should be $100.\n\nThis means you need to calculate your stop-loss level before entering a trade and size your position accordingly.",
        keyTakeaway: "Never bet more than 5-10% on one stock. Use the 1% rule for active trading to survive losing streaks.",
        example: "Position sizing with the 1% rule: your account is $10,000, so your max risk is 1% = $100 per trade. You buy at $50 and set a stop-loss at $45 — a risk of $5 per share. Position size = $100 ÷ $5 = 20 shares ($1,000 invested). If the stop triggers, you lose exactly $100 (1% of the account) and live to trade another day. The stop-loss distance, not gut feeling, sets the position size."
      },
      {
        heading: "Stop-Loss Orders and Exit Strategy",
        content: "A stop-loss is a pre-set order to sell a stock if it falls to a certain price. It limits your downside automatically, removing emotion from the decision.\n\nCommon approaches:\n• Percentage stop: Sell if the stock drops 7-10% below your buy price.\n• Technical stop: Sell if it breaks below a key support level or moving average.\n• Trailing stop: Automatically moves up as the stock rises. A 10% trailing stop on a stock that rises from $100 to $150 would trigger at $135.\n\nThe critical habit: Set your stop-loss BEFORE you enter the trade, not after. Decide in advance how much you're willing to lose. Amateur investors hope losers will recover. Professionals cut losses quickly and move on.\n\n'The first loss is the best loss' — Wall Street proverb.",
        keyTakeaway: "Always set your exit price before entering a trade. Cutting losses early preserves capital for winning trades."
      }
    ]
  },
  {
    id: "portfolio-construction",
    title: "Building Your First Portfolio",
    subtitle: "From zero to a diversified portfolio using proven strategies",
    duration: "10 min",
    difficulty: "Beginner",
    icon: "🧮",
    relatedQuiz: "Portfolio Construction & Strategy",
    sections: [
      {
        heading: "Start with Your Goals",
        content: "Before buying a single stock, answer three questions:\n\n1. What's your time horizon? Money you need in 1-2 years shouldn't be in stocks. Money you won't touch for 10+ years can handle more volatility.\n\n2. What's your risk tolerance? Be honest. If a 30% portfolio drop would make you panic-sell, you need a more conservative allocation.\n\n3. What's your objective? Growth (capital appreciation), income (dividends), or a mix? Students and young investors typically focus on growth because time is their biggest advantage.\n\nYour answers determine your asset allocation — the mix of stocks, bonds, and cash. A common starting point for young investors: 80-90% stocks, 10-20% bonds/cash.",
        keyTakeaway: "Define your time horizon, risk tolerance, and goals before choosing a single investment."
      },
      {
        heading: "Core-Satellite Strategy",
        content: "Professional portfolio managers often use a 'core-satellite' approach:\n\n• Core (60-80% of portfolio): Low-cost index funds or ETFs that track broad markets. The S&P 500 index has returned ~10% annually over the long term. This is your foundation.\n\n• Satellites (20-40%): Individual stocks, sector ETFs, or thematic investments where you have conviction. This is where you can try to outperform.\n\nWhy this works: The core provides steady, diversified returns regardless of your stock-picking skill. The satellites give you the chance to outperform while limiting the damage if you're wrong.\n\nExample for a $10,000 portfolio:\n- $6,000 in S&P 500 index fund (core)\n- $2,000 split across 4-5 individual growth stocks\n- $1,000 in a sector you believe in (tech, clean energy, etc.)\n- $1,000 in cash/bonds for stability",
        keyTakeaway: "Use index funds as your foundation (core) and individual picks as satellites. This limits risk while allowing outperformance."
      },
      {
        heading: "Dollar-Cost Averaging",
        content: "Dollar-cost averaging (DCA) means investing a fixed amount at regular intervals, regardless of the price. Instead of trying to time the market with one big purchase, you spread your buying over time.\n\nExample: Invest $500 every month into the S&P 500.\n- Month 1: Price is $100/share → buy 5 shares\n- Month 2: Price drops to $80 → buy 6.25 shares\n- Month 3: Price rises to $110 → buy 4.54 shares\n\nAverage cost per share: $95.24 (better than the average price of $96.67)\n\nDCA works because you automatically buy more shares when prices are low and fewer when prices are high. It removes the stress of trying to 'time the bottom' and enforces investing discipline.\n\nStudies show DCA doesn't always beat lump-sum investing, but it dramatically reduces the risk of investing everything at a market peak.",
        keyTakeaway: "Invest a fixed amount regularly. DCA removes emotion, enforces discipline, and reduces timing risk."
      },
      {
        heading: "When to Rebalance",
        content: "Over time, your winning investments grow and your losers shrink, throwing your allocation off target. If you started 80/20 stocks/bonds and stocks soared, you might be 90/10 — taking on more risk than intended.\n\nRebalancing means selling some winners and buying more of the underweight positions to return to your target. This feels counterintuitive (selling winners?) but it's actually a disciplined way to 'sell high, buy low.'\n\nRebalancing guidelines:\n• Check quarterly or semi-annually — don't obsess over daily moves.\n• Rebalance when any asset class drifts more than 5% from target.\n• Use new contributions to rebalance when possible (avoids selling and triggering taxes).\n\nRebalancing won't boost returns dramatically, but it keeps your risk level consistent with your plan — and that prevents panic during downturns.",
        keyTakeaway: "Rebalance when allocations drift 5%+ from targets. It's a disciplined way to sell high and buy low."
      }
    ]
  },
  {
    id: "etfs-index-investing",
    title: "ETFs & Index Investing",
    subtitle: "Build wealth with low-cost, diversified funds that outperform most pros",
    duration: "10 min",
    difficulty: "Beginner",
    icon: "🏦",
    relatedQuiz: "ETFs & Index Funds",
    sections: [
      {
        heading: "What Is an ETF?",
        content: "An Exchange-Traded Fund (ETF) is a basket of securities — stocks, bonds, commodities, or a mix — packaged into a single fund that trades on an exchange just like a regular stock. When you buy one share of the SPDR S&P 500 ETF (ticker: SPY), you instantly own a tiny slice of all 500 companies in the S&P 500 index. No need to buy each stock individually.\n\nETFs were invented in 1993 when State Street launched SPY, and they've since become one of the most popular investment vehicles in the world. As of 2024, over $10 trillion is invested in ETFs globally. Their appeal is simple: instant diversification, low costs, and the flexibility to buy and sell throughout the trading day at real-time prices.\n\nUnlike buying individual stocks, where a single company's bad earnings report can tank your position 20% overnight, an ETF spreads that risk across dozens or hundreds of holdings. If one company in the S&P 500 collapses, it barely dents the overall fund. This built-in diversification makes ETFs an ideal building block for any portfolio, especially for investors who are just getting started.",
        keyTakeaway: "An ETF bundles many securities into one tradable fund, giving you instant diversification at low cost."
      },
      {
        heading: "ETFs vs. Mutual Funds",
        content: "ETFs and mutual funds both offer diversification, but they differ in important ways. Mutual funds are priced once per day after the market closes, meaning you submit a buy or sell order and get whatever price is calculated at 4:00 PM. ETFs trade throughout the day on an exchange, so you can buy at 10:30 AM and sell at 2:15 PM if you want — just like a stock.\n\nCost is where ETFs really shine. The average actively managed mutual fund charges an expense ratio around 0.50-1.00% annually. Many popular ETFs charge 0.03-0.20%. That difference compounds dramatically: on a $100,000 portfolio over 30 years, a 0.75% fee difference costs you over $150,000 in lost returns. Vanguard founder Jack Bogle spent decades hammering this point — fees are the single most reliable predictor of future fund performance.\n\nETFs also tend to be more tax-efficient than mutual funds. Because of how ETF shares are created and redeemed (through a mechanism called 'in-kind' transfers), they generate fewer taxable capital gains distributions. This means you keep more of your returns. The one area where mutual funds have an edge is automatic investing — many brokerages let you set up automatic monthly purchases of mutual funds but not ETFs, though this is changing.",
        keyTakeaway: "ETFs beat mutual funds on cost, tax efficiency, and trading flexibility. Fee differences compound into massive savings over decades."
      },
      {
        heading: "Types of ETFs",
        content: "The ETF universe has exploded into hundreds of categories. Here are the main types every investor should know:\n\nEquity ETFs track stock indexes. SPY and VOO track the S&P 500. QQQ tracks the Nasdaq-100, giving heavy tech exposure. VTI covers the entire U.S. stock market including small and mid-cap companies. These broad market ETFs form the core of most portfolios.\n\nBond ETFs provide fixed-income exposure. BND (Vanguard Total Bond Market) and AGG (iShares Core Aggregate Bond) cover the U.S. investment-grade bond market. TLT focuses on long-term Treasury bonds, which tend to rise when stocks fall, making it a popular hedging tool.\n\nSector ETFs let you bet on specific industries. XLK targets technology, XLF targets financials, XLE targets energy. These are useful when you have conviction about a particular sector's outlook but don't want to pick individual stocks within it.\n\nInternational ETFs provide global diversification. VXUS covers all non-U.S. stocks, EFA focuses on developed markets (Europe, Japan, Australia), and VWO targets emerging markets like China, India, and Brazil.\n\nThematic ETFs target specific trends like clean energy (ICLN), artificial intelligence (BOTZ), cybersecurity (HACK), or genomics (ARKG). These are higher-risk, more concentrated bets on the future.",
        keyTakeaway: "From broad market to niche themes, there's an ETF for virtually every investment thesis. Start broad, then specialize."
      },
      {
        heading: "How to Choose an ETF",
        content: "With over 3,000 ETFs available in the U.S. alone, selecting the right one requires evaluating a few key metrics. Expense ratio is the annual fee charged as a percentage of your investment. For broad index ETFs, anything above 0.10% is overpaying — Vanguard's VOO charges just 0.03%. For niche or thematic ETFs, 0.30-0.75% is typical but still worth comparing against alternatives.\n\nTracking error measures how closely the ETF follows its benchmark index. A good S&P 500 ETF should nearly perfectly mirror the index's returns. Large tracking errors suggest poor fund management or high hidden costs. Check this by comparing the ETF's 1-year and 5-year returns against its stated benchmark.\n\nAssets under management (AUM) matters because larger funds tend to have tighter bid-ask spreads, meaning lower trading costs. Generally, stick with ETFs that have at least $100 million in AUM. The biggest funds like SPY ($500B+) and VOO ($400B+) have razor-thin spreads of just a penny.\n\nLiquidity, measured by average daily trading volume, determines how easily you can buy and sell without moving the price. For most buy-and-hold investors this isn't critical, but active traders should stick to high-volume ETFs. Finally, look at the fund's holdings — make sure you understand what you actually own inside the ETF.",
        keyTakeaway: "Prioritize low expense ratios, minimal tracking error, and sufficient AUM. For broad indexes, you shouldn't pay more than 0.10% annually."
      },
      {
        heading: "The Case for Index Investing",
        content: "Here is one of the most well-documented facts in finance: the vast majority of professional fund managers fail to beat a simple index fund over the long term. The SPIVA Scorecard, published annually by S&P Dow Jones Indices, consistently shows that over 15-year periods, roughly 90% of actively managed U.S. large-cap funds underperform the S&P 500. Not because fund managers are incompetent — but because markets are highly efficient, fees eat into returns, and consistently picking winners is nearly impossible.\n\nJack Bogle, who founded Vanguard and created the first index fund in 1976, was ridiculed at the time. Critics called it 'Bogle's Folly' and said accepting average returns was un-American. But Bogle understood a powerful truth: by accepting the market's average return at near-zero cost, you actually outperform most people who are trying (and paying handsomely) to beat it.\n\nWarren Buffett is perhaps the most vocal advocate of index investing for ordinary investors. He famously bet hedge fund manager Ted Seides $1 million that the S&P 500 would beat a basket of hedge funds over 10 years. Buffett won easily. In his will, Buffett has instructed that 90% of his wife's inheritance be placed in a low-cost S&P 500 index fund. If the greatest investor of all time recommends index funds for his own family, that should tell you something about their power.",
        keyTakeaway: "About 90% of professional managers underperform index funds long-term. Low-cost indexing is the most reliable path to wealth for most investors."
      }
    ]
  },
  {
    id: "behavioral-finance",
    title: "Behavioral Finance & Psychology",
    subtitle: "Understand the mental traps that sabotage even brilliant investors",
    duration: "12 min",
    difficulty: "Intermediate",
    icon: "🧠",
    relatedQuiz: "Behavioral Finance",
    sections: [
      {
        heading: "Why Smart People Make Bad Investment Decisions",
        content: "If investing were purely a math problem, every intelligent person would be a great investor. But they're not — and that's because investing is as much a psychological challenge as an analytical one. Our brains evolved for survival on the African savanna, not for making rational decisions about 401(k) allocations. The mental shortcuts (heuristics) that kept our ancestors alive actively sabotage us in financial markets.\n\nDaniel Kahneman and Amos Tversky pioneered the field of behavioral economics in the 1970s and 1980s, demonstrating through rigorous experiments that humans are systematically irrational when it comes to risk and uncertainty. Kahneman won the Nobel Prize in Economics in 2002 — remarkable for a psychologist who never took an economics class. Their research revealed that we don't process gains and losses symmetrically, we anchor to irrelevant information, and we follow the crowd even when the crowd is wrong.\n\nThe legendary investor Charlie Munger (Warren Buffett's longtime partner at Berkshire Hathaway) compiled a famous list of 25 cognitive biases that lead to misjudgment. He argued that understanding psychology is more important to investing success than understanding accounting. In his words: 'The human mind is a lot like the human egg. When one sperm gets in, it shuts down so the next one can't get in. The mind tends to do the same thing with ideas.'",
        keyTakeaway: "Investing success is more about managing your psychology than mastering spreadsheets. Our brains are wired to make systematic financial errors."
      },
      {
        heading: "Loss Aversion & Prospect Theory",
        content: "Kahneman and Tversky's Prospect Theory, published in 1979, is perhaps the most important paper in behavioral finance. Its central finding: losses hurt approximately twice as much as equivalent gains feel good. Losing $100 produces roughly the same emotional intensity as gaining $200. This asymmetry — called loss aversion — drives a cascade of poor investment decisions.\n\nLoss aversion explains why investors hold losing stocks far too long, hoping they'll recover and 'make them whole.' Selling a loser means admitting you were wrong, which triggers pain. Meanwhile, investors sell winners too quickly to lock in gains and avoid the possibility of those gains disappearing. This pattern — holding losers, selling winners — is called the disposition effect, and studies of brokerage accounts confirm it's widespread.\n\nA classic experiment illustrates the bias: offered a coin flip where heads wins $150 and tails loses $100, most people refuse the bet even though the expected value is positive ($25). The potential loss looms larger than the potential gain. In investing, this manifests as portfolios stuffed with underwater positions that should have been sold long ago and stripped of winners that were sold prematurely. The practical antidote is to use pre-set stop-losses and evaluate each position based on its future prospects, not on what you originally paid for it.",
        keyTakeaway: "We feel losses twice as intensely as gains, causing us to hold losers too long and sell winners too soon. Judge positions by future potential, not past cost."
      },
      {
        heading: "Confirmation Bias & Anchoring",
        content: "Confirmation bias is the tendency to seek, interpret, and remember information that confirms your existing beliefs while ignoring contradictory evidence. If you believe Tesla is the future, you'll devour bullish articles and dismiss bearish ones. If you think a recession is coming, you'll notice every negative headline and skip the positive data. This creates a dangerous echo chamber that reinforces conviction regardless of whether the thesis is actually correct.\n\nIn the investing world, confirmation bias is amplified by social media and algorithm-driven news feeds. Twitter/X, Reddit's WallStreetBets, and YouTube finance channels create communities where bullish or bearish groupthink is constantly reinforced. During the 2021 meme stock mania, GameStop and AMC bulls ignored deteriorating fundamentals because their information ecosystem only served them rocket emojis and diamond-hands memes.\n\nAnchoring is equally insidious. When you buy a stock at $50, that price becomes your mental anchor. If it drops to $30, you think it's 'cheap' — even if the company's fundamentals have deteriorated and $30 is actually expensive relative to its new reality. Similarly, analysts anchor to round numbers and previous price targets. The antidote to both biases is to actively seek disconfirming evidence. Before buying any stock, write down the three best arguments against your thesis. Follow analysts who disagree with you. If your thesis can't survive scrutiny, it wasn't strong enough.",
        keyTakeaway: "Actively seek evidence that proves you wrong. If your investment thesis can't survive the best bear case, don't make the trade."
      },
      {
        heading: "Herd Mentality & FOMO",
        content: "Humans are social creatures, and the fear of missing out (FOMO) is one of the most destructive forces in investing. When everyone around you is making money on the latest hot stock, crypto token, or meme trade, the urge to join is nearly irresistible — even when logic says the opportunity has already passed. Herd mentality explains why asset bubbles form and why they always end badly for latecomers.\n\nHistory is littered with examples. The dot-com bubble of 1999-2000 saw taxi drivers recommending Pets.com. The housing bubble of 2006-2007 had people flipping condos they couldn't afford. The crypto mania of late 2021 featured celebrities promoting coins they didn't understand. In each case, by the time the general public was piling in, the smart money was heading for the exits. Sir John Templeton captured this perfectly: 'Bull markets are born on pessimism, grow on skepticism, mature on optimism, and die on euphoria.'\n\nFOMO creates a specific pattern: investors buy near the top because everyone else seems to be profiting, then panic-sell near the bottom when everyone else is selling. This is the exact opposite of what generates returns. The data backs this up — Dalbar's annual Quantitative Analysis of Investor Behavior consistently shows that the average equity fund investor underperforms the S&P 500 by 3-4% annually, largely because of poorly timed buying and selling driven by emotion.",
        keyTakeaway: "By the time everyone is excited about an investment, you're probably too late. The crowd's euphoria historically signals tops, not opportunities."
      },
      {
        heading: "Overcoming Your Biases",
        content: "Knowing about biases doesn't automatically fix them — but having a structured investment process dramatically reduces their impact. Here are practical strategies used by professional investors to keep emotions in check.\n\nFirst, create an Investment Policy Statement (IPS) for yourself. Write down your strategy, criteria for buying and selling, position sizing rules, and rebalancing schedule before you put any money at risk. When emotions flare, refer to your written plan instead of making impulsive decisions. Legendary trader Ed Seykota said: 'Win or lose, everybody gets what they want out of the market. Some people seem to like to lose, so they win by losing money.'\n\nSecond, keep an investment journal. Record every trade — why you entered, what you expected, and what actually happened. Review it quarterly. Patterns will emerge: maybe you consistently overtrade in volatile markets, or you always hold losers past your stop-loss. You can't fix what you don't measure.\n\nThird, automate what you can. Dollar-cost averaging, automatic rebalancing, and pre-set stop-losses remove decisions from the heat of the moment. The less you intervene, the better you'll perform — Fidelity reportedly found that their best-performing accounts belonged to investors who forgot they had accounts.\n\nFinally, build in cooling-off periods. The 24-hour rule says you should never make an investment decision the same day you get the idea. Sleep on it. If it's still compelling tomorrow with fresh eyes, proceed. This single habit eliminates a surprising number of bad trades.",
        keyTakeaway: "Build a written plan, keep a journal, automate decisions, and enforce a 24-hour cooling-off rule. Systems beat willpower every time."
      }
    ]
  },
  {
    id: "global-markets",
    title: "Global Markets & Economics",
    subtitle: "How macroeconomic forces shape stock prices around the world",
    duration: "12 min",
    difficulty: "Intermediate",
    icon: "🌍",
    relatedQuiz: "Global Markets & Economics",
    sections: [
      {
        heading: "How Macroeconomics Affects Stocks",
        content: "Individual stock prices are driven by company fundamentals, but the overall direction of the market is heavily influenced by macroeconomic forces. Think of macroeconomics as the tide — it lifts or lowers all boats. Even the best company in the world will struggle if the economy enters a deep recession, and even mediocre companies can see their stock prices rise during a strong economic expansion.\n\nThe key macro indicators every investor should track include GDP growth (the broadest measure of economic health), the unemployment rate (a lagging indicator that confirms economic trends), consumer spending (which drives roughly 70% of U.S. GDP), and manufacturing indexes like the ISM Purchasing Managers' Index (a leading indicator that signals expansion or contraction ahead of official data).\n\nThe business cycle — expansion, peak, contraction, trough — typically lasts 5-10 years in the modern era. Different sectors perform best at different stages: cyclical sectors like consumer discretionary and industrials outperform during expansions, while defensive sectors like utilities, healthcare, and consumer staples hold up better during contractions. Understanding where we are in the cycle helps you position your portfolio accordingly, a strategy known as sector rotation.",
        keyTakeaway: "Macro forces set the direction of the entire market. Track GDP, employment, and leading indicators to understand the cycle and position your portfolio."
      },
      {
        heading: "Interest Rates & The Federal Reserve",
        content: "The Federal Reserve (the 'Fed') is the most powerful institution in global finance, and its interest rate decisions move markets more than almost anything else. The Fed sets the federal funds rate — the rate banks charge each other for overnight loans — which cascades through the entire economy. When the Fed raises rates, borrowing becomes more expensive for companies and consumers, slowing economic activity. When it cuts rates, borrowing becomes cheaper, stimulating growth.\n\nInterest rates affect stocks through several channels. First, higher rates increase the discount rate used in valuation models (like DCF), mathematically reducing the present value of future cash flows. This hits growth stocks especially hard because their value depends on earnings far in the future. Second, higher rates make bonds and savings accounts more attractive relative to stocks, pulling money out of equities. When 10-year Treasuries yield 5%, investors demand a higher return from stocks to justify the extra risk.\n\nThe Fed's communication matters as much as its actions. Markets hang on every word of the Fed Chair's press conferences and the minutes of FOMC (Federal Open Market Committee) meetings. The phrase 'data dependent' from Chair Jerome Powell can move billions in market value. The bond market's expectations for future rate changes, visible in the CME FedWatch tool, often tell you more about the market's direction than stock charts do.",
        keyTakeaway: "The Fed's interest rate decisions are the single most important macro driver of stock prices. Higher rates hurt growth stocks most; lower rates fuel risk-taking."
      },
      {
        heading: "Inflation's Impact on Investments",
        content: "Inflation — the general increase in prices over time — is the silent wealth destroyer that every investor must account for. If your investments return 7% annually but inflation runs at 4%, your real (inflation-adjusted) return is only 3%. The U.S. Federal Reserve targets 2% annual inflation, but it has historically ranged from near-zero to double digits.\n\nThe 2021-2023 inflation surge was a painful reminder of inflation's impact. As the Consumer Price Index (CPI) spiked to 9.1% in June 2022 — the highest in 40 years — the Fed responded with aggressive rate hikes that hammered both stocks and bonds simultaneously. The S&P 500 fell 25% from its peak, and long-term Treasury bonds lost over 30% of their value. The traditional 60/40 portfolio (60% stocks, 40% bonds) had its worst year in decades because bonds failed to provide their usual cushion.\n\nCertain investments provide better inflation protection than others. Real assets like real estate, commodities, and infrastructure tend to keep pace with inflation because their prices rise alongside the general price level. Treasury Inflation-Protected Securities (TIPS) are bonds that automatically adjust for inflation. Companies with strong pricing power — those that can pass cost increases to customers without losing sales, like Coca-Cola, Apple, or Procter & Gamble — tend to maintain profit margins during inflationary periods. Highly leveraged companies and long-duration bonds are the most vulnerable to rising inflation.",
        keyTakeaway: "Inflation erodes real returns and can devastate portfolios when it spikes. Own assets with pricing power, real assets, and TIPS for protection."
      },
      {
        heading: "Currency & International Investing",
        content: "When you invest outside your home country, you take on currency risk in addition to the usual market risk. If you buy a Japanese stock and the yen weakens 10% against the dollar, your returns are reduced by 10% even if the stock price didn't change in yen terms. Conversely, a strengthening foreign currency boosts your returns.\n\nThe U.S. dollar's status as the world's reserve currency gives American investors a unique advantage and challenge. A strong dollar makes foreign investments less attractive (their returns translate into fewer dollars) and hurts U.S. companies that earn revenue overseas. When Apple reports that foreign exchange reduced its revenue by $3 billion, that's the strong dollar at work. Conversely, a weakening dollar makes foreign stocks more attractive and boosts the overseas earnings of U.S. multinationals.\n\nFor most individual investors, the simplest approach to currency risk is to accept it as part of the diversification benefit. Over long periods, currencies tend to fluctuate around fair value determined by relative inflation rates and economic fundamentals (a concept called Purchasing Power Parity). Some investors hedge currency exposure through currency-hedged ETFs (like HEFA, the hedged version of EFA), but hedging has a cost and removes a potential source of diversification. Academic research suggests that for long-term investors, the diversification benefits of international investing outweigh the additional currency volatility.",
        keyTakeaway: "International investing adds currency risk, but over the long term, diversification benefits generally outweigh the extra volatility."
      },
      {
        heading: "Emerging Markets: Opportunity and Risk",
        content: "Emerging markets — countries transitioning from developing to developed economies — offer some of the most compelling long-term growth opportunities in investing. China, India, Brazil, Indonesia, Mexico, and Vietnam are home to billions of people with rising incomes, growing middle classes, and increasing consumer spending. India's GDP is projected to become the third largest in the world by 2030, while Indonesia and Vietnam are rapidly industrializing. These demographic and economic tailwinds can translate into powerful stock market returns.\n\nHowever, emerging markets come with risks that don't exist (or are minimal) in developed markets. Political instability can upend investment theses overnight — China's sudden crackdown on its tech sector in 2021 wiped hundreds of billions from companies like Alibaba, Tencent, and Didi. Currency crises can devastate returns, as Turkish and Argentine investors learned painfully. Regulatory environments are less predictable, corporate governance standards may be weaker, and accounting transparency can be questionable.\n\nThe most prudent approach for most investors is to gain emerging market exposure through diversified ETFs like VWO (Vanguard FTSE Emerging Markets) or IEMG (iShares Core MSCI Emerging Markets) rather than picking individual stocks. A common allocation is 5-15% of your equity portfolio in emerging markets. The key is to have a long time horizon — emerging market returns tend to be lumpy, with years of underperformance punctuated by explosive rallies. Patience and diversification are non-negotiable.",
        keyTakeaway: "Emerging markets offer exceptional long-term growth potential but carry political, currency, and governance risks. Use diversified ETFs and a long time horizon."
      }
    ]
  },
  {
    id: "esg-investing",
    title: "ESG & Sustainable Investing",
    subtitle: "Align your portfolio with your values without sacrificing returns",
    duration: "8 min",
    difficulty: "Beginner",
    icon: "🌱",
    relatedQuiz: "ESG & Sustainable Investing",
    sections: [
      {
        heading: "What Is ESG Investing?",
        content: "ESG investing evaluates companies based on three non-financial pillars: Environmental, Social, and Governance factors. The idea is that companies managing these risks and opportunities well are better-run businesses that will deliver superior long-term returns — and that investors can use their capital to encourage positive change.\n\nESG investing has exploded in popularity. Global ESG assets surpassed $30 trillion in 2022, and major institutional investors like BlackRock, the world's largest asset manager with over $10 trillion under management, have made ESG integration a core part of their investment process. CEO Larry Fink's annual letters to corporate leaders have pushed ESG to the top of boardroom agendas worldwide.\n\nIt's important to distinguish between different approaches. ESG integration means considering ESG factors alongside traditional financial analysis — not replacing it. Negative screening means excluding entire industries (tobacco, weapons, fossil fuels). Positive screening means actively seeking companies with strong ESG profiles. Impact investing goes further, targeting measurable social or environmental outcomes alongside financial returns. Most mainstream ESG funds use integration or screening, not pure impact investing. The spectrum is wide, and investors should understand exactly what approach a fund takes before investing.",
        keyTakeaway: "ESG investing considers environmental, social, and governance factors alongside financials. It ranges from simple screening to targeted impact investing."
      },
      {
        heading: "The E: Environmental Factors",
        content: "The environmental pillar examines how a company interacts with the natural world. This includes carbon emissions, energy efficiency, waste management, water usage, pollution, and biodiversity impact. Climate change has elevated the E to the most prominent and debated of the three pillars.\n\nFor investors, environmental factors represent both risks and opportunities. On the risk side, companies heavily dependent on fossil fuels face 'stranded asset' risk — the possibility that regulatory changes or technological shifts could render their reserves worthless. Coal companies have already experienced this devastation: Peabody Energy, once the world's largest private coal company, went bankrupt in 2016. On the opportunity side, the clean energy transition is creating massive new markets. Tesla's rise from a niche automaker to one of the world's most valuable companies demonstrates how environmental megatrends can create enormous shareholder value.\n\nPractically, investors can evaluate companies through metrics like carbon intensity (emissions per dollar of revenue), renewable energy usage, and science-based emissions targets. The CDP (formerly Carbon Disclosure Project) collects environmental data from thousands of companies, and the Task Force on Climate-Related Financial Disclosures (TCFD) is pushing for standardized climate risk reporting. Companies like Microsoft, which has pledged to become carbon negative by 2030, and Unilever, with its sustainable living plan, are frequently cited as environmental leaders.",
        keyTakeaway: "Environmental factors represent real financial risks (stranded assets, regulation) and opportunities (clean energy, efficiency). Climate disclosure is rapidly becoming standard."
      },
      {
        heading: "The S: Social Factors",
        content: "The social pillar evaluates how a company manages relationships with its employees, suppliers, customers, and the communities where it operates. Key issues include labor practices, diversity and inclusion, employee health and safety, data privacy, supply chain standards, and community impact.\n\nSocial factors have proven to be financially material in dramatic fashion. When working conditions in Apple's Chinese supplier factories (particularly Foxconn) made global headlines in 2012, it created a reputational crisis that forced Apple to overhaul its supply chain oversight. When Wells Fargo's toxic sales culture led employees to create millions of fake accounts, the bank paid over $3 billion in fines, its CEO was fired, and the stock underperformed for years. More recently, companies with poor data privacy practices have faced massive fines under regulations like Europe's GDPR — Meta has been fined over $1.3 billion for data transfers alone.\n\nOn the positive side, companies that invest in their workforce tend to outperform. Costco's model of paying above-market wages results in lower turnover, higher productivity, and better customer service — contributing to stock returns that have crushed competitors. Research from Harvard Business School shows that companies on 'Best Places to Work' lists outperform their peers by 2-3% per year. Diversity is also increasingly linked to performance: McKinsey's research consistently finds that companies in the top quartile for ethnic and gender diversity are more likely to achieve above-average profitability.",
        keyTakeaway: "Social factors like employee treatment, data privacy, and supply chain ethics have clear financial consequences — both positive and catastrophically negative."
      },
      {
        heading: "The G: Governance Factors",
        content: "Governance is arguably the most important ESG pillar from a pure investment perspective because it determines how well a company is managed and whether leadership acts in shareholders' best interests. Key governance factors include board independence, executive compensation, shareholder rights, accounting transparency, and anti-corruption measures.\n\nPoor governance has destroyed more shareholder value than almost any other risk factor. Enron's board failed to provide oversight, allowing executives to hide billions in debt through off-balance-sheet entities — shareholders lost $74 billion when the fraud collapsed in 2001. WeWork's governance was so dysfunctional (founder Adam Neumann had supervoting shares, leased his own buildings to the company, and trademarked the word 'We' to sell back to the company for $5.9 million) that its IPO spectacularly imploded. Wirecard, once a $28 billion German fintech darling, turned out to have $2 billion in cash that simply didn't exist — a failure of both management integrity and board oversight.\n\nWhat to look for: A strong board has a majority of independent directors (not current or former executives), separates the CEO and Chairman roles, ties executive pay to long-term performance rather than short-term stock price, and provides clear financial reporting. Red flags include dual-class share structures that give founders outsized control (common in tech), excessive related-party transactions, and frequent auditor changes. Proxy advisory firms like ISS and Glass Lewis evaluate governance quality and recommend how shareholders should vote.",
        keyTakeaway: "Governance quality determines whether a company's leadership works for shareholders or for themselves. Poor governance is the most reliable predictor of corporate catastrophe."
      },
      {
        heading: "Does ESG Investing Sacrifice Returns?",
        content: "The million-dollar question: can you do well by doing good? The evidence is nuanced but increasingly encouraging. A landmark 2015 meta-analysis by Oxford University and Arabesque Partners reviewed over 200 studies and found that 88% showed a positive correlation between strong ESG practices and operational performance, while 80% found a positive effect on stock price performance. A 2021 NYU Stern study analyzing over 1,000 research papers reached similar conclusions — the majority of studies find either positive or neutral relationships between ESG and financial performance.\n\nHowever, the picture isn't uniformly rosy. Performance depends heavily on which ESG strategy you use. Broad ESG integration tends to perform in line with or slightly better than conventional investing. But exclusionary screening (removing fossil fuels, tobacco, etc.) can sometimes hurt returns if those sectors rally — energy stocks surged in 2022, causing ESG funds that excluded oil companies to underperform the S&P 500 significantly. Meanwhile, some ESG funds have been accused of 'greenwashing' — marketing themselves as sustainable while holding stocks that hardly qualify.\n\nThe most balanced view: ESG factors are financially material risk indicators. Companies with strong ESG profiles tend to have lower cost of capital, fewer regulatory penalties, better employee retention, and more resilient business models. Over the long run, avoiding poorly governed, environmentally reckless, or socially harmful companies is simply good risk management. The key is choosing ESG funds with genuine, well-defined methodologies rather than marketing-driven labels. Popular ESG ETFs include ESGU (iShares ESG Aware MSCI USA), SUSA (iShares MSCI USA ESG Select), and DSI (KLD 400 Social Index).",
        keyTakeaway: "The evidence suggests ESG investing does not require sacrificing returns — strong ESG practices correlate with lower risk and competitive long-term performance."
      }
    ]
  },
  {
    id: "options-derivatives",
    title: "Options & Derivatives Basics",
    subtitle: "Understand calls, puts, and how derivatives work in modern markets",
    duration: "14 min",
    difficulty: "Advanced",
    icon: "🔄",
    relatedQuiz: "Options & Derivatives",
    sections: [
      {
        heading: "What Are Derivatives?",
        content: "A derivative is a financial contract whose value is derived from an underlying asset — stocks, bonds, commodities, currencies, or even interest rates. The four main types are options, futures, forwards, and swaps. Derivatives serve two critical purposes: hedging (reducing risk) and speculation (betting on price movements).\n\nThe derivatives market is enormous — the notional value of outstanding derivatives contracts exceeds $600 trillion globally, dwarfing the entire stock market. Despite their reputation for complexity, the basic concepts are straightforward. When a farmer sells wheat futures to lock in a price before harvest, that's a derivative being used sensibly. When a hedge fund uses 50x leverage on oil futures, that's derivatives being used dangerously.\n\nFor individual investors, options are the most accessible derivative. Understanding them isn't just about trading them — it's about understanding how professional investors think about risk, probability, and market expectations.",
        keyTakeaway: "Derivatives derive value from underlying assets. Options are the most relevant derivative for individual investors — understanding them makes you a better investor even if you never trade one."
      },
      {
        heading: "Call Options: The Right to Buy",
        content: "A call option gives you the right (but not the obligation) to buy 100 shares of a stock at a specific price (the strike price) before a specific date (the expiration date). For this right, you pay a premium.\n\nExample: Apple is trading at $230. You buy a call option with a $240 strike price expiring in 30 days for $5.00 per share ($500 total for the 100-share contract). Three scenarios:\n\n1. Apple rises to $260: Your option is worth $20 per share ($260 - $240 strike). Profit = $2,000 - $500 premium = $1,500 (300% return)\n2. Apple stays at $230: Your option expires worthless because nobody would exercise the right to buy at $240 when the stock is at $230. Loss = $500 premium (100% loss)\n3. Apple drops to $200: Same as scenario 2 — you lose only the $500 premium, not the full stock decline\n\nThe key insight: calls let you control 100 shares with a fraction of the capital. That leverage amplifies both gains and losses percentage-wise, but your maximum loss is always limited to the premium paid.",
        keyTakeaway: "A call option = the right to buy at a set price. You profit when the stock rises above the strike price plus your premium cost. Max loss = the premium paid."
      },
      {
        heading: "Put Options: The Right to Sell",
        content: "A put option gives you the right to sell 100 shares at the strike price before expiration. Puts gain value when the stock price falls — making them the primary tool for hedging downside risk.\n\nExample: You own 100 shares of Apple at $230 and are worried about a potential drop. You buy a put with a $220 strike for $4.00 ($400 total). If Apple drops to $180, you can sell your shares at $220 instead of $180 — saving $4,000 minus the $400 premium. If Apple rises instead, you only lose the $400 premium, and your shares participate in the upside.\n\nThis is exactly like insurance. You pay a premium for protection, and you hope you never need it. Portfolio managers routinely buy puts on the S&P 500 (using SPY or SPX options) to protect against market crashes.\n\nProfessional investors also use puts speculatively. When hedge fund manager Bill Ackman bought $27 million in puts on the market index in February 2020 — just before COVID crashed stocks — those puts became worth $2.6 billion. A 100:1 return in one month.",
        keyTakeaway: "A put option = the right to sell at a set price. Puts profit when stocks fall, making them the primary tool for portfolio protection. Think of them as portfolio insurance."
      },
      {
        heading: "Options Pricing: What Determines Premium?",
        content: "The price you pay for an option (the premium) is determined by five factors, elegantly captured by the Black-Scholes model:\n\n1. Intrinsic Value: How much the option is 'in the money.' A $240 call when the stock is at $250 has $10 of intrinsic value. If the stock is below $240, the intrinsic value is zero.\n\n2. Time Value: More time until expiration = higher premium, because there's more time for the stock to move favorably. This time value decays as expiration approaches — accelerating in the final weeks. This is called theta decay.\n\n3. Implied Volatility (IV): The market's expectation of how much the stock will move. Higher volatility = higher premiums. Before earnings announcements, IV spikes because the stock could move dramatically in either direction. After the announcement, IV collapses (called 'IV crush').\n\n4. Interest Rates: Higher rates slightly increase call premiums and decrease put premiums. Minor factor for most investors.\n\n5. Dividends: Expected dividends decrease call premiums and increase put premiums, because dividends reduce the stock price on the ex-dividend date.\n\nThe most important takeaway: options are priced based on probability. The market is telling you the expected range of stock movement. Understanding this makes you a better investor, period.",
        keyTakeaway: "Option premiums reflect five factors: intrinsic value, time, volatility, rates, and dividends. Implied volatility and time decay are the most important for practical trading."
      },
      {
        heading: "Common Options Strategies for Beginners",
        content: "While options can be incredibly complex, a few strategies are accessible and commonly used:\n\nCovered Call: Own 100 shares + sell a call option. You collect the premium as income but cap your upside at the strike price. Ideal for generating extra income on stocks you hold. If you own Apple at $230 and sell a $250 call for $5, you earn $500 in premium. If Apple stays below $250, you keep the premium and the shares.\n\nProtective Put: Own 100 shares + buy a put option. You pay for downside protection while keeping upside. This is the 'insurance' strategy described earlier. Costs money but provides peace of mind.\n\nCash-Secured Put: Sell a put option while keeping enough cash to buy the stock if assigned. You earn the premium and agree to buy the stock at a lower price — which means you're getting paid to set a limit buy order. Warren Buffett has used this strategy extensively.\n\nIMPORTANT WARNING: Never sell 'naked' options (selling calls without owning the stock, or selling puts without the cash). The losses can be theoretically unlimited for naked calls. Stick to covered strategies when starting out. Many beginner traders have been wiped out by misunderstanding the risks of selling naked options.",
        keyTakeaway: "Start with covered calls (income), protective puts (insurance), and cash-secured puts (getting paid to wait). Never sell naked options — the risk is potentially unlimited."
      }
    ]
  },
  {
    id: "crypto-blockchain",
    title: "Cryptocurrency & Blockchain",
    subtitle: "Digital assets, DeFi, and what every investor should understand",
    duration: "12 min",
    difficulty: "Intermediate",
    icon: "⛓️",
    sections: [
      {
        heading: "What Is Blockchain Technology?",
        content: "A blockchain is a distributed, immutable ledger — a database shared across thousands of computers where every transaction is permanently recorded and cannot be altered. Think of it as a Google spreadsheet that everyone can read, anyone can add to (following rules), but nobody can edit or delete previous entries.\n\nBitcoin, created in 2009 by the pseudonymous Satoshi Nakamoto, was the first application of blockchain technology. It solved the 'double-spending problem' — how to prevent someone from spending the same digital dollar twice — without needing a trusted intermediary like a bank.\n\nThe key innovation is decentralization. Traditional finance relies on central authorities (banks, clearinghouses, payment processors) to verify transactions. Blockchain replaces these with a network of computers (nodes) that collectively validate transactions through consensus mechanisms. This removes single points of failure and reduces the need for trust in any one institution.\n\nBlockchain technology extends far beyond cryptocurrency. It's being used for supply chain tracking (IBM Food Trust traces food from farm to store), cross-border payments (Ripple settles international transfers in seconds instead of days), digital identity, voting systems, and tokenization of real-world assets like real estate and art.",
        keyTakeaway: "Blockchain is a shared, tamper-proof database that removes the need for trusted intermediaries. Bitcoin was its first application, but the technology has far broader implications."
      },
      {
        heading: "Bitcoin: Digital Gold",
        content: "Bitcoin is the first and largest cryptocurrency by market capitalization (approximately $2 trillion as of 2025). Its value proposition rests on scarcity and decentralization: there will only ever be 21 million bitcoins (about 19.5 million have been mined), and no government or institution can print more or freeze your holdings.\n\nBitcoin proponents call it 'digital gold' because, like gold, it's scarce, durable, portable, and divisible — but far more practical for digital transfer. BlackRock CEO Larry Fink, who was initially skeptical, now calls Bitcoin 'digital gold' and launched the iShares Bitcoin Trust (IBIT), which gathered over $20 billion in its first year — the fastest-growing ETF in history.\n\nCriticisms of Bitcoin include extreme price volatility (it dropped 77% from Nov 2021 to Nov 2022), enormous energy consumption (Bitcoin mining uses more electricity than many countries), limited transaction throughput (about 7 transactions per second vs. Visa's 65,000), and its use in illicit activity (though this is declining as a percentage).\n\nFor investors, the key question isn't whether Bitcoin will go up or down — it's what role, if any, it plays in a diversified portfolio. Research from Fidelity suggests a 1-5% Bitcoin allocation has historically improved risk-adjusted returns due to Bitcoin's low correlation with traditional assets. However, past performance in a new asset class is a weak predictor.",
        keyTakeaway: "Bitcoin is a scarce digital asset with institutional adoption accelerating. A small allocation (1-5%) may improve portfolio diversification, but extreme volatility requires strong risk tolerance."
      },
      {
        heading: "Ethereum & Smart Contracts",
        content: "If Bitcoin is digital gold, Ethereum is a digital computer. Created by Vitalik Buterin in 2015, Ethereum introduced smart contracts — self-executing code that runs on the blockchain. Smart contracts enable 'programmable money' — financial transactions that execute automatically when conditions are met, without intermediaries.\n\nThis innovation spawned an entire ecosystem:\n\nDecentralized Finance (DeFi): Financial services (lending, borrowing, trading, insurance) built on Ethereum without banks. Aave lets you earn interest on crypto deposits. Uniswap lets you trade tokens directly with other users. Compound lets you borrow against crypto collateral. Total value locked in DeFi protocols exceeds $50 billion.\n\nNFTs (Non-Fungible Tokens): Unique digital assets representing ownership of art, music, or collectibles. The NFT market experienced a speculative frenzy in 2021-2022 (Bored Ape Yacht Club NFTs sold for millions) followed by a massive crash. The technology is real, but most speculative NFT projects lost 90%+ of their value.\n\nLayer 2 Solutions: Because Ethereum's base layer is slow and expensive (gas fees can exceed $50 during congestion), Layer 2 networks like Arbitrum and Optimism process transactions off the main chain and batch them for settlement — dramatically reducing costs.\n\nEthereum's transition from Proof of Work to Proof of Stake in September 2022 ('The Merge') reduced its energy consumption by 99.95%, addressing the biggest environmental criticism of blockchain technology.",
        keyTakeaway: "Ethereum enables programmable money through smart contracts, powering DeFi, NFTs, and a growing ecosystem. Understanding Ethereum is key to understanding where blockchain technology is heading."
      },
      {
        heading: "Crypto Investing: Risks and Reality",
        content: "The crypto market is the Wild West of investing. Understanding the risks is more important than chasing returns:\n\nVolatility: Crypto routinely moves 10-20% in a single day. Bitcoin has experienced four drawdowns of 50%+ in its history. Many altcoins have lost 95-99% from their peaks. If you can't handle this level of volatility, crypto isn't for you.\n\nRegulation: The regulatory environment is rapidly evolving. The SEC has approved Bitcoin and Ethereum ETFs, signaling growing acceptance, but has also sued major exchanges (Coinbase, Binance) for operating as unregistered securities exchanges. Regulatory clarity will take years.\n\nScams and Rug Pulls: The crypto space is plagued by fraud. The FTX collapse in November 2022 — where exchange founder Sam Bankman-Fried was convicted of stealing $8 billion in customer funds — wiped out countless investors. The Terra/Luna collapse earlier that year destroyed $40 billion in value in days. Always self-custody important holdings (hardware wallets like Ledger or Trezor) and never invest in tokens you don't understand.\n\nTax Implications: In most countries, every crypto trade is a taxable event. Swapping Bitcoin for Ethereum, buying an NFT, or even earning staking rewards can trigger capital gains taxes. Keep meticulous records.\n\nSensible Approach: Only invest what you can afford to lose entirely. Use dollar-cost averaging. Stick to established assets (BTC, ETH) for the core allocation. The easiest access for traditional investors is through regulated ETFs like IBIT (Bitcoin) or ETHA (Ethereum) rather than managing crypto wallets directly.",
        keyTakeaway: "Crypto offers genuine innovation but extreme risk. Only invest what you can fully lose, use regulated products (ETFs), stick to established assets, and never trust anyone with custody of your holdings."
      },
      {
        heading: "Blockchain's Future: Beyond Speculation",
        content: "Looking past the speculation and volatility, several blockchain applications are genuinely transforming finance and technology:\n\nTokenization of Real-World Assets (RWA): BlackRock launched a tokenized money market fund (BUIDL) on Ethereum that surpassed $500 million in assets. Real estate, bonds, and private equity are being tokenized to enable fractional ownership and 24/7 trading. The Boston Consulting Group estimates tokenized assets could reach $16 trillion by 2030.\n\nCentral Bank Digital Currencies (CBDCs): Over 130 countries are exploring digital versions of their national currencies. China's digital yuan (e-CNY) is already in live use. CBDCs use blockchain-like technology but are centrally controlled — the opposite philosophy of Bitcoin.\n\nCross-Border Payments: Traditional international wire transfers take 3-5 days and cost 5-7% in fees. Blockchain-based solutions (Ripple, Stellar, stablecoins like USDC) can settle in seconds for pennies. This is particularly transformative for remittances — workers sending money home to developing countries pay billions in unnecessary fees annually.\n\nDecentralized Identity: Self-sovereign identity systems let individuals control their personal data without relying on Facebook, Google, or government databases. You prove you're over 21 without revealing your birthdate, or prove you graduated from a university without sharing your transcript.\n\nThe key for investors: separate the technology (blockchain) from the speculation (crypto trading). The technology is being adopted by the world's largest financial institutions. The speculation may or may not reward individual participants. Understanding the difference is what makes you a sophisticated investor.",
        keyTakeaway: "Blockchain technology is being adopted by major institutions for tokenization, payments, and identity. Separate the real infrastructure transformation from speculative token trading."
      }
    ]
  },
];
