import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import Medication from "../models/medicineModel.js";
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

const summaryModel =  new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  apiKey: GROQ_API_KEY,
});

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

export default async function personalHealthModelHandler(req, res) {
  try {
    const input = req.body?.input || "What is my medical status ?";
    
    // Get user data from request body (since auth middleware is removed)
    const user = req.body?.user || req.body?.localuser;
    if (!user || !user.id) {
      return res.status(400).json({ 
        success: false, 
        error: "User data is required in request body" 
      });
    }

    //call the past two data from the database
    let pastData = [];
    let userData = [];
    try {
      userData = await Medication.find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(20);
      pastData = await Conversation.find({ user: user.id })
        .sort({ createdAt: -1 }) // latest first
        .limit(2);
      console.log("Past Data loaded...");
    } catch (err) {
      console.log("Error fetching the data...", err);
    }

    //add the userdata and pastdata in the memory 
    await memory.saveContext(
      { input: "This medications are available in the database" },
      { output: `Available medications:\n${JSON.stringify(userData, null, 1)}` }
    );
    await memory.saveContext(
      { input: "This is past conversation" },
      { output: `Past Chat:\n${JSON.stringify(pastData, null, 2)}` }
    );

    const prompt = PromptTemplate.fromTemplate(`
      You are an AI assistant specialized as a Personal Health Tracker.
      Your primary role is to help users log, track, and recall their health-related data such as exercise, diet, sleep, symptoms, and general wellness information.
      Core Directives:
        Scope:
          Assist users in tracking personal health activities (exercise, meals, hydration, medications stored in the database, symptoms, sleep, etc.).
          Provide general knowledge about health, wellness, and medical concepts.
          Summarize and recall previously stored user data from memory when requested.
        Crucial Boundaries:
          Do not provide medical prescriptions, dosages, or specific drug recommendations.
          Do not handle emergency cases.
          If asked about specific medicines, dosages, or urgent situations, redirect the user.
        Redirection Protocol:
          For medication-specific queries (e.g., "What dose of Paracetamol should I take?"), respond:"For detailed information on specific medicines or urgent medical situations, please consult our specialized medical chatbot or a qualified healthcare professional."
        Response Style:
          Keep responses short and structured:
            Paragraphs: Max 2–3 lines.
            Bulleted lists: Max 4–5 items.
            Use clear, simple language suitable for all users.
        Memory Handling:
          Always recall and leverage previously stored data from the database and conversation memory.
          When asked about available medications, retrieve from stored memory (userData) and present them concisely.

      Current conversation:
      {chat_history}
      Human: {input}
      AI:`);

    const memoryVars = await memory.loadMemoryVariables({});
    const summary = memoryVars?.chat_history || "No summary available";

    const chain = new LLMChain({ llm: chatModel, prompt, memory });
    const result = await chain.call({ input });

    try {
      await Conversation.create({ summary, input, output: result.text, model: "personal_health_model", user: user.id});
    } catch (err) {
      console.error("Error saving conversation:", err);
    }

    return res.status(200).json({ success: true, output: result.text });
  } catch (err) {
    console.error('personalHealthModelHandler error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}