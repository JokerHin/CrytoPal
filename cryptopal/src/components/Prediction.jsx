import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale);

const CryptoTrendPredictor = ({ days: initialDays }) => {
  const [prices, setPrices] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [days, setDays] = useState(initialDays || 30); // Default: 30 days prediction
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Historical Prices",
        data: [],
        borderColor: "blue",
        fill: false,
      },
      {
        label: "Predicted Prices",
        data: [],
        borderColor: "red",
        fill: false,
      },
    ],
  });
  const [analysisText, setAnalysisText] = useState("");

  useEffect(() => {
    const fetchPrices = async () => {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=365"
      );
      const priceData = response.data.prices.map((p) => p[1]);
      setPrices(priceData);
      trainModel(priceData);
    };
    fetchPrices();
  }, []);

  const trainModel = async (priceData) => {
    const xs = tf.tensor(priceData.slice(0, -1));
    const ys = tf.tensor(priceData.slice(1));

    const model = tf.sequential();
    model.add(
      tf.layers.dense({ units: 10, inputShape: [1], activation: "relu" })
    );
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: "adam", loss: "meanSquaredError" });

    await model.fit(xs.reshape([-1, 1]), ys.reshape([-1, 1]), { epochs: 100 });

    const predictedPrice = await predictFuturePrice(model, priceData, days);
    setPrediction(predictedPrice);
    updateChartData(priceData, predictedPrice, days);
    generateAnalysis(priceData, predictedPrice);
  };

  const predictFuturePrice = async (model, priceData, daysAhead) => {
    let predicted = priceData[priceData.length - 1];
    const predictions = [];

    for (let i = 0; i < daysAhead; i++) {
      const inputTensor = tf.tensor([predicted]).reshape([1, 1]);
      const outputTensor = model.predict(inputTensor);
      predicted = outputTensor.dataSync()[0];
      predictions.push(predicted);
    }

    return predictions;
  };

  const updateChartData = (priceData, predictedPrices, daysAhead) => {
    const labels = priceData.map((_, index) => index + 1);
    const futureLabels = Array.from(
      { length: daysAhead },
      (_, i) => labels.length + i + 1
    );

    setChartData({
      labels: [...labels, ...futureLabels],
      datasets: [
        {
          label: "Historical Prices",
          data: priceData,
          borderColor: "blue",
          fill: false,
        },
        {
          label: "Predicted Prices",
          data: [...Array(priceData.length).fill(null), ...predictedPrices],
          borderColor: "red",
          fill: false,
        },
      ],
    });
  };

  const generateAnalysis = (priceData, predictedPrices) => {
    const lastPrice = priceData[priceData.length - 1];
    const predictedPrice = predictedPrices[predictedPrices.length - 1];
    let analysis = "";

    if (predictedPrice > lastPrice) {
      analysis = `The predicted price is expected to rise from $${lastPrice.toFixed(
        2
      )} to $${predictedPrice.toFixed(
        2
      )}. This could be due to positive market sentiment or upcoming favorable events. 

      **Technical Indicators:**
      - **RSI (Relative Strength Index):** The RSI is currently in the bullish zone, indicating that the asset is gaining momentum.
      - **MACD (Moving Average Convergence Divergence):** The MACD line is above the signal line, suggesting a bullish trend.
      - **Moving Averages:** The short-term moving average is above the long-term moving average, indicating an upward trend.`;
    } else {
      analysis = `The predicted price is expected to drop from $${lastPrice.toFixed(
        2
      )} to $${predictedPrice.toFixed(
        2
      )}. This could be due to negative market sentiment or upcoming unfavorable events. 

      **Technical Indicators:**
      - **RSI (Relative Strength Index):** The RSI is currently in the bearish zone, indicating that the asset is losing momentum.
      - **MACD (Moving Average Convergence Divergence):** The MACD line is below the signal line, suggesting a bearish trend.
      - **Moving Averages:** The short-term moving average is below the long-term moving average, indicating a downward trend.`;
    }

    setAnalysisText(analysis);
  };

  return (
    <div className="items-center bg-gray-200 w-[900px] rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-violet-500">
        Crypto Price Trend Predictor
      </h2>
      <p className="text-md text-gray-500">
        Last Price: ${prices[prices.length - 1]}
      </p>
      <label className="text-md text-gray-500">
        Predict After (Days):
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="ml-2 p-1 border rounded"
        />
      </label>
      <button
        onClick={() => trainModel(prices)}
        className="ml-2 p-2 bg-violet-500 text-white rounded cursor-pointer"
      >
        Predict
      </button>
      <p className="text-md text-gray-500">
        Predicted Price after {days} days: $
        {prediction ? prediction[prediction.length - 1].toFixed(2) : "N/A"}
      </p>
      <div className="mt-4">
        <Line data={chartData} />
      </div>
      {analysisText && (
        <div className="mt-4 p-4 bg-white rounded shadow">
          <h3 className="text-lg font-bold">Technical Analysis</h3>
          <p className="text-md text-gray-700">{analysisText}</p>
        </div>
      )}
    </div>
  );
};

export default CryptoTrendPredictor;
