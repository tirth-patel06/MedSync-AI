import express from 'express';
import { addMedication } from '../api/addMedicineController.js';
import {todaysMedication} from '../api/todaysMedicineController.js'
import {medicineStatus} from '../api/statusMedicineController.js'   


const router = express.Router();
router.post('/add', addMedication);
router.post('/today', todaysMedication);
router.post('/status', medicineStatus);




export default router;