import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function Transaction() {
  const { performTransaction } = useContext(AppContext);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("scroll");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipient || !amount) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);
    await performTransaction(recipient, amount, network);
    setLoading(false);
  };

  return (
    <div className="items-center bg-gray-100 w-[600px] rounded-2xl p-6">
      <div>
        <p className="text-2xl font-bold text-violet-500">Make a Transaction</p>
        <p className="text-md text-gray-500">
          Enter recipient address, amount, and select network:
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-5">
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="recipient"
          >
            Recipient Address
          </label>
          <input
            type="text"
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="amount"
          >
            Amount (ETH)
          </label>
          <input
            type="text"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4 relative">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="network"
          >
            Select Network
          </label>
          <select
            id="network"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="scroll">Scroll Smart Contract</option>
            <option value="vanguard">Vanguard Smart Contract</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-10 w-10 items-center mt-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-violet-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-pointer"
            disabled={loading}
          >
            {loading ? "Processing..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
