import express from "express";
import { translate, getSupportedLanguages } from "../api/translationController.js";

const router = express.Router();

// Translate single text or batch (if texts[] is provided)
router.post("/", translate);
router.post("/batch", translate);

// Supported languages
router.get("/supported", getSupportedLanguages);

export default router;
