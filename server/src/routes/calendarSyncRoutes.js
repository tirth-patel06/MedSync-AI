import express from 'express';
import { syncMedicationsToCalendar, getCalendarSyncStatus } from '../api/calendarSyncController.js';

const router = express.Router();

// Sync all medications to Google Calendar
router.post('/sync', syncMedicationsToCalendar);

// Get calendar sync status
router.post('/status', getCalendarSyncStatus);

export default router;