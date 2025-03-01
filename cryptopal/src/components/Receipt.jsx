import React from "react";
import Success from "../assets/success.png";

export default function Receipt() {
  return (
    <div className="rounded-2xl p-4 w-[40%] flex flex-col items-center justify-center bg-gray-100">
      <div className="flex items-center justify-evenly text-center w-full">
        <div className="flex items-center text-center">
          <img src={Success} alt="Success" className="w-10 mr-5" />
          <p className="text-xl font-bold text-violet-500">
            Transaction Success
          </p>
        </div>

        <a
          href="https://scroll-sepolia.blockscout.com/"
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
