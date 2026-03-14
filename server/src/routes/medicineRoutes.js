import express from 'express';
import { addMedication, checkInteractions } from '../api/addMedicineController.js';
import { todaysMedication } from '../api/todaysMedicineController.js';
import { medicineStatus } from '../api/statusMedicineController.js';
import { bulkAddMedicine } from '../api/bulkMedicineController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/add', addMedication);
router.post('/bulk', bulkAddMedicine);
router.post('/today', todaysMedication);
router.post('/status', medicineStatus);

// FIX 8 & 9: Protected with authMiddleware — user derived from JWT, not request body
router.post('/check-interactions', authMiddleware, checkInteractions);

export default router;