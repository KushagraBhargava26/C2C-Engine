import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded border border-steel-light bg-ink px-2.5 py-1.5 font-mono text-xs text-parchment">
      {label}: <span className="text-bullion">{payload[0].value} incidents</span>
    </div>
  );
}

export default function IncidentVolumeChart({ days }) {
  return (
    <div className="rounded-lg border border-steel bg-ink-soft p-4">
      <h2 className="mb-3 font-display text-sm font-semibold text-parchment">Incident Volume</h2>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3542" />
            <XAxis dataKey="day" stroke="#6B7684" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
            <YAxis stroke="#6B7684" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#C9A227" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}