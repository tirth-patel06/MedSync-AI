import express from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import generateReport from '../api/reportController';

const router = express.Router();

router.post("/report", authMiddleware, generateReport);

export default router;