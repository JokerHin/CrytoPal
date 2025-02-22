import React, { useState } from "react";
import axios from "axios";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    setInput("");
    if (!input.trim()) {
      alert("Input cannot be empty");
      return;
    }

    // Add user message
    setMessages([...messages, { text: input, isBot: false }]);

    // Call DeepSeek API
    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [{ role: "user", content: input }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer YOUR_DEEPSEEK_API_KEY`,
        },
      }
    );

    // Add bot response
    const botReply = response.data.choices[0].message.content;
    setMessages([...messages, { text: botReply, isBot: true }]);
    setInput("");
  };

  return (
    <div className="w-full h-full p-4 z-10">
      <div className="w-full mx-auto rounded-lg p-4 items-center justify-center">
        {messages.length === 0 ? (
          <div className="text-center text-violet-500 text-[40pt] h-[380px] items-center justify-center flex">
            What can I assist you with today?
          </div>
        ) : (
          <div className="h-96 h-[600px] overflow-y-auto mb-4 w-full">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 my-2 rounded ${
                  msg.isBot ? "bg-gray-100" : "bg-blue-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
        )}
        <div className="w-full flex justify-center">
          <div className="flex gap-2 w-[90%] items-center ">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-4 border rounded focus:border-violet-500 focus:border-2 focus:outline-none shadow-lg shadow-violet-200 bg-white"
              placeholder="Ask CryptoPal..."
            />
            <button
              onClick={handleSend}
              className="bg-violet-500 text-white p-4 px-6 rounded-lg font-bold cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
