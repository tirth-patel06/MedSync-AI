import express from "express";
import startNotificationScheduler, {
  getTodaysNotificationsHandler,
  snoozeNotificationHandler,
  checkSnoozedNotificationsHandler,
} from "../api/notificationController.js";

const router = express.Router();

router.post("/regular-notify", startNotificationScheduler);

// Returns today's saved notification messages for the user
router.post("/today", getTodaysNotificationsHandler);

// Snooze notification endpoint
router.post("/snooze", snoozeNotificationHandler);

// Check and re-trigger snoozed notifications
router.post("/check-snoozed", checkSnoozedNotificationsHandler);

export default router;
