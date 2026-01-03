/**
 * Readability Checker - Implements Flesch-Kincaid Grade Level and Flesch Reading Ease
 * Supports English, Spanish, and Hindi with language-specific adaptations
 */

import { getReadingLevelKey, getReadingLevelLabel } from './languageConfig.js';

class ReadabilityChecker {
  constructor() {
    this.complexityThreshold = 12; // Grade level considered "too complex" for medical text
    this.minWordsForAnalysis = 10;
  }

  /**
   * Analyze text readability and return comprehensive score
   * @param {string} text - Text to analyze
   * @param {string} language - Language code (en, es, hi)
   * @returns {Object} - Readability scores and recommendations
   */
  analyzeReadability(text, language = 'en') {
    if (!text || text.trim().length === 0) {
      return this.getEmptyResponse();
    }

    const cleanText = this.cleanText(text);
    const stats = this.getTextStatistics(cleanText, language);

    if (stats.wordCount < this.minWordsForAnalysis) {
      return this.getEmptyResponse();
    }

    let scores;
    switch (language) {
      case 'es':
        scores = this.calculateSpanishReadability(stats);
        break;
      case 'hi':
        scores = this.calculateHindiReadability(stats);
        break;
      case 'en':
      default:
        scores = this.calculateEnglishReadability(stats);
    }

    const readingLevelKey = getReadingLevelKey(scores.fleschKincaid);
    const readingLevel = getReadingLevelLabel(scores.fleschKincaid);
    const isTooComplex = scores.fleschKincaid > this.complexityThreshold;
    const recommendations = this.generateRecommendations(scores, stats, isTooComplex);

    return {
      fleschKincaid: Math.round(scores.fleschKincaid * 10) / 10,
      fleschReadingEase: Math.round(scores.fleschReadingEase * 10) / 10,
      readingLevel: readingLevelKey,
      readingLevelLabel: readingLevel,
      grade: Math.round(scores.fleschKincaid),
      isTooComplex,
      statistics: {
        wordCount: stats.wordCount,
        sentenceCount: stats.sentenceCount,
        syllableCount: stats.syllableCount,
        averageWordsPerSentence: Math.round((stats.wordCount / stats.sentenceCount) * 10) / 10,
        averageSyllablesPerWord: Math.round((stats.syllableCount / stats.wordCount) * 10) / 10,
      },
      recommendations,
    };
  }

  /**
   * Calculate Flesch-Kincaid scores for English text
   * @private
   */
  calculateEnglishReadability(stats) {
    const { wordCount, sentenceCount, syllableCount } = stats;

    if (sentenceCount === 0 || wordCount === 0) {
      return { fleschKincaid: 0, fleschReadingEase: 100 };
    }

    // Flesch-Kincaid Grade Level: 0.39 * (W/S) + 11.8 * (Sy/W) - 15.59
    const fleschKincaid =
      0.39 * (wordCount / sentenceCount) +
      11.8 * (syllableCount / wordCount) -
      15.59;

    // Flesch Reading Ease: 206.835 - 1.015 * (W/S) - 84.6 * (Sy/W)
    const fleschReadingEase =
      206.835 -
      1.015 * (wordCount / sentenceCount) -
      84.6 * (syllableCount / wordCount);

    return {
      fleschKincaid: Math.max(0, fleschKincaid),
      fleschReadingEase: Math.min(100, Math.max(0, fleschReadingEase)),
    };
  }

  /**
   * Calculate readability for Spanish text
   * Adapted algorithm for Spanish language characteristics
   * @private
   */
  calculateSpanishReadability(stats) {
    const { wordCount, sentenceCount, syllableCount } = stats;

    if (sentenceCount === 0 || wordCount === 0) {
      return { fleschKincaid: 0, fleschReadingEase: 100 };
    }

    // Spanish adaptation: Spanish words tend to be longer with more syllables
    // Adjusted coefficients for Spanish language
    const fleschKincaid =
      0.6 * (wordCount / sentenceCount) +
      9.0 * (syllableCount / wordCount) -
      14.0;

    const fleschReadingEase =
      206.835 -
      0.9 * (wordCount / sentenceCount) -
      60.0 * (syllableCount / wordCount);

    return {
      fleschKincaid: Math.max(0, fleschKincaid),
      fleschReadingEase: Math.min(100, Math.max(0, fleschReadingEase)),
    };
  }

  /**
   * Calculate readability for Hindi text
   * Adapted algorithm for Hindi language characteristics
   * @private
   */
  calculateHindiReadability(stats) {
    const { wordCount, sentenceCount, syllableCount } = stats;

    if (sentenceCount === 0 || wordCount === 0) {
      return { fleschKincaid: 0, fleschReadingEase: 100 };
    }

    // Hindi adaptation: Hindi uses compound words (समासs) and has different structure
    // Adjusted coefficients for Hindi language
    const fleschKincaid =
      0.5 * (wordCount / sentenceCount) +
      7.5 * (syllableCount / wordCount) -
      12.0;

    const fleschReadingEase =
      200.0 -
      1.0 * (wordCount / sentenceCount) -
      50.0 * (syllableCount / wordCount);

    return {
      fleschKincaid: Math.max(0, fleschKincaid),
      fleschReadingEase: Math.min(100, Math.max(0, fleschReadingEase)),
    };
  }

  /**
   * Generate recommendations for simplifying text
   * @private
   */
  generateRecommendations(scores, stats, isTooComplex) {
    const recommendations = [];

    if (!isTooComplex) {
      recommendations.push('✓ Text is at appropriate reading level for medical content');
      return recommendations;
    }

    const avgWordsPerSentence = stats.wordCount / stats.sentenceCount;
    const avgSyllablesPerWord = stats.syllableCount / stats.wordCount;

    // Recommendations based on metrics
    if (avgWordsPerSentence > 20) {
      recommendations.push('📌 Consider shorter sentences (average: ' + Math.round(avgWordsPerSentence) + ' words). Target: 15-18 words per sentence.');
    }

    if (avgSyllablesPerWord > 1.8) {
      recommendations.push('📌 Replace longer, technical terms with simpler alternatives (average: ' + avgSyllablesPerWord.toFixed(1) + ' syllables per word).');
    }

    if (scores.fleschReadingEase < 30) {
      recommendations.push('📌 Text is very complex. Break down complex ideas into multiple shorter sentences.');
    } else if (scores.fleschReadingEase < 50) {
      recommendations.push('📌 Text is moderately complex. Consider simplifying vocabulary and sentence structure.');
    }

    if (stats.sentenceCount < 3) {
      recommendations.push('📌 Add more sentences to improve readability and break up dense content.');
    }

    recommendations.push('💡 Medical terms are acceptable; focus on sentence clarity and word simplicity.');

    return recommendations;
  }

  /**
   * Get text statistics (word count, sentence count, syllable count)
   * @private
   */
  getTextStatistics(text, language = 'en') {
    const words = this.extractWords(text);
    const sentences = this.extractSentences(text);
    const syllableCount = this.countSyllables(words, language);

    return {
      wordCount: words.length,
      sentenceCount: Math.max(1, sentences.length),
      syllableCount,
      text,
    };
  }

  /**
   * Extract words from text
   * @private
   */
  extractWords(text) {
    // Match word characters, including Unicode for non-Latin scripts
    return text.match(/\b[\p{L}\p{N}]+\b/gu) || [];
  }

  /**
   * Extract sentences from text
   * @private
   */
  extractSentences(text) {
    // Split on sentence-ending punctuation
    const sentenceRegex = /[.!?]+(?:\s+|$)/g;
    const sentences = text.split(sentenceRegex).filter(s => s.trim().length > 0);
    return sentences;
  }

  /**
   * Count total syllables in words
   * Uses a simplified syllable counting algorithm for English, Spanish, and Hindi
   * @private
   */
  countSyllables(words, language = 'en') {
    let totalSyllables = 0;

    for (const word of words) {
      totalSyllables += this.countWordSyllables(word.toLowerCase(), language);
    }

    return Math.max(totalSyllables, words.length); // At minimum, one syllable per word
  }

  /**
   * Count syllables in a single word
   * Simplified algorithm for multiple languages
   * @private
   */
  countWordSyllables(word, language = 'en') {
    switch (language) {
      case 'es':
        return this.countSpanishSyllables(word);
      case 'hi':
        return this.countHindiSyllables(word);
      case 'en':
      default:
        return this.countEnglishSyllables(word);
    }
  }

  /**
   * Count syllables in English word
   * Based on vowel groups with common exception handling
   * @private
   */
  countEnglishSyllables(word) {
    if (word.length <= 3) return 1;

    let syllableCount = 0;
    let previousWasVowel = false;

    const vowels = 'aeiouy';

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);

      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }

    // Exceptions
    if (word.endsWith('e')) syllableCount--;
    if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
      syllableCount++;
    }
    if (word.endsWith('ed') && !vowels.includes(word[word.length - 3])) {
      syllableCount--;
    }
    if (word.endsWith('ous')) syllableCount--;

    return Math.max(1, syllableCount);
  }

  /**
   * Count syllables in Spanish word
   * Spanish syllable rules: primarily based on vowel groups
   * @private
   */
  countSpanishSyllables(word) {
    if (word.length <= 3) return 1;

    let syllableCount = 0;
    let previousWasVowel = false;

    const vowels = 'aeiouáéíóú';

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);

      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }

    // Spanish exceptions
    if (word.endsWith('ia') || word.endsWith('io') || word.endsWith('ía') || word.endsWith('ío')) {
      // These typically count as 1 syllable or diphthongs
      if (previousWasVowel) syllableCount--;
    }

    return Math.max(1, syllableCount);
  }

  /**
   * Count syllables in Hindi word
   * Hindi syllables based on matra (vowel markers) and consonant clusters
   * @private
   */
  countHindiSyllables(word) {
    // Hindi syllable counting is complex; using a simplified approach
    // Based on character count as rough approximation
    if (word.length <= 2) return 1;

    // Hindi Devanagari script consideration
    const devanagariVowels = 'अआइईउऊऋएऐओऔ';

    // Count vowel sounds (full vowels + vowel marks)
    let syllableCount = 0;

    for (let i = 0; i < word.length; i++) {
      if (devanagariVowels.includes(word[i])) {
        syllableCount++;
      } // else if (devanagariVowelMarks.includes(word[i])) { /* intentionally ignored */ }
    }

    // Add syllable for word-initial consonant without explicit vowel mark
    if (syllableCount === 0 && word.length > 0) {
      syllableCount = Math.max(1, Math.ceil(word.length / 2));
    }

    return Math.max(1, syllableCount);
  }

  /**
   * Clean text for analysis
   * @private
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\p{L}\p{N}\s.!?]/gu, '') // Remove special characters except punctuation
      .trim();
  }

  /**
   * Get empty response for insufficient text
   * @private
   */
  getEmptyResponse() {
    return {
      fleschKincaid: 0,
      fleschReadingEase: 0,
      readingLevel: 'unknown', // standardized as key
      readingLevelLabel: 'Unknown', // standardized as label
      grade: 0,
      isTooComplex: false,
      statistics: {
        wordCount: 0,
        sentenceCount: 0,
        syllableCount: 0,
        averageWordsPerSentence: 0,
        averageSyllablesPerWord: 0,
      },
      recommendations: ['Text is too short to analyze.'],
    };
  }

  /**
   * Get complexity assessment string
   * @param {number} score - Flesch Reading Ease score (0-100)
   * @returns {string} - Human-readable complexity assessment
   */
  getComplexityAssessment(score) {
    if (score >= 90) return 'Very Easy';
    if (score >= 80) return 'Easy';
    if (score >= 70) return 'Fairly Easy';
    if (score >= 60) return 'Standard';
    if (score >= 50) return 'Fairly Difficult';
    if (score >= 30) return 'Difficult';
    return 'Very Difficult';
  }
}

export default new ReadabilityChecker();
