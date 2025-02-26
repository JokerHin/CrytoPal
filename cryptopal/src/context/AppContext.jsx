import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);

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

      let response;
      if (selectedDocument) {
        response = await fetch(
          `http://localhost:3000/api/chat/update/${selectedDocument._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages: formattedMessages }),
          }
        );
      } else {
        response = await fetch("http://localhost:3000/api/chat/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: 1, messages: formattedMessages }), // Replace with actual userId
        });
      }

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
    setSelectedDocument(null);
  };

  const loadChatHistory = (history) => {
    const formattedMessages = history.messages.map((msg) => ({
      text: msg.content,
      isBot: msg.role === "assistant",
    }));
    setMessages(formattedMessages);
    setSelectedDocument(history);
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
        loadChatHistory,
        selectedDocument,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
