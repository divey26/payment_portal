import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Health endpoint', () => {
  it('GET /api/health should return 200 OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });
});
