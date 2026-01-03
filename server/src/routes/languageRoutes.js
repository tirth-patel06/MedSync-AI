import express from "express";
import { getUserLanguage, updateUserLanguage, listSupportedLanguages } from "../api/languageController.js";

const router = express.Router();

router.get("/user", getUserLanguage);
router.put("/user", updateUserLanguage);
router.get("/supported", listSupportedLanguages);

export default router;
