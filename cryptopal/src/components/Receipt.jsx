import React from "react";
import Success from "../assets/success.png";

export default function Receipt() {
  return (
    <div className="rounded-2xl p-4 w-[300px] flex flex-col items-center justify-center bg-gray-100">
      <div className="flex items-center justify-left text-center w-full">
        <img src={Success} alt="Success" className="w-10 mr-5" />
        <p className="text-xl font-bold text-violet-500 ">
          Transaction Success
        </p>
      </div>
    </div>
  );
}
