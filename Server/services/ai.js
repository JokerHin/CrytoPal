import { google } from "@ai-sdk/google";

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

export const generateAIResponse = async (userMessage) => {
  try {
    console.log("🚀 Generating AI response for:", userMessage);

    const model = google("models/gemini-pro", {
      projectId: process.env.GOOGLE_PROJECT_ID,
    });

    const result = await model.generateText([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ]);

    if (!result || !result.text) {
      throw new Error("AI response is empty");
    }

    console.log("✅ AI Response:", result.text);
    return { response: result.text };
  } catch (error) {
    console.error("❌ AI Error:", error.message);
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
};
