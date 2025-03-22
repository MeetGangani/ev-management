import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  getMyBookings,
  updateBookingStatus,
  reportDamage,
  getPenaltyStatistics,
  updateBookingLocation,
  cancelBooking,
  completeBooking,
  applyPenaltyToBooking,
  searchBookings
} from '../controllers/bookingController.js';
import { protect, admin, adminOrStationMaster, verifiedCustomer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Customer routes
router.route('/')
  .post(protect, verifiedCustomer, createBooking)
  .get(protect, adminOrStationMaster, getBookings);

router.route('/my-bookings').get(protect, getMyBookings);

router.route('/penalty-stats').get(protect, admin, getPenaltyStatistics);

router.route('/:id')
  .get(protect, getBookingById);

router.route('/:id/status')
  .put(protect, updateBookingStatus);

router.route('/:id/cancel')
  .put(protect, cancelBooking);

router.route('/:id/damage-report').post(protect, adminOrStationMaster, reportDamage);

router.route('/:id/location').put(protect, updateBookingLocation);

router.post('/search', protect, searchBookings);
router.post('/:id/apply-penalty', protect, applyPenaltyToBooking);

export default router; 