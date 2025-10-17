import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock for Bill model (default export from models/Bill.js)
let createdBillPayload;

function MockBill(data) {
  createdBillPayload = data;
  this.save = vi.fn(async () => ({ _id: 'b_1', ...data }));
  return this;
}

// helpers to build chainable query mocks
const chainPopulateSort = (docs) => ({
  populate: vi.fn(() => ({
    sort: vi.fn(async () => docs),
  })),
});

MockBill.find = vi.fn(() =>
  chainPopulateSort([
    { _id: 'b_2', paymentMethod: { _id: 'pm_1' }, reference: 'REF2' },
    { _id: 'b_1', paymentMethod: { _id: 'pm_1' }, reference: 'REF1' },
  ])
);

MockBill.findById = vi.fn((id) => ({
  populate: vi.fn(async () =>
    id === 'missing' ? null : { _id: id, paymentMethod: { _id: 'pm_1' } }
  ),
}));

MockBill.findByIdAndUpdate = vi.fn((id, update) => ({
  populate: vi.fn(async () =>
    id === 'missing' ? null : { _id: id, ...update, paymentMethod: { _id: 'pm_1' } }
  ),
}));

vi.mock('../../models/Bill.js', () => ({
  default: MockBill,
}));

import {
  addPayment as addBill,
  getPayments as getBills,
  getPaymentById,
  updatePaymentStatus,
} from '../../controllers/billController.js';

function createRes() {
  const res = {};
  res.statusCode = 200;
  res.status = vi.fn(function (code) {
    res.statusCode = code;
    return res;
  });
  res.jsonData = undefined;
  res.json = vi.fn(function (data) {
    res.jsonData = data;
    return res;
  });
  return res;
}

describe('billController unit', () => {
  beforeEach(() => {
    createdBillPayload = undefined;
    vi.clearAllMocks();
  });

  it('addBill normalizes status and sets reference and paidAt', async () => {
    const req = {
      body: {
        amount: '100.00',
        paymentMethod: 'pm_1',
        senderName: 'Alice',
        status: 'foo',
      },
    };
    const res = createRes();
    await addBill(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(createdBillPayload).toBeDefined();
    expect(createdBillPayload.status).toBe('pending');
    expect(createdBillPayload.reference.startsWith('REF')).toBe(true);
    expect(createdBillPayload.paidAt instanceof Date).toBe(true);
  });

  it('getBills returns populated list sorted desc', async () => {
    const req = {};
    const res = createRes();
    await getBills(req, res);
    expect(Array.isArray(res.jsonData)).toBe(true);
    expect(res.jsonData[0]._id).toBe('b_2');
  });

  it('getPaymentById returns 404 when not found', async () => {
    const req = { params: { id: 'missing' } };
    const res = createRes();
    await getPaymentById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.jsonData).toEqual({ error: 'Payment not found' });
  });

  it('updatePaymentStatus validates allowed values and updates', async () => {
    const billId = 'b_1';
    const badReq = { params: { id: billId }, body: { status: 'BAD' } };
    const badRes = createRes();
    await updatePaymentStatus(badReq, badRes);
    expect(badRes.status).toHaveBeenCalledWith(400);

    const okReq = { params: { id: billId }, body: { status: 'success' } };
    const okRes = createRes();
    await updatePaymentStatus(okReq, okRes);
    expect(okRes.statusCode).toBe(200);
    expect(okRes.jsonData.status).toBe('success');
  });
});
