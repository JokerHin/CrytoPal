import React from "react";
import Success from "../assets/success.png";

export default function Receipt({ walletAddress, recipientAddress }) {
  return (
    <div className="bg-gray-200 rounded-2xl p-4 w-[350px] h-[300px] flex flex-col items-center justify-center">
      <div className="text-center w-full">
        <p className="text-xl font-bold text-violet-500">Transaction Success</p>
      </div>
      <img src={Success} alt="Success" className="w-15" />
      <div className="h-[60%] mt-5">
        <div className="mt-4">
          <p className="text-md text-gray-500">From:</p>
          <p className="text-xl font-bold truncate">{walletAddress}</p>
        </div>
        <div className="mt-4 ">
          <p className="text-md text-gray-500">To:</p>
          <p className="text-xl font-bold truncate">{recipientAddress}</p>
        </div>
      </div>
    </div>
  );
}
