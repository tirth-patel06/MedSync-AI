import express from 'express';
import { addMedication } from '../api/addMedicineController.js';


const router = express.Router();
router.post('/add', addMedication);


export default router;