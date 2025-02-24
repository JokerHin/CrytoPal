import express from "express";
import ChatHistory from "../models/ChatHistory";
import { generateAIResponse } from "../services/ai";

const router = express.Router();

// Save Chat History
router.post("/save", async (req, res) => {
  const { userId, messages } = req.body;

  try {
    const history = await ChatHistory.findOneAndUpdate(
      { userId },
      { $push: { messages: { $each: messages } } },
      { upsert: true, new: true }
    );
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to save chat history" });
  }
});

// Get Chat History
router.get("/history/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const history = await ChatHistory.findOne({ userId });
    res.status(200).json(history?.messages || []);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Generate AI Response
router.post("/generate", async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await generateAIResponse(messages);
    res.status(200).json({ text: response });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

export default router;
