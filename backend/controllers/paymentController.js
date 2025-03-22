import asyncHandler from '../middleware/asyncHandler.js';
import Payment from '../models/paymentModel.js';
import Booking from '../models/bookingModel.js';
import User from '../models/userModel.js';
import EVStation from '../models/evStationModel.js';
import { createNotification } from './notificationController.js';

// Helper functions for API responses
const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = asyncHandler(async (req, res) => {
  // Pagination parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Filter by userId if provided
  const filter = {};
  if (req.query.userId) {
    filter.userId = req.query.userId;
  }
  
  // Status filter
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  // Calculate total count
  const totalPayments = await Payment.countDocuments(filter);
  
  // Get payments with pagination
  const payments = await Payment.find(filter)
    .populate('userId', 'name email')
    .populate('bookingId', 'status totalCost')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  return successResponse(res, 'Payments retrieved successfully', {
    payments,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalPayments / limit),
      totalItems: totalPayments
    }
  });
});

// @desc    Get user payments
// @route   GET /api/payments/user
// @access  Private
const getUserPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('booking', 'startTime endTime status');
  
  res.json(payments);
});

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('user', 'name email')
    .populate({
      path: 'booking',
      populate: {
        path: 'station',
        select: 'name location chargingPoints',
      },
    });

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  // Check if the payment belongs to the logged in user or the user is an admin
  if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this payment');
  }

  res.json(payment);
});

// @desc    Process payment for a booking
// @route   POST /api/payments/process
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
  const { bookingId, paymentMethod, amount } = req.body;

  if (!bookingId || !paymentMethod || !amount) {
    res.status(400);
    throw new Error('Please provide booking id, payment method and amount');
  }

  // Find the booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if payment already exists
  const existingPayment = await Payment.findOne({ booking: bookingId, status: 'completed' });
  if (existingPayment) {
    res.status(400);
    throw new Error('Payment already processed for this booking');
  }

  // Mock payment processing
  // In a real application, integrate with a payment gateway like Stripe
  const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo

  if (!paymentSuccess) {
    // Create a failed payment record
    const failedPayment = await Payment.create({
      user: req.user._id,
      booking: bookingId,
      amount,
      paymentMethod,
      status: 'failed',
      transactionId: `FAILED-${Date.now()}`,
    });

    res.status(400);
    throw new Error('Payment processing failed. Please try again.');
  }

  // Create payment record
  const payment = await Payment.create({
    user: req.user._id,
    booking: bookingId,
    amount,
    paymentMethod,
    status: 'completed',
    transactionId: `TXN-${Date.now()}`,
  });

  // Update booking payment status
  booking.paymentStatus = 'paid';
  booking.paymentDate = Date.now();
  await booking.save();

  // Get station details
  const station = await EVStation.findById(booking.station).select('name owner');

  // Create notification for user
  await createNotification({
    userId: req.user._id,
    type: 'success',
    message: 'Payment successful',
    description: `Your payment of $${amount} for booking #${booking._id.toString().slice(-8)} has been processed successfully.`,
    link: `/bookings/${bookingId}`,
    metadata: { bookingId, paymentId: payment._id },
  });

  // Create notification for station owner if applicable
  if (station && station.owner) {
    await createNotification({
      userId: station.owner,
      type: 'info',
      message: 'New payment received',
      description: `Payment of $${amount} received for booking #${booking._id.toString().slice(-8)} at ${station.name}.`,
      link: `/station/bookings/${bookingId}`,
      metadata: { bookingId, paymentId: payment._id },
    });
  }

  res.status(201).json(payment);
});

// @desc    Cancel a payment
// @route   PUT /api/payments/:id/cancel
// @access  Private/Admin
const cancelPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  // Only allow cancellation of completed payments
  if (payment.status !== 'completed') {
    res.status(400);
    throw new Error(`Cannot cancel a payment with status: ${payment.status}`);
  }

  // Update payment status
  payment.status = 'cancelled';
  payment.cancelledAt = Date.now();
  const updatedPayment = await payment.save();

  // Update booking payment status
  const booking = await Booking.findById(payment.booking);
  if (booking) {
    booking.paymentStatus = 'cancelled';
    await booking.save();
  }

  // Create notification for user
  await createNotification({
    userId: payment.user,
    type: 'warning',
    message: 'Payment cancelled',
    description: `Your payment of $${payment.amount} has been cancelled.`,
    metadata: { paymentId: payment._id },
  });

  res.json(updatedPayment);
});

// @desc    Refund a payment
// @route   PUT /api/payments/:id/refund
// @access  Private/Admin
const refundPayment = asyncHandler(async (req, res) => {
  const { reason, refundAmount } = req.body;
  
  if (!reason) {
    res.status(400);
    throw new Error('Please provide a reason for the refund');
  }

  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  // Only allow refund of completed payments
  if (payment.status !== 'completed') {
    res.status(400);
    throw new Error(`Cannot refund a payment with status: ${payment.status}`);
  }

  // Set refund amount to full amount if not specified
  const amountToRefund = refundAmount || payment.amount;

  // Update payment
  payment.status = 'refunded';
  payment.refundedAt = Date.now();
  payment.refundReason = reason;
  payment.refundAmount = amountToRefund;
  const updatedPayment = await payment.save();

  // Update booking payment status
  const booking = await Booking.findById(payment.booking);
  if (booking) {
    booking.paymentStatus = 'refunded';
    await booking.save();
  }

  // Create notification for user
  await createNotification({
    userId: payment.user,
    type: 'info',
    message: 'Payment refunded',
    description: `Your payment of $${amountToRefund} has been refunded. Reason: ${reason}`,
    metadata: { paymentId: payment._id },
  });

  res.json(updatedPayment);
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private/Admin
const getPaymentStats = asyncHandler(async (req, res) => {
  const totalPayments = await Payment.countDocuments({ status: 'completed' });
  
  const totalRevenue = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const paymentsByMethod = await Payment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
    { $sort: { amount: -1 } }
  ]);

  // Last 7 days payments
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const dailyPayments = await Payment.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        amount: { $sum: '$amount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    totalPayments,
    totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    paymentsByMethod,
    dailyPayments,
  });
});

export {
  getPayments,
  getUserPayments,
  getPaymentById,
  processPayment,
  cancelPayment,
  refundPayment,
  getPaymentStats
}; 