import express from "express";
import ChatHistory from "../models/ChatHistory.js";
import { generateAIResponse } from "../services/ai.js";
import { performTransaction } from "../services/transaction.js";

const router = express.Router();

// Save Chat History
router.post("/save", async (req, res) => {
  try {
    const { userId, messages } = req.body;

    console.log("Received chat data:", JSON.stringify(req.body, null, 2)); // ✅ Log request data

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid messages format");
    }

    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content:
        typeof msg.content === "string"
          ? msg.content
          : msg.content.type === "balance" && msg.content.balance
          ? { type: "balance", balance: msg.content.balance }
          : "Missing content", // ✅ Ensure valid content
    }));

    const newHistory = new ChatHistory({
      userId,
      messages: formattedMessages,
    });

    const savedHistory = await newHistory.save();
    console.log("Saved chat history:", savedHistory);

    res.status(200).json(savedHistory);
  } catch (error) {
    console.error("Error saving chat history:", error.message); // ✅ Log actual error
    res.status(500).json({
      error: "Failed to save chat history",
      details: error.message,
    });
  }
});

// Update Chat History
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { messages } = req.body;

  try {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content:
        typeof msg.content === "string"
          ? msg.content
          : msg.content.type === "balance" && msg.content.balance
          ? { type: "balance", balance: msg.content.balance }
          : "Missing content", // ✅ Ensure valid content
    }));

    const updatedHistory = await ChatHistory.findByIdAndUpdate(
      id,
      { messages: formattedMessages.filter((msg) => msg.content) }, // Filter out messages without content
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
    console.error("Error generating AI response:", error.message, error.stack); // Log error details
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// Perform Transaction
router.post("/transaction", async (req, res) => {
  const { sender, recipient, amount } = req.body;

  try {
    const result = await performTransaction.execute({
      sender,
      recipient,
      amount,
    });

    if (result.status === "success") {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error("Error performing transaction:", error.message, error.stack); // Log error details
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

export default router;
