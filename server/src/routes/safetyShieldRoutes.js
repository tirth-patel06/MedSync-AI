// src/routes/safetyShieldRoutes.js
import express from 'express';
import { checkSafety } from '../api/safetyShieldController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected – user must be logged in
router.use(authMiddleware);

// POST /api/safety-shield/check
router.post('/check', checkSafety);

export default router;
