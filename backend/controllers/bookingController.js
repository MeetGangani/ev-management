import asyncHandler from 'express-async-handler';
import Booking from '../models/bookingModel.js';
import EV from '../models/evModel.js';
import Station from '../models/stationModel.js';
import User from '../models/userModel.js';
import Penalty from '../models/penaltyModel.js';
import Payment from '../models/paymentModel.js';

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
// @access  Private/Admin/StationMaster/Customer
const updateBookingStatus = asyncHandler(async (req, res) => {
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

  // Validate status transition
  if (!['approved', 'declined', 'cancelled', 'ongoing', 'completed', 'penalized'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

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
      await ev.save();
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
  if (req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to access penalty statistics');
  }

  // Get penalty statistics
  const totalPenalizedBookings = await Booking.countDocuments({ hasPenalty: true });
  const totalPenaltyAmount = await Booking.aggregate([
    { $match: { hasPenalty: true } },
    { $group: { _id: null, total: { $sum: "$penaltyAmount" } } }
  ]);
  
  // Get penalty types breakdown
  const lateReturnCount = await Booking.countDocuments({
    penaltyReason: { $regex: /late return/i }
  });
  
  const damageCount = await Booking.countDocuments({
    damageReport: { $exists: true, $ne: "" }
  });
  
  const otherPenaltyCount = totalPenalizedBookings - (lateReturnCount + damageCount);

  res.status(200).json({
    totalPenalizedBookings,
    totalPenaltyAmount: totalPenaltyAmount.length > 0 ? totalPenaltyAmount[0].total : 0,
    penaltyBreakdown: {
      lateReturn: lateReturnCount,
      damage: damageCount,
      other: otherPenaltyCount
    }
  });
});

// @desc    Update booking location
// @route   PUT /api/bookings/:id/location
// @access  Private/Customer
const updateBookingLocation = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customerId')
    .populate('startStationId')
    .populate('evId');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only the customer who owns the booking can update its location
  if (req.user._id.toString() !== booking.customerId._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this booking');
  }

  // Only allow location updates for ongoing bookings
  if (booking.status !== 'ongoing') {
    res.status(400);
    throw new Error('Location can only be updated for ongoing bookings');
  }

  const { location } = req.body;

  if (!location || !location.latitude || !location.longitude) {
    res.status(400);
    throw new Error('Location data is required (latitude, longitude)');
  }

  // Create Point geometry
  const point = {
    type: 'Point',
    coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)],
  };

  // Add timestamp to the location
  const locationWithTimestamp = {
    ...point,
    timestamp: new Date(),
  };

  // Update the booking's last known location
  booking.lastKnownLocation = locationWithTimestamp;

  // Check if within geofence (station radius)
  const stationLng = booking.startStationId.location.coordinates[0];
  const stationLat = booking.startStationId.location.coordinates[1];
  const stationRadius = booking.startStationId.radius || 100; // default to 100m if not specified

  // Calculate distance between current location and station
  const distanceToStation = calculateDistance(
    location.latitude,
    location.longitude,
    stationLat,
    stationLng
  );

  // Determine if within geofence
  const isWithinGeofence = distanceToStation <= stationRadius;

  // If this is the first location update for an ongoing booking, set start location
  if (booking.status === 'ongoing' && !booking.geofenceData?.startLocation) {
    booking.geofenceData = {
      ...booking.geofenceData,
      startLocation: point,
    };
  }

  const updatedBooking = await booking.save();

  res.status(200).json({
    bookingId: updatedBooking._id,
    lastKnownLocation: updatedBooking.lastKnownLocation,
    isWithinGeofence,
    distance: distanceToStation,
    stationRadius
  });
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

// @desc    Apply penalty to a booking
// @route   POST /api/bookings/:id/apply-penalty
// @access  Private/Admin/StationMaster
const applyPenaltyToBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customerId', 'name email')
    .populate('evId', 'manufacturer model registrationNumber');

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only admins and station masters can apply penalties
  if (req.user.role !== 'admin' && req.user.role !== 'stationMaster') {
    res.status(401);
    throw new Error('Not authorized to apply penalties');
  }

  const { penaltyType, description, amount, evidence } = req.body;

  if (!penaltyType || !description || !amount) {
    res.status(400);
    throw new Error('Penalty type, description and amount are required');
  }

  // Create a new penalty record
  const penalty = new Penalty({
    bookingId: booking._id,
    userId: booking.customerId._id,
    type: penaltyType,
    amount: parseFloat(amount),
    title: penaltyType.charAt(0).toUpperCase() + penaltyType.slice(1).replace('_', ' '),
    description: description,
    details: {
      appliedBy: req.user._id,
      appliedByRole: req.user.role,
      evidence: evidence || [],
      timestamp: new Date().toISOString()
    },
    status: 'pending'
  });

  await penalty.save();

  // Update the booking with penalty reference if it has penalties array
  if (booking.penalties) {
    booking.penalties.push(penalty._id);
  } else {
    booking.penalties = [penalty._id];
  }

  // Update penalty amounts in booking
  booking.hasPenalty = true;
  
  // Add to totalPenaltyAmount if exists, otherwise create it
  if (booking.totalPenaltyAmount) {
    booking.totalPenaltyAmount += penalty.amount;
  } else {
    booking.totalPenaltyAmount = penalty.amount;
  }

  // If this is the first penalty, set the penalty reason directly
  if (!booking.penaltyReason) {
    booking.penaltyReason = description;
  } else {
    booking.penaltyReason += '; ' + description;
  }

  // If there's no penaltyAmount field, initialize it
  if (!booking.penaltyAmount) {
    booking.penaltyAmount = penalty.amount;
  } else {
    booking.penaltyAmount += penalty.amount;
  }

  // Update finalAmount if it exists
  if (booking.finalAmount) {
    booking.finalAmount += penalty.amount;
  }

  // If booking is completed, don't change status
  // If it's not completed yet, mark as penalized
  if (booking.status !== 'completed') {
    booking.status = 'penalized';
  }

  await booking.save();

  // Send notification to customer about the penalty
  // ... (notification logic would go here)

  res.status(200).json({
    success: true,
    message: 'Penalty applied successfully',
    penalty,
    booking
  });
});

// Function to complete a booking
const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { locationData } = req.body; // Contains final location information
    
    // Find the booking
    const booking = await Booking.findById(id)
      .populate('evId')
      .populate('startStationId')
      .populate('endStationId')
      .populate('customerId');
    
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }
    
    // Check if the booking is active
    if (booking.status !== 'ongoing') {
      return errorResponse(res, 'Only ongoing bookings can be completed', 400);
    }
    
    // Set end time and calculate duration
    const endTime = new Date();
    const durationMs = endTime - booking.startTime;
    const durationMinutes = Math.ceil(durationMs / (1000 * 60)); // Round up to nearest minute
    
    // Calculate the final cost based on duration and vehicle rate
    const vehicleRate = booking.evId.pricePerHour / 60 || 1; // Default to 1 if not specified
    const baseCost = durationMinutes * vehicleRate;
    
    // Get any existing penalties
    const penalties = await Penalty.find({ bookingId: id });
    const penaltyAmount = penalties.reduce((sum, penalty) => sum + penalty.amount, 0);
    
    // Calculate final amount with penalties
    const finalAmount = baseCost + penaltyAmount;
    
    // Add improper parking penalty if far from destination station
    if (locationData && booking.endStationId) {
      const endStationLocation = {
        lat: booking.endStationId.latitude || booking.endStationId.location?.lat, 
        lng: booking.endStationId.longitude || booking.endStationId.location?.lng
      };
      
      if (endStationLocation.lat && endStationLocation.lng && 
          locationData.position && locationData.position.lat && locationData.position.lng) {
        const distance = calculateDistance(
          locationData.position.lat,
          locationData.position.lng,
          endStationLocation.lat,
          endStationLocation.lng
        );
        
        // If more than 50 meters away from station, apply improper parking penalty
        if (distance > 50) {
          const penaltyAmount = 200; // Base penalty amount
          let multiplier = 1;
          
          if (distance > 100) multiplier = 1.5;
          if (distance > 500) multiplier = 2;
          
          const improperParkingPenalty = new Penalty({
            bookingId: id,
            userId: booking.customerId._id,
            type: 'improper_parking',
            amount: penaltyAmount * multiplier,
            title: 'Improper Parking',
            description: 'Penalty for returning vehicle outside designated area',
            details: {
              location: locationData.position,
              distanceFromStation: distance,
              timestamp: new Date().toISOString()
            },
            status: 'pending'
          });
          
          await improperParkingPenalty.save();
          
          // Add to booking
          booking.penalties.push(improperParkingPenalty._id);
          booking.totalPenaltyAmount += improperParkingPenalty.amount;
        }
      }
    }
    
    // Update the booking
    booking.endTime = endTime;
    booking.status = 'completed';
    booking.totalDuration = durationMinutes;
    booking.finalLocation = locationData?.position || null;
    booking.baseCost = baseCost;
    booking.finalAmount = finalAmount;
    
    // Update the EV status
    await EV.findByIdAndUpdate(booking.evId._id, {
      currentStationId: booking.endStationId._id,
      status: 'available',
      currentLocation: locationData?.position || null
    });
    
    // Update user stats
    await User.findByIdAndUpdate(booking.customerId._id, {
      $inc: {
        totalRides: 1,
        totalSpent: finalAmount
      }
    });
    
    // Save the booking with all updates
    await booking.save();
    
    // Create payment entry if needed
    if (finalAmount > 0) {
      const payment = new Payment({
        userId: booking.customerId._id,
        bookingId: booking._id,
        amount: finalAmount,
        status: 'pending',
        description: `Payment for ride #${booking._id}`
      });
      
      await payment.save();
      
      // Add payment reference to booking
      booking.paymentId = payment._id;
      await booking.save();
    }
    
    return successResponse(res, 'Booking completed successfully', {
      booking,
      duration: durationMinutes,
      baseCost,
      penaltyAmount,
      finalAmount
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    return errorResponse(res, 'Failed to complete booking', 500);
  }
};

// @desc    Search bookings by ID or customer name
// @route   POST /api/bookings/search
// @access  Private/Admin/StationMaster
const searchBookings = asyncHandler(async (req, res) => {
  const { query } = req.body;

  // Only admins and station masters can search bookings
  if (req.user.role !== 'admin' && req.user.role !== 'stationMaster') {
    res.status(401);
    throw new Error('Not authorized to search bookings');
  }

  let bookings = [];

  // If the query looks like an ObjectId, try to search by ID first
  if (query.match(/^[0-9a-fA-F]{24}$/)) {
    const bookingById = await Booking.findById(query)
      .populate('customerId', 'name email phone')
      .populate('evId', 'model manufacturer')
      .populate('startStationId', 'name')
      .populate('endStationId', 'name');
    
    if (bookingById) {
      bookings.push(bookingById);
    }
  }

  // If no results by ID (or ID search wasn't performed), search by customer name
  if (bookings.length === 0) {
    // First find users that match the query
    const users = await User.find({ 
      name: { $regex: query, $options: 'i' } 
    }).select('_id');
    
    const userIds = users.map(user => user._id);
    
    // Then find bookings for those users
    if (userIds.length > 0) {
      bookings = await Booking.find({ 
        customerId: { $in: userIds } 
      })
        .populate('customerId', 'name email phone')
        .populate('evId', 'model manufacturer')
        .populate('startStationId', 'name')
        .populate('endStationId', 'name')
        .sort({ createdAt: -1 })
        .limit(20);
    }
  }

  res.status(200).json(bookings);
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
  completeBooking,
  applyPenaltyToBooking,
  searchBookings
}; 