import express from 'express';
import { 
  getPayments, 
  getUserPayments,
  getPaymentById, 
  processPayment, 
  cancelPayment, 
  refundPayment,
  getPaymentStats
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// User routes
router.route('/user').get(getUserPayments);
router.route('/process').post(processPayment);

// Admin routes
router.route('/')
  .get(admin, getPayments);

router.route('/stats')
  .get(admin, getPaymentStats);

// Specific payment routes
router.route('/:id')
  .get(getPaymentById);

router.route('/:id/cancel')
  .put(admin, cancelPayment);

router.route('/:id/refund')
  .put(admin, refundPayment);

export default router; 