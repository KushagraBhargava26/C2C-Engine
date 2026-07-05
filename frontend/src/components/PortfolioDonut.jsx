import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const SLICE_COLORS = ["#C9A227", "#3D7A6E", "#C98A3A", "#C1562E", "#A8324B", "#6B7684", "#3A4757"];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { sector, value } = payload[0].payload;
  return (
    <div className="rounded border border-steel-light bg-ink px-2.5 py-1.5 font-mono text-xs text-parchment">
      {sector}: <span className="text-bullion">{value}%</span>
    </div>
  );
}

export default function PortfolioDonut({ data, totalExposureUsd }) {
  const totalFormatted = `$${(totalExposureUsd / 1e12).toFixed(2)}T`;

  return (
    <div className="rounded-lg border border-steel bg-ink-soft p-4">
      <h2 className="mb-3 font-display text-sm font-semibold text-parchment">
        Exposure by Sector
      </h2>
      <div className="relative" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="sector"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {data.map((entry, idx) => (
                <Cell key={entry.sector} fill={SLICE_COLORS[idx % SLICE_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-mono text-lg font-semibold text-parchment">{totalFormatted}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-parchment-faint">
            Total exposure
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {data.map((entry, idx) => (
          <div key={entry.sector} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: SLICE_COLORS[idx % SLICE_COLORS.length] }}
            />
            <span className="truncate text-parchment-dim">{entry.sector}</span>
            <span className="ml-auto font-mono text-parchment-faint">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}