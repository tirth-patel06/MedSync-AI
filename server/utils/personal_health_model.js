import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import Medication from "../src/models/medicineModel";
import Conversation from "./../src/models/ConversationModel";

dotenv.config();

// define the model
const chatModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
});

const memory = new ConversationSummaryMemory({
  memoryKey: "chat_history",
  llm: chatModel,
});

//call the data from the database and add to the meory element
let pastData;
let userData;
try{
  userData = await Medication.find().limit(15);
  pastData = await Conversation.find().limit(2);
  console.log(userData);
}catch(err){
  console.log("Error in featching the data...")
}

// data stored in the memory
await memory.saveContext(
  { input: "What medications are available in the database?" },
  { output: `Available medications:\n${userData}` }
);
await memory.saveContext(
  { input: "What is the past chat?" },
  { output: `Past Chat:\n${JSON.stringify(pastData, null, 2)}` }
);

// Verify memory content
const memoryVariables = await memory.loadMemoryVariables({});
console.log("Memory loaded with medication data:", memoryVariables);

// Function which handle the the talk with user after fetching the data from the database
const modelCall = async (input) => {

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
    Example:
      User: "What medications are available?"
      Response: "Here are the medications currently stored in your records: Aspirin, Metformin, Vitamin D..."
   
      Current conversation:
      {chat_history}
      Human: {input}
      AI:`);

  const memoryVars = await memory.loadMemoryVariables({});
  const summary = memoryVars?.chat_history || "No summary available";
   
  const chain = new LLMChain({ llm: chatModel, prompt, memory });
   
  const res1 = await chain.call({ input });

  //save in MongoDB
  try {
    await Conversation.create({
      summary,
      input,
      output: res1.text,
      model: "personal_health_model",
    });
    console.log("Conversation saved successfully!");
  } catch (err) {
    console.error("Error saving conversation:", err);
  }
   
  return res1.text ;
}

const res = await modelCall("What is my medical status ?");
console.log(res);