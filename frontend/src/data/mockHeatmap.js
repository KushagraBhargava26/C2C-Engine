// Mirrors GET /api/v1/exposure/heatmap from CONTRACT.md exactly.

export const SECTORS = ["Banking", "Energy", "Manufacturing", "Tech", "Agriculture"];
export const REGIONS = ["IN", "CN", "US", "RU", "BR", "TR"];

const SCORES = {
  IN: { Banking: 72.5, Energy: 41.0, Manufacturing: 55.3, Tech: 38.2, Agriculture: 29.8 },
  CN: { Banking: 64.1, Energy: 58.7, Manufacturing: 88.2, Tech: 76.4, Agriculture: 33.5 },
  US: { Banking: 45.6, Energy: 39.2, Manufacturing: 42.0, Tech: 61.8, Agriculture: 22.4 },
  RU: { Banking: 81.9, Energy: 92.3, Manufacturing: 66.7, Tech: 40.1, Agriculture: 48.9 },
  BR: { Banking: 53.2, Energy: 47.5, Manufacturing: 50.1, Tech: 35.6, Agriculture: 62.0 },
  TR: { Banking: 88.4, Energy: 60.3, Manufacturing: 57.8, Tech: 44.9, Agriculture: 39.1 },
};

const data = [];
for (const region of REGIONS) {
  for (const sector of SECTORS) {
    data.push({ region, sector, exposureScore: SCORES[region][sector] });
  }
}

export function getMockHeatmap() {
  return { data, generatedAt: new Date().toISOString() };
}
