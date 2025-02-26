import React, { useState } from "react";
import axios from "axios";
import Spinner from "../assets/Spinner@1x-1.0s-200px-200px (1).gif";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      setInput("");
      handleSend();
    }
  };

  const handleSubmit = () => {
    setInput("");
    handleSend();
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setLoading(true);

    setMessages([
      ...messages,
      { text: `Me: ${input}`, isBot: false },
      { text: "Assistant is typing...", isBot: true, isLoading: true },
    ]);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/chat/generate-prompt",
        {
          input,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Ensure botReply is a string
      const botReply = response.data.response;

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.isLoading
            ? {
                text: `Assistant: ${
                  typeof botReply === "string"
                    ? botReply
                    : JSON.stringify(botReply)
                }`,
                isBot: true,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }

    setLoading(false);
  };

  const renderMessageText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className="w-full h-full p-4 z-10 flex flex-col relative">
      <div className="w-full mx-auto rounded-lg p-4 items-center justify-center flex-1">
        {messages.length === 0 ? (
          <div className="text-center text-violet-500 text-[40pt] h-[380px] items-center justify-center flex">
            What can I assist you with today?
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="h-[600px] overflow-y-auto overflow-hidden mb-4 w-[90%] text-xl">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 my-2 rounded ${
                    msg.isBot ? "bg-gray-100" : "bg-blue-100"
                  }`}
                >
                  {msg.isLoading ? (
                    <img src={Spinner} alt="Loading..." className="w-6 h-6" />
                  ) : (
                    renderMessageText(msg.text).map((line, index) => (
                      <div key={index}>{line}</div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="w-full flex justify-center">
          <div className="flex gap-2 w-[90%] items-center ">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-4 border rounded focus:border-violet-500 focus:border-2 focus:outline-none shadow-lg shadow-violet-200 bg-white"
              placeholder="Ask CryptoPal..."
              disabled={loading}
            />
            <button
              onClick={handleSubmit}
              className="bg-violet-500 text-white p-4 px-6 rounded-lg font-bold cursor-pointer"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
