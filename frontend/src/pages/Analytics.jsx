import SentimentChart from "../components/SentimentChart.jsx";
import { getMockSentimentTimeseries } from "../data/mockAnalytics.js";

export default function Analytics() {
  const { points } = getMockSentimentTimeseries();

  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <SentimentChart points={points} />
      </div>
    </div>
  );
}
