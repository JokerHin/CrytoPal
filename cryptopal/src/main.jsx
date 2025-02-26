import React from "react";
import ReactDOM from "react-dom/client";
import { AppProvider } from "./context/AppContext";

import "./index.css";

import { PrivyProvider } from "@privy-io/react-auth";

import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <PrivyProvider
      appId="cm7g7ttiu00mpppa2eqis8dfk"
      config={{
        loginMethods: ["email", "wallet"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://www.svgrepo.com/show/428624/ethereum-crypto-cryptocurrency-2.svg",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <AppProvider>
        <App />
      </AppProvider>
    </PrivyProvider>
  </React.StrictMode>
);
