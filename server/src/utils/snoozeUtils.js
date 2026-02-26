/**
 * Utility functions for notification snooze feature
 */

/**
 * Calculate the snooze time from current time + minutes
 * @param {number} minutes - Minutes to snooze
 * @returns {Date} - Future date when notification should re-trigger
 */
export const calculateSnoozeTime = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Validate snooze request parameters
 * @param {string} notificationId - Notification ID
 * @param {number} minutes - Snooze minutes
 * @returns {object} - Validation result
 */
export const validateSnoozeRequest = (notificationId, minutes) => {
  const errors = [];

  if (!notificationId || typeof notificationId !== "string") {
    errors.push("Valid notification ID is required");
  }

  if (!minutes || typeof minutes !== "number" || minutes <= 0) {
    errors.push("Valid snooze minutes is required");
  }

  const validMinutes = [5, 15, 30, 60];
  if (!validMinutes.includes(minutes)) {
    errors.push("Snooze minutes must be 5, 15, 30, or 60");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format snooze duration for display
 * @param {number} minutes - Minutes
 * @returns {string} - Formatted string (e.g., "15min", "1hr")
 */
export const formatSnoozeDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}hr`;
  }
  return `${hours}hr ${remainingMinutes}min`;
};

/**
 * Check if a notification can be snoozed
 * @param {object} notification - Notification object
 * @returns {boolean} - Whether notification can be snoozed
 */
export const canSnooze = (notification) => {
  if (!notification) return false;
  if (notification.type === "test") return false; // Don't allow snoozing test notifications
  if (notification.snoozeCount >= notification.maxSnoozes) return false;

  return true;
};
