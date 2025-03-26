import asyncHandler from 'express-async-handler';
import Booking from '../models/bookingModel.js';
import EV from '../models/evModel.js';
import Station from '../models/stationModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

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
    duration: hours,
    totalCost: fare,
    fare,
    bookingType: bookingType || 'scheduled'
  });

  if (booking) {
    // Update EV status to 'booked'
    ev.status = 'booked';
    ev.bookings.push(booking._id);
    await ev.save();
    
    // Update availableEVs count for start station
    await Station.findByIdAndUpdate(
      startStation._id,
      { $inc: { availableEVs: -1 } }
    );

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
    .populate('evId', 'model manufacturer imageUrl registrationNumber pricePerHour')
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
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate('evId', 'model manufacturer imageUrl registrationNumber pricePerHour')
      .populate('customerId', 'name email')
      .populate('startStationId', 'name address')
      .populate('endStationId', 'name address')
      .sort({ createdAt: -1 });
    
    // Map through bookings to ensure we handle any null references
    const processedBookings = bookings.map(booking => {
      const bookingObj = booking.toObject();
      
      // Handle missing station data
      if (!bookingObj.startStationId) {
        bookingObj.startStationId = { 
          name: "Unknown Station", 
          address: "No address available" 
        };
      }
      
      if (!bookingObj.endStationId) {
        bookingObj.endStationId = { 
          name: "Unknown Station", 
          address: "No address available" 
        };
      }
      
      return bookingObj;
    });
    
    res.json(processedBookings);
  } catch (error) {
    console.error('Error in getMyBookings:', error);
    res.status(500).json({ message: 'Error retrieving bookings data' });
  }
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'name email phone')
    .populate('evId', 'model manufacturer batteryLevel range imageUrl pricePerHour registrationNumber')
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
// @access  Private/Admin/StationMaster/Customer
const updateBookingStatus = asyncHandler(async (req, res) => {
  console.log('Update booking status request body:', req.body);
  console.log('User requesting status update:', req.user.role);
  
  const booking = await Booking.findById(req.params.id)
    .populate('evId', 'status')
    .populate('customerId', 'name email');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Verify user authorization
  if (req.user.role !== 'admin' && req.user.role !== 'stationMaster' &&
      req.user._id.toString() !== booking.customerId._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this booking');
  }

  // Get the new status from request body
  const { status, damageReport, penaltyAmount, penaltyReason } = req.body;
  
  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  // Validate status transition
  if (!['approved', 'declined', 'cancelled', 'ongoing', 'completed', 'penalized'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }
  
  console.log(`Updating booking ${booking._id} from ${booking.status} to ${status}`);

  // Special validations based on user role and status transitions
  if (req.user.role === 'customer') {
    // Customers can only cancel pending bookings or start/complete their rides
    if ((booking.status === 'pending' && status !== 'cancelled') &&
        (booking.status === 'approved' && status !== 'ongoing') &&
        (booking.status === 'ongoing' && status !== 'completed')) {
      res.status(400);
      throw new Error('You are not authorized to change to this status');
    }
  }
  
  // Station masters should be able to mark rides as completed
  if (req.user.role === 'stationMaster') {
    // Allow station master to approve pending or complete ongoing bookings
    const allowedTransitions = {
      'pending': ['approved', 'declined', 'cancelled'],
      'approved': ['completed', 'cancelled', 'ongoing'],
      'ongoing': ['completed']
    };
    
    if (allowedTransitions[booking.status] && 
        !allowedTransitions[booking.status].includes(status)) {
      res.status(400);
      throw new Error(`Station master cannot change booking from ${booking.status} to ${status}`);
    }
  }

  // Calculate lateness if completing a ride
  let lateReturnMinutes = 0;
  let calculatedPenaltyAmount = 0;
  let latePenaltyReason = '';

  if (status === 'completed' && booking.status === 'ongoing') {
    const endTime = new Date(booking.endTime);
    const now = new Date();
    
    // Check if return is late
    if (now > endTime) {
      lateReturnMinutes = Math.ceil((now - endTime) / (1000 * 60));
      
      // Calculate penalty - $1 per minute late, for example
      calculatedPenaltyAmount = Math.min(lateReturnMinutes, 120); // Cap at $120
      
      if (lateReturnMinutes > 0) {
        latePenaltyReason = `Late return by ${lateReturnMinutes} minutes`;
      }
    }
  }

  // Update booking with new status
  booking.status = status;
  
  // Apply penalties if applicable
  if (status === 'penalized' || calculatedPenaltyAmount > 0) {
    booking.hasPenalty = true;
    booking.penaltyAmount = penaltyAmount || calculatedPenaltyAmount;
    booking.penaltyReason = penaltyReason || latePenaltyReason;
  }
  
  // Add damage report if provided
  if (damageReport) {
    booking.damageReport = damageReport;
    booking.hasPenalty = true;
    
    // If no explicit penalty amount is set, default to a minimum
    if (!booking.penaltyAmount) {
      booking.penaltyAmount = 50; // Default penalty for damage report
    }
    
    // Add to penalty reason
    if (booking.penaltyReason) {
      booking.penaltyReason += '; ' + damageReport;
    } else {
      booking.penaltyReason = damageReport;
    }
  }

  // If status is 'ongoing', update the startTime to now
  if (status === 'ongoing') {
    booking.startTime = new Date();
    
    // Update the EV status
    const ev = await EV.findById(booking.evId);
    if (ev) {
      ev.status = 'in-use';
      await ev.save();
      
      // Decrement availableEVs count at the start station
      await Station.findByIdAndUpdate(
        booking.startStationId,
        { $inc: { availableEVs: -1 } }
      );
    }
  }

  // If status is 'completed', update the actualEndTime to now
  if (status === 'completed') {
    booking.actualEndTime = new Date();
    
    // Calculate total cost if needed (based on actual usage time)
    if (!booking.totalCost) {
      const ev = await EV.findById(booking.evId);
      const startTime = new Date(booking.startTime);
      const endTime = new Date();
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);
      
      booking.totalCost = Math.ceil(durationHours * ev.pricePerHour);
    }
    
    // Update the EV status back to available
    const ev = await EV.findById(booking.evId);
    if (ev) {
      ev.status = 'available';
      
      // Set currentStation to either the endStationId from the booking or the station
      // that was already set on the EV, ensuring it's never null/undefined
      ev.currentStation = booking.endStationId || ev.station || ev.currentStation;
      
      // Also update the station field for backward compatibility
      ev.station = ev.currentStation;
      
      console.log(`Setting EV ${ev._id} current station to ${ev.currentStation}`);
      await ev.save();
      
      // Increment availableEVs count at the end station
      await Station.findByIdAndUpdate(
        booking.endStationId,
        { $inc: { availableEVs: 1 } }
      );
    }
  }

  const updatedBooking = await booking.save();

  // Send notification if needed
  // ... (existing notification code)

  res.status(200).json(updatedBooking);
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
    
    // Increment the availableEVs count at the start station
    await Station.findByIdAndUpdate(
      booking.startStationId,
      { $inc: { availableEVs: 1 } }
    );
  }

  const updatedBooking = await booking.save();
  res.json(updatedBooking);
});

// @desc    Report damage for a booking
// @route   POST /api/bookings/:id/damage-report
// @access  Private/Admin/StationMaster
const reportDamage = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'name email')
    .populate('evId', 'manufacturer model registrationNumber');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only admins and station masters can report damage
  if (req.user.role !== 'admin' && req.user.role !== 'stationMaster') {
    res.status(401);
    throw new Error('Not authorized to report damage');
  }

  const { damageDescription, penaltyAmount, images } = req.body;

  if (!damageDescription) {
    res.status(400);
    throw new Error('Damage description is required');
  }

  booking.damageReport = damageDescription;
  booking.hasPenalty = true;
  booking.penaltyAmount = penaltyAmount || 50; // Default penalty amount
  booking.penaltyReason = `Vehicle damage: ${damageDescription}`;
  
  if (images && images.length > 0) {
    booking.damageImages = images;
  }

  // Change status to penalized
  booking.status = 'penalized';

  const updatedBooking = await booking.save();

  // Send notification to customer
  // ... (implement notification logic)

  res.status(200).json(updatedBooking);
});

// @desc    Get penalty statistics
// @route   GET /api/bookings/penalty-stats
// @access  Private/Admin
const getPenaltyStatistics = asyncHandler(async (req, res) => {
  console.log('Fetching penalty statistics...');
  
  const penaltyBookings = await Booking.find({
    $or: [
      { hasPenalty: true },
      { penalty: { $exists: true } }
    ]
  })
  .populate('customerId', 'name email')
  .populate('evId', 'model manufacturer registrationNumber')
  .select('customerId evId penalty penaltyAmount penaltyReason hasPenalty createdAt updatedAt');

  console.log(`Found ${penaltyBookings.length} bookings with penalties`);
  
  // Handle case of no penalty bookings
  if (penaltyBookings.length === 0) {
    return res.json({
      totalPenaltyCount: 0,
      totalPenaltyAmount: 0,
      customerPenalties: []
    });
  }

  // Calculate summary statistics
  const totalPenaltyAmount = penaltyBookings.reduce((total, booking) => {
    const amount = booking.penalty ? booking.penalty.amount : booking.penaltyAmount || 0;
    return total + amount;
  }, 0);

  // Group penalties by customer
  const customerPenalties = {};
  
  penaltyBookings.forEach(booking => {
    // Skip bookings with missing customer info
    if (!booking.customerId) {
      console.log('Skipping booking with missing customer:', booking._id);
      return;
    }
    
    const customerId = booking.customerId._id.toString();
    const customerName = booking.customerId.name || 'Unknown';
    const customerEmail = booking.customerId.email || 'No email';
    const amount = booking.penalty ? booking.penalty.amount : booking.penaltyAmount || 0;
    
    if (!customerPenalties[customerId]) {
      customerPenalties[customerId] = {
        customerId,
        customerName,
        customerEmail,
        totalAmount: 0,
        count: 0,
        bookings: []
      };
    }
    
    customerPenalties[customerId].totalAmount += amount;
    customerPenalties[customerId].count += 1;
    customerPenalties[customerId].bookings.push({
      bookingId: booking._id,
      amount: amount,
      reason: booking.penalty?.reason || booking.penaltyReason || 'Unknown reason',
      date: booking.penalty?.timestamp || booking.updatedAt,
      vehicle: `${booking.evId?.manufacturer || ''} ${booking.evId?.model || ''} (${booking.evId?.registrationNumber || 'Unknown'})`
    });
  });

  res.json({
    totalPenaltyCount: penaltyBookings.length,
    totalPenaltyAmount,
    customerPenalties: Object.values(customerPenalties)
  });
});

// @desc    Update booking location and penalty
// @route   PUT /api/bookings/:id/location
// @access  Private
const updateBookingLocation = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Update location if provided
  if (req.body.location) {
    booking.lastKnownLocation = {
      type: 'Point',
      coordinates: [req.body.location.longitude, req.body.location.latitude],
      timestamp: new Date()
    };
  }

  // Update penalty if provided
  if (req.body.penalty) {
    booking.penalty = req.body.penalty;
  }

  const updatedBooking = await booking.save();

  res.json(updatedBooking);
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 1000; // Convert to meters
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// @desc    Complete a ride
// @route   PUT /api/bookings/:id/complete
// @access  Private
const completeRide = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id)
      .populate('evId')
      .populate('startStationId')
      .populate('endStationId');

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'completed') {
      throw new Error('Ride is already completed');
    }

    // Update booking status
    booking.status = 'completed';
    booking.endTime = new Date();
    await booking.save({ session });

    // Update EV status and location
    await EV.findByIdAndUpdate(
      booking.evId._id,
      {
        status: 'available',
        station: booking.endStationId._id,
        batteryLevel: req.body.batteryLevel || booking.evId.batteryLevel
      },
      { session }
    );

    // Remove EV from start station and decrease count
    await Station.findByIdAndUpdate(
      booking.startStationId._id,
      {
        $pull: { evs: booking.evId._id }
      },
      { session }
    );

    // Add EV to end station and increase count
    await Station.findByIdAndUpdate(
      booking.endStationId._id,
      {
        $addToSet: { evs: booking.evId._id },
        $inc: { availableEVs: 1 }
      },
      { session }
    );

    await session.commitTransaction();

    // Return updated booking with populated fields
    const updatedBooking = await Booking.findById(booking._id)
      .populate('evId')
      .populate('startStationId')
      .populate('endStationId')
      .populate('userId');

    res.json(updatedBooking);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// @desc    Add test penalty to a booking (for testing only)
// @route   POST /api/bookings/:id/test-penalty
// @access  Private/Admin (development only)
const addTestPenalty = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('evId', 'model manufacturer registrationNumber');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  const { penaltyAmount, reason } = req.body;
  const amount = penaltyAmount || 100;
  const penaltyReason = reason || 'Test penalty for development purposes';

  // Add penalty to booking (new format)
  booking.penalty = {
    amount: amount,
    reason: penaltyReason,
    timestamp: new Date().toISOString()
  };
  
  // Also set legacy fields for compatibility
  booking.hasPenalty = true;
  booking.penaltyAmount = amount;
  booking.penaltyReason = penaltyReason;

  const updatedBooking = await booking.save();
  res.json(updatedBooking);
});

export {
  createBooking,
  getBookings,
  getBookingById,
  getMyBookings,
  updateBookingStatus,
  reportDamage,
  getPenaltyStatistics,
  updateBookingLocation,
  cancelBooking,
  completeRide,
  addTestPenalty,
}; 