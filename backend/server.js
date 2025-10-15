import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import paymentRoutes from "./routes/paymentRoutes.js";
import billRoutes from "./routes/billRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.get('/api/health', (req, res) => {
  res.status(200).send('OK'); // Send a 200 OK status if the server is healthy
});
// Routes
app.use("/api/payments", paymentRoutes);
app.use("/api/bills", billRoutes);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
