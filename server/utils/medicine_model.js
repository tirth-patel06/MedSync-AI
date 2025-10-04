import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import * as dotenv from "dotenv";
import { ChatMessageHistory } from "@langchain/community/stores/message/in_memory";
import { ConversationSummaryMemory } from "langchain/memory";
import { LLMChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";
import Conversation from "./../src/models/ConversationModel";

dotenv.config();

// define the model
const chatModel = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
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

async function modelCall(input) {

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

  const res1 = await chain.call({ input });

  //save in MongoDB
  try {
    await Conversation.create({
      summary,
      input,
      output: res1.text,
      model: "medicine_model",
    });
    console.log("Conversation saved successfully!");
  } catch (err) {
    console.error("Error saving conversation:", err);
  }

  return res1.text ;
}

const res = await modelCall("azithromycin is safe ??");
const res2 = await modelCall("What is my last questaion ?");
console.log(res);
console.log(res2);