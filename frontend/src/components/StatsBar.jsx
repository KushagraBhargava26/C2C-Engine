import { riskStyle } from "../utils/risk.js";

function StatCard({ label, value, accentClass }) {
  return (
    <div className="flex-1 rounded-lg border border-steel bg-ink-soft px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-parchment-faint">
        {label}
      </p>
      <p className={`mt-1.5 font-mono text-2xl font-semibold ${accentClass || "text-parchment"}`}>
        {value}
      </p>
    </div>
  );
}

export default function StatsBar({ incidents, heatmap }) {
  const activeIncidents = incidents.length;

  // Find the incident with the worst risk level to surface as "highest risk region"
  const riskRank = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  const worst = incidents.reduce(
    (acc, i) => (riskRank[i.riskLevel] > riskRank[acc?.riskLevel ?? "LOW"] ? i : acc),
    incidents[0]
  );

  // Sum exposure scores per region, find the highest
  const regionTotals = {};
  for (const row of heatmap) {
    regionTotals[row.region] = (regionTotals[row.region] || 0) + row.exposureScore;
  }
  const [topRegion] = Object.entries(regionTotals).sort((a, b) => b[1] - a[1])[0] || ["—"];

  const avgExposure =
    heatmap.length > 0
      ? (heatmap.reduce((sum, r) => sum + r.exposureScore, 0) / heatmap.length).toFixed(1)
      : "—";

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Active incidents" value={activeIncidents} />
      <StatCard
        label="Highest-risk region"
        value={worst ? worst.region : "—"}
        accentClass={worst ? riskStyle(worst.riskLevel).chip.split(" ")[1] : undefined}
      />
      <StatCard label="Top exposure region" value={topRegion} />
      <StatCard label="Avg. exposure score" value={avgExposure} />
    </div>
  );
}