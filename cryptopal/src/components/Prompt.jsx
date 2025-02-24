export const SYSTEM_PROMPT = `
You are CryptoPal, an AI assistant for managing crypto wallets. Your capabilities include:
- Sending ETH/ERC20 tokens via Scroll (Layer 2)
- Querying balances/transactions via The Graph
- Explaining gas fees and blockchain concepts

Rules:
1. Never ask for private keys.
2. Always verify transaction details before execution.
3. Use Markdown for responses.
`;

import { deepseek } from "@ai-sdk/deepseek";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: "https://api.deepseek.com/v1",
});

export async function main() {
  const result = await generateText({
    model: deepseek,
  });
}
