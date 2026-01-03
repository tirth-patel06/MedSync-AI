/**
 * Language configuration for multilingual support
 */

export const DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || 'en';

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
  },
];

export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map(lang => lang.code);

/**
 * Get language details by code
 * @param {string} code - Language code
 * @returns {Object|null} - Language object or null
 */
export const getLanguageByCode = (code) => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || null;
};

/**
 * Check if language code is supported
 * @param {string} code - Language code
 * @returns {boolean} - True if supported
 */
export const isSupportedLanguage = (code) => {
  return LANGUAGE_CODES.includes(code);
};

/**
 * Reading level mapping for readability scores
 */
export const READING_LEVELS = {
  elementary: { gradeMin: 1, gradeMax: 6, label: 'Elementary School' },
  middle: { gradeMin: 7, gradeMax: 9, label: 'Middle School' },
  high: { gradeMin: 10, gradeMax: 12, label: 'High School' },
  college: { gradeMin: 13, gradeMax: 16, label: 'College' },
  professional: { gradeMin: 17, gradeMax: Infinity, label: 'Professional' },
};

/**
 * Get reading level label from grade
 * @param {number} grade - Grade level
 * @returns {string} - Reading level label
 */
export const getReadingLevelLabel = (grade) => {
  for (const [, level] of Object.entries(READING_LEVELS)) {
    if (grade >= level.gradeMin && grade <= level.gradeMax) {
      return level.label;
    }
  }
  return 'Professional';
};

/**
 * Get reading level key from grade
 * @param {number} grade - Grade level
 * @returns {string} - Reading level key
 */
export const getReadingLevelKey = (grade) => {
  for (const [key, level] of Object.entries(READING_LEVELS)) {
    if (grade >= level.gradeMin && grade <= level.gradeMax) {
      return key;
    }
  }
  return 'professional';
};

/**
 * Get accurate grade from Flesch-Kincaid score
 * @param {number} score - Flesch-Kincaid score
 * @returns {number} - Grade level (clamped to 0)
 */
export const getReadingLevelGrade = (score) => {
  return Math.max(0, score);
};
