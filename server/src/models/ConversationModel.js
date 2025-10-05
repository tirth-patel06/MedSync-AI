import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  summary: {
    type: String,
    required: true,
  },
  input: {
    type: String,
    required: true,
  },
  output: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
