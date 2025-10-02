import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import MedicineRoutes from './routes/medicineRoutes.js';
import authRoutes from "../src/routes/auth.js";
import startNotificationScheduler from "./api/notificationController.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config({path: '../.env'});
const app = express();

const allowedOrigins = [
    'http://localhost:5173','http://localhost:5174'
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/notification",notificationRoutes );
app.use("/api/medicine",MedicineRoutes );
// Test route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});
 
const start=async()=>{

await mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 8080, () => console.log("Server running")))
  .catch(err => console.error(err));

// startNotificationScheduler();

}
start();
