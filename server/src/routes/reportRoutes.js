import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import generateReport from '../api/reportController.js';

const router = express.Router();

router.post("/report", authMiddleware, generateReport);

export default router;