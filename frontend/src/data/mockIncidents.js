// Mirrors GET /api/v1/incidents from CONTRACT.md exactly.

const RAW_INCIDENTS = [
  { id: 101, incidentText: "Tensions escalate along the eastern border as troops mobilize.", region: "IN", riskLevel: "HIGH", confidenceScore: 0.87, createdAt: "2026-07-04T10:15:02Z" },
  { id: 102, incidentText: "Central bank signals emergency rate hike amid currency slide.", region: "TR", riskLevel: "CRITICAL", confidenceScore: 0.94, createdAt: "2026-07-04T09:52:11Z" },
  { id: 103, incidentText: "Port workers extend strike into third week, delaying grain exports.", region: "AR", riskLevel: "MEDIUM", confidenceScore: 0.71, createdAt: "2026-07-04T09:30:47Z" },
  { id: 104, incidentText: "Regional trade summit concludes with new tariff reduction pact.", region: "VN", riskLevel: "LOW", confidenceScore: 0.62, createdAt: "2026-07-04T08:58:20Z" },
  { id: 105, incidentText: "Naval patrols increase near disputed shipping lanes.", region: "CN", riskLevel: "HIGH", confidenceScore: 0.81, createdAt: "2026-07-04T08:40:05Z" },
  { id: 106, incidentText: "Opposition calls for snap election after coalition collapse.", region: "BR", riskLevel: "MEDIUM", confidenceScore: 0.68, createdAt: "2026-07-04T08:12:39Z" },
  { id: 107, incidentText: "Pipeline outage cuts regional gas supply by an estimated 30%.", region: "RU", riskLevel: "CRITICAL", confidenceScore: 0.91, createdAt: "2026-07-04T07:44:16Z" },
  { id: 108, incidentText: "Central government approves new infrastructure stimulus package.", region: "ID", riskLevel: "LOW", confidenceScore: 0.58, createdAt: "2026-07-04T07:20:03Z" },
  { id: 109, incidentText: "Currency board intervenes to defend peg after speculative attack.", region: "EG", riskLevel: "HIGH", confidenceScore: 0.83, createdAt: "2026-07-04T06:55:41Z" },
  { id: 110, incidentText: "Farmers block highways over new export quota rules.", region: "TH", riskLevel: "MEDIUM", confidenceScore: 0.65, createdAt: "2026-07-04T06:30:12Z" },
];

export function getMockIncidentsPage({ page = 0, size = 20 } = {}) {
  const start = page * size;
  const content = RAW_INCIDENTS.slice(start, start + size);
  return {
    content,
    page,
    size,
    totalElements: RAW_INCIDENTS.length,
  };
}

export default RAW_INCIDENTS;