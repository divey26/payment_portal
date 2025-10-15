import express from "express";
import { addPayment, getPayments, getPaymentById } from "../controllers/billController.js";

const router = express.Router();

router.post("/", addPayment);
router.get("/", getPayments);
router.get("/:id", getPaymentById); // <-- Add this line


export default router;