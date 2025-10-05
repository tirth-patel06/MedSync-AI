import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import Conversation from "../models/ConversationModel.js";

import dotenv from "dotenv";


dotenv.config();
// Ensure the GROQ API key is available. The application's entrypoint (`server/src/index.js`) should load dotenv.
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.warn('GROQ_API_KEY is not set in environment. ChatGroq may fail to initialize.');
}

// define the model (pass apiKey explicitly)
const chatModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  apiKey: GROQ_API_KEY,
});

// define the memory
const memory = new ConversationSummaryMemory({
  memoryKey: "chat_history",
  llm: chatModel,
});

//call the past memory
let pastData
try{
  pastData = await Conversation.find().limit(2);
  console.log("Past Data loaded...");
}catch(err){
  console.log("Error in featching the data...");
}

//add memory in the memory veriable
await memory.saveContext(
  { input: "What is the past chat?" },
  { output: `Past Chat:\n${JSON.stringify(pastData, null, 2)}` }
);



export default async function medicineModelHandler(req, res) {
  try {
    const input = req.body?.input || "What is my medical status ?";

    const prompt = PromptTemplate.fromTemplate(`
      You are an intelligent AI assistant with specialized knowledge of medicines and pharmaceutical drugs. Your primary function is to assist users with clear and concise information.
      Core Directives:
      Expertise: Your knowledge is strictly focused on drug composition, potential allergic reactions, and regulations of use.
      Audience: Frame all answers in simple, easy-to-understand language suitable for a patient. Avoid technical jargon.
      Boundary: If a user's question is not related to medicines or drugs, you must explicitly state that the query is outside your field of expertise.
      Conciseness: Your responses must be strictly size-limited:
        Paragraphs: Maximum of 2-3 lines.
        Bulleted Lists: Maximum of 4-5 points.

      Current conversation:
      {chat_history}
      Human: {input}
      AI:`);

    const memoryVars = await memory.loadMemoryVariables({});
    const summary = memoryVars?.chat_history || "No summary available";

    const chain = new LLMChain({ llm: chatModel, prompt, memory });
    const result = await chain.call({ input });

    // persist conversation (best-effort)
    try {
      await Conversation.create({ summary, input, output: result.text, model: "medicine_model" });
    } catch (err) {
      console.error("Error saving conversation:", err);
    }

    return res.status(200).json({ success: true, output: result.text });
  } catch (err) {
    console.error('medicineModelHandler error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}