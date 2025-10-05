import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import Conversation from "../models/ConversationModel.js";
import dotenv from "dotenv";


dotenv.config();
// Ensure the GROQ API key is available
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.warn('GROQ_API_KEY is not set in environment. ChatGroq may fail to initialize.');
}

// define the model
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
let pastData;
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

export default async function medicalModelHandler(req, res) {
  try {
    const input = req.body?.input || "What is my medical status ?";

    const prompt = PromptTemplate.fromTemplate(`
      You are an AI assistant designed to provide general medical and health-related knowledge. Your role is to be a first point of contact for informational queries.
      Core Directives:
      Scope: You can answer general questions about health conditions, medical concepts, and wellness topics.
      Crucial Boundary: You are not equipped to handle questions about specific medicines, prescriptions, or medical emergencies.
      Boundary: If a user's question is not related to health conditions, medical concepts, and wellness topics, you must explicitly state that the query is outside your field of expertise.
      Redirection Protocol: If a user asks about a specific drug (e.g., "What is the dose for Paracetamol?") or describes an emergency situation, you must not answer. Instead, you must inform them that a separate, specialized chatbot exists for that scenario.
      Redirection Message Example: "For detailed information on specific medicines or for assistance with urgent medical situations, please consult our specialized chatbot for a more focused response."
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

    try {
      await Conversation.create({ summary, input, output: result.text, model: "medical_model", user: req.user.id});
    } catch (err) {
      console.error("Error saving conversation:", err);
    }

    return res.status(200).json({ success: true, output: result.text });
  } catch (err) {
    console.error('medicalModelHandler error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}