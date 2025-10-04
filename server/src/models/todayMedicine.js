import mongoose from "mongoose";
import MedicationSchema from "../models/medicineModel.js";  

const MedicationSubSchema = new mongoose.Schema(
  MedicationSchema.obj, 
  { _id: false } 
);

const TodaysMedicationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { 
    type: Date, 
    required: true, 
    default: () => new Date().setHours(0,0,0,0) 
  },
  medicines: [MedicationSubSchema]  
}, { timestamps: true });

export default mongoose.model("TodaysMedication", TodaysMedicationSchema);
