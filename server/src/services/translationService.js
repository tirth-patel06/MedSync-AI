import axios from 'axios';
import NodeCache from 'node-cache';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../utils/languageConfig.js';
import { MEDICAL_TERMS } from '../utils/medicalTerminology.js';

const ttl = parseInt(process.env.TRANSLATION_CACHE_TTL, 10);
const cache = new NodeCache({ stdTTL: Number.isNaN(ttl) ? 86400 : ttl });

class TranslationService {
  constructor() {
    this.provider = process.env.TRANSLATION_PROVIDER || 'google';
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    this.maxRetries = 3;
    this.retryDelay = 1000; // ms
    this.cache = cache;
  }

  /**
   * Translate a single text to target language
   * @param {string} text - Text to translate
   * @param {string} targetLang - Target language code (es, hi, etc.)
   * @param {string} context - Context for translation ('medical', 'general')
   * @returns {Promise<string>} - Translated text
   */
  async translateText(text, targetLang = DEFAULT_LANGUAGE, context = 'medical') {
    // Always return an object with success, translatedText, and originalText
    try {
      if (targetLang === DEFAULT_LANGUAGE) {
        return { success: true, translatedText: text, originalText: text };
      }

      const cacheKey = this.getCacheKey(text, targetLang, context);
      const cached = this.getCachedTranslation(cacheKey);
      if (cached) {
        return { success: true, translatedText: cached, originalText: text };
      }

      let translated = await this.callTranslationAPI(text, DEFAULT_LANGUAGE, targetLang, context);
      cache.set(cacheKey, translated);
      return { success: true, translatedText: translated, originalText: text };
    } catch (error) {
      console.error(`Translation error for "${text}" to ${targetLang}:`, error.message);
      return { success: false, translatedText: text, originalText: text, error: error.message };
    }
  }

  /**
   * Translate multiple texts in a batch
   * @param {Array<string>} texts - Array of texts to translate
   * @param {string|Array<string>} targetLang - Target language code or array of codes
   * @param {string} context - Translation context ('medical', 'general')
   * @returns {Promise<Array<string>>} - Array of translated texts
   */
  async translateBatch(texts = [], targetLang = DEFAULT_LANGUAGE, context = 'medical') {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }

    // Filter out falsy values (null, undefined, empty string)
    const filteredTexts = texts.filter(Boolean);
    if (filteredTexts.length === 0) {
      return [];
    }

    // If targetLang is an array, translate each text to its corresponding language
    if (Array.isArray(targetLang)) {
      const results = [];
      for (let i = 0; i < texts.length; i++) {
        const lang = targetLang[i] || DEFAULT_LANGUAGE;
        if (lang === DEFAULT_LANGUAGE) {
          results.push(texts[i]);
        } else {
          const result = await this.translateText(texts[i], lang, context);
          results.push(result.translatedText || texts[i]);
        }
      }
      return results;
    }

    // If targetLang is a single language, translate all texts to that language
    if (targetLang === DEFAULT_LANGUAGE) {
      return texts;
    }

    const results = [];
    for (const text of texts) {
      const result = await this.translateText(text, targetLang, context);
      results.push(result.translatedText || text);
    }
    return results;
  }

  /**
   * Detect language of given text
   * @param {string} text - Text to detect language for
   * @returns {Promise<string>} - Detected language code
   */
  async detectLanguage(text) {
    if (!text || text.trim().length === 0) {
      return DEFAULT_LANGUAGE;
    }

    try {
      // For Google Translate API detection
      if (this.provider === 'google') {
        const response = await this.callDetectLanguageAPI(text);
        return response || DEFAULT_LANGUAGE;
      }
      return DEFAULT_LANGUAGE;
    } catch (error) {
      console.error('Language detection error:', error.message);
      return DEFAULT_LANGUAGE;
    }
  }

  /**
   * Get cached translation
   * @param {string} key - Cache key
   * @returns {string|null} - Cached translation or null
   */
  getCachedTranslation(key) {
    return cache.get(key) || null;
  }

  /**
   * Invalidate cache for a specific key or all cache
   * @param {string|null} key - Cache key to invalidate, or null for all
   */
  invalidateCache(key = null) {
    if (key) {
      cache.del(key);
    } else {
      cache.flushAll();
    }
  }

  /**
   * Get list of supported languages
   * @returns {Array<Object>} - Array of language objects with code, name, nativeName
   */
  getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Call Google Translate API with retry logic
   * @private
   */
  async callTranslationAPI(text, sourceLang, targetLang, context, retryCount = 0) {
    try {
      // Apply medical terminology substitution if context is medical
      let textToTranslate = text;
      const medicalReplacements = {};

      if (context === 'medical') {
        const result = this.applyMedicalTerminology(text);
        textToTranslate = result.text;
        Object.assign(medicalReplacements, result.replacements);
      }

      // Using Google Translate API with simple REST endpoint
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2`,
        {
          q: textToTranslate,
          source: sourceLang,
          target: targetLang,
          format: 'text',
        },
        {
          params: {
            key: this.apiKey,
          },
          timeout: 10000,
        }
      );

      let translated = response.data?.data?.translations?.[0]?.translatedText || text;

      // Restore medical terms from placeholders if any were used
      translated = this.restoreMedicalTerms(translated, medicalReplacements);

      return translated;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(`Translation API retry ${retryCount + 1}/${this.maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.callTranslationAPI(text, sourceLang, targetLang, context, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Call Google Translate API for language detection
   * @private
   */
  async callDetectLanguageAPI(text, retryCount = 0) {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2/detect`,
        {
          q: text,
        },
        {
          params: {
            key: this.apiKey,
          },
          timeout: 10000,
        }
      );

      return response.data?.data?.detections?.[0]?.[0]?.language || DEFAULT_LANGUAGE;
    } catch (error) {
      if (retryCount < this.maxRetries) {
        console.warn(`Detection API retry ${retryCount + 1}/${this.maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));
        return this.callDetectLanguageAPI(text, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Apply medical terminology to preserve specialized terms
   * @private
   */
  applyMedicalTerminology(text) {
    const replacements = {};
    let processedText = text;
    let placeholderIndex = 0;

    // Replace medical terms with placeholders
    Object.entries(MEDICAL_TERMS).forEach(([term, _]) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      if (regex.test(processedText)) {
        const placeholder = `__MEDICAL_${placeholderIndex}__`;
        processedText = processedText.replace(regex, placeholder);
        replacements[placeholder] = term;
        placeholderIndex++;
      }
    });

    return { text: processedText, replacements };
  }

  /**
   * Restore medical terms from placeholders
   * @private
   */
  restoreMedicalTerms(text, replacements) {
    let restored = text;
    Object.entries(replacements).forEach(([placeholder, term]) => {
      restored = restored.replace(new RegExp(placeholder, 'g'), term);
    });
    return restored;
  }

  /**
   * Generate cache key
   * @private
   */
  getCacheKey(text, targetLang, context) {
    return `${context}:${targetLang}:${text.substring(0, 100)}`;
  }
}

export default new TranslationService();
