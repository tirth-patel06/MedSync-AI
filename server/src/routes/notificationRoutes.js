import express from 'express';
import startNotificationScheduler  from '../api/notificationController.js';


const router = express.Router();



router.post('/regular-notify', startNotificationScheduler);
export default router;