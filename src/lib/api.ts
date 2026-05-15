export interface IndexData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

const now = () => new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

/**
 * Fetch major global indices.
 * Uses Yahoo Finance unofficial API — free, no key required.
 * Falls back to static mock data if fetch fails.
 */
export async function getIndices(): Promise<IndexData[]> {
  const symbols = [
    { symbol: "000001.SS", name: "上证指数" },
    { symbol: "399001.SZ", name: "深证成指" },
    { symbol: "%5EHSI", name: "恒生指数" },
    { symbol: "%5EDJI", name: "道琼斯" },
    { symbol: "%5EIXIC", name: "纳斯达克" },
  ];

  const timestamp = now();

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
      updatedAt: timestamp,
    }));
  } catch {
    return getFallbackIndices();
  }
}

function getFallbackIndices(): IndexData[] {
  const timestamp = now();
  return [
    { symbol: "000001", name: "上证指数", price: 3389.72, change: 25.43, changePercent: 0.76, updatedAt: timestamp },
    { symbol: "399001", name: "深证成指", price: 10686.35, change: -18.90, changePercent: -0.18, updatedAt: timestamp },
    { symbol: "HSI", name: "恒生指数", price: 21458.32, change: 156.78, changePercent: 0.74, updatedAt: timestamp },
    { symbol: "DJI", name: "道琼斯", price: 43870.21, change: 89.12, changePercent: 0.20, updatedAt: timestamp },
    { symbol: "IXIC", name: "纳斯达克", price: 20670.55, change: -45.67, changePercent: -0.22, updatedAt: timestamp },
  ];
}

/**
 * Fetch A-share top 5 gainers from East Money API.
 * Falls back to mock data if fetch fails.
 */
export async function getAShareTopGainers(): Promise<StockQuote[]> {
  const timestamp = now();

  try {
    const params = new URLSearchParams({
      pn: "1",
      pz: "5",
      po: "1",
      np: "1",
      ut: "bd1d9ddb04089700cf9c27f6f7426281",
      fltt: "2",
      invt: "2",
      fid: "f3",
      fs: "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23",
      fields: "f2,f3,f12,f14",
    });

    const url = `https://push2.eastmoney.com/api/qt/clist/get?${params}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Referer: "https://quote.eastmoney.com/" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const list: any[] = data?.data?.diff ?? [];

    if (list.length === 0) throw new Error("Empty result");

    return list.map((r: any) => ({
      symbol: r.f12 ?? "",
      name: r.f14 ?? r.f12 ?? "",
      price: r.f2 ?? 0,
      change: (r.f2 ?? 0) - (r.f2 ?? 0) / (1 + (r.f3 ?? 0) / 100),
      changePercent: r.f3 ?? 0,
      updatedAt: timestamp,
    }));
  } catch {
    return getFallbackTopGainers();
  }
}

function getFallbackTopGainers(): StockQuote[] {
  const timestamp = now();
  return [
    { symbol: "300750", name: "宁德时代", price: 289.50, change: 18.75, changePercent: 6.92, updatedAt: timestamp },
    { symbol: "002594", name: "比亚迪", price: 312.80, change: 18.60, changePercent: 6.32, updatedAt: timestamp },
    { symbol: "688981", name: "中芯国际", price: 68.32, change: 3.82, changePercent: 5.92, updatedAt: timestamp },
    { symbol: "601012", name: "隆基绿能", price: 22.18, change: 1.18, changePercent: 5.62, updatedAt: timestamp },
    { symbol: "600519", name: "贵州茅台", price: 1832.00, change: 88.00, changePercent: 5.05, updatedAt: timestamp },
  ];
}
