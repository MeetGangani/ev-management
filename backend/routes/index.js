import express from 'express';
import userRoutes from './userRoutes.js';
import stationRoutes from './stationRoutes.js';
import evRoutes from './evRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import penaltyRoutes from './penaltyRoutes.js';
import rideRoutes from './rideRoutes.js';

const router = express.Router();

// Register routes
router.use('/api/users', userRoutes);
router.use('/api/stations', stationRoutes);
router.use('/api/evs', evRoutes);
router.use('/api/bookings', bookingRoutes);
router.use('/api/upload', uploadRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/penalties', penaltyRoutes);
router.use('/api/rides', rideRoutes);

export default router; 