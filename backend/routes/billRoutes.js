import express from 'express';
import {
  addPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
} from '../controllers/billController.js';

const router = express.Router();

router.post('/', addPayment);
router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.patch('/:id/status', updatePaymentStatus);

export default router;
