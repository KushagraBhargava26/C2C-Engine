import { useRef, useState, useEffect, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";

export const NODE_COLOR = {
  COUNTRY: "#C9A227",
  EVENT: "#A8324B",
  COMMODITY: "#C98A3A",
  SECTOR: "#3D7A6E",
  HOLDING: "#C1562E",
};

export const EDGE_COLOR = {
  SANCTIONED_BY: "#C9A227",
  CONFLICTS_WITH: "#A8324B",
  IMPACTS: "#3A4757",
  EXPORTS_TO: "#6B7684",
  ALLIED_WITH: "#6B7684",
};

export default function GraphCanvas({ graphData, onNodeClick }) {
  const containerRef = useRef(null);
  const fgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, []);

  const handleEngineStop = useCallback(() => {
    fgRef.current?.zoomToFit(400, 60);
  }, []);

  const zoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.4, 300);
  const zoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() / 1.4, 300);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {dimensions.width > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          backgroundColor="transparent"
          nodeLabel="label"
          onEngineStop={handleEngineStop}
          nodeColor={(node) => NODE_COLOR[node.type] ?? "#9AA3AE"}
          linkColor={(link) => EDGE_COLOR[link.relation] ?? "#3A4757"}
          linkWidth={1.5}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalParticleColor={(link) => EDGE_COLOR[link.relation] ?? "#3A4757"}
          onNodeClick={onNodeClick}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.label;
            const fontSize = 12 / globalScale;
            const radius = 6;

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = NODE_COLOR[node.type] ?? "#9AA3AE";
            ctx.fill();

            ctx.font = `${fontSize}px "IBM Plex Sans"`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#E7E4DA";
            ctx.fillText(label, node.x, node.y + radius + 2);
          }}
        />
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-3 left-3 flex flex-col gap-1">
        <button
          onClick={zoomIn}
          className="w-7 h-7 flex items-center justify-center rounded bg-ink-raised border border-steel text-parchment-dim hover:text-parchment">
          +
        </button>
        <button
          onClick={zoomOut}
          className="w-7 h-7 flex items-center justify-center rounded bg-ink-raised border border-steel text-parchment-dim hover:text-parchment">
          −
        </button>
      </div>

      {/* Caption */}
      <div className="absolute bottom-3 right-3 font-mono text-xs text-parchment-faint">
        Drag to move · Scroll to zoom · Click on a node to view details
      </div>
    </div>
  );
}
