import "./App.css";
import LoginButton from "./components/LoginButton";
import ChatInterface from "./components/ChatInterface";
import React from "react";
import bg from "./assets/bg.png";

function App() {
  return (
    <div className="w-full h-screen" style={{ backgroundImage: `url(${bg})` }}>
      <LoginButton />
      <ChatInterface />
    </div>
  );
}

export default App;
