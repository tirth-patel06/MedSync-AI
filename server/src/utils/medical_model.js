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
let chatModel;
let summaryModel;
try {
  chatModel = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    apiKey: GROQ_API_KEY,
  });

  summaryModel =  new ChatGroq({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    apiKey: GROQ_API_KEY,
  });
} catch (error) {
  console.warn('ChatGroq initialization failed, medical model will not be available:', error.message);
}

// define the memory
const summaryPrompt = PromptTemplate.fromTemplate(`
Progressively summarize the conversation. Keep the summary under 50 words and return only the summary.
Make sure that all the key words are included so not loss the flow of chat.

Current summary:
{summary}

New lines of conversation:
{new_lines}

New summary:`);

const memory = new ConversationSummaryMemory({
  memoryKey: "chat_history",
  llm: summaryModel,
  prompt: summaryPrompt, // <-- Add this line
});

export default async function medicalModelHandler(req, res) {
  if (!chatModel) {
    return res.status(503).json({ 
      success: false, 
      error: "Medical model is not available. GROQ_API_KEY may not be configured properly." 
    });
  }

  try {
    const input = req.body?.input || "What is my medical status ?";

    const user = req.body?.user || req.body?.localuser;
    if (!user || !user.id) {
      return res.status(400).json({ 
        success: false, 
        error: "User data is required in request body" 
      });
    }

    //call the past two data from the database
    let pastData = [];
    try {
      pastData = await Conversation.find({ user: user.id })
        .sort({ createdAt: -1 }) // latest first
        .limit(2);
      console.log("Past Data loaded...");
    } catch (err) {
      console.log("Error fetching the data...", err);
    }

    //add the past data in the memory 
    await memory.saveContext(
      { input: "This is past conversation" },
      { output: `Past Chat:\n${JSON.stringify(pastData, null, 2)}` }
    );

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
      await Conversation.create({ summary, input, output: result.text, model: "medical_model", user: user.id});
    } catch (err) {
      console.error("Error saving conversation:", err);
    }

    return res.status(200).json({ success: true, output: result.text });
  } catch (err) {
    console.error('medicalModelHandler error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}