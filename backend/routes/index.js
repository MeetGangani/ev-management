const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const stationRoutes = require('./stationRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const bookingRoutes = require('./bookingRoutes');
const paymentRoutes = require('./paymentRoutes');
const penaltyRoutes = require('./penaltyRoutes');

// Register routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/stations', stationRoutes);
router.use('/api/vehicles', vehicleRoutes);
router.use('/api/bookings', bookingRoutes);
router.use('/api/payments', paymentRoutes);
router.use('/api/penalties', penaltyRoutes);

module.exports = router; 