"use client";
import { useState } from "react";
import Receipt from "./Receipt";

export default function TransactionFlow() {
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTransaction = async () => {
    setLoading(true);
    const messages = [
      {
        role: "user",
        content: `I want to transfer ${amount} ETH to ${recipient}`,
      },
    ];

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const result = await response.json();
    if (result?.content?.status === "success") {
      setTransaction(result.content);
    } else {
      alert("Transaction failed: " + result?.content?.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      {!transaction ? (
        <div className="space-y-4">
          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Your Wallet Address"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
          />
          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Recipient Wallet Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            type="number"
            className="border p-2 w-full"
            placeholder="Amount in ETH"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            className="bg-violet-500 text-white p-2 rounded-lg"
            onClick={handleTransaction}
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm & Send"}
          </button>
        </div>
      ) : (
        <Receipt walletAddress={sender} recipientAddress={recipient} />
      )}
    </div>
  );
}
