import { tool } from "ai";
import { z } from "zod";
import { ethers } from "ethers";
import abi from "../../cryptopal/abi.json";

export const performTransaction = tool({
  description: "Perform a blockchain transaction",
  parameters: z.object({
    sender: z.string().describe("Sender's wallet address"),
    recipient: z.string().describe("Recipient's wallet address"),
    amount: z.string().describe("Amount of cryptocurrency to transfer"),
  }),
  execute: async ({ sender, recipient, amount }) => {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        abi,
        wallet
      );

      // Convert amount to Wei
      const value = ethers.parseEther(amount);

      // Execute transaction
      const tx = await wallet.sendTransaction({
        to: recipient,
        value,
      });

      await tx.wait();

      return {
        status: "success",
        message: `Transaction successful! Hash: ${tx.hash}`,
        transactionHash: tx.hash,
        sender,
        recipient,
        amount,
      };
    } catch (error) {
      return { status: "error", message: error.message };
    }
  },
});

export const tools = {
  performTransaction,
};
