import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
  getUserPreferences,
  updateUserPreferences,
  resetUserPreferences
} from '../api/preferencesController.js';

const router = express.Router();

/**
 * GET /api/preferences
 * Fetch user's language, translation, and readability preferences
 */
router.get('/', authMiddleware, getUserPreferences);

/**
 * PUT /api/preferences
 * Update user preferences (language, auto-translate, readability settings)
 */
router.put('/', authMiddleware, updateUserPreferences);

/**
 * POST /api/preferences/reset
 * Reset preferences to defaults
 */
router.post('/reset', authMiddleware, resetUserPreferences);

export default router;
