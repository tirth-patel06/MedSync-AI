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

async function modelCall(input) {

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

  const res1 = await chain.call({ input });

  //save in MongoDB
  try {
    await Conversation.create({
      summary,
      input,
      output: res1.text,
      model: "emergency_model",
    });
    console.log("Conversation saved successfully!");
  } catch (err) {
    console.error("Error saving conversation:", err);
  }

  return res1.text ;
}

const res = await modelCall("What is the meaning of the red marks on skin suddenly after bath ?");
console.log(res);