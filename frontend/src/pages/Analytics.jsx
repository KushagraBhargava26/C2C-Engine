import { useEffect, useState } from "react";
import SentimentChart from "../components/SentimentChart.jsx";
import SectorImpactTable from "../components/SectorImpactTable.jsx";
import IncidentVolumeChart from "../components/IncidentVolumeChart.jsx";
import { getSentimentTimeseries, getSectorImpact, getIncidentVolume } from "../services/api.js";

export default function Analytics() {
  const [sentiment, setSentiment] = useState(null);
  const [sectors, setSectors] = useState(null);
  const [volume, setVolume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, sec, vol] = await Promise.all([getSentimentTimeseries(), getSectorImpact(), getIncidentVolume()]);
        setSentiment(s);
        setSectors(sec);
        setVolume(vol);
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
        <p className="font-mono text-xs uppercase tracking-widest text-parchment-faint">Loading analytics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-risk-critical">{error.message || "Something went wrong."}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 p-8 lg:grid-cols-2">
      <SentimentChart points={sentiment.points} />
      <IncidentVolumeChart days={volume.days} />
      <div className="lg:col-span-2">
        <SectorImpactTable sectors={sectors.sectors} />
      </div>
    </div>
  );
}
