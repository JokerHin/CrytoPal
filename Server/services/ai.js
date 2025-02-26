import "dotenv/config"; // Load environment variables from .env
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const SYSTEM_PROMPT = `
You are CryptoPal, an AI assistant for managing crypto wallets. Your capabilities include:
- Sending ETH/ERC20 tokens via Scroll (Layer 2)
- Querying balances/transactions via The Graph
- Explaining gas fees and blockchain concepts

Rules:
1. Never ask for private keys.
2. Always verify transaction details before execution.
3. Use Markdown for responses.
`;

const schema = z.object({
  text: z.string(),
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
    console.error("❌ AI Error:", error.message, error.stack);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
};
