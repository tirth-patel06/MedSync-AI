import translationService from "../services/translationService.js";
import { SUPPORTED_LANGUAGES } from "../utils/languageConfig.js";

export const translate = async (req, res) => {
  try {
    const { text, texts, targetLanguage, context = "medical" } = req.body;

    if (!text && (!texts || !Array.isArray(texts))) {
      return res.status(400).json({ error: "Provide 'text' or an array 'texts' to translate" });
    }

    const targetLang = targetLanguage || process.env.DEFAULT_LANGUAGE || "en";

    if (texts && Array.isArray(texts)) {
      const translated = await translationService.translateBatch(texts, targetLang, context);
      const detected = await translationService.detectLanguage(texts[0] || "");
      return res.status(200).json({
        translatedTexts: translated,
        targetLanguage: targetLang,
        originalLanguage: detected,
      });
    }

    const detectedLanguage = await translationService.detectLanguage(text || "");
    const translatedText = await translationService.translateText(text, targetLang, context);

    return res.status(200).json({
      translatedText,
      targetLanguage: targetLang,
      originalLanguage: detectedLanguage,
    });
  } catch (error) {
    console.error("Translation error:", error.message);
    return res.status(500).json({ error: "Translation failed" });
  }
};

export const getSupportedLanguages = (req, res) => {
  return res.status(200).json({ languages: SUPPORTED_LANGUAGES });
};
