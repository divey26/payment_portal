// controllers/billController.js
import Payment from "../models/Bill.js";

// Create
export const addPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, senderName, status } = req.body;

    // generate reference
    const reference = "REF" + Math.floor(100000000 + Math.random() * 900000000);

    // normalize status (optional from client)
    const allowed = ["success", "failed", "pending"];
    const normalizedStatus = allowed.includes(status) ? status : "pending";

    const payment = new Payment({
      amount,
      paymentMethod,
      senderName,
      reference,
      paidAt: new Date(),
      status: normalizedStatus, // ✅ save it
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read all
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("paymentMethod")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read one
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("paymentMethod");
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ NEW: update only the status later if you want
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["success", "failed", "pending"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("paymentMethod");

    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
