import { describe, it, expect, vi, beforeEach } from 'vitest';

// Prepare a mock for PaymentMethod that works as constructor and static
let createdPayload;
const savedDocs = [];

function MockPaymentMethod(data) {
  createdPayload = data;
  Object.assign(this, data);
  this.save = vi.fn().mockImplementation(async () => {
    // mimic mongoose assigning _id on saved document instance
    this._id = 'pm_1';
    savedDocs.push(this);
    return this;
  });
  return this;
}

MockPaymentMethod.find = vi.fn(() => ({
  sort: vi.fn(async () => {
    // Return in createdAt desc order simulation
    return [
      { _id: 'pm_2', kind: 'bank', title: 'New' },
      { _id: 'pm_1', kind: 'card', title: 'Old' },
    ];
  }),
}));

MockPaymentMethod.findByIdAndDelete = vi.fn(async () => ({}));

vi.mock('../../models/PaymentModel.js', () => ({
  default: MockPaymentMethod,
}));

import { getPayments, addPayment, deletePayment } from '../../controllers/paymentController.js';

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

describe('paymentController unit', () => {
  beforeEach(() => {
    createdPayload = undefined;
    savedDocs.length = 0;
    vi.clearAllMocks();
  });

  it('getPayments returns methods sorted by createdAt desc', async () => {
    const req = {};
    const res = createRes();
    await getPayments(req, res);
    expect(res.status).not.toHaveBeenCalled();
    expect(Array.isArray(res.jsonData)).toBe(true);
    expect(res.jsonData[0].title).toBe('New');
  });

  it('addPayment creates and returns the method (201)', async () => {
    const req = { body: { kind: 'card', title: 'Visa' } };
    const res = createRes();
    await addPayment(req, res);
    expect(createdPayload).toEqual(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.jsonData).toMatchObject({ _id: 'pm_1', kind: 'card', title: 'Visa' });
  });

  it('deletePayment removes by id and returns message', async () => {
    const req = { params: { id: 'pm_1' } };
    const res = createRes();
    await deletePayment(req, res);
    expect(MockPaymentMethod.findByIdAndDelete).toHaveBeenCalledWith('pm_1');
    expect(res.jsonData).toEqual({ message: 'Payment method deleted' });
  });
});
