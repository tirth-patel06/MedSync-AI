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
  autoTranslateAll: {
    type: Boolean,
    default: false,
  },
  showReadabilityScores: {
    type: Boolean,
    default: true,
  },
  targetReadingLevel: {
    type: String,
    enum: ["all", "college", "highschool", "middle", "elementary"],
    default: "highschool",
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
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otpCode: {
    type: String,
    default: null
  },
  otpExpiresAt: {
    type: Date,
    default: null
  },
  otpRetryCount: {
    type: Number,
    default: 0
  },
  backupCodes: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);