import StatsBar from "../components/StatsBar.jsx";
import IncidentTicker from "../components/IncidentTicker.jsx";
import ExposureHeatmap from "../components/ExposureHeatmap.jsx";
import mockIncidents from "../data/mockIncidents.js";
import { getMockHeatmap } from "../data/mockHeatmap.js";

export default function Dashboard() {
  const heatmap = getMockHeatmap().data;

  return (
    <div className="flex flex-col gap-5 p-8">
      <StatsBar incidents={mockIncidents} heatmap={heatmap} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <IncidentTicker incidents={mockIncidents} />
        </div>
        <div className="lg:col-span-2">
          <ExposureHeatmap rows={heatmap} />
        </div>
      </div>
    </div>
  );
}
