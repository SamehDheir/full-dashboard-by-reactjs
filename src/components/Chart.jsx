import { Line } from "react-chartjs-2";
import { chartData, chartOptions } from "../data";

export default function Chart() {
  return <Line data={chartData} options={chartOptions} />;
}
