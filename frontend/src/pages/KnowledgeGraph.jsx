import { useState, useEffect, useMemo } from "react";
import { getGraph } from "../services/api";
import { getMockNodeDetails } from "../data/mockGraph";
import GraphCanvas, { NODE_COLOR, EDGE_COLOR } from "../components/GraphCanvas";

const NODE_TYPES = ["COUNTRY", "EVENT", "COMMODITY", "SECTOR", "HOLDING"];
const RELATIONS = ["SANCTIONED_BY", "IMPACTS", "EXPORTS_TO", "ALLIED_WITH", "CONFLICTS_WITH"];

export default function KnowledgeGraph() {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState(new Set(NODE_TYPES));
  const [relationFilter, setRelationFilter] = useState("ALL");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getGraph();
        setGraph(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredGraphData = useMemo(() => {
    if (!graph) return { nodes: [], links: [] };

    const query = search.trim().toLowerCase();

    const nodes = graph.nodes
      .filter((n) => {
        if (!activeTypes.has(n.type)) return false;
        if (query && !n.label.toLowerCase().includes(query)) return false;
        return true;
      })
      .map((n) => ({ ...n })); // clone so force-graph's position mutations don't touch the mock source

    const nodeIds = new Set(nodes.map((n) => n.id));
    const getId = (endpoint) => (typeof endpoint === "object" && endpoint !== null ? endpoint.id : endpoint);

    const links = graph.edges
      .filter((e) => {
        if (relationFilter !== "ALL" && e.relation !== relationFilter) return false;
        return nodeIds.has(getId(e.source)) && nodeIds.has(getId(e.target));
      })
      .map((e) => ({ ...e, source: getId(e.source), target: getId(e.target) }));

    return { nodes, links };
  }, [graph, search, activeTypes, relationFilter]);

  const toggleType = (type) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  if (loading) return <div className="p-6 text-parchment-dim">Loading graph...</div>;
  if (error) return <div className="p-6 text-risk-critical">Failed to load graph.</div>;

  const details = selectedNode ? getMockNodeDetails(selectedNode.id) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: search + type toggles + relation filter */}
      <div className="flex items-center gap-4 p-4 border-b border-steel">
        <input
          type="text"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-ink-soft border border-steel rounded px-3 py-1.5 text-sm text-parchment placeholder-parchment-faint w-56"
        />

        <div className="flex items-center gap-3">
          {NODE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className="flex items-center gap-1.5 text-xs font-mono"
              style={{ opacity: activeTypes.has(type) ? 1 : 0.35 }}>
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: NODE_COLOR[type] }} />
              <span className="text-parchment-dim">{type}</span>
            </button>
          ))}
        </div>

        <select
          value={relationFilter}
          onChange={(e) => setRelationFilter(e.target.value)}
          className="ml-auto bg-ink-soft border border-steel rounded px-2 py-1.5 text-sm text-parchment-dim">
          <option value="ALL">All Relations</option>
          {RELATIONS.map((rel) => (
            <option key={rel} value={rel}>
              {rel}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 relative">
          <GraphCanvas graphData={filteredGraphData} onNodeClick={setSelectedNode} />
        </div>

        {/* Right column: node details + legend */}
        <div className="w-72 border-l border-steel p-4 flex flex-col gap-6 overflow-y-auto">
          {selectedNode ? (
            <div>
              <h3 className="font-display text-parchment text-lg">{selectedNode.label}</h3>
              <p className="font-mono text-parchment-dim text-xs mt-1">{selectedNode.type}</p>
              {details ? (
                <>
                  <p className="text-parchment-dim text-sm mt-3">{details.description}</p>
                  <p className="font-mono text-bullion text-sm mt-2">Impact Score: {details.impactScore}/100</p>
                  <p className="font-mono text-parchment-faint text-xs mt-1">{details.relatedIncidents} related incidents</p>
                </>
              ) : (
                <p className="text-parchment-faint text-sm mt-3">No additional details for this node.</p>
              )}
            </div>
          ) : (
            <p className="text-parchment-faint text-sm">Click a node to view details.</p>
          )}

          <div>
            <h4 className="font-mono text-xs text-parchment-faint uppercase mb-2">Legend</h4>
            {RELATIONS.map((rel) => (
              <div key={rel} className="flex items-center gap-2 text-xs mb-1">
                <span className="w-4 h-0.5 inline-block" style={{ backgroundColor: EDGE_COLOR[rel] }} />
                <span className="text-parchment-dim font-mono">{rel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
