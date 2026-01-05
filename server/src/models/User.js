import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function () { return !this.googleId; } },
  googleId: { type: String, unique: true, sparse: true },
  googleTokens: {
    type: Object,  // stores access_token, refresh_token, expiry_date, etc.
    default: null,
  },
  timeZone: {
    type: String,
    default: "UTC"  // User's timezone for calendar events
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