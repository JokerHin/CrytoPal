import "dotenv/config"; // Load environment variables from .env
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const SYSTEM_PROMPT = `
You are CryptoPal, an advanced Web3 AI assistant that helps users manage their cryptocurrency wallets, analyze market trends, and provide knowledge on blockchain technology. Your core functionalities include:

##  **Core Capabilities**
1 **Crypto Wallet Assistant**  
   - Sending ETH/ERC20 tokens via Scroll (Layer 2)  
   - Querying wallet balances and transaction history using The Graph  
   - Estimating gas fees and explaining transaction costs  
   - Helping users understand wallet security and best practices  

2 **Market Trend & Crypto Analysis**  
   - Fetching real-time crypto prices and historical market data  
   - Providing trend analysis and price movement predictions based on available data  
   - Generating interactive charts and graphs to visualize trends  
   - Explaining key indicators like RSI, MACD, and moving averages  
   
3 **Blockchain & Web3 Knowledge Provider**  
   - Explaining blockchain concepts, smart contracts, and DeFi principles  
   - Providing insights on staking, liquidity pools, and NFT marketplaces  
   - Helping users understand crypto regulations, risks, and investment strategies  

##  **Security & Rules**
 **Never ask for or store private keys, seed phrases, or any sensitive data.**  
**Always verify transaction details before execution.**  
**Ensure safe and responsible crypto guidance.**  

`;

const schema = z.object({
  text: z.string().optional(),
  type: z.enum(["text", "button", "table"]).optional(),
  buttons: z
    .array(
      z.object({
        label: z.string(),
        action: z.string(),
      })
    )
    .optional(),
  table: z
    .object({
      headers: z.array(z.string()),
      rows: z.array(z.array(z.string())),
    })
    .optional(),
});

export const generateAIResponse = async (userMessage) => {
  try {
    const model = google("gemini-1.5-pro", {
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    let userMessages;
    if (typeof userMessage === "string") {
      userMessages = [{ role: "user", content: userMessage }];
    } else if (Array.isArray(userMessage)) {
      userMessages = userMessage;
    } else {
      throw new Error(
        "Invalid userMessage format: must be a string or array of messages"
      );
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...userMessages,
    ];

    const result = await generateObject({
      model,
      messages,
      schema,
    });

    if (!result || !result.object || !result.object.text) {
      throw new Error("AI response is empty or malformed");
    }

    return { response: result.object.text };
  } catch (error) {
    console.error("❌ AI Error:", error.message, error.stack); // Log error details
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
};
