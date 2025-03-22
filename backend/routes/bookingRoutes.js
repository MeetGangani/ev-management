import express from 'express';
import {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect, admin, stationMaster, verifiedCustomer, adminOrStationMaster } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer routes
router.route('/')
  .post(protect, verifiedCustomer, createBooking)
  .get(protect, adminOrStationMaster, getBookings);

router.route('/my').get(protect, getMyBookings);

router.route('/:id')
  .get(protect, getBookingById);

router.route('/:id/status')
  .put(protect, updateBookingStatus);

router.route('/:id/cancel')
  .put(protect, cancelBooking);

export default router; 