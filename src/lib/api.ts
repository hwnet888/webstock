export interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

/**
 * Fetch major global indices.
 * Uses Yahoo Finance unofficial API — free, no key required.
 * Falls back to static mock data if fetch fails.
 */
export async function getIndices(): Promise<IndexData[]> {
  const symbols = [
    { symbol: "%5EHSI", name: "恒生指数" },
    { symbol: "%5EGSPC", name: "标普500" },
    { symbol: "%5EDJI", name: "道琼斯" },
    { symbol: "%5EIXIC", name: "纳斯达克" },
    { symbol: "%5EN225", name: "日经225" },
    { symbol: "000001.SS", name: "上证指数" },
    { symbol: "399001.SZ", name: "深证成指" },
    { symbol: "%5EFTSE", name: "富时100" },
  ];

  try {
    const query = symbols.map((s) => s.symbol).join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${query}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const results = data.quoteResponse?.result ?? [];

    return results.map((r: any, i: number) => ({
      symbol: symbols[i]?.symbol ?? r.symbol,
      name: symbols[i]?.name ?? r.shortName ?? r.symbol,
      price: r.regularMarketPrice ?? 0,
      change: r.regularMarketChange ?? 0,
      changePercent: r.regularMarketChangePercent ?? 0,
    }));
  } catch {
    // Fallback to static data when API is unavailable
    return getFallbackIndices();
  }
}

function getFallbackIndices(): IndexData[] {
  return [
    { symbol: "HSI", name: "恒生指数", price: 21458.32, change: 156.78, changePercent: 0.74 },
    { symbol: "SPX", name: "标普500", price: 5912.47, change: -12.34, changePercent: -0.21 },
    { symbol: "DJI", name: "道琼斯", price: 43870.21, change: 89.12, changePercent: 0.20 },
    { symbol: "IXIC", name: "纳斯达克", price: 20670.55, change: -45.67, changePercent: -0.22 },
    { symbol: "N225", name: "日经225", price: 38956.18, change: 234.56, changePercent: 0.61 },
    { symbol: "000001", name: "上证指数", price: 3389.72, change: 25.43, changePercent: 0.76 },
    { symbol: "399001", name: "深证成指", price: 10686.35, change: -18.90, changePercent: -0.18 },
    { symbol: "FTSE", name: "富时100", price: 8512.64, change: 34.21, changePercent: 0.40 },
  ];
}

/**
 * Fetch trending/hot stocks. Returns mock + optional fallback.
 */
export async function getTrendingStocks(): Promise<StockQuote[]> {
  try {
    const symbols = ["AAPL", "TSLA", "NVDA", "MSFT", "GOOGL", "BABA", "0700.HK", "9988.HK"].join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const results = data.quoteResponse?.result ?? [];

    return results.map((r: any) => ({
      symbol: r.symbol,
      name: r.shortName ?? r.symbol,
      price: r.regularMarketPrice ?? 0,
      change: r.regularMarketChange ?? 0,
      changePercent: r.regularMarketChangePercent ?? 0,
    }));
  } catch {
    return [
      { symbol: "AAPL", name: "Apple Inc.", price: 198.45, change: 2.34, changePercent: 1.19 },
      { symbol: "TSLA", name: "Tesla Inc.", price: 342.17, change: -5.63, changePercent: -1.62 },
      { symbol: "NVDA", name: "NVIDIA Corp.", price: 968.52, change: 15.78, changePercent: 1.66 },
      { symbol: "MSFT", name: "Microsoft Corp.", price: 448.91, change: 3.21, changePercent: 0.72 },
      { symbol: "GOOGL", name: "Alphabet Inc.", price: 193.14, change: -1.45, changePercent: -0.75 },
      { symbol: "BABA", name: "阿里巴巴", price: 102.34, change: 1.23, changePercent: 1.22 },
      { symbol: "0700.HK", name: "腾讯控股", price: 485.60, change: 8.20, changePercent: 1.72 },
      { symbol: "9988.HK", name: "阿里巴巴-SW", price: 98.75, change: -0.85, changePercent: -0.85 },
    ];
  }
}
