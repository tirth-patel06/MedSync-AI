import express from 'express';
import { addMedication, checkInteractions } from '../api/addMedicineController.js';
import { todaysMedication } from '../api/todaysMedicineController.js';
import { medicineStatus } from '../api/statusMedicineController.js';
import { bulkAddMedicine } from '../api/bulkMedicineController.js';

const router = express.Router();

router.post('/add', addMedication);
router.post('/bulk', bulkAddMedicine);
router.post('/today', todaysMedication);
router.post('/status', medicineStatus);

// Safety Shield: check interactions without saving (for real-time frontend preview)
router.post('/check-interactions', checkInteractions);

export default router;