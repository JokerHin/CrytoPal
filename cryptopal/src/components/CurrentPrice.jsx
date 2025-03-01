import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function CurrentPrice({ currency }) {
  const [price, setPrice] = useState(0);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price?ids=${currency}&vs_currencies=usd`
        );
        setPrice(response.data[currency].usd);
      } catch (error) {
        console.error(`Error fetching ${currency} price:`, error);
      }
    };

    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${currency}/market_chart?vs_currency=usd&days=7`
        );
        const prices = response.data.prices.map((price) => ({
          x: new Date(price[0]).toLocaleDateString(),
          y: price[1],
        }));
        setChartData({
          labels: prices.map((price) => price.x),
          datasets: [
            {
              label: `${currency.toUpperCase()} Price (USD)`,
              data: prices.map((price) => price.y),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error(`Error fetching ${currency} chart data:`, error);
      }
    };

    fetchPrice();
    fetchChartData();

    // Update price every 60 seconds
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [currency]);

  return (
    <div className="items-center bg-gray-200 w-[600px] rounded-2xl p-6">
      <div>
        <p className="text-2xl font-bold text-violet-500">
          {currency.toUpperCase()} Price
        </p>
        <p className="text-md text-gray-500">Current price:</p>
      </div>
      <div className="flex items-center mt-5">
        <p className="text-4xl font-bold ml-4 ">${price} USD</p>
      </div>
      <div className="mt-5">
        {chartData ? <Line data={chartData} /> : <p>Loading chart data...</p>}
      </div>
    </div>
  );
}
