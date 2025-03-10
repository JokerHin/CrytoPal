import "./App.css";
import LoginButton from "./components/LoginButton";
import ChatInterface from "./components/ChatInterface";
import React from "react";
import bg from "./assets/bg.png";
import robot from "./assets/robot.png";
import History from "./components/History";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="w-full h-screen relative flex"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <History />
        <div className="relative z-10 flex-1">
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
      </div>
    </QueryClientProvider>
  );
}

export default App;
