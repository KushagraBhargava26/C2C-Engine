export const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const RISK_STYLES = {
  LOW: { chip: "bg-risk-low/15 text-risk-low border-risk-low/30", bar: "bg-risk-low" },
  MEDIUM: { chip: "bg-risk-medium/15 text-risk-medium border-risk-medium/30", bar: "bg-risk-medium" },
  HIGH: { chip: "bg-risk-high/15 text-risk-high border-risk-high/30", bar: "bg-risk-high" },
  CRITICAL: { chip: "bg-risk-critical/15 text-risk-critical border-risk-critical/30", bar: "bg-risk-critical" },
};

export function riskStyle(level) {
  return RISK_STYLES[level] || RISK_STYLES.MEDIUM;
}

// Interpolates a gold -> crimson scale for the heatmap (continuous 0-100 score,
// separate from the four discrete risk levels above).
export function exposureColor(score) {
  const t = Math.max(0, Math.min(100, score)) / 100;
  const stops = [
    { t: 0, c: [42, 53, 66] },
    { t: 0.35, c: [138, 110, 28] },
    { t: 0.65, c: [201, 138, 58] },
    { t: 1, c: [168, 50, 75] },
  ];
  let a = stops[0], b = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) {
      a = stops[i];
      b = stops[i + 1];
      break;
    }
  }
  const span = b.t - a.t || 1;
  const local = (t - a.t) / span;
  const mix = a.c.map((v, i) => Math.round(v + (b.c[i] - v) * local));
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}