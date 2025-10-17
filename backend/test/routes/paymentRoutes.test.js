import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';
import PaymentMethod from '../../models/PaymentModel.js';

describe('/api/payments routes', () => {
  it('POST /api/payments creates a payment method', async () => {
    const payload = {
      kind: 'card',
      title: 'Visa ending 4242',
      cardName: 'John Doe',
      cardNumber: '4242424242424242',
      expiry: '12/29',
    };

    const res = await request(app)
      .post('/api/payments')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.kind).toBe('card');
    const saved = await PaymentMethod.findById(res.body._id);
    expect(saved).not.toBeNull();
    expect(saved.kind).toBe('card');
  });

  it('GET /api/payments lists payment methods sorted by createdAt desc', async () => {
    const first = await PaymentMethod.create({ kind: 'card', title: 'Old' });
    const second = await PaymentMethod.create({ kind: 'bank', title: 'New' });

    const res = await request(app).get('/api/payments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    // Newest should come first
    expect(res.body[0]._id).toBe(String(second._id));
    expect(res.body[1]._id).toBe(String(first._id));
  });
});
