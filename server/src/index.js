import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import MedicineRoutes from './routes/medicineRoutes.js';
import authRoutes from "../src/routes/auth.js";
import startNotificationScheduler from "./api/notificationController.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import healthRoutes from "./routes/healthRoutes.js"
import agentsRoutes from "./routes/agentsRoutes.js";

import calendarSyncRoutes from "./routes/calendarSyncRoutes.js";

import reportRoutes from "./routes/reportRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";
import languageRoutes from "./routes/languageRoutes.js";
import preferencesRoutes from "./routes/preferencesRoutes.js";


import oauthRoutes from "./routes/oauth.js";
import analyticsRoutes from "./routes/analytics.js";
import authMiddleware from "./middlewares/authMiddleware.js";


import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });


const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO with CORS settings
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io instance available globally for notification controller
global.io = io;

const allowedOrigins = [
    'http://localhost:5173','http://localhost:5174'
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.use(express.json());


app.use("/api/agents",agentsRoutes)
app.use("/api/auth", authRoutes);
app.use("/api/notification",notificationRoutes );
app.use("/api/medicine",MedicineRoutes );
app.use("/api/health", healthRoutes);
app.use("/api/oauth", oauthRoutes);

app.use("/api/calendar", calendarSyncRoutes);

app.use("/api/report", reportRoutes);
app.use("/api/translate", translationRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/preferences", preferencesRoutes);

app.use("/api/analytics", analyticsRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});
 
const start=async()=>{

await mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    httpServer.listen(process.env.PORT || 8080, () => {
      console.log("Server running on port", process.env.PORT || 8080);
      console.log("WebSocket server initialized");
    });
  })
  .catch(err => console.error(err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join user to their personal room for targeted notifications
  socket.on('join-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// startNotificationScheduler();

}
start();
