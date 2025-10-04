import mongoose from "mongoose";

const DosageTimeSchema = new mongoose.Schema({
  time: { type: String, required: true },         
  remindBefore: { type: String, default: "15m" }, 
  remindAfter: { type: String, default: "30m" },
  status: { type: String, enum: ["pending", "taken", "missed", "delayed"], default: "pending" },
  takenAt: { type: Date, default: null }
});



// Schema to track adherence history for each dose the status is stored here....
const AdherenceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["taken", "missed", "delayed"], required: true },

 
  //if explicilty marked as taken set it to taken
  //if the time has passed and not marked as taken set it to missed
  
  takenAt: { type: Date, default: null }
});

const MedicationSchema = new mongoose.Schema({
  userId: { type:String, required: true},  
  pillName: { type: String, required: true },
  pillDescription: { type: String },
  
  dosageDays: [{ type: String }], // e.g. ["Monday","Tuesday"]
  dosageTimes: [DosageTimeSchema], 

  dosageAmount: { type: String },   // e.g. "500mg"
  frequency: { type: String },      // e.g. "2 times a day"
  startDate: { type: Date, required: true },  // date of starting medication
  endDate: { type: Date },    // date of deletion of medication

  adherenceHistory: [AdherenceSchema],

}, { timestamps: true });

export default mongoose.model("Medication", MedicationSchema);
