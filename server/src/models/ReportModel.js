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
  userId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Report = mongoose.model("Report", reportSchema);

export default Report;