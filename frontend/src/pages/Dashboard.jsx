import StatsBar from "../components/StatsBar.jsx";
import mockIncidents from "../data/mockIncidents.js";
import { getMockHeatmap } from "../data/mockHeatmap.js";

export default function Dashboard() {
  const heatmap = getMockHeatmap().data;

  return (
    <div className="p-8">
      <StatsBar incidents={mockIncidents} heatmap={heatmap} />
    </div>
  );
}