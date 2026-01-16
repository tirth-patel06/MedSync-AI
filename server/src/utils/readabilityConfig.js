/**
 * Readability Configuration - Settings and thresholds for readability analysis
 */

/**
 * Complexity thresholds for medical content
 * Text above these grades is considered "too complex" for patient-facing summaries
 */
export const COMPLEXITY_THRESHOLDS = {
  SIMPLE: 6, // Elementary school level
  MODERATE: 9, // High school level
  COMPLEX: 12, // College level
};

/**
 * Reading level categories with descriptive labels
 */
export const READING_LEVEL_CATEGORIES = {
  very_easy: { 
    range: [90, 100],
    label: 'Very Easy',
    description: 'Elementary school (Grades 1-3)',
    fleschKincaid: '0-3',
  },
  easy: {
    range: [80, 89],
    label: 'Easy',
    description: 'Elementary school (Grades 4-6)',
    fleschKincaid: '4-6',
  },
  fairly_easy: {
    range: [70, 79],
    label: 'Fairly Easy',
    description: 'Middle school (Grades 7-8)',
    fleschKincaid: '7-8',
  },
  standard: {
    range: [60, 69],
    label: 'Standard',
    description: 'High school (Grade 9)',
    fleschKincaid: '9',
  },
  fairly_difficult: {
    range: [50, 59],
    label: 'Fairly Difficult',
    description: 'High school (Grades 10-11)',
    fleschKincaid: '10-11',
  },
  difficult: {
    range: [30, 49],
    label: 'Difficult',
    description: 'High school (Grade 12) / College (Grades 13-15)',
    fleschKincaid: '12-15',
  },
  very_difficult: {
    range: [0, 29],
    label: 'Very Difficult',
    description: 'College graduate',
    fleschKincaid: '16+',
  },
};

/**
 * Language-specific settings
 */
export const LANGUAGE_SETTINGS = {
  en: {
    name: 'English',
    syllableCountingMethod: 'vowel_groups',
    averageWordsPerSentenceTarget: 15,
    averageSyllablesPerWordTarget: 1.5,
    complexityThreshold: COMPLEXITY_THRESHOLDS.COMPLEX,
  },
  es: {
    name: 'Spanish',
    syllableCountingMethod: 'vowel_groups_spanish',
    averageWordsPerSentenceTarget: 16,
    averageSyllablesPerWordTarget: 1.7, // Spanish words tend to be longer
    complexityThreshold: COMPLEXITY_THRESHOLDS.COMPLEX,
  },
  hi: {
    name: 'Hindi',
    syllableCountingMethod: 'devanagari_matras',
    averageWordsPerSentenceTarget: 14,
    averageSyllablesPerWordTarget: 1.4,
    complexityThreshold: COMPLEXITY_THRESHOLDS.COMPLEX,
  },
};

/**
 * Color coding for readability indicators
 */
export const READABILITY_COLORS = {
  green: '#10b981', // Good readability (easy to understand)
  yellow: '#f59e0b', // Moderate readability (some simplification recommended)
  red: '#ef4444', // Poor readability (too complex)
};

/**
 * Get color for readability score
 * @param {number} grade - Flesch-Kincaid grade level
 * @returns {string} - Hex color code
 */
export const getColorForGrade = (grade) => {
  if (grade <= 6) return READABILITY_COLORS.green; // Elementary (easy)
  if (grade <= 10) return READABILITY_COLORS.yellow; // High school (moderate)
  return READABILITY_COLORS.red; // College+ (complex)
};

/**
 * Get reading level category by Flesch Reading Ease score
 * @param {number} score - Flesch Reading Ease score (0-100)
 * @returns {Object} - Reading level category details
 */
export const getReadingLevelCategory = (score) => {
  for (const [key, category] of Object.entries(READING_LEVEL_CATEGORIES)) {
    if (score >= category.range[0] && score <= category.range[1]) {
      return { key, ...category };
    }
  }
  return { key: 'very_difficult', ...READING_LEVEL_CATEGORIES.very_difficult };
};

/**
 * Simplification recommendations based on metrics
 */
export const SIMPLIFICATION_SUGGESTIONS = {
  long_sentences: {
    pattern: 'averageWordsPerSentence > 20',
    suggestion: 'Consider breaking longer sentences into shorter ones (target: 15-18 words).',
    priority: 'high',
  },
  complex_vocabulary: {
    pattern: 'averageSyllablesPerWord > 1.8',
    suggestion: 'Replace technical terms with simpler alternatives or add definitions.',
    priority: 'high',
  },
  dense_paragraphs: {
    pattern: 'sentenceCount < 3',
    suggestion: 'Add more sentences to break up dense content.',
    priority: 'medium',
  },
  very_complex_text: {
    pattern: 'fleschReadingEase < 30',
    suggestion: 'Text is very complex. Consider a major restructuring for clarity.',
    priority: 'high',
  },
  moderately_complex: {
    pattern: '30 <= fleschReadingEase < 50',
    suggestion: 'Simplify vocabulary and sentence structure for better readability.',
    priority: 'medium',
  },
};

/**
 * Minimum text length requirements for analysis
 */
export const ANALYSIS_REQUIREMENTS = {
  minWords: 10,
  minSentences: 1,
  minCharacters: 30,
};

/**
 * Cache settings for readability analysis
 */
export const CACHE_SETTINGS = {
  enabled: true,
  ttl: 3600, // 1 hour in seconds
};
