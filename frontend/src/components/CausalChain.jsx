const TYPE_STYLES = {
  EVENT: { chip: "border-risk-critical/40 text-risk-critical bg-risk-critical/10", label: "EVENT" },
  MARKET_SIGNAL: { chip: "border-bullion-dim/60 text-bullion bg-bullion/10", label: "MARKET SIGNAL" },
  HOLDING: { chip: "border-risk-low/40 text-risk-low bg-risk-low/10", label: "HOLDING" },
};

function ChainNode({ node }) {
  const style = TYPE_STYLES[node.type] || TYPE_STYLES.MARKET_SIGNAL;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${style.chip}`}>
        <span className="font-mono text-[10px] uppercase tracking-wider">{style.label}</span>
      </div>
      <p className="max-w-[120px] text-xs text-parchment-dim leading-snug">{node.node}</p>
      {node.impactPct != null && (
        <p className="font-mono text-sm font-semibold text-risk-critical">{node.impactPct}% impact</p>
      )}
    </div>
  );
}

export default function CausalChain({ chain, holdingName }) {
  if (!chain || chain.length === 0) return null;

  return (
    <div className="rounded-lg border border-steel bg-ink-soft p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-parchment">
          Causal Chain Example
        </h2>
        <span className="rounded border border-bullion-dim/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-bullion">
          Illustrative
        </span>
      </div>
      <p className="mb-5 text-xs text-parchment-faint">
        How a geopolitical event traces through to {holdingName}'s exposure score.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {chain.map((node, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <ChainNode node={node} />
            {idx < chain.length - 1 && <span className="text-parchment-faint">→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}