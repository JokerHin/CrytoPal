import React from "react";

export default function Message({ message }) {
  return (
    <div
      className={`flex gap-5 p-4 ${
        message.role === "assistant" ? "bg-gray-900 rounded-lg" : ""
      }`}
    >
      <div className="text-sm text-gray-500">
        {message.role === "user" ? "U" : "A"}
      </div>
      <div className="text-sm">{message.content}</div>
    </div>
  );
}
