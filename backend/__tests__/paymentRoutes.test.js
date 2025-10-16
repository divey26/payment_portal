
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';

jest.unstable_mockModule('../controllers/paymentController.js', () => ({
  getPayments: jest.fn((req, res) => res.status(200).json([{ amount: 50 }])),
  addPayment: jest.fn((req, res) => res.status(201).json({ amount: 50 })),
}));

const { default: paymentRoutes } = await import('../routes/paymentRoutes.js');

const app = express();
app.use(express.json());
app.use('/', paymentRoutes);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Payment Routes', () => {
  it('should fetch all payments on GET /', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should add a new payment on POST /', async () => {
    const res = await request(app)
      .post('/')
      .send({ amount: 50, paymentMethod: 'paypal', senderName: 'Jane Doe' });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('amount', 50);
  });
});
