import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState([]);
  const [messages, setMessages] = useState([]);

  const saveChat = async () => {
    if (messages.length === 0) {
      alert("No messages to save.");
      return;
    }

    try {
      const formattedMessages = messages.map((msg) => ({
        role: msg.isBot ? "assistant" : "user",
        content: msg.text ? msg.text.replace(/^Me: |^Assistant: /, "") : "",
      }));

      console.log("Sending save request with messages:", formattedMessages);

      const response = await fetch("http://localhost:3000/api/chat/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: 1, messages: formattedMessages }), // Replace with actual userId
      });

      if (response.ok) {
        const savedHistory = await response.json();
        setCurrentChat([]);
        return savedHistory;
      } else {
        console.error("Failed to save chat history:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const startNewChat = () => {
    setCurrentChat([]);
    setMessages([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        saveChat,
        startNewChat,
        messages,
        setMessages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
