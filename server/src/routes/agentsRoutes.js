import express from 'express';
import medical_model_modelCall  from '../utils/medical_model.js';
import emergency_model_modelCall  from '../utils/emergency_model.js';
import medicine_model_modelCall  from '../utils/medicine_model.js';
import personal_health_model_modelCall  from '../utils/personal_health_model.js';
const router = express.Router();
router.post('/medical', medical_model_modelCall);
router.post('/emergency', emergency_model_modelCall);
router.post('/medicine', medicine_model_modelCall);
router.post('/personal-health', personal_health_model_modelCall);


export default router;