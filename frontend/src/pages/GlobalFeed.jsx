import { useEffect, useMemo, useState } from "react";
import IncidentTicker from "../components/IncidentTicker.jsx";
import IncidentFilters from "../components/IncidentFilters.jsx";
import { getIncidents } from "../services/api.js";

export default function GlobalFeed() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState("ALL");
  const [risk, setRisk] = useState("ALL");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getIncidents({ page: 0, size: 20 });
        setIncidents(res.content);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const regions = useMemo(() => [...new Set(incidents.map((i) => i.region))].sort(), [incidents]);

  const filtered = useMemo(() => {
    return incidents.filter((i) => {
      const regionOk = region === "ALL" || i.region === region;
      const riskOk = risk === "ALL" || i.riskLevel === risk;
      return regionOk && riskOk;
    });
  }, [incidents, region, risk]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-widest text-parchment-faint">Loading feed…</p>
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
    <div className="flex flex-col gap-5 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold text-parchment">Global Feed</h1>
        <IncidentFilters regions={regions} selectedRegion={region} onRegionChange={setRegion} selectedRisk={risk} onRiskChange={setRisk} />
      </div>

      <IncidentTicker incidents={filtered} />
    </div>
  );
}
