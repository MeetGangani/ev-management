import express from 'express';
import {
  startRide,
  endRide,
  getRideDetails,
  getActiveRide,
  getCustomerActiveRide,
  getRides,
  getUserRideHistory,
  rateRide,
  reportRideIssue,
  getRideStats,
} from '../controllers/rideController.js';
import { protect, admin, stationMaster } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes - none

// Protected routes (logged in users)
router.route('/').get(protect, admin, getRides);
router.route('/start').post(protect, startRide);
router.route('/active').get(protect, getActiveRide);
router.route('/history').get(protect, getUserRideHistory);
router.route('/stats').get(protect, admin, getRideStats);
router.route('/customer/:id/active').get(protect, stationMaster, getCustomerActiveRide);
router.route('/:id').get(protect, getRideDetails);
router.route('/:id/end').put(protect, endRide);
router.route('/:id/rate').post(protect, rateRide);
router.route('/:id/report').post(protect, reportRideIssue);

export default router; 