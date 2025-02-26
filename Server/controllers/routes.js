import express from "express";
import ChatHistory from "../models/ChatHistory.js";
import { generateAIResponse } from "../services/ai.js";

const router = express.Router();

// Save Chat History
router.post("/save", async (req, res) => {
  const { userId, messages } = req.body;

  console.log("Received save request:", { userId, messages });

  try {
    const formattedMessages = messages.map((msg) => ({
      role: msg.isBot ? "assistant" : "user",
      content: msg.content ? msg.content.replace(/^Me: |^Assistant: /, "") : "",
    }));

    console.log("Formatted messages:", formattedMessages);

    const history = await ChatHistory.findOneAndUpdate(
      { userId },
      { $push: { messages: { $each: formattedMessages } } },
      { upsert: true, new: true }
    );
    res.status(200).json(history);
  } catch (error) {
    console.error("Error saving chat history:", error);
    res
      .status(500)
      .json({ error: "Failed to save chat history", details: error.message });
  }
});

// Get Chat History
router.get("/history", async (req, res) => {
  const { userId } = req.query;

  try {
    const history = await ChatHistory.findOne({ userId });
    res.status(200).json(history?.messages || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Generate AI Response using Prompt.jsx
router.post("/generate-prompt", async (req, res) => {
  const { input } = req.body;

  if (!input) {
    return res
      .status(400)
      .json({ success: false, message: "Input cannot be empty" });
  }

  try {
    const aiResponse = await generateAIResponse([
      { role: "user", content: input },
    ]);

    if (!aiResponse || !aiResponse.response) {
      return res.status(500).json({ error: "AI response is empty" });
    }

    res.status(200).json({ response: aiResponse.response });
  } catch (error) {
    // Respond with the error details for debugging
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
