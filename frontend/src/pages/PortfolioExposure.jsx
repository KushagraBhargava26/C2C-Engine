import { useEffect, useState } from "react";
import PortfolioDonut from "../components/PortfolioDonut.jsx";
import HoldingsTable from "../components/HoldingsTable.jsx";
import CausalChain from "../components/CausalChain.jsx";
import { getPortfolioExposure } from "../services/api.js";
import { getSectorBreakdown } from "../data/mockPortfolio.js";

export default function PortfolioExposure() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getPortfolioExposure();
        setData(res);
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
        <p className="font-mono text-xs uppercase tracking-widest text-parchment-faint">Loading portfolio…</p>
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

  const sectorData = getSectorBreakdown();
  const reliance = data.holdings.find((h) => h.chain);

  return (
    <div className="flex flex-col gap-5 p-8">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <PortfolioDonut data={sectorData} totalExposureUsd={data.totalExposureUsd} />
        </div>
        <div className="lg:col-span-3">
          <HoldingsTable holdings={data.holdings} />
        </div>
      </div>

      {reliance && <CausalChain chain={reliance.chain} holdingName={reliance.name} />}
    </div>
  );
}
