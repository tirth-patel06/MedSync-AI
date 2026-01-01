import express from 'express';
import { syncMedicationsToCalendar, getCalendarSyncStatus } from '../api/calendarSyncController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Sync all medications to Google Calendar
router.post('/sync', authMiddleware, syncMedicationsToCalendar);

// Get calendar sync status
router.post('/status', authMiddleware, getCalendarSyncStatus);

export default router;