import asyncHandler from '../middleware/asyncHandler.js';
import Ride from '../models/rideModel.js';
import Booking from '../models/bookingModel.js';
import EV from '../models/evModel.js';
import User from '../models/userModel.js';
import { calculateDistance } from '../utils/geoUtils.js';
import { createNotification } from './notificationController.js';

// @desc    Start a new ride
// @route   POST /api/rides/start
// @access  Private
const startRide = asyncHandler(async (req, res) => {
  console.log('Starting ride with data:', req.body);
  const { bookingId, startLocationLat, startLocationLng } = req.body;

  if (!bookingId || !startLocationLat || !startLocationLng) {
    res.status(400);
    throw new Error('Please provide booking ID and start location');
  }

  // Find the booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Check if booking belongs to the user
  if (booking.customerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized access to this booking');
  }

  // Check if booking is in 'approved' status
  if (booking.status !== 'approved') {
    res.status(400);
    throw new Error(`Cannot start ride. Booking status is ${booking.status}, but needs to be 'approved'`);
  }

  // Check if there's already an active ride for this booking
  const existingRide = await Ride.findOne({
    booking: bookingId,
    status: 'active',
  });

  if (existingRide) {
    res.status(400);
    throw new Error('An active ride already exists for this booking');
  }

  // Get the EV information
  const ev = await EV.findById(booking.evId);
  if (!ev) {
    res.status(404);
    throw new Error('EV not found');
  }

  // Check if EV is available
  if (!ev.isAvailable) {
    res.status(400);
    throw new Error('This EV is currently not available');
  }

  // Create a new ride
  const ride = await Ride.create({
    user: req.user._id,
    ev: booking.evId,
    booking: bookingId,
    startTime: new Date(),
    startLocation: {
      type: 'Point',
      coordinates: [parseFloat(startLocationLng), parseFloat(startLocationLat)],
    },
    status: 'active',
  });

  // Update booking status
  booking.status = 'ongoing';
  await booking.save();

  // Mark EV as unavailable
  ev.isAvailable = false;
  ev.currentLocation = {
    type: 'Point',
    coordinates: [parseFloat(startLocationLng), parseFloat(startLocationLat)],
  };
  await ev.save();

  // Create notification
  await createNotification({
    userId: req.user._id,
    type: 'info',
    message: 'Your ride has started',
    description: `Your ride with ${ev.manufacturer} ${ev.model} has started. Enjoy your journey!`,
    link: `/ride/${ride._id}`,
  });

  res.status(201).json({
    _id: ride._id,
    status: ride.status,
    startTime: ride.startTime,
    ev: {
      _id: ev._id,
      manufacturer: ev.manufacturer,
      model: ev.model,
      licensePlate: ev.licensePlate,
    },
    message: 'Ride started successfully',
  });
});

// @desc    End an active ride
// @route   PUT /api/rides/:id/end
// @access  Private
const endRide = asyncHandler(async (req, res) => {
  const { endLocationLat, endLocationLng } = req.body;

  if (!endLocationLat || !endLocationLng) {
    res.status(400);
    throw new Error('Please provide end location');
  }

  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    res.status(404);
    throw new Error('Ride not found');
  }

  // Check if ride belongs to the user
  if (ride.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'stationMaster') {
    res.status(403);
    throw new Error('Unauthorized access to this ride');
  }

  // Check if ride is active
  if (ride.status !== 'active') {
    res.status(400);
    throw new Error('Cannot end ride. Ride is not active');
  }

  // Calculate distance traveled
  const startCoords = ride.startLocation.coordinates;
  const endCoords = [parseFloat(endLocationLng), parseFloat(endLocationLat)];
  
  const distanceInKm = calculateDistance(
    startCoords[1], startCoords[0], 
    parseFloat(endLocationLat), parseFloat(endLocationLng)
  );

  // Get the booking and EV
  const booking = await Booking.findById(ride.booking);
  const ev = await EV.findById(ride.ev);

  if (!booking || !ev) {
    res.status(500);
    throw new Error('Associated booking or EV not found');
  }

  // Calculate cost based on distance and booking rates
  let cost = booking.baseRate;
  if (distanceInKm > booking.includedKm) {
    const extraKm = distanceInKm - booking.includedKm;
    cost += extraKm * booking.extraKmRate;
  }

  // Update ride details
  ride.endTime = new Date();
  ride.endLocation = {
    type: 'Point',
    coordinates: endCoords,
  };
  ride.distanceTraveled = distanceInKm;
  ride.status = 'completed';
  ride.cost = cost;
  ride.isActive = false;

  await ride.save();

  // Update booking status
  booking.status = 'completed';
  booking.finalCost = cost;
  await booking.save();

  // Update EV status and location
  ev.isAvailable = true;
  ev.currentLocation = {
    type: 'Point',
    coordinates: endCoords,
  };
  await ev.save();

  // Create notification
  await createNotification({
    userId: ride.user,
    type: 'success',
    message: 'Your ride has been completed',
    description: `Your ride with ${ev.manufacturer} ${ev.model} has ended. Total distance: ${distanceInKm.toFixed(2)} km. Cost: $${cost.toFixed(2)}.`,
    link: `/ride/${ride._id}`,
  });

  res.json({
    _id: ride._id,
    status: ride.status,
    startTime: ride.startTime,
    endTime: ride.endTime,
    distanceTraveled: ride.distanceTraveled,
    cost: ride.cost,
    message: 'Ride ended successfully',
  });
});

// @desc    Get ride details
// @route   GET /api/rides/:id
// @access  Private
const getRideDetails = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id)
    .populate('user', 'name email')
    .populate('ev', 'manufacturer model licensePlate')
    .populate('booking', 'bookedTime returnTime baseRate includedKm extraKmRate');

  if (!ride) {
    res.status(404);
    throw new Error('Ride not found');
  }

  // Check if ride belongs to the user or user is admin/station master
  if (ride.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'stationMaster') {
    res.status(403);
    throw new Error('Unauthorized access to this ride');
  }

  res.json(ride);
});

// @desc    Get active ride for the logged-in user
// @route   GET /api/rides/active
// @access  Private
const getActiveRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findOne({
    user: req.user._id,
    status: 'active',
  })
    .populate('user', 'name email')
    .populate('ev', 'manufacturer model licensePlate image currentLocation')
    .populate('booking', 'bookedTime returnTime baseRate includedKm extraKmRate');

  if (!ride) {
    return res.json(null);
  }

  res.json(ride);
});

// @desc    Get active ride for a specific customer (admin/station master use)
// @route   GET /api/rides/customer/:id/active
// @access  Private/Admin/StationMaster
const getCustomerActiveRide = asyncHandler(async (req, res) => {
  // Check if user is admin or station master
  if (req.user.role !== 'admin' && req.user.role !== 'stationMaster') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const userId = req.params.id;
  const ride = await Ride.findOne({
    user: userId,
    status: 'active',
  })
    .populate('user', 'name email')
    .populate('ev', 'manufacturer model licensePlate image currentLocation')
    .populate('booking', 'bookedTime returnTime baseRate includedKm extraKmRate');

  if (!ride) {
    return res.json(null);
  }

  res.json(ride);
});

// @desc    Get all rides
// @route   GET /api/rides
// @access  Private/Admin/StationMaster
const getRides = asyncHandler(async (req, res) => {
  // Check if user is admin or station master
  if (req.user.role !== 'admin' && req.user.role !== 'stationMaster') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Ride.countDocuments({});
  const rides = await Ride.find({})
    .populate('user', 'name email')
    .populate('ev', 'manufacturer model licensePlate')
    .populate('booking', 'bookedTime returnTime')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    rides,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  });
});

// @desc    Get user ride history
// @route   GET /api/rides/history
// @access  Private
const getUserRideHistory = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const count = await Ride.countDocuments({ user: req.user._id });
  const rides = await Ride.find({ user: req.user._id })
    .populate('ev', 'manufacturer model licensePlate image')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    rides,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  });
});

// @desc    Rate a completed ride
// @route   POST /api/rides/:id/rate
// @access  Private
const rateRide = asyncHandler(async (req, res) => {
  const { rating, feedback } = req.body;

  if (!rating) {
    res.status(400);
    throw new Error('Please provide a rating');
  }

  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    res.status(404);
    throw new Error('Ride not found');
  }

  // Check if ride belongs to the user
  if (ride.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized access to this ride');
  }

  // Check if ride is completed
  if (ride.status !== 'completed') {
    res.status(400);
    throw new Error('Cannot rate ride. Ride is not completed');
  }

  // Update ride rating
  ride.rating = rating;
  ride.feedback = feedback || '';
  await ride.save();

  // Get EV to update its average rating
  const ev = await EV.findById(ride.ev);
  if (ev) {
    // Find all rated rides for this EV
    const allRatings = await Ride.find({ 
      ev: ev._id, 
      rating: { $ne: null } 
    });
    
    if (allRatings.length > 0) {
      const totalRating = allRatings.reduce((sum, ride) => sum + ride.rating, 0);
      ev.rating = (totalRating / allRatings.length).toFixed(1);
      await ev.save();
    }
  }

  res.json({
    _id: ride._id,
    rating: ride.rating,
    feedback: ride.feedback,
    message: 'Ride rated successfully',
  });
});

// @desc    Report an issue with a ride
// @route   POST /api/rides/:id/report
// @access  Private
const reportRideIssue = asyncHandler(async (req, res) => {
  const { issue, details } = req.body;

  if (!issue) {
    res.status(400);
    throw new Error('Please provide issue details');
  }

  const ride = await Ride.findById(req.params.id);

  if (!ride) {
    res.status(404);
    throw new Error('Ride not found');
  }

  // Check if ride belongs to the user
  if (ride.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized access to this ride');
  }

  // Add issue to ride
  ride.issues.push({
    issue,
    details: details || '',
    reportedAt: new Date(),
    resolved: false,
  });

  await ride.save();

  // Notify admins and station masters
  const admins = await User.find({ role: { $in: ['admin', 'stationMaster'] } });
  
  for (const admin of admins) {
    await createNotification({
      userId: admin._id,
      type: 'warning',
      message: 'New ride issue reported',
      description: `User ${req.user.name} reported issue: ${issue}`,
      link: `/admin/ride/${ride._id}`,
    });
  }

  res.json({
    _id: ride._id,
    issues: ride.issues,
    message: 'Issue reported successfully',
  });
});

// @desc    Get ride statistics
// @route   GET /api/rides/stats
// @access  Private/Admin/StationMaster
const getRideStats = asyncHandler(async (req, res) => {
  // Check if user is admin or station master
  if (req.user.role !== 'admin' && req.user.role !== 'stationMaster') {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Get total number of rides
  const totalRides = await Ride.countDocuments({});
  
  // Get number of active rides
  const activeRides = await Ride.countDocuments({ status: 'active' });
  
  // Get number of completed rides
  const completedRides = await Ride.countDocuments({ status: 'completed' });
  
  // Get number of cancelled rides
  const cancelledRides = await Ride.countDocuments({ status: 'cancelled' });
  
  // Get total distance traveled
  const distanceResult = await Ride.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, totalDistance: { $sum: '$distanceTraveled' } } }
  ]);
  
  const totalDistance = distanceResult.length > 0 ? distanceResult[0].totalDistance : 0;
  
  // Get total revenue
  const revenueResult = await Ride.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, totalRevenue: { $sum: '$cost' } } }
  ]);
  
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
  
  // Get average ride rating
  const ratingResult = await Ride.aggregate([
    { $match: { rating: { $ne: null } } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  
  const avgRating = ratingResult.length > 0 ? ratingResult[0].avgRating : 0;
  
  // Get rides per day for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const ridesPerDay = await Promise.all(
    last7Days.map(async (date) => {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      
      const count = await Ride.countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });
      
      return { date, count };
    })
  );
  
  res.json({
    totalRides,
    activeRides,
    completedRides,
    cancelledRides,
    totalDistance,
    totalRevenue,
    avgRating,
    ridesPerDay,
  });
});

export {
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
}; 