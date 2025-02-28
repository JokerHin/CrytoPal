import { usePrivy } from "@privy-io/react-auth";
import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import Logo from "../assets/Logo.png";
import MetaMaskLogo from "../assets/MetaMask.webp"; // Add MetaMask logo import

export default function LoginButton() {
  const { login, logout, authenticated } = usePrivy();
  const { connectWallet, walletAddress } = useContext(AppContext);
  const [showDropdown, setShowDropdown] = useState(false);

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
      <div className="flex items-center pr-10 relative">
        {!authenticated ? (
          <button
            onClick={handleConnectWallet}
            className="bg-violet-500 text-white font-bold p-4 rounded cursor-pointer active:scale-90  active:duration-300"
          >
            Connect Wallet
          </button>
        ) : (
          <div
            className="flex justify-center items-center cursor-pointer "
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <img src={MetaMaskLogo} alt="MetaMask" className="w-10 h-10 mr-2" />
            <span className="font-bold truncate w-20">{walletAddress}</span>
            {showDropdown && (
              <div className="absolute top-13 mt-2 right-3 bg-white shadow-lg rounded p-2">
                <button
                  onClick={logout}
                  className="text-red-500 font-bold p-2 w-full text-left cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
