import mongoose from "mongoose";

const paymentMethodSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["card", "bank"], required: true },
    title: String,
    subtitle: String,
    cardName: String,
    cardNumber: String,
    expiry: String,
    cvv: String,
    accountName: String,
    bankName: String,
    accountNumber: String,
    branchCode: String,
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("PaymentMethod", paymentMethodSchema);
