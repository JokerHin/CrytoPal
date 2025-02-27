import React, { createContext, useState } from "react";
import { ethers } from "ethers";
import abi from "../../abi.json";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [history, setHistory] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install MetaMask.");
        console.error("MetaMask not found.");
        return;
      }

      console.log("Ethereum provider detected:", window.ethereum);
      const providerInstance = new ethers.BrowserProvider(window.ethereum);
      const signer = await providerInstance.getSigner();
      const address = await signer.getAddress();

      console.log("Wallet connected:", address);
      setWalletAddress(address);
      setProvider(providerInstance);

      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
      console.log("Smart contract address:", contractAddress);
      if (!contractAddress) {
        console.error("Smart contract address is missing in .env");
        return;
      }

      const contractInstance = new ethers.Contract(
        contractAddress,
        abi,
        signer
      );
      setContract(contractInstance);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const getBalance = async () => {
    if (!walletAddress || !provider) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const balance = await provider.getBalance(walletAddress);
      console.log("Raw Balance in Wei:", balance);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const performTransaction = async (to, amount) => {
    if (!walletAddress || !provider) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      alert(`Transaction successful! Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Error performing transaction:", error);
    }
  };

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

      let response;
      if (selectedDocument) {
        response = await fetch(
          `http://localhost:3000/api/chat/update/${selectedDocument._id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: formattedMessages }),
          }
        );
      } else {
        response = await fetch("http://localhost:3000/api/chat/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: 1, messages: formattedMessages }),
        });
      }

      if (response.ok) {
        const savedHistory = await response.json();
        setCurrentChat([]);
        setSelectedDocument(savedHistory);
        return savedHistory;
      } else {
        console.error("Failed to save chat history:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  };

  const loadChatHistory = (history) => {
    const formattedMessages = history.messages.map((msg) => ({
      text: msg.content,
      isBot: msg.role === "assistant",
    }));
    setMessages(formattedMessages);
    setSelectedDocument(history);
  };

  const deleteChatHistory = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/chat/delete/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setHistory(history.filter((doc) => doc._id !== id));
      } else {
        console.error("Failed to delete chat history:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting chat history:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        saveChat,
        messages,
        setMessages,
        selectedDocument,
        history,
        setHistory,
        connectWallet,
        getBalance,
        performTransaction,
        walletAddress,
        loadChatHistory,
        deleteChatHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
