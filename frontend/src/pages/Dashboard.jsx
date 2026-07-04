import { useEffect, useState } from "react";
import StatsBar from "../components/StatsBar.jsx";
import IncidentTicker from "../components/IncidentTicker.jsx";
import ExposureHeatmap from "../components/ExposureHeatmap.jsx";
import { getIncidents, getHeatmap } from "../services/api.js";

export default function Dashboard() {
  const [incidents, setIncidents] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [incidentsRes, heatmapRes] = await Promise.all([
          getIncidents({ page: 0, size: 20 }),
          getHeatmap(),
        ]);
        setIncidents(incidentsRes.content);
        setHeatmap(heatmapRes.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-parchment-faint">
          Loading dashboard…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-risk-critical">
          {error.message || "Something went wrong."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-8">
      <StatsBar incidents={incidents} heatmap={heatmap} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <IncidentTicker incidents={incidents} />
        </div>
        <div className="lg:col-span-2">
          <ExposureHeatmap rows={heatmap} />
        </div>
      </div>
    </div>
  );
}