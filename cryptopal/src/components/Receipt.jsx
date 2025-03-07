import React from "react";
import Success from "../assets/success.png";

export default function Receipt({ network, transactionHash }) {
  const getExplorerUrl = () => {
    if (network === "scroll") {
      return `https://scroll-sepolia.blockscout.com/address/0x77Ca6C90541036A4DAf4EcFdaC3e4B4E361dc86C`;
    } else if (network === "vanguard") {
      return `https://explorer-vanguard.vanarchain.com/address/0x0716f3787ff1a5F0725F5038dcd4F396FCDe5E43?tab=txs`;
    }
  };

  return (
    <div className="rounded-2xl p-4 w-[50%] flex flex-col items-center justify-center bg-gray-100">
      <div className="flex items-center justify-evenly text-center w-full">
        <div className="flex items-center text-center">
          <img src={Success} alt="Success" className="w-10 mr-5" />
          <p className="text-xl font-bold text-violet-500">
            Transaction Success
          </p>
        </div>

        <a
          href={getExplorerUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 underline hover:text-black"
        >
          View Transaction
        </a>
      </div>
    </div>
  );
}
