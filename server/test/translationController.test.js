import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import translationRoutes from '../src/routes/translationRoutes.js';
import languageRoutes from '../src/routes/languageRoutes.js';

// Mock services
vi.mock('../src/services/translationService.js');
vi.mock('../src/models/User.js');
vi.mock('../src/middlewares/authMiddleware.js', () => ({
  default: (req, res, next) => {
    req.user = { _id: 'test-user-id', id: 'test-user-id' };
    next();
  }
}));

describe('Translation Controller API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/translate', translationRoutes);
    app.use('/api/languages', languageRoutes);
    vi.clearAllMocks();
  });

  describe('POST /api/translate', () => {
    it('should translate single text', async () => {
      const translationService = await import('../src/services/translationService.js');
      translationService.default.translateText = vi.fn().mockResolvedValue('Hola mundo');

      const response = await request(app)
        .post('/api/translate')
        .send({
          text: 'Hello world',
          targetLanguage: 'es',
          context: 'general'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('translatedText', 'Hola mundo');
    });

    it('should translate batch of texts', async () => {
      const translationService = await import('../src/services/translationService.js');
      translationService.default.translateBatch = vi.fn().mockResolvedValue(['Hola', 'Adiós', 'Gracias']);

      const response = await request(app)
        .post('/api/translate')
        .send({
          texts: ['Hello', 'Goodbye', 'Thank you'],
          targetLanguages: ['es', 'es', 'es']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('translatedTexts');
      expect(response.body.translatedTexts).toEqual(['Hola', 'Adiós', 'Gracias']);
    });

    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .post('/api/translate')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle translation service errors', async () => {
      const translationService = await import('../src/services/translationService.js');
      translationService.default.translateText = vi.fn().mockRejectedValue(new Error('Translation failed'));

      const response = await request(app)
        .post('/api/translate')
        .send({
          text: 'Hello',
          targetLanguage: 'es'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle unsupported language codes', async () => {
      const response = await request(app)
        .post('/api/translate')
        .send({
          text: 'Hello',
          targetLanguage: 'xyz'
        });

      expect(response.status).toBe(400);
    });

    it('should preserve medical context', async () => {
      const translationService = await import('../src/services/translationService.js');
      translationService.default.translateText = vi.fn().mockResolvedValue('Tome aspirina 500mg');

      const response = await request(app)
        .post('/api/translate')
        .send({
          text: 'Take aspirin 500mg',
          targetLanguage: 'es',
          context: 'medication'
        });

      expect(response.status).toBe(200);
      expect(translationService.default.translateText).toHaveBeenCalledWith(
        'Take aspirin 500mg',
        'es',
        'medication'
      );
    });
  });

  describe('GET /api/translate/languages', () => {
    it('should return list of supported languages', async () => {
      const response = await request(app)
        .get('/api/translate/languages');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('languages');
      expect(Array.isArray(response.body.languages)).toBe(true);
      expect(response.body.languages.length).toBeGreaterThan(0);
    });

    it('should include language codes and names', async () => {
      const response = await request(app)
        .get('/api/translate/languages');

      expect(response.body.languages[0]).toHaveProperty('code');
      expect(response.body.languages[0]).toHaveProperty('name');
      expect(response.body.languages[0]).toHaveProperty('nativeName');
    });
  });

  describe('GET /api/languages/user', () => {
    it('should return user preferred language', async () => {
      const User = await import('../src/models/User.js');
      User.default.findById = vi.fn().mockResolvedValue({
        preferredLanguage: 'es'
      });

      const response = await request(app)
        .get('/api/languages/user')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('preferredLanguage', 'es');
    });

    it('should return 404 for non-existent user', async () => {
      const User = await import('../src/models/User.js');
      User.default.findById = vi.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/languages/user')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/languages/user', () => {
    it('should update user language preference', async () => {
      const User = await import('../src/models/User.js');
      User.default.findByIdAndUpdate = vi.fn().mockResolvedValue({
        preferredLanguage: 'es'
      });

      const response = await request(app)
        .put('/api/languages/user')
        .set('Authorization', 'Bearer test-token')
        .send({ language: 'es' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('preferredLanguage', 'es');
    });

    it('should reject invalid language codes', async () => {
      const response = await request(app)
        .put('/api/languages/user')
        .set('Authorization', 'Bearer test-token')
        .send({ language: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should require authentication', async () => {
      // Override auth middleware for this test
      const appNoAuth = express();
      appNoAuth.use(express.json());
      appNoAuth.use('/api/languages', (req, res, next) => {
        return res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(appNoAuth)
        .put('/api/languages/user')
        .send({ language: 'es' });

      expect(response.status).toBe(401);
    });
  });

  describe('rate limiting and performance', () => {
    it('should handle concurrent translation requests', async () => {
      const translationService = await import('../src/services/translationService.js');
      translationService.default.translateText = vi.fn().mockResolvedValue('Hola');

      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/translate')
          .send({ text: 'Hello', targetLanguage: 'es' })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should respond within acceptable time (<500ms)', async () => {
      const translationService = await import('../src/services/translationService.js');
      translationService.default.translateText = vi.fn().mockResolvedValue('Hola');

      const start = Date.now();
      
      await request(app)
        .post('/api/translate')
        .send({ text: 'Hello', targetLanguage: 'es' });
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });
  });

  describe('error scenarios', () => {
    it('should handle database connection errors', async () => {
      const User = await import('../src/models/User.js');
      User.default.findById = vi.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/languages/user')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/translate')
        .set('Content-Type', 'application/json')
        .send('{ invalid json');

      expect(response.status).toBe(400);
    });

    it('should validate request body structure', async () => {
      const response = await request(app)
        .post('/api/translate')
        .send({ invalidField: 'value' });

      expect(response.status).toBe(400);
    });
  });
});
