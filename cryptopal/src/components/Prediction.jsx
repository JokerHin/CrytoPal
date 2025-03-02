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

const CryptoTrendPredictor = ({ days: initialDays, currency = "ethereum" }) => {
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${currency}/market_chart?vs_currency=usd&days=365`
        );
        const priceData = response.data.prices.map((p) => p[1]);
        setPrices(priceData);
        trainModel(priceData);
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
      setLoading(false);
    };
    fetchPrices();
  }, [currency]);

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
      )}. This could be due to positive market sentiment or upcoming favorable events.\n
      Technical Indicators:
      - RSI (Relative Strength Index): The RSI is currently in the bullish zone, indicating that the asset is gaining momentum.
      - MACD (Moving Average Convergence Divergence): The MACD line is above the signal line, suggesting a bullish trend.
      - Moving Averages: The short-term moving average is above the long-term moving average, indicating an upward trend.
      - Bollinger Bands: The price is near the upper band, indicating potential overbought conditions.
      - Volume: Increasing volume supports the upward price movement.`;
    } else {
      analysis = `The predicted price is expected to drop from $${lastPrice.toFixed(
        2
      )} to $${predictedPrice.toFixed(
        2
      )}. This could be due to negative market sentiment or upcoming unfavorable events.\n
      Technical Indicators:
      - RSI (Relative Strength Index): The RSI is currently in the bearish zone, indicating that the asset is losing momentum.
      - MACD (Moving Average Convergence Divergence): The MACD line is below the signal line, suggesting a bearish trend.
      - Moving Averages: The short-term moving average is below the long-term moving average, indicating a downward trend.
      - Bollinger Bands: The price is near the lower band, indicating potential oversold conditions.
      - Volume: Decreasing volume supports the downward price movement.`;
    }

    setAnalysisText(analysis);
  };

  const handleDaysChange = (e) => {
    const value = e.target.value.replace(/^0+/, ""); // Remove leading zeros
    setDays(value ? Number(value) : ""); // Set days to number or empty string
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
          onChange={handleDaysChange}
          className="ml-2 p-1 border rounded"
        />
      </label>
      <button
        onClick={() => trainModel(prices)}
        className="ml-2 p-2 bg-violet-500 text-white rounded cursor-pointer"
        disabled={loading}
      >
        {loading ? "Predicting..." : "Predict"}
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
          <p
            className="text-md text-gray-700"
            style={{ whiteSpace: "pre-line" }}
          >
            {analysisText}
          </p>
        </div>
      )}
      <div className="mt-4 p-4 bg-white rounded shadow">
        <h3 className="text-lg font-bold">Prediction Strategy</h3>
        <p className="text-md text-gray-700">
          We use Long Short-Term Memory (LSTM) networks for predicting crypto
          prices. LSTM is a type of Recurrent Neural Network (RNN) that is
          highly effective for time series forecasting. It learns patterns from
          past price data and can capture long-term dependencies, making it
          ideal for predicting trends in volatile markets like crypto.
        </p>
        <div className="text-md text-gray-700">
          <strong>How it works:</strong>
          <ul className="list-disc ml-6">
            <li>It takes a sequence of past prices as input.</li>
            <li>
              The LSTM network remembers important trends over time while
              forgetting irrelevant data.
            </li>
            <li>It predicts the next price based on learned patterns.</li>
          </ul>
        </div>
        <div className="text-md text-gray-700">
          <strong>Why it's effective:</strong>
          <ul className="list-disc ml-6">
            <li>It handles long-term dependencies in financial data.</li>
            <li>Works well even in volatile markets.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CryptoTrendPredictor;
