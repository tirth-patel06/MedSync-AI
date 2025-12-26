import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  reportText: {
    type: String,
    required: true,
  },
  analysis: {
    type: String,
    required: true,
  },
  translatedAnalysis: {
    type: Map,
    of: String,
    default: undefined,
  },
  originalLanguage: {
    type: String,
    default: "en",
  },
  readabilityScore: {
    fleschKincaid: { type: Number },
    fleschReadingEase: { type: Number },
    readingLevel: { type: String },
    grade: { type: Number },
  },
  userId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema);

export default Report;