import { RISK_LEVELS } from "../utils/risk.js";

export default function IncidentFilters({ regions, selectedRegion, onRegionChange, selectedRisk, onRiskChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={selectedRegion}
        onChange={(e) => onRegionChange(e.target.value)}
        className="rounded-md border border-steel-light bg-ink-soft px-3 py-1.5 font-mono text-xs text-parchment"
      >
        <option value="ALL">All regions</option>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        value={selectedRisk}
        onChange={(e) => onRiskChange(e.target.value)}
        className="rounded-md border border-steel-light bg-ink-soft px-3 py-1.5 font-mono text-xs text-parchment"
      >
        <option value="ALL">All severities</option>
        {RISK_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
    </div>
  );
}