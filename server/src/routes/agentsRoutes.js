import express from 'express';
import medical_model_modelCall  from '../utils/medical_model.js';
import emergency_model_modelCall  from '../utils/emergency_model.js';
import medicine_model_modelCall  from '../utils/medicine_model.js';
import personal_health_model_modelCall  from '../utils/personal_health_model.js';
import Report from '../models/ReportModel.js';

import {generateAnalysis, pdfQ} from '../utils/reportAnalysis.js'
import multer from "multer";
const router = express.Router();


router.post('/medical', medical_model_modelCall);
router.post('/emergency', emergency_model_modelCall);
router.post('/medicine', medicine_model_modelCall);
router.post('/personal-health', personal_health_model_modelCall);

const upload = multer({ dest: "uploads/" });
router.post("/upload", upload.single("file"), generateAnalysis);
router.post("/chat", pdfQ);

router.post('/reports', async (req, res) => {
    try {
        const { user } = req.body;
        const reports = await Report.find({ userId: user.id });
        res.json({ reports });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;