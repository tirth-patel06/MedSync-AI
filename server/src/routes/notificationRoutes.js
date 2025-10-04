import express from 'express';
import startNotificationScheduler, { getTodaysNotificationsHandler } from '../api/notificationController.js';

const router = express.Router();

router.post('/regular-notify', startNotificationScheduler);

// Returns today's saved notification messages for the  user
router.post('/today', getTodaysNotificationsHandler);

export default router;