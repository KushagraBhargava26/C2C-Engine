import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function formatHour(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded border border-steel-light bg-ink px-2.5 py-1.5 font-mono text-xs text-parchment">
      {formatHour(label)}: <span className={value < 0 ? "text-risk-critical" : "text-risk-low"}>{value.toFixed(2)}</span>
    </div>
  );
}

export default function SentimentChart({ points }) {
  const latest = points[points.length - 1]?.avgSentiment ?? 0;
  const sentimentLabel = latest < -0.15 ? "Bearish" : latest > 0.15 ? "Bullish" : "Neutral";
  const sentimentColor = latest < -0.15 ? "text-risk-critical" : latest > 0.15 ? "text-risk-low" : "text-bullion";

  return (
    <div className="rounded-lg border border-steel bg-ink-soft p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-parchment">Sentiment Over Time</h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-parchment-faint">24H</span>
      </div>
      <div className="mb-3 flex items-baseline gap-2">
        <p className={`font-mono text-2xl font-semibold ${sentimentColor}`}>{latest.toFixed(2)}</p>
        <p className={`text-sm ${sentimentColor}`}>{sentimentLabel}</p>
      </div>

      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3542" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatHour}
              stroke="#6B7684"
              tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }}
            />
            <YAxis domain={[-1, 1]} stroke="#6B7684" tick={{ fontSize: 10, fontFamily: "IBM Plex Mono" }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="avgSentiment" stroke="#C9A227" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}