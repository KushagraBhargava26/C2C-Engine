// Mirrors GET /api/v1/portfolio/exposure from CONTRACT.md v2, Endpoint E.

const HOLDINGS = [
  {
    ticker: "RELIANCE",
    name: "Reliance Industries",
    sector: "Energy",
    region: "IN",
    exposurePct: 18.0,
    riskLevel: "HIGH",
    chain: [
      { node: "Red Sea shipping disruption", type: "EVENT" },
      { node: "Oil price +8%", type: "MARKET_SIGNAL" },
      { node: "Shipping costs -3%", type: "MARKET_SIGNAL" },
      { node: "Reliance Industries", type: "HOLDING", impactPct: 18.0 },
    ],
  },
  { ticker: "TCS", name: "Tata Consultancy", sector: "Tech", region: "IN", exposurePct: 12.4, riskLevel: "MEDIUM" },
  { ticker: "HDFCBANK", name: "HDFC Bank", sector: "Banking", region: "IN", exposurePct: 9.8, riskLevel: "MEDIUM" },
  { ticker: "INFY", name: "Infosys", sector: "Tech", region: "IN", exposurePct: 7.6, riskLevel: "LOW" },
  { ticker: "BHARTIARTL", name: "Bharti Airtel", sector: "Telecom", region: "IN", exposurePct: 5.7, riskLevel: "LOW" },
  { ticker: "ITC", name: "ITC Limited", sector: "Consumer Staples", region: "IN", exposurePct: 4.1, riskLevel: "LOW" },
  { ticker: "LT", name: "Larsen & Toubro", sector: "Industrials", region: "IN", exposurePct: 4.1, riskLevel: "MEDIUM" },
  { ticker: "NTPC", name: "NTPC Limited", sector: "Energy", region: "IN", exposurePct: 3.2, riskLevel: "LOW" },
];

const TOTAL_EXPOSURE_USD = 2460000000000;

export function getMockPortfolioExposure() {
  return {
    totalExposureUsd: TOTAL_EXPOSURE_USD,
    holdings: HOLDINGS,
    generatedAt: new Date().toISOString(),
  };
}

// Aggregates holdings by sector for the donut chart — this is a derived
// view, not a separate contract shape.
export function getSectorBreakdown() {
  const totals = {};
  for (const h of HOLDINGS) {
    totals[h.sector] = (totals[h.sector] || 0) + h.exposurePct;
  }
  return Object.entries(totals).map(([sector, value]) => ({ sector, value: Number(value.toFixed(1)) }));
}
