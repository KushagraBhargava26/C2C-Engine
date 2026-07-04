// Mirrors GET /api/v1/countries/{isoCode} from CONTRACT.md v2, Endpoint D.

const COUNTRY_DETAILS = {
  IN: { region: "IN", riskScore: 42, riskLevel: "MEDIUM", activeEvents: 12, affectedSectors: ["Tech", "Manufacturing", "Energy"], marketImpactPct: 2.1 },
  CN: { region: "CN", riskScore: 66, riskLevel: "HIGH", activeEvents: 21, affectedSectors: ["Manufacturing", "Tech"], marketImpactPct: -3.4 },
  US: { region: "US", riskScore: 38, riskLevel: "MEDIUM", activeEvents: 9, affectedSectors: ["Banking", "Tech"], marketImpactPct: 0.8 },
  RU: { region: "RU", riskScore: 85, riskLevel: "CRITICAL", activeEvents: 34, affectedSectors: ["Energy", "Banking"], marketImpactPct: -8.2 },
  BR: { region: "BR", riskScore: 53, riskLevel: "MEDIUM", activeEvents: 14, affectedSectors: ["Agriculture", "Banking"], marketImpactPct: -1.2 },
  TR: { region: "TR", riskScore: 78, riskLevel: "HIGH", activeEvents: 19, affectedSectors: ["Banking", "Manufacturing"], marketImpactPct: -5.6 },
  EG: { region: "EG", riskScore: 61, riskLevel: "HIGH", activeEvents: 11, affectedSectors: ["Banking"], marketImpactPct: -2.8 },
  NG: { region: "NG", riskScore: 58, riskLevel: "HIGH", activeEvents: 8, affectedSectors: ["Energy"], marketImpactPct: -1.9 },
  PK: { region: "PK", riskScore: 64, riskLevel: "HIGH", activeEvents: 10, affectedSectors: ["Banking", "Agriculture"], marketImpactPct: -3.1 },
  ID: { region: "ID", riskScore: 25, riskLevel: "LOW", activeEvents: 4, affectedSectors: ["Manufacturing"], marketImpactPct: 1.4 },
  VN: { region: "VN", riskScore: 22, riskLevel: "LOW", activeEvents: 3, affectedSectors: ["Manufacturing"], marketImpactPct: 1.1 },
  MX: { region: "MX", riskScore: 28, riskLevel: "LOW", activeEvents: 4, affectedSectors: ["Manufacturing"], marketImpactPct: 0.9 },
  ZA: { region: "ZA", riskScore: 70, riskLevel: "HIGH", activeEvents: 13, affectedSectors: ["Banking", "Tech"], marketImpactPct: -2.4 },
  IR: { region: "IR", riskScore: 55, riskLevel: "MEDIUM", activeEvents: 9, affectedSectors: ["Energy"], marketImpactPct: -1.5 },
  AR: { region: "AR", riskScore: 47, riskLevel: "MEDIUM", activeEvents: 7, affectedSectors: ["Agriculture"], marketImpactPct: -1.0 },
};

export function getMockCountryDetail(isoCode) {
  return COUNTRY_DETAILS[isoCode] || null;
}

export function getMockRiskScoreForMap(isoCode) {
  return COUNTRY_DETAILS[isoCode]?.riskScore ?? null;
}