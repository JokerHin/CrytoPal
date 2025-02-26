import express from "express";
import ChatHistory from "../models/ChatHistory.js";
import { generateAIResponse } from "../services/ai.js";

const router = express.Router();

// Save Chat History
router.post("/save", async (req, res) => {
  const { userId, messages } = req.body;

  try {
    const formattedMessages = messages.map((msg) => ({
      role: msg.isBot ? "assistant" : "user",
      content: msg.content ? msg.content.replace(/^Me: |^Assistant: /, "") : "",
    }));

    const newHistory = new ChatHistory({
      userId,
      messages: formattedMessages,
    });

    const savedHistory = await newHistory.save();
    res.status(200).json(savedHistory);
  } catch (error) {
    console.error("Error saving chat history:", error);
    res
      .status(500)
      .json({ error: "Failed to save chat history", details: error.message });
  }
});

// Update Chat History
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { messages } = req.body;

  try {
    const formattedMessages = messages.map((msg) => ({
      role: msg.isBot ? "assistant" : "user",
      content: msg.content ? msg.content.replace(/^Me: |^Assistant: /, "") : "",
    }));

    const updatedHistory = await ChatHistory.findByIdAndUpdate(
      id,
      { messages: formattedMessages },
      { new: true }
    );

    res.status(200).json(updatedHistory);
  } catch (error) {
    console.error("Error updating chat history:", error);
    res
      .status(500)
      .json({ error: "Failed to update chat history", details: error.message });
  }
});

// Delete Chat History
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await ChatHistory.findByIdAndDelete(id);
    res.status(200).json({ message: "Chat history deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat history:", error);
    res
      .status(500)
      .json({ error: "Failed to delete chat history", details: error.message });
  }
});

// Get Chat History
router.get("/history", async (req, res) => {
  const { userId } = req.query;

  try {
    const history = await ChatHistory.find({ userId });
    res.status(200).json(history);
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
