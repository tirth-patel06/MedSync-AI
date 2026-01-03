import User from "../models/User.js";
import { SUPPORTED_LANGUAGES, LANGUAGE_CODES } from "../utils/languageConfig.js";

const resolveUserId = (req) => {
  return req.user?._id || req.user?.id || req.body?.userId || req.params?.userId || null;
};

export const getUserLanguage = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    if (!userId) {
      return res.status(400).json({ error: "User id missing" });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      preferredLanguage: user.preferredLanguage || "en",
      supportedLanguages: SUPPORTED_LANGUAGES,
    });
  } catch (error) {
    console.error("getUserLanguage error:", error.message);
    return res.status(500).json({ error: "Failed to fetch user language" });
  }
};

export const updateUserLanguage = async (req, res) => {
  try {
    const userId = resolveUserId(req);
    // Support both 'language' and 'preferredLanguage' parameter names
    const language = req.body.language || req.body.preferredLanguage;

    if (!userId) {
      return res.status(400).json({ error: "User id missing" });
    }
    if (!language || !LANGUAGE_CODES.includes(language)) {
      return res.status(400).json({ error: "Unsupported or missing language code" });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { preferredLanguage: language },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ success: true, preferredLanguage: updated.preferredLanguage });
  } catch (error) {
    console.error("updateUserLanguage error:", error.message);
    return res.status(500).json({ error: "Failed to update user language" });
  }
};

export const listSupportedLanguages = (req, res) => {
  return res.status(200).json({ languages: SUPPORTED_LANGUAGES });
};
