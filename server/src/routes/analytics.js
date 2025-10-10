import express from "express";
import Medication from "../models/medicineModel.js"; // or your dose model
import { getUserAnalytics } from "../api/analyticsController.js";
const router = express.Router();

router.get("/:userId", getUserAnalytics);

export default router;