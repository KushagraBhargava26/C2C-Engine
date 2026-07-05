// Mirrors GET /api/v1/analytics/sentiment-timeseries and
// GET /api/v1/analytics/sector-impact from CONTRACT.md v2, Endpoint G.

const SENTIMENT_POINTS = [
  { timestamp: "2026-07-04T00:00:00Z", avgSentiment: -0.12 },
  { timestamp: "2026-07-04T03:00:00Z", avgSentiment: -0.35 },
  { timestamp: "2026-07-04T06:00:00Z", avgSentiment: -0.28 },
  { timestamp: "2026-07-04T09:00:00Z", avgSentiment: -0.51 },
  { timestamp: "2026-07-04T12:00:00Z", avgSentiment: -0.42 },
  { timestamp: "2026-07-04T15:00:00Z", avgSentiment: -0.18 },
  { timestamp: "2026-07-04T18:00:00Z", avgSentiment: -0.3 },
  { timestamp: "2026-07-04T21:00:00Z", avgSentiment: -0.35 },
];

const SECTOR_IMPACT = [
  { sector: "Energy", avgExposureScore: 61.4, incidentCount: 18 },
  { sector: "Banking", avgExposureScore: 58.2, incidentCount: 9 },
  { sector: "Tech", avgExposureScore: 49.3, incidentCount: 11 },
  { sector: "Manufacturing", avgExposureScore: 46.8, incidentCount: 12 },
  { sector: "Agriculture", avgExposureScore: 38.6, incidentCount: 6 },
];

const INCIDENT_VOLUME = [
  { day: "Jun 28", count: 14 },
  { day: "Jun 29", count: 18 },
  { day: "Jun 30", count: 12 },
  { day: "Jul 01", count: 21 },
  { day: "Jul 02", count: 16 },
  { day: "Jul 03", count: 19 },
  { day: "Jul 04", count: 23 },
];

export function getMockSentimentTimeseries() {
  return { window: "24h", points: SENTIMENT_POINTS };
}

export function getMockSectorImpact() {
  return { sectors: SECTOR_IMPACT };
}

export function getMockIncidentVolume() {
  return { days: INCIDENT_VOLUME };
}
