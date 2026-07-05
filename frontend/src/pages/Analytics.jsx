import SentimentChart from "../components/SentimentChart.jsx";
import SectorImpactTable from "../components/SectorImpactTable.jsx";
import { getMockSentimentTimeseries, getMockSectorImpact } from "../data/mockAnalytics.js";

export default function Analytics() {
  const { points } = getMockSentimentTimeseries();
  const { sectors } = getMockSectorImpact();

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="max-w-2xl">
        <SentimentChart points={points} />
      </div>
      <SectorImpactTable sectors={sectors} />
    </div>
  );
}
