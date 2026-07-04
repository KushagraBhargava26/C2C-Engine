import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GlobalFeed from "./pages/GlobalFeed.jsx";
import RiskMap from "./pages/RiskMap.jsx";
import PortfolioExposure from "./pages/PortfolioExposure.jsx";
import KnowledgeGraph from "./pages/KnowledgeGraph.jsx";
import Analytics from "./pages/Analytics.jsx";

function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/global-feed" element={<GlobalFeed />} />
          <Route path="/risk-map" element={<RiskMap />} />
          <Route path="/portfolio" element={<PortfolioExposure />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;