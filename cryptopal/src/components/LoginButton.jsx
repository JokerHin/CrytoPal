import { usePrivy } from "@privy-io/react-auth";
import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Logo from "../assets/Logo.png";

export default function LoginButton() {
  const { login, logout, authenticated } = usePrivy();
  const { connectWallet, walletAddress } = useContext(AppContext);

  const handleConnectWallet = async () => {
    await connectWallet();
    login();
  };

  return (
    <div className="flex justify-between p-4 w-full">
      <div className="flex items-center pl-10">
        <img src={Logo} alt="Logo" className="w-25 h-25" />
        <p className="font-bold text-2xl ml-[-10] text-violet-500">CrytoPal</p>
      </div>
      <div className="flex items-center pr-10">
        {!authenticated ? (
          <button
            onClick={handleConnectWallet}
            className="bg-violet-500 text-white font-bold p-4 rounded cursor-pointer active:scale-90  active:duration-300"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={logout}
            className="bg-violet-500 text-white font-bold p-4 rounded-full cursor-pointer active:scale-90  active:duration-300"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
