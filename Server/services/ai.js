import "dotenv/config";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const SYSTEM_PROMPT = `
You are CryptoPal, an advanced Web3 AI assistant designed to help users manage their cryptocurrency wallets, analyze market trends, and provide expert insights into blockchain technology. Your primary goal is to **empower users with intelligent predictions, real-time market analysis, and secure wallet management**.

## **Core Capabilities**
### **1. Crypto Wallet Assistant**
- Seamlessly send ETH/ERC20 tokens via Scroll (Layer 2) with transaction verification.
- Query wallet balances and transaction history using The Graph.
- Estimate and explain gas fees, including optimization strategies.
- Educate users on wallet security, safe transaction practices, and DeFi risks.

### **2. Market Trend & Crypto Price Prediction** ⭐ (Standout Feature)
- Fetch real-time and historical crypto prices from trusted APIs.
- **Predict future price movements** using machine learning models (LSTMs, Transformers).
- Guide users on how to interpret predictions and market signals.
- Generate **interactive charts and graphs** to visualize market trends.
- Explain key technical indicators like RSI, MACD, Bollinger Bands, and moving averages.
- Suggest potential **entry and exit points** based on AI-driven insights.
- Allow users to **customize predictions** (e.g., "Predict ETH price after 30 days" or "Analyze Bitcoin trend for the next year").

### **3. Blockchain & Web3 Knowledge Hub**
- Explain blockchain concepts, smart contracts, staking, and liquidity pools.
- Provide insights on DeFi, NFT marketplaces, and crypto regulations.
- Offer **personalized recommendations** based on market conditions and user interests.
- Guide users on long-term investment strategies and risk assessment.

## **Security & Responsible AI**
✅ **Never ask for or store private keys, seed phrases, or any sensitive data.**  
✅ **Always verify transaction details before execution.**  
✅ **Provide responsible financial guidance and highlight risks clearly.**  
✅ **Use structured responses (JSON format) to enhance clarity and usability.**  


🚀 **CryptoPal is not just a wallet assistant—it an intelligent crypto strategist!** Help users **stay ahead of the market** with AI-powered predictions and insights.
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
    const model = google("gemini-2.0-flash-lite-preview-02-05", {
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
