import React, { useState, useContext } from "react";
import axios from "axios";
import Spinner from "../assets/Spinner@1x-1.0s-200px-200px (1).gif";
import { AppContext } from "../context/AppContext";
import Balance from "./balance";
import CurrentPrice from "./CurrentPrice";
import Logo from "../assets/logo.png";
import TheGraph from "../assets/TheGraph.png";
import Scroll from "../assets/Scroll.svg";

export default function ChatInterface() {
  const { messages, setMessages, getBalance, handleTransactionInput } =
    useContext(AppContext);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && input.trim()) {
      setInput("");
      handleSend(input);
    }
  };

  const handleSubmit = () => {
    if (input.trim()) {
      setInput("");
      handleSend(input);
    } else {
      alert("Input cannot be empty.");
    }
  };

  const handleSend = async (message) => {
    if (!message.trim()) return;

    setLoading(true);

    setMessages([
      ...messages,
      { text: message, isBot: false },
      { text: "Assistant is typing...", isBot: true, isLoading: true },
    ]);

    try {
      if (message.toLowerCase().includes("balance")) {
        const balance = await getBalance();

        // ✅ Add Balance component instead of text
        setMessages((prevMessages) =>
          prevMessages
            .filter((msg) => !msg.isLoading)
            .concat({
              isComponent: true,
              component: <Balance key={Date.now()} balance={balance} />,
            })
        );
      } else if (
        message.toLowerCase().includes("eth current price") ||
        message.toLowerCase().includes("ethereum current price")
      ) {
        setMessages((prevMessages) =>
          prevMessages
            .filter((msg) => !msg.isLoading)
            .concat({
              isComponent: true,
              component: <CurrentPrice key={Date.now()} currency="ethereum" />,
            })
        );
      } else if (
        message.toLowerCase().includes("btc current price") ||
        message.toLowerCase().includes("bitcoin current price")
      ) {
        setMessages((prevMessages) =>
          prevMessages
            .filter((msg) => !msg.isLoading)
            .concat({
              isComponent: true,
              component: <CurrentPrice key={Date.now()} currency="bitcoin" />,
            })
        );
      } else if (message.toLowerCase().includes("transaction")) {
        const responseText = handleTransactionInput(message);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.isLoading
              ? {
                  text: responseText,
                  isBot: true,
                }
              : msg
          )
        );
      } else {
        const response = await axios.post(
          "http://localhost:3000/api/chat/generate-prompt",
          {
            input: message,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const botReply = response.data.response;

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.isLoading
              ? {
                  text: botReply,
                  isBot: true,
                }
              : msg
          )
        );
      }
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
          <div className="h-[380px] items-center pt-30">
            <div className="text-center text-violet-500 text-[40pt] block ">
              What can I assist you with today?
            </div>
            <div className="flex items-center justify-center gap-10 mt-7">
              <button
                className="border border-gray-400 rounded-full px-7 hover:bg-gray-100 cursor-pointer w-[20%] flex justify-center text-center hover:shadow-lg hover:shadow-violet-200"
                onClick={() => handleSend("What is CryptoPal?")}
              >
                <img src={Logo} alt="CryptoPal" className="w-15 ml-[-20px]" />
                <p className="mt-3">What is CryptoPal?</p>
              </button>
              <button
                className="border border-gray-400 rounded-full px-7 py-2 hover:bg-gray-100 cursor-pointer w-[20%] flex justify-evenly hover:shadow-lg hover:shadow-violet-200"
                onClick={() => handleSend("What is Scroll?")}
              >
                <img src={Scroll} alt="Scroll" className="w-7 ml-[-10px]" />
                <p>What is Scroll?</p>
              </button>
              <button
                className="border border-gray-400 rounded-full px-7 py-2 hover:bg-gray-100 cursor-pointer w-[20%] flex justify-evenly hover:shadow-lg hover:shadow-violet-200"
                onClick={() => handleSend("What is The Graph?")}
              >
                <img src={TheGraph} alt="The Graph" className="w-7" />
                <p className="mt-1">What is The Graph?</p>
              </button>
            </div>
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
                  ) : msg.text ? (
                    renderMessageText(msg.text).map((line, index) => (
                      <div key={index}>{line}</div>
                    ))
                  ) : (
                    msg.component
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
