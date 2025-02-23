import "./App.css";
import LoginButton from "./components/LoginButton";
import ChatInterface from "./components/ChatInterface";
import React from "react";
import bg from "./assets/bg.png";
import robot from "./assets/robot.png";

function App() {
  return (
    <div
      className="w-full h-screen relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <img
        src={robot}
        alt="Robot"
        className="absolute inset-0 m-auto opacity-30 rounded-full z-0"
        style={{ width: "300px", height: "300px" }}
      />
      <div className="relative z-10">
        <LoginButton />
        <ChatInterface />
      </div>
    </div>
  );
}

export default App;
