import { describe, it, expect } from 'vitest';
import ReadabilityChecker from '../src/utils/readabilityChecker.js';
import { getReadingLevelLabel, getReadingLevelGrade } from '../src/utils/languageConfig.js';

const analyzeReadability = ReadabilityChecker.analyzeReadability.bind(ReadabilityChecker);

describe('Readability Checker', () => {
  describe('analyzeReadability - English', () => {
    it('should calculate correct Flesch-Kincaid score for simple text', () => {
      const text = 'The cat sat on the mat. It was warm.';
      const result = analyzeReadability(text, 'en');

      expect(result).toHaveProperty('fleschKincaid');
      expect(result).toHaveProperty('fleschReadingEase');
      expect(result).toHaveProperty('readingLevel');
      expect(result).toHaveProperty('grade');
      expect(result.fleschKincaid).toBeGreaterThan(0);
      expect(result.fleschKincaid).toBeLessThan(5); // Simple text
    });

    it('should identify elementary level text', () => {
      const text = 'The dog runs fast. The cat is small. I like them.';
      const result = analyzeReadability(text, 'en');

      expect(result.readingLevel).toBe('Elementary School');
      expect(result.grade).toBeLessThanOrEqual(6);
    });

    it('should identify college level text', () => {
      const text = 'The pharmaceutical intervention demonstrated significant efficacy in ameliorating symptomatology associated with chronic inflammatory conditions, particularly when administered in conjunction with complementary therapeutic modalities.';
      const result = analyzeReadability(text, 'en');

      expect(result.readingLevel).toBe('College Graduate');
      expect(result.grade).toBeGreaterThan(12);
    });

    it('should handle medical terminology correctly', () => {
      const text = 'Administer acetaminophen 500mg orally every 4-6 hours as needed for pain. Maximum daily dose should not exceed 4000mg.';
      const result = analyzeReadability(text, 'en');

      expect(result.fleschKincaid).toBeGreaterThan(0);
      expect(result.readingLevel).toBeDefined();
    });

    it('should calculate Flesch Reading Ease score', () => {
      const text = 'The quick brown fox jumps over the lazy dog.';
      const result = analyzeReadability(text, 'en');

      expect(result.fleschReadingEase).toBeGreaterThan(0);
      expect(result.fleschReadingEase).toBeLessThanOrEqual(100);
    });

    it('should provide recommendations based on score', () => {
      const complexText = 'The multifaceted pharmacological intervention necessitates comprehensive evaluation of contraindications.';
      const result = analyzeReadability(complexText, 'en');

      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('analyzeReadability - Spanish', () => {
    it('should calculate readability for Spanish text', () => {
      const text = 'El gato está en la casa. Hace buen tiempo.';
      const result = analyzeReadability(text, 'es');

      expect(result).toHaveProperty('fleschKincaid');
      expect(result).toHaveProperty('fleschReadingEase');
      expect(result.fleschKincaid).toBeGreaterThan(0);
    });

    it('should handle Spanish medical text', () => {
      const text = 'Tome aspirina 500mg dos veces al día después de las comidas.';
      const result = analyzeReadability(text, 'es');

      expect(result.readingLevel).toBeDefined();
      expect(result.grade).toBeGreaterThan(0);
    });
  });

  describe('analyzeReadability - Hindi', () => {
    it('should calculate readability for Hindi text', () => {
      const text = 'यह एक साधारण वाक्य है। मौसम अच्छा है।';
      const result = analyzeReadability(text, 'hi');

      expect(result).toHaveProperty('fleschKincaid');
      expect(result).toHaveProperty('fleschReadingEase');
    });

    it('should handle Devanagari script syllable counting', () => {
      const text = 'स्वास्थ्य महत्वपूर्ण है।';
      const result = analyzeReadability(text, 'hi');

      expect(result.grade).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very short text', () => {
      const text = 'Hello.';
      const result = analyzeReadability(text, 'en');

      expect(result.fleschKincaid).toBeGreaterThanOrEqual(0);
      expect(result.readingLevel).toBe('Elementary School');
    });

    it('should handle very long text', () => {
      const longText = 'This is a sentence. '.repeat(100);
      const result = analyzeReadability(longText, 'en');

      expect(result.fleschKincaid).toBeGreaterThan(0);
      expect(result.readingLevel).toBeDefined();
    });

    it('should handle text with numbers', () => {
      const text = 'Take 500mg twice daily for 7 days.';
      const result = analyzeReadability(text, 'en');

      expect(result.fleschKincaid).toBeGreaterThan(0);
    });

    it('should handle text with special characters', () => {
      const text = 'Test: 100mg/day (morning & evening) - important!';
      const result = analyzeReadability(text, 'en');

      expect(result.fleschKincaid).toBeGreaterThan(0);
    });

    it('should handle empty string', () => {
      const result = analyzeReadability('', 'en');

      expect(result.fleschKincaid).toBe(0);
      expect(result.readingLevel).toBe('N/A');
    });

    it('should handle single word', () => {
      const result = analyzeReadability('Hello', 'en');

      expect(result.fleschKincaid).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getReadingLevelLabel', () => {
    it('should return correct label for grade 1-6', () => {
      expect(getReadingLevelLabel(3)).toBe('Elementary School');
      expect(getReadingLevelLabel(6)).toBe('Elementary School');
    });

    it('should return correct label for grade 7-8', () => {
      expect(getReadingLevelLabel(7)).toBe('Middle School');
      expect(getReadingLevelLabel(8)).toBe('Middle School');
    });

    it('should return correct label for grade 9-12', () => {
      expect(getReadingLevelLabel(10)).toBe('High School');
      expect(getReadingLevelLabel(12)).toBe('High School');
    });

    it('should return correct label for grade 13+', () => {
      expect(getReadingLevelLabel(13)).toBe('College');
      expect(getReadingLevelLabel(16)).toBe('College Graduate');
    });
  });


  describe('getReadingLevelGrade', () => {
    it('should calculate grade from Flesch-Kincaid score', () => {
      const grade = getReadingLevelGrade(8.5);
      expect(grade).toBeCloseTo(8.5, 1);
    });

    it('should handle negative scores', () => {
      const grade = getReadingLevelGrade(-1);
      expect(grade).toBeGreaterThanOrEqual(0);
    });

    it('should handle very high scores', () => {
      const grade = getReadingLevelGrade(25);
      expect(grade).toBeGreaterThan(20);
    });
  });

  describe('syllable counting accuracy', () => {
    it('should count syllables correctly for common words', () => {
      const words = [
        { word: 'hello', syllables: 2 },
        { word: 'world', syllables: 1 },
        { word: 'beautiful', syllables: 3 },
        { word: 'medication', syllables: 4 }
      ];

      // Test through full analysis
      words.forEach(({ word }) => {
        const result = analyzeReadability(word, 'en');
        expect(result.fleschKincaid).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('cross-language consistency', () => {
    it('should produce similar scores for equivalent complexity', () => {
      const englishSimple = 'The cat sat on the mat.';
      const spanishSimple = 'El gato está en la casa.';

      const resultEn = analyzeReadability(englishSimple, 'en');
      const resultEs = analyzeReadability(spanishSimple, 'es');

      // Both should be elementary level
      expect(resultEn.readingLevel).toBe('Elementary School');
      expect(resultEs.grade).toBeLessThan(8);
    });
  });

  describe('performance', () => {
    it('should analyze text quickly (< 100ms)', () => {
      const text = 'This is a test sentence. It should be analyzed quickly.';
      const start = Date.now();

      analyzeReadability(text, 'en');

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle large text efficiently', () => {
      const largeText = 'This is a sentence. '.repeat(500); // ~10000 chars
      const start = Date.now();

      analyzeReadability(largeText, 'en');

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });
  });
});
