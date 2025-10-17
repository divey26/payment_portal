import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';
import PaymentMethod from '../../models/PaymentModel.js';
import Bill from '../../models/Bill.js';

describe('/api/bills routes', () => {
  let method;

  beforeEach(async () => {
    method = await PaymentMethod.create({ kind: 'card', title: 'Card A' });
  });

  it('POST /api/bills creates a bill with normalized status and reference', async () => {
    const payload = {
      amount: '100.00',
      paymentMethod: method._id.toString(),
      senderName: 'Alice',
      status: 'invalid-status',
    };

    const res = await request(app)
      .post('/api/bills')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('reference');
    expect(res.body.status).toBe('pending');
    const saved = await Bill.findById(res.body._id);
    expect(saved).not.toBeNull();
    expect(saved.reference).toBeDefined();
    expect(saved.status).toBe('pending');
  });

  it('GET /api/bills returns populated paymentMethod and sorted desc', async () => {
    await Bill.create({
      amount: '10',
      paymentMethod: method._id,
      reference: 'REF000001',
      senderName: 'A',
      status: 'pending',
    });
    const b = await Bill.create({
      amount: '20',
      paymentMethod: method._id,
      reference: 'REF000002',
      senderName: 'B',
      status: 'success',
    });

    const res = await request(app).get('/api/bills');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0]._id).toBe(String(b._id));
    expect(res.body[0]).toHaveProperty('paymentMethod');
    expect(res.body[0].paymentMethod).toHaveProperty('_id');
  });

  it('GET /api/bills/:id returns 404 for non-existing id and 500 for invalid id', async () => {
    const validButMissing = new mongoose.Types.ObjectId();
    const missingRes = await request(app).get(`/api/bills/${validButMissing}`);
    expect(missingRes.status).toBe(404);

    const invalidRes = await request(app).get('/api/bills/not-an-id');
    expect(invalidRes.status).toBe(500);
  });

  it('PATCH /api/bills/:id/status updates status and validates allowed values', async () => {
    const bill = await Bill.create({
      amount: '50',
      paymentMethod: method._id,
      reference: 'REFXYZ',
      senderName: 'C',
      status: 'pending',
    });

    const ok = await request(app)
      .patch(`/api/bills/${bill._id}/status`)
      .send({ status: 'success' })
      .set('Content-Type', 'application/json');
    expect(ok.status).toBe(200);
    expect(ok.body.status).toBe('success');

    const bad = await request(app)
      .patch(`/api/bills/${bill._id}/status`)
      .send({ status: 'UNKNOWN' });
    expect(bad.status).toBe(400);
  });
});
