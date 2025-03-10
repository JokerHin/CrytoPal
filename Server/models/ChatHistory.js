import { Schema, model } from "mongoose";

const ChatHistorySchema = new Schema({
  userId: { type: String, required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "assistant"], required: true },
      content: { type: Schema.Types.Mixed, required: true }, // Allow content to be string or object
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default model("ChatHistory", ChatHistorySchema);
