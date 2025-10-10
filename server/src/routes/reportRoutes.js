import express from 'express';
import generateReport from '../api/reportController.js';

const router = express.Router();

router.post("/", generateReport);

export default router;