
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import translationService from '../src/services/translationService.js';

// Mock axios for Google Translate API
vi.mock('axios');
import axios from 'axios';

describe('Translation Service', () => {
  beforeEach(() => {
    // Clear cache before each test
    translationService.invalidateCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('translateText', () => {
    it('should translate simple English to Spanish', async () => {
      const mockResponse = {
        data: {
          data: {
            translations: [{ translatedText: 'Hola mundo' }]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await translationService.translateText('Hello world', 'es');

      expect(result.success).toBe(true);
      expect(result.translatedText).toBe('Hola mundo');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('translate.googleapis.com'),
        expect.objectContaining({
          q: 'Hello world',
          target: 'es',
          source: 'en'
        }),
        expect.any(Object)
      );
    });

    it('should translate simple English to Hindi', async () => {
      const mockResponse = {
        data: {
          data: {
            translations: [{ translatedText: 'नमस्ते दुनिया' }]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await translationService.translateText('Hello world', 'hi');

      expect(result).toBe('नमस्ते दुनिया');
    });

    it('should preserve medical terminology', async () => {
      const text = 'Take aspirin 500mg twice daily';
      const mockResponse = {
        data: {
          data: {
            translations: [{ translatedText: 'Tome aspirina 500mg dos veces al día' }]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await translationService.translateText(text, 'es', 'medication');

      expect(result).toContain('aspirina');
      expect(result).toContain('500mg');
    });

    it('should cache translations to reduce API calls', async () => {
      const mockResponse = {
        data: {
          data: {
            translations: [{ translatedText: 'Hola' }]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      // First call
      const result1 = await translationService.translateText('Hello', 'es');
      expect(result1).toBe('Hola');
      expect(axios.post).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await translationService.translateText('Hello', 'es');
      expect(result2).toBe('Hola');
      expect(axios.post).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should handle API failures gracefully with retry', async () => {
      axios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: {
            data: {
              translations: [{ translatedText: 'Hola' }]
            }
          }
        });

      const result = await translationService.translateText('Hello', 'es');

      expect(result.success).toBe(true);
      expect(result.translatedText).toBe('Hola');
      expect(axios.post).toHaveBeenCalledTimes(3); // 2 failures + 1 success
    });

    it('should return original text after max retries', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));

      const result = await translationService.translateText('Hello', 'es');

      expect(result.success).toBe(false); // Fallback to original
      expect(result.translatedText).toBe('Hello');
      expect(result.originalText).toBe('Hello');
      expect(result.error).toBeDefined();
      expect(axios.post).toHaveBeenCalledTimes(3); // Max retries
    });

    it('should handle empty strings', async () => {
      const result = await translationService.translateText('', 'es');

      expect(result.success).toBe(true);
      expect(result.translatedText).toBe('');
      expect(axios.post).not.toHaveBeenCalled(); // Should skip API call
    });

    it('should handle very long text', async () => {
      const longText = 'Lorem ipsum dolor sit amet. '.repeat(100); // ~2800 chars
      const mockResponse = {
        data: {
          data: {
            translations: [{ translatedText: 'Translated long text' }]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await translationService.translateText(longText, 'es');

      expect(result).toBe('Translated long text');
      expect(axios.post).toHaveBeenCalled();
    });

    it('should handle special characters correctly', async () => {
      const text = 'Test: 100mg/day (morning & evening)';
      const mockResponse = {
        data: {
          data: {
            translations: [{ translatedText: 'Prueba: 100mg/día (mañana y tarde)' }]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await translationService.translateText(text, 'es');

      expect(result).toContain('100mg');
      expect(result).toContain('día');
    });
  });

  describe('translateBatch', () => {
    it('should translate multiple texts in one call', async () => {
      const texts = ['Hello', 'Goodbye', 'Thank you'];
      const mockResponse = {
        data: {
          data: {
            translations: [
              { translatedText: 'Hola' },
              { translatedText: 'Adiós' },
              { translatedText: 'Gracias' }
            ]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const results = await translationService.translateBatch(texts, ['es', 'es', 'es']);

      expect(results).toEqual(['Hola', 'Adiós', 'Gracias']);
      expect(axios.post).toHaveBeenCalledTimes(1); // Batch call
    });

    it('should handle mixed cache hits and misses', async () => {
      // Pre-cache one translation
      translationService.cache.set('en-es-Hello', 'Hola');

      const mockResponse = {
        data: {
          data: {
            translations: [{ translatedText: 'Adiós' }]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const results = await translationService.translateBatch(['Hello', 'Goodbye'], ['es', 'es']);

      expect(results).toEqual(['Hola', 'Adiós']);
      expect(axios.post).toHaveBeenCalledTimes(1); // Only for uncached
    });
  });

  describe('detectLanguage', () => {
    it('should detect English text', async () => {
      const mockResponse = {
        data: {
          data: {
            detections: [[{ language: 'en', confidence: 0.98 }]]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await translationService.detectLanguage('This is English text');

      expect(result).toBe('en');
    });

    it('should detect Spanish text', async () => {
      const mockResponse = {
        data: {
          data: {
            detections: [[{ language: 'es', confidence: 0.95 }]]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      const result = await translationService.detectLanguage('Este es texto en español');

      expect(result).toBe('es');
    });
  });

  describe('cache performance', () => {
    it('should improve performance with caching', async () => {
      const mockResponse = {
        data: {
          data: {
            translations: [{ translatedText: 'Hola' }]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      // First call - should take longer
      const start1 = Date.now();
      await translationService.translateText('Hello', 'es');
      const duration1 = Date.now() - start1;

      // Second call - should be instant from cache
      const start2 = Date.now();
      await translationService.translateText('Hello', 'es');
      const duration2 = Date.now() - start2;

      expect(duration2).toBeLessThan(duration1);
      expect(duration2).toBeLessThan(10); // Should be < 10ms from cache
    });

    it('should have cache expiration', async () => {
      const NodeCache = require('node-cache');
      class TestTranslationService extends translationService.constructor {
        constructor() {
          super();
          this.cache = new NodeCache({ stdTTL: 1 }); // 1 second TTL
        }
      }
      const testService = new TestTranslationService();

      const mockResponse = {
        data: {
          data: {
            translations: [{ translatedText: 'Hola' }]
          }
        }
      };
      axios.post.mockResolvedValue(mockResponse);

      await testService.translateText('Hello', 'es');
      expect(axios.post).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      await testService.translateText('Hello', 'es');
      expect(axios.post).toHaveBeenCalledTimes(2); // Called again after expiration
    });
  });

  describe('error handling', () => {
    it('should handle rate limit errors', async () => {
      axios.post.mockRejectedValue({ response: { status: 429, data: { error: 'Rate limit exceeded' } } });

      await expect(translationService.translateText('Hello', 'es')).rejects.toThrow();
    });

    it('should handle invalid API key', async () => {
      axios.post.mockRejectedValue({ response: { status: 403, data: { error: 'Invalid API key' } } });

      await expect(translationService.translateText('Hello', 'es')).rejects.toThrow();
    });

    it('should handle unsupported language', async () => {
      const result = await translationService.translateText('Hello', 'xyz');

      expect(result).toBe('Hello'); // Fallback to original
    });
  });
});
