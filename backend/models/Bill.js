import mongoose from 'mongoose';

const billSchema = new mongoose.Schema(
  {
    amount: { type: String, required: true }, // Amount paid
    paymentMethod: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod', required: true },
    reference: { type: String, required: true }, // Reference number
    senderName: { type: String, required: true }, // Sender name
    paidAt: { type: Date, default: Date.now }, // Time of payment
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Bill', billSchema);
