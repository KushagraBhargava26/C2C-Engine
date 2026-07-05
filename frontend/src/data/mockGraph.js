// Mock data for v2 Endpoint F: GET /api/v1/graph
// Shape matches CONTRACT.md exactly. Per Decision Log (Section 5): this is a hand-authored,
// fixed graph (10-20 nodes) served as-is, NOT generated from real entity/relationship extraction.

const mockGraph = {
  isIllustrative: true,

  nodes: [
    { id: "n1", label: "Russia", type: "COUNTRY" },
    { id: "n2", label: "China", type: "COUNTRY" },
    { id: "n3", label: "EU Sanctions", type: "EVENT" },
    { id: "n4", label: "Red Sea Disruption", type: "EVENT" },
    { id: "n5", label: "Brent Crude Price", type: "COMMODITY" },
    { id: "n6", label: "Oil", type: "COMMODITY" },
    { id: "n7", label: "Global Shipping", type: "SECTOR" },
    { id: "n8", label: "Energy", type: "SECTOR" },
    { id: "n9", label: "Reliance Industries", type: "HOLDING" },
    { id: "n10", label: "ONGC", type: "HOLDING" },
  ],

  edges: [
    { source: "n1", target: "n3", relation: "SANCTIONED_BY" },
    { source: "n3", target: "n6", relation: "IMPACTS" },
    { source: "n1", target: "n2", relation: "EXPORTS_TO" },
    { source: "n4", target: "n7", relation: "IMPACTS" },
    { source: "n4", target: "n5", relation: "IMPACTS" },
    { source: "n5", target: "n6", relation: "IMPACTS" },
    { source: "n6", target: "n9", relation: "IMPACTS" },
    { source: "n6", target: "n10", relation: "IMPACTS" },
    { source: "n7", target: "n9", relation: "IMPACTS" },
    { source: "n8", target: "n9", relation: "IMPACTS" },
    { source: "n8", target: "n10", relation: "IMPACTS" },
  ],

  generatedAt: "2026-07-04T10:20:00Z",
};

export default mockGraph;

// ⚠️ NOT part of CONTRACT.md Endpoint F — the contract's node shape is only { id, label, type }.
// This extra detail powers the "Node Details" side panel in the mockup but has no backend source
// yet. Keyed by node id, kept separate from the real payload above.
const nodeDetailsIllustrative = {
  n1: {
    description: "Country at the center of ongoing sanctions and trade disruption events.",
    impactScore: 82,
    impactLevel: "critical",
    relatedIncidents: 14,
    firstSeen: "2026-06-10",
    lastUpdated: "2026-07-04",
  },
  n2: {
    description: "Major trade partner with Russia, indirectly exposed to sanctions spillover.",
    impactScore: 54,
    impactLevel: "medium",
    relatedIncidents: 5,
    firstSeen: "2026-06-18",
    lastUpdated: "2026-07-04",
  },
  n3: {
    description: "Economic sanctions imposed by the EU on Russian entities.",
    impactScore: 78,
    impactLevel: "high",
    relatedIncidents: 8,
    firstSeen: "2026-06-15",
    lastUpdated: "2026-07-04",
  },
  n4: {
    description: "Shipping route disruption in the Red Sea affecting freight costs.",
    impactScore: 71,
    impactLevel: "high",
    relatedIncidents: 6,
    firstSeen: "2026-06-20",
    lastUpdated: "2026-07-04",
  },
  n5: {
    description: "Global oil benchmark, reacting to shipping route disruptions and supply shocks.",
    impactScore: 69,
    impactLevel: "high",
    relatedIncidents: 9,
    firstSeen: "2026-06-20",
    lastUpdated: "2026-07-04",
  },
  n6: {
    description: "Core commodity underlying multiple holdings' exposure, sensitive to geopolitical shocks.",
    impactScore: 75,
    impactLevel: "high",
    relatedIncidents: 11,
    firstSeen: "2026-06-15",
    lastUpdated: "2026-07-04",
  },
  n7: {
    description: "Sector bearing direct cost impact from Red Sea route disruptions.",
    impactScore: 66,
    impactLevel: "high",
    relatedIncidents: 7,
    firstSeen: "2026-06-20",
    lastUpdated: "2026-07-04",
  },
  n8: {
    description: "Sector-wide exposure driven by oil price volatility and supply chain risk.",
    impactScore: 71,
    impactLevel: "high",
    relatedIncidents: 12,
    firstSeen: "2026-06-12",
    lastUpdated: "2026-07-04",
  },
  n9: {
    description: "Largest single holding by exposure, directly impacted via Oil and Global Shipping.",
    impactScore: 80,
    impactLevel: "critical",
    relatedIncidents: 10,
    firstSeen: "2026-06-15",
    lastUpdated: "2026-07-04",
  },
  n10: {
    description: "Oil & gas holding, exposed to crude price swings via the Energy sector and Oil commodity node.",
    impactScore: 63,
    impactLevel: "medium",
    relatedIncidents: 6,
    firstSeen: "2026-06-15",
    lastUpdated: "2026-07-04",
  },
};

export function getMockGraph() {
  return mockGraph;
}

export function getMockNodeDetails(nodeId) {
  return nodeDetailsIllustrative[nodeId] ?? null;
}
