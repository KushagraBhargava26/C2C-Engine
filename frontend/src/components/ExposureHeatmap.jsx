import { Fragment, useMemo, useState } from "react";
import { exposureColor } from "../utils/risk.js";
import { FlagIcon } from "../utils/region.jsx";

export default function ExposureHeatmap({ rows }) {
  const [hovered, setHovered] = useState(null);

  const { regions, sectors, grid } = useMemo(() => {
    const regionSet = [...new Set(rows.map((r) => r.region))];
    const sectorSet = [...new Set(rows.map((r) => r.sector))];
    const map = {};
    for (const r of rows) map[`${r.region}|${r.sector}`] = r.exposureScore;
    return { regions: regionSet, sectors: sectorSet, grid: map };
  }, [rows]);

  return (
    <div className="rounded-lg border border-steel bg-ink-soft">
      <div className="flex items-center justify-between border-b border-steel px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-parchment">
          Portfolio Exposure Heatmap
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-widest text-parchment-faint">
          Sector × Region
        </span>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[420px]">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `88px repeat(${sectors.length}, 1fr)` }}
          >
            <div />
            {sectors.map((sector) => (
              <div
                key={sector}
                className="truncate px-1 pb-2 text-center font-mono text-[10px] uppercase tracking-wider text-parchment-faint"
              >
                {sector}
              </div>
            ))}

            {regions.map((region) => (
              <Fragment key={region}>
                <div className="flex items-center gap-1.5 pr-2 font-mono text-xs text-parchment-dim">
                  <FlagIcon regionCode={region} className="h-3.5 w-5" />
                  {region}
                </div>
                {sectors.map((sector) => {
                  const score = grid[`${region}|${sector}`];
                  const key = `${region}|${sector}`;
                  return (
                    <div
                      key={key}
                      className="relative aspect-square rounded-sm cursor-default"
                      style={{ backgroundColor: score != null ? exposureColor(score) : "transparent" }}
                      onMouseEnter={() => setHovered(key)}
                      onMouseLeave={() => setHovered((h) => (h === key ? null : h))}
                    >
                      {hovered === key && score != null && (
                        <div className="absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded border border-steel-light bg-ink px-2 py-1 font-mono text-[11px] text-parchment">
                          {region} · {sector}: <span className="text-bullion">{score.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}