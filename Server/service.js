import { googleVertex } from "@ai-sdk/google-vertex";

const systemPrompt = `
You are Crypto Assistant, an AI for managing crypto wallets. You can:
1. Send ETH via Scroll
2. Check balances
3. Explain transactions
4. Show history

Rules:
- Addresses must be validated with 0x... format
- Always confirm transactions with user
- Use markdown for responses
`;

export const generateAIResponse = async (messages) => {
  const model = googleVertex("gemini-1.5-pro", {
    projectId: process.env.GOOGLE_PROJECT_ID,
    location: process.env.GOOGLE_LOCATION,
  });

  const result = await model.generateText([
    { role: "system", content: systemPrompt },
    ...messages,
  ]);

  return result.text;
};
