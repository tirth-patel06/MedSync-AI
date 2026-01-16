import express from 'express';
import generateReport from '../api/reportController.js';
import { generateAnalysis, pdfQ, translateReportAnalysis, getReportReadability } from '../utils/reportAnalysis.js';

const router = express.Router();

// Generate adherence report PDF
router.post('/', generateReport);

// Analyze uploaded report (expects file upload middleware wired where used)
router.post('/analyze', generateAnalysis);

// Chat with a stored report
router.post('/chat', pdfQ);

// Translate stored report analysis
router.get('/:id/translate/:language', translateReportAnalysis);

// Readability for stored report analysis
router.get('/:id/readability', getReportReadability);

export default router;