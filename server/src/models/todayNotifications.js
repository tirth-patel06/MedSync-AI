
import mongoose from "mongoose";


const NotificationMessageSchema = new mongoose.Schema({
  title: { type: String, required: true },      
  message: { type: String, required: true },   
  type: { type: String, enum: ["before", "onTime", "after", "test"], default: "onTime" },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medication" }, 
  medicineName: { type: String },
  time: { type: Date, required: true },          
});


const DailyNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, 
  dayName: { type: String },            
  notifications: [NotificationMessageSchema],
});


const Notification = mongoose.model("Notification", DailyNotificationSchema);
export default Notification;
