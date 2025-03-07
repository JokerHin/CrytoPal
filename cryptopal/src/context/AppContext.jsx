import React, { createContext, useState } from "react";
import { ethers } from "ethers";
import scrollAbi from "../../abi.json";
import vanguardAbi from "../../vanguardAbi.json";
import Balance from "../components/Balance";
import Receipt from "../components/Receipt";
import Transaction from "../components/Transaction";
import CurrentPrice from "../components/CurrentPrice";
import Prediction from "../components/Prediction";
import News from "../components/LatestNews";

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

  const performTransaction = async (to, amount, network = "scroll") => {
    if (!walletAddress || !provider) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      let contractAddress;
      let abi;
      if (network === "scroll") {
        contractAddress = import.meta.env.VITE_SCROLL_CONTRACT_ADDRESS;
        abi = scrollAbi;
      } else if (network === "vanguard") {
        contractAddress = import.meta.env.VITE_VANAR_CONTRACT_ADDRESS;
        abi = vanguardAbi;
      }

      console.log("Smart contract address:", contractAddress);
      if (!contractAddress) {
        console.error("Smart contract address is missing in .env");
        return;
      }

      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        contractAddress,
        abi,
        signer
      );
      const tx = await contractInstance.deposit({
        value: ethers.parseEther(amount),
      });

      console.log("Transaction sent:", tx);
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);

      if (receipt.status === 1) {
        alert(`Transaction successful! Hash: ${tx.hash}`);
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
                network={network}
                transactionHash={tx.hash}
              />
            ),
          })
        );
      } else {
        alert("Transaction failed.");
      }
    } catch (error) {
      console.error("Error performing transaction:", error);
    }
  };

  const handleTransactionInput = (input, network = "scroll") => {
    if (transactionStep === 0) {
      setMessages((prevMessages) =>
        prevMessages.concat({
          isComponent: true,
          component: <Transaction key={Date.now()} />,
        })
      );
      setTransactionStep(1);
      return "Please fill in the transaction details.";
    } else if (transactionStep === 1) {
      setTransactionDetails({ ...transactionDetails, to: input });
      setTransactionStep(2);
      return "Please enter the amount to transfer.";
    } else if (transactionStep === 2) {
      setTransactionDetails({ ...transactionDetails, amount: input });
      setTransactionStep(3);
      return `You are about to transfer ${input} ETH to ${transactionDetails.to}. Please confirm.`;
    } else if (transactionStep === 3) {
      performTransaction(
        transactionDetails.to,
        transactionDetails.amount,
        network
      );
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
            : msg.component && msg.component.props.walletAddress
            ? {
                type: "transaction",
                walletAddress: msg.component.props.walletAddress,
                recipientAddress: msg.component.props.recipientAddress,
              }
            : msg.component && msg.component.type === Transaction
            ? { type: "transaction", details: "Transaction details" }
            : msg.component && msg.component.type === Receipt
            ? {
                type: "receipt",
                walletAddress: msg.component.props.walletAddress,
                recipientAddress: msg.component.props.recipientAddress,
              }
            : msg.component && msg.component.type === CurrentPrice
            ? { type: "currentPrice", currency: msg.component.props.currency }
            : msg.component && msg.component.type === Prediction
            ? {
                type: "prediction",
                days: msg.component.props.days,
                currency: msg.component.props.currency,
                analysis: msg.component.props.analysis,
              }
            : msg.component && msg.component.type === News
            ? { type: "news" }
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
        ) : typeof msg.content === "object" &&
          msg.content.type === "transaction" ? (
          <Receipt
            key={Date.now()}
            walletAddress={msg.content.walletAddress}
            recipientAddress={msg.content.recipientAddress}
          />
        ) : msg.content === "Transaction details" ? (
          <Transaction key={Date.now()} />
        ) : typeof msg.content === "object" &&
          msg.content.type === "receipt" ? (
          <Receipt
            key={Date.now()}
            walletAddress={msg.content.walletAddress}
            recipientAddress={msg.content.recipientAddress}
          />
        ) : typeof msg.content === "object" &&
          msg.content.type === "currentPrice" ? (
          <CurrentPrice key={Date.now()} currency={msg.content.currency} />
        ) : typeof msg.content === "object" &&
          msg.content.type === "prediction" ? (
          <Prediction
            key={Date.now()}
            days={msg.content.days}
            currency={msg.content.currency}
            analysis={msg.content.analysis}
          />
        ) : msg.content === "news" ? (
          <News key={Date.now()} />
        ) : (
          msg.content
        ),
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
        handleTransactionInput,
        performTransaction,
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
