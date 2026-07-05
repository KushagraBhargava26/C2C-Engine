export default function SectorImpactTable({ sectors }) {
  const maxScore = Math.max(...sectors.map((s) => s.avgExposureScore));

  return (
    <div className="rounded-lg border border-steel bg-ink-soft">
      <div className="border-b border-steel px-4 py-3">
        <h2 className="font-display text-sm font-semibold text-parchment">Sector Impact Analysis</h2>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-steel/60">
            {["Sector", "Avg. Exposure Score", "Incident Count"].map((h) => (
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
          {sectors.map((s) => (
            <tr key={s.sector} className="border-b border-steel/40 last:border-0 hover:bg-ink-raised/50">
              <td className="px-4 py-2.5 text-sm text-parchment">{s.sector}</td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-parchment">{s.avgExposureScore.toFixed(1)}</span>
                  <div className="h-1.5 flex-1 max-w-[100px] rounded-full bg-steel">
                    <div
                      className="h-full rounded-full bg-bullion"
                      style={{ width: `${(s.avgExposureScore / maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5 font-mono text-sm text-parchment-dim">{s.incidentCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}