import PortfolioDonut from "../components/PortfolioDonut.jsx";
import { getMockPortfolioExposure, getSectorBreakdown } from "../data/mockPortfolio.js";

export default function PortfolioExposure() {
  const { totalExposureUsd } = getMockPortfolioExposure();
  const sectorData = getSectorBreakdown();

  return (
    <div className="p-8">
      <div className="max-w-sm">
        <PortfolioDonut data={sectorData} totalExposureUsd={totalExposureUsd} />
      </div>
    </div>
  );
}
