import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import Eth from "../assets/ethereum-eth.svg"; // Ensure this path is correct

export default function Balance({ balance }) {
  const { getBalance } = useContext(AppContext);
  const [ethBalance, setEthBalance] = useState(0);
  const [usdPrice, setUsdPrice] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await getBalance();
        setEthBalance(balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    const fetchEthPrice = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        setUsdPrice(response.data.ethereum.usd);
      } catch (error) {
        console.error("Error fetching ETH price:", error);
      }
    };

    fetchBalance();
    fetchEthPrice();

    // Update price every 60 seconds
    const interval = setInterval(fetchEthPrice, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="items-center bg-gray-200 w-[450px] rounded-2xl p-6">
      <div>
        <p className="text-2xl font-bold text-violet-500">Your Wallet</p>
        <p className="text-md text-gray-500">Crypto balance:</p>
      </div>
      <div className="flex items-center mt-5">
        <img src={Eth} alt="Ethereum" className="w-10 h-auto" />
        <p className="text-4xl font-bold ml-4 ">{balance} ETH</p>
      </div>
      <div className="mt-3 text-xl text-gray-600">
        ≈ ${Number(ethBalance * usdPrice).toFixed(2)} USD
      </div>
    </div>
  );
}
