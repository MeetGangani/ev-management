import asyncHandler from 'express-async-handler';
import Booking from '../models/bookingModel.js';
import EV from '../models/evModel.js';
import Station from '../models/stationModel.js';
import User from '../models/userModel.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (verified customers)
const createBooking = asyncHandler(async (req, res) => {
  const {
    evId,
    startStationId,
    endStationId,
    startTime,
    endTime,
    bookingType
  } = req.body;

  // Check if user is a verified customer
  if (req.user.role !== 'customer' || !req.user.aadharVerified) {
    res.status(403);
    throw new Error('You must be a verified customer to make a booking');
  }

  // Verify EV exists and is available
  const ev = await EV.findById(evId);
  if (!ev) {
    res.status(404);
    throw new Error('EV not found');
  }

  if (ev.status !== 'available') {
    res.status(400);
    throw new Error('This EV is not available for booking');
  }

  // Verify stations
  const startStation = await Station.findById(startStationId);
  if (!startStation) {
    res.status(404);
    throw new Error('Start station not found');
  }

  const endStation = await Station.findById(endStationId || startStationId);
  if (!endStation) {
    res.status(404);
    throw new Error('End station not found');
  }

  // Calculate fare based on EV price and duration
  const start = new Date(startTime);
  let end;
  let hours;
  let fare;

  if (endTime) {
    end = new Date(endTime);
    hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
  } else {
    // Default to 1 hour if no end time provided
    hours = 1;
    end = new Date(start.getTime() + hours * 60 * 60 * 1000);
  }

  fare = hours * ev.pricePerHour;

  // Create the booking
  const booking = await Booking.create({
    customerId: req.user._id,
    evId: ev._id,
    startStationId: startStation._id,
    endStationId: endStation._id,
    startTime: start,
    endTime: end,
    fare,
    bookingType: bookingType || 'scheduled'
  });

  if (booking) {
    // Update EV status
    ev.status = 'booked';
    ev.bookings.push(booking._id);
    await ev.save();

    res.status(201).json(booking);
  } else {
    res.status(400);
    throw new Error('Invalid booking data');
  }
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({})
    .populate('customerId', 'name email phone')
    .populate('evId', 'model manufacturer imageUrl registrationNumber')
    .populate({
      path: 'startStationId',
      select: 'name address stationMasterId',
      populate: {
        path: 'stationMasterId',
        select: 'name email _id'
      }
    })
    .populate({
      path: 'endStationId',
      select: 'name address stationMasterId',
      populate: {
        path: 'stationMasterId',
        select: 'name email _id'
      }
    })
    .sort({ createdAt: -1 });
  
  res.json(bookings);
});

// @desc    Get user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customerId: req.user._id })
    .populate('evId', 'model manufacturer imageUrl')
    .populate('startStationId', 'name address')
    .populate('endStationId', 'name address')
    .sort({ createdAt: -1 });
  
  res.json(bookings);
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'name email phone')
    .populate('evId', 'model manufacturer batteryLevel range imageUrl')
    .populate('startStationId', 'name address operatingHours')
    .populate('endStationId', 'name address operatingHours');

  if (booking) {
    // Check if the user is authorized to view this booking
    if (
      booking.customerId._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin' ||
      req.user.role === 'stationMaster'
    ) {
      res.json(booking);
    } else {
      res.status(403);
      throw new Error('Not authorized to view this booking');
    }
  } else {
    res.status(404);
    throw new Error('Booking not found');
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/StationMaster, Admin, and Customer (for their own bookings)
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Add authorization check - Allow customers to update their own bookings
  const isCustomersOwnBooking = booking.customerId.toString() === req.user._id.toString();
  const isStationMasterOrAdmin = req.user.role === 'stationMaster' || req.user.role === 'admin';
  
  // If not authorized, throw error
  if (!isStationMasterOrAdmin && !isCustomersOwnBooking) {
    res.status(403);
    throw new Error('Not authorized to update this booking');
  }
  
  // Additional validation for customer-initiated updates
  if (isCustomersOwnBooking && !isStationMasterOrAdmin) {
    // Customers can only set status to 'ongoing' or 'completed'
    if (!['ongoing', 'completed'].includes(status)) {
      res.status(400);
      throw new Error('Customers can only start or complete their rides');
    }
    
    // Can only set to 'ongoing' if current status is 'approved'
    if (status === 'ongoing' && booking.status !== 'approved') {
      res.status(400);
      throw new Error('Booking must be approved before starting the ride');
    }
    
    // Can only set to 'completed' if current status is 'ongoing'
    if (status === 'completed' && booking.status !== 'ongoing') {
      res.status(400);
      throw new Error('Ride must be ongoing before it can be completed');
    }
  }

  booking.status = status;

  // Update the EV status based on booking status
  if (status === 'ongoing') {
    const ev = await EV.findById(booking.evId);
    if (ev) {
      ev.status = 'in-use';
      await ev.save();
    }
  } else if (status === 'completed') {
    const ev = await EV.findById(booking.evId);
    if (ev) {
      ev.status = 'available';
      await ev.save();
    }
  }

  const updatedBooking = await booking.save();
  res.json(updatedBooking);
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only the customer or admin can cancel
  if (
    booking.customerId.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('Not authorized to cancel this booking');
  }

  // Only pending or approved bookings can be cancelled
  if (!['pending', 'approved'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Booking with status "${booking.status}" cannot be cancelled`);
  }

  booking.status = 'cancelled';
  
  // Make the EV available again
  const ev = await EV.findById(booking.evId);
  if (ev) {
    ev.status = 'available';
    await ev.save();
  }

  const updatedBooking = await booking.save();
  res.json(updatedBooking);
});

export {
  createBooking,
  getBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
}; 