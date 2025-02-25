import express from "express";
import ChatHistory from "./models/ChatHistory.js";
import { generateAIResponse } from "./services/ai.js";

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
    console.error("Error saving chat history:", error);
    res.status(500).json({ error: "Failed to save chat history" });
  }
});

// Get Chat History
router.get("/history", async (req, res) => {
  const { userId } = req.params;

  try {
    const history = await ChatHistory.findOne({ userId });
    res.status(200).json(history?.messages || []);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Generate AI Response using Prompt.jsx
router.post("/generate-prompt", async (req, res) => {
  const { input } = req.body;
  console.log(input);

  if (!input) {
    return res
      .status(400)
      .json({ success: false, message: "Input cannot be empty" });
  }

  try {
    const aiResponse = await generateAIResponse(input);

    if (!aiResponse || !aiResponse.response) {
      return res.status(500).json({ error: "AI response is empty" });
    }

    res.status(200).json(aiResponse);
  } catch (error) {
    // Log detailed error info from the backend
    console.error("❌ Backend Error:", error.message);

    // Respond with the error details for debugging
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
