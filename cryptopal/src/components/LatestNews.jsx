import React, { useState, useEffect } from "react";
import axios from "axios";

const CryptoStockNews = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  const fetchNews = async () => {
    const API_KEY = "oc0PadcKyhz0cNyfX3XbH7Mkji0rl5RuDiRC20ta";
    const API_URL = `https://api.marketaux.com/v1/news/all?api_token=${API_KEY}&language=en&limit=5&symbols=MSTR,COIN,RIOT,MARA,GBTC`;

    try {
      const response = await axios.get(API_URL);
      setNews(response.data.data);
    } catch (err) {
      console.error("Error fetching crypto stock news:", err);
      setError("Failed to fetch news. Check API key or try again later.");
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Latest Crypto Stock News</h2>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="space-y-6">
          {news.map((article, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-gray-100"
            >
              <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-auto max-w-md rounded-lg mb-4"
                />
              )}
              <p className="text-gray-700 mb-4">{article.description}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Read More
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoStockNews;
