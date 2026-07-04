import StatsBar from "../components/StatsBar.jsx";
import IncidentTicker from "../components/IncidentTicker.jsx";
import mockIncidents from "../data/mockIncidents.js";
import { getMockHeatmap } from "../data/mockHeatmap.js";

export default function Dashboard() {
  const heatmap = getMockHeatmap().data;

  return (
    <div className="flex flex-col gap-5 p-8">
      <StatsBar incidents={mockIncidents} heatmap={heatmap} />
      <IncidentTicker incidents={mockIncidents} />
    </div>
  );
}
