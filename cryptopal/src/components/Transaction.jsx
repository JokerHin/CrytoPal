import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function Transaction() {
  const { performTransaction } = useContext(AppContext);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await performTransaction(recipient, amount);
    setLoading(false);
  };

  return (
    <div className="items-center bg-gray-100 w-[600px] rounded-2xl p-6">
      <div>
        <p className="text-2xl font-bold text-violet-500">Make a Transaction</p>
        <p className="text-md text-gray-500">
          Enter recipient address and amount:
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
