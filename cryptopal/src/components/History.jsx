import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import toggleIcon from "../assets/sidebar.svg";
import newChatIcon from "../assets/NewChat.png"; // Add the new chat image import
import saveIcon from "../assets/save.svg"; // Add the save chat image import

export default function History() {
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const { currentChat, saveChat, startNewChat, loadChatHistory } =
    useContext(AppContext);

  useEffect(() => {
    // Fetch chat history from the backend
    const fetchHistory = async () => {
      const response = await fetch(
        "http://localhost:3000/api/chat/history?userId=1"
      ); // Replace with actual userId
      const data = await response.json();
      setHistory(data);
      console.log(data);
    };

    fetchHistory();
  }, []);

  const generateSummary = (messages) => {
    const summaryLength = 50; // Adjust the length of the summary as needed
    const summary = messages
      .map((msg) => msg.content)
      .join(" ")
      .slice(0, summaryLength);
    return summary.length === summaryLength ? `${summary}...` : summary;
  };

  return (
    <div
      className={`h-full p-4 z-20 rounded-2xl ${
        showHistory
          ? "w-[17%] border-r border-gray-200 bg-gray-100"
          : "w-[4%] border-r border-gray-200 bg-gray-100"
      }`}
    >
      <div
        className={`flex items-center ${
          !showHistory ? "absolute top-4 left-4 flex-col" : ""
        }`}
      >
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="cursor-pointer"
        >
          <img
            src={toggleIcon}
            alt="Toggle History"
            className="w-10 h-10 text-violet-500"
          />
        </button>
        <button
          onClick={() => {
            startNewChat();
          }}
          className={`ml-2 cursor-pointer ${
            !showHistory ? "mt-3 ml-[-1px]" : ""
          }`}
        >
          <img
            src={newChatIcon}
            alt="New Chat"
            className="w-9 h-9 text-violet-500"
          />
        </button>
        <button
          onClick={async () => {
            console.log("Saving chat...");
            const savedHistory = await saveChat();
            console.log("Saved history:", savedHistory);
            if (savedHistory) {
              setHistory([...history, savedHistory]);
            }
          }}
          className={`ml-2 cursor-pointer ${
            !showHistory ? "mt-3 ml-[-1px]" : ""
          }`}
        >
          <img
            src={saveIcon}
            alt="Save Chat"
            className="w-9 h-9 text-violet-500"
          />
        </button>
      </div>
      {showHistory && (
        <div className="h-[calc(100%-56px)] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-violet-500 w-full mt-4">
            Chat History
          </h2>
          {history.map((entry, index) => (
            <div
              key={index}
              className="mb-4 cursor-pointer"
              onClick={() => loadChatHistory(entry)}
            >
              <div className="font-semibold hover:bg-gray-200 w-full p-2">
                {generateSummary(entry.messages)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
