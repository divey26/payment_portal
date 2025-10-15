import Payment from "../models/Bill.js";

export const addPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, senderName } = req.body;
    const reference = "REF" + Math.floor(100000000 + Math.random() * 900000000);
    const payment = new Payment({
      amount,
      paymentMethod,
      senderName,
      reference,
      paidAt: new Date(),
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("paymentMethod").sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("paymentMethod");
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};