import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  preferredLanguage: {
    type: String,
    enum: ["en", "es", "hi"],
    default: "en",
  },
  googleTokens: {
    type: Object,  // stores access_token, refresh_token, expiry_date, etc.
    default: null,
  },
  lastCalendarSync: { 
    type: Date, 
    default: null 
  },
  calendarSyncEnabled: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);