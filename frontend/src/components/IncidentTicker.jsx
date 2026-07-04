import { FlagIcon } from "../utils/region.jsx";
import { riskStyle } from "../utils/risk.js";

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

function IncidentRow({ incident, isLatest }) {
  const style = riskStyle(incident.riskLevel);
  return (
    <li className="relative flex gap-3 border-b border-steel/60 py-3 pl-3 pr-2 last:border-0 hover:bg-ink-raised/60 transition-colors">
      <span className={`absolute left-0 top-0 h-full w-0.5 ${style.bar}`} />

      <FlagIcon regionCode={incident.region} className="mt-1 h-4 w-6 shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-parchment leading-snug">{incident.incidentText}</p>
          {isLatest && (
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-risk-low" title="Latest" />
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className={`rounded border px-1.5 py-0.5 uppercase tracking-wider ${style.chip}`}>
            {incident.riskLevel}
          </span>
          <span className="text-parchment-faint">{incident.region}</span>
          <span className="text-parchment-faint">
            conf. {(incident.confidenceScore * 100).toFixed(0)}%
          </span>
          <span className="ml-auto text-parchment-faint">{timeAgo(incident.createdAt)}</span>
        </div>
      </div>
    </li>
  );
}

export default function IncidentTicker({ incidents }) {
  return (
    <div className="rounded-lg border border-steel bg-ink-soft">
      <div className="flex items-center justify-between border-b border-steel px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-parchment">
          Global Incident Ticker
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-parchment-faint">
          Wire feed
        </span>
      </div>

      <ul style={{ maxHeight: 480, overflowY: "auto" }}>
        {incidents.map((incident, idx) => (
          <IncidentRow key={incident.id} incident={incident} isLatest={idx === 0} />
        ))}
      </ul>
    </div>
  );
}