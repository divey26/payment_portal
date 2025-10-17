import PaymentMethod from '../models/PaymentModel.js';

// Get all payment methods
export const getPayments = async (req, res) => {
  try {
    const methods = await PaymentMethod.find().sort({ createdAt: -1 });
    res.json(methods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new payment method
export const addPayment = async (req, res) => {
  try {
    const method = new PaymentMethod(req.body);
    await method.save();
    res.status(201).json(method);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a payment method
export const deletePayment = async (req, res) => {
  try {
    await PaymentMethod.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment method deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
