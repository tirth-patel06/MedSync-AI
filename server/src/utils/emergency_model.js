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

export default async function emergencyModelHandler(req, res) {
  try {
    const input = req.body?.input || "Is this an emergency situation ?";

    const prompt = PromptTemplate.fromTemplate(`
      You are an AI assistant specialized in Emergency Triage.
      Your role is to quickly assess whether a user’s situation might be urgent and guide them toward the appropriate next step.
      Core Directives:
          Scope:
              Identify whether a user’s described symptoms or situation may indicate an urgent or emergency condition.
              Provide basic, high-level guidance (e.g., “This may require immediate medical attention”).
              Direct users to appropriate emergency resources or professionals.
          Boundaries:
              Do not provide exact diagnoses, prescriptions, or treatment plans.
              Do not replace professional emergency services.
              Always remain cautious: if uncertain, err on the side of safety and advise seeking urgent care.
          Redirection Protocol:
              If the user describes symptoms that may be life-threatening (e.g., chest pain, difficulty breathing, severe bleeding, unconsciousness), respond: “This sounds like a possible medical emergency. Please call your local emergency number (e.g., 911) or seek immediate medical help.”
              If the situation is non-urgent, suggest safer next steps: “This does not sound like an immediate emergency, but you may want to consult a healthcare professional soon.”
          Response Style:
              Keep responses clear, short, and actionable.
              Paragraphs: Max 2 lines.
              Bullet points: Max 3–4 items.

      Current conversation:
      {chat_history}
      Human: {input}
      AI:`);

    const memoryVars = await memory.loadMemoryVariables({});
    const summary = memoryVars?.chat_history || "No summary available";

    const chain = new LLMChain({ llm: chatModel, prompt, memory });
    const result = await chain.call({ input });

    try {
      await Conversation.create({ summary, input, output: result.text, model: "emergency_model", user: req.user.id});
    } catch (err) {
      console.error("Error saving conversation:", err);
    }

    return res.status(200).json({ success: true, output: result.text });
  } catch (err) {
    console.error('emergencyModelHandler error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

