import express from "express";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import Report from './../models/ReportModel.js'
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize the Groq model
const model = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  apiKey: process.env.GROQ_API_KEY,
});

let reportText = ""; // store extracted PDF text

// Route 1️⃣: Upload PDF and analyze it
export const generateAnalysis = async (req, res) => {
  try {
    const pdfBuffer = req.file ? req.file.buffer || null : null;

    if (!req.body.user) {
      return res.status(400).json({ error: "User data is missing from the request." });
    }

    const userInfo = JSON.parse(req.body.user);
    const userId = userInfo.id;

    console.log("File info:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const dataBuffer = await pdfParse(fs.readFileSync(req.file.path));

    reportText = dataBuffer.text;
    fs.unlinkSync(req.file.path); //stay eyes on this 

    const prompt = `
Your are a health report analyser. User provide a health report to you and you need to analyse the report and generate the crisp analysis of the report that contain the import all the numeric values and also make sure if some values is less or higher than usual than tell him alert and suggest the solution to improve that condition.
And if the report contain any logs then analyse the logs and find the pettern and mention that pattern in the analysis. Also if there is some medicines with same pattern than also inculde this all the pattens in one or two sentences.

If provided report is not related to health then tell him that this is not any health report so please provide the health report and not analyse that non-health report.Do not provide unnecessary thingd like name age etc just give consise and crisp analysis like report conclusion critical conditons and suugestions according the condition. Try to consise the report in at max two peregraph so give importance to the critical observations 

Make sure you analaysis crisp and consise so that user can grasp all the import things and improvements in simple and short way.

Report Text:
${reportText}
`;

    const response = await model.invoke(prompt);
    const analysisText = response.content;

    const newReport = new Report({
      filename: req.file.originalname,
      reportText: reportText,
      analysis: analysisText,
      userId,
    });

    const savedReport = await newReport.save();

    res.status(201).json({
      message: "Health Report Analyzed and Saved Successfully",
      reportId: savedReport._id, // Send back the ID of the new document
      analysis: savedReport.analysis,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error analyzing report" });
  }
};


//fetch user id and store in report also 
//update the pdfQ function as well


// Route 2️⃣: Chat with the uploaded report
export const pdfQ = async (req, res) => {
  try {
    const { question, reportId } = req.body;
    
    if (!question) {
      console.log(req);
      return res.status(400).json({ data: req });
    }
    
    const report = await Report.findById(reportId);

    const chatPrompt = `
    You are a helpful AI assistant analyzing a medical report.
    make sure answer is consise and answer is to the point and at mex in two to three lines so that it not become the hectic to undertand.
    Also make answer related to health domain related. If user ask other than health related question then tell him thah that is out of my domain and give answer from the given document text. Not mention who are you just solve the user query.
    Answer the question based on the report below.
    
    Report:
    ${report.reportText}
    Report Analysis:
    ${reportText.analysis}
    
    Question:
    ${question}
    `;
    
    const response = await model.invoke(chatPrompt);
    
    res.json({
      reply: response.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ data: req.body });
  }
};

