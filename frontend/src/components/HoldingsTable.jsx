import { FlagIcon } from "../utils/region.jsx";
import { riskStyle } from "../utils/risk.js";

export default function HoldingsTable({ holdings }) {
  return (
    <div className="rounded-lg border border-steel bg-ink-soft">
      <div className="border-b border-steel px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-parchment">Holdings Exposure</h2>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-steel/60">
            {["Holding", "Sector", "Region", "Exposure %", "Risk"].map((h) => (
              <th
                key={h}
                className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-parchment-faint"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const style = riskStyle(h.riskLevel);
            return (
              <tr key={h.ticker} className="border-b border-steel/40 last:border-0 hover:bg-ink-raised/50">
                <td className="px-4 py-2.5">
                  <p className="text-sm text-parchment">{h.name}</p>
                  <p className="font-mono text-[11px] text-parchment-faint">{h.ticker}</p>
                </td>
                <td className="px-4 py-2.5 text-sm text-parchment-dim">{h.sector}</td>
                <td className="px-4 py-2.5">
                  <FlagIcon regionCode={h.region} className="h-3.5 w-5" />
                </td>
                <td className="px-4 py-2.5 font-mono text-sm text-parchment">{h.exposurePct.toFixed(1)}%</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${style.chip}`}>
                    {h.riskLevel}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}