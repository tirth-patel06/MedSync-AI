import User from "../models/User.js";

const resolveUserId = (req) => {
  return req.user?._id || req.user?.id || req.body?.userId || req.params?.userId || null;
};

/**
 * Get all user preferences and settings
 */
export const getUserPreferences = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "User id missing" });
    }

    const user = await User.findById(userId).select(
      'preferredLanguage autoTranslateAll showReadabilityScores targetReadingLevel'
    ).lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      preferences: {
        preferredLanguage: user.preferredLanguage || 'en',
        autoTranslateAll: user.autoTranslateAll || false,
        showReadabilityScores: user.showReadabilityScores !== false, // true by default
        targetReadingLevel: user.targetReadingLevel || 'highschool'
      }
    });
  } catch (error) {
    console.error("getUserPreferences error:", error.message);
    return res.status(500).json({ error: "Failed to fetch user preferences" });
  }
};

/**
 * Update user preferences (language, translation, readability settings)
 */
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "User id missing" });
    }

    const updates = {};
    const allowedFields = ['preferredLanguage', 'autoTranslateAll', 'showReadabilityScores', 'targetReadingLevel'];

    // Only allow updating specific fields
    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    // Validate language code if provided
    if (updates.preferredLanguage) {
      const validLanguages = ['en', 'es', 'hi'];
      if (!validLanguages.includes(updates.preferredLanguage)) {
        return res.status(400).json({ error: "Invalid language code" });
      }
    }

    // Validate reading level if provided
    if (updates.targetReadingLevel) {
      const validLevels = ['all', 'college', 'highschool', 'middle', 'elementary'];
      if (!validLevels.includes(updates.targetReadingLevel)) {
        return res.status(400).json({ error: "Invalid reading level" });
      }
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select('preferredLanguage autoTranslateAll showReadabilityScores targetReadingLevel').lean();

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      preferences: {
        preferredLanguage: updated.preferredLanguage,
        autoTranslateAll: updated.autoTranslateAll,
        showReadabilityScores: updated.showReadabilityScores,
        targetReadingLevel: updated.targetReadingLevel
      }
    });
  } catch (error) {
    console.error("updateUserPreferences error:", error.message);
    return res.status(500).json({ error: "Failed to update user preferences" });
  }
};

/**
 * Reset user preferences to defaults
 */
export const resetUserPreferences = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "User id missing" });
    }

    const defaults = {
      preferredLanguage: 'en',
      autoTranslateAll: false,
      showReadabilityScores: true,
      targetReadingLevel: 'highschool'
    };

    const updated = await User.findByIdAndUpdate(
      userId,
      defaults,
      { new: true }
    ).select('preferredLanguage autoTranslateAll showReadabilityScores targetReadingLevel').lean();

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Preferences reset to defaults",
      preferences: {
        preferredLanguage: updated.preferredLanguage,
        autoTranslateAll: updated.autoTranslateAll,
        showReadabilityScores: updated.showReadabilityScores,
        targetReadingLevel: updated.targetReadingLevel
      }
    });
  } catch (error) {
    console.error("resetUserPreferences error:", error.message);
    return res.status(500).json({ error: "Failed to reset user preferences" });
  }
};
