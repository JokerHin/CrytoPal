import React, { createContext, useState } from "react";
import { ethers } from "ethers";
import abi from "../../abi.json";
import Balance from "../components/balance";
import Receipt from "../components/Receipt";
import axios from "axios";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentChat, setCurrentChat] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [history, setHistory] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [transactionStep, setTransactionStep] = useState(0);
  const [transactionDetails, setTransactionDetails] = useState({
    to: "",
    amount: "",
  });

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
    try {
      const response = await axios.post(
        "http://localhost:3000/api/transaction",
        {
          sender: walletAddress,
          recipient: to,
          amount,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        alert(`Transaction successful! Hash: ${response.data.transactionHash}`);
        setTransactionStep(0); // Reset transaction step after success

        // Show receipt
        setMessages((prevMessages) =>
          prevMessages.concat({
            isComponent: true,
            component: (
              <Receipt
                key={Date.now()}
                walletAddress={walletAddress}
                recipientAddress={to}
              />
            ),
          })
        );
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error performing transaction:", error);
      alert(`Failed to perform transaction: ${error.message}`);
    }
  };

  const handleTransactionInput = (input) => {
    if (transactionStep === 0) {
      setTransactionDetails({ ...transactionDetails, to: input });
      setTransactionStep(1);
      return "Please enter the amount to transfer.";
    } else if (transactionStep === 1) {
      setTransactionDetails({ ...transactionDetails, amount: input });
      setTransactionStep(2);
      return `You are about to transfer ${input} ETH to ${transactionDetails.to}. Please confirm.`;
    } else if (transactionStep === 2) {
      performTransaction(transactionDetails.to, transactionDetails.amount);
      return `Transaction of ${transactionDetails.amount} ETH to ${transactionDetails.to} completed.`;
    }
  };

  const showPopup = (message) => {
    alert(message);
  };

  const saveChat = async () => {
    if (messages.length === 0) {
      showPopup("No messages to save.");
      return;
    }

    try {
      const formattedMessages = messages.map((msg) => ({
        role: msg.isBot ? "assistant" : "user",
        content:
          msg.text ||
          (msg.component && msg.component.props.balance
            ? { type: "balance", balance: msg.component.props.balance }
            : "Missing content"), // ✅ Ensure valid content
      }));

      console.log(
        "Sending chat history:",
        JSON.stringify(formattedMessages, null, 2)
      ); // ✅ Debug frontend data

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
        showPopup("Chat history saved successfully!");
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
      text: typeof msg.content === "string" ? msg.content : null,
      isBot: msg.role === "assistant",
      component:
        typeof msg.content === "object" && msg.content.type === "balance" ? (
          <Balance key={Date.now()} balance={msg.content.balance} />
        ) : null,
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

  const startNewChat = () => {
    setMessages([]);
    setSelectedDocument(null);
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
        handleTransactionInput,
        walletAddress,
        loadChatHistory,
        deleteChatHistory,
        startNewChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
