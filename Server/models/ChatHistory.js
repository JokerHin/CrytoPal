import { Schema, model } from "mongoose";

const ChatHistorySchema = new Schema({
  userId: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default model("ChatHistory", ChatHistorySchema);
