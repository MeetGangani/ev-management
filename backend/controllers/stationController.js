import asyncHandler from 'express-async-handler';
import Station from '../models/stationModel.js';
import User from '../models/userModel.js';

// @desc    Get all stations
// @route   GET /api/stations
// @access  Public (for basic info) / Private (for detailed info)
const getStations = asyncHandler(async (req, res) => {
  const stations = await Station.find({})
    .select('-createdAt -updatedAt -__v')
    .populate('stationMasterId', 'name email');

  res.json(stations);
});

// @desc    Get station by ID
// @route   GET /api/stations/:id
// @access  Public (for basic info) / Private (for detailed info)
const getStationById = asyncHandler(async (req, res) => {
  const station = await Station.findById(req.params.id)
    .populate('stationMasterId', 'name email')
    .populate('evs');

  if (station) {
    res.json(station);
  } else {
    res.status(404);
    throw new Error('Station not found');
  }
});

// @desc    Get nearest stations based on coordinates
// @route   GET /api/stations/nearest
// @access  Public (for customers)
const getNearestStations = asyncHandler(async (req, res) => {
  // Support both naming conventions (lat/lng and latitude/longitude)
  const { longitude, latitude, lng, lat, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km

  // Use either format, preferring the latitude/longitude format if both are provided
  const longitudeValue = longitude || lng;
  const latitudeValue = latitude || lat;

  if (!longitudeValue || !latitudeValue) {
    res.status(400);
    throw new Error('Longitude and latitude are required');
  }

  // Convert string params to numbers
  const lng_float = parseFloat(longitudeValue);
  const lat_float = parseFloat(latitudeValue);
  const maxDist = parseFloat(maxDistance);

  if (isNaN(lng_float) || isNaN(lat_float) || isNaN(maxDist)) {
    res.status(400);
    throw new Error('Invalid longitude, latitude, or maxDistance');
  }

  // GeoJSON point
  const point = {
    type: 'Point',
    coordinates: [lng_float, lat_float]
  };

  // Find stations within maxDistance
  const stations = await Station.find({
    'geofenceParameters.coordinates': {
      $near: {
        $geometry: point,
        $maxDistance: maxDist
      }
    },
    status: 'active' // Only active stations
  }).select('-createdAt -updatedAt -__v');

  res.json(stations);
});

// @desc    Create a station
// @route   POST /api/stations
// @access  Private/Admin
const createStation = asyncHandler(async (req, res) => {
  const {
    name,
    address,
    operatingHours,
    stationMasterId,
    geofenceParameters
  } = req.body;

  // Verify the station master if provided
  if (stationMasterId) {
    const stationMaster = await User.findById(stationMasterId);
    if (!stationMaster || stationMaster.role !== 'stationMaster') {
      res.status(400);
      throw new Error('Invalid station master');
    }
  }

  const station = await Station.create({
    name,
    address,
    operatingHours,
    stationMasterId: stationMasterId || null,
    geofenceParameters
  });

  if (station) {
    res.status(201).json(station);
  } else {
    res.status(400);
    throw new Error('Invalid station data');
  }
});

// @desc    Update a station
// @route   PUT /api/stations/:id
// @access  Private/Admin
const updateStation = asyncHandler(async (req, res) => {
  const station = await Station.findById(req.params.id);

  if (!station) {
    res.status(404);
    throw new Error('Station not found');
  }

  try {
    // Validate the incoming data
    const {
      name,
      address,
      operatingHours,
      stationMasterId,
      geofenceParameters
    } = req.body;

    // Verify the station master if provided
    if (stationMasterId) {
      const stationMaster = await User.findById(stationMasterId);
      if (!stationMaster || stationMaster.role !== 'stationMaster') {
        res.status(400);
        throw new Error('Invalid station master');
      }
    }

    // Validate coordinates
    if (geofenceParameters && geofenceParameters.coordinates) {
      const [longitude, latitude] = geofenceParameters.coordinates;
      if (
        !Array.isArray(geofenceParameters.coordinates) ||
        geofenceParameters.coordinates.length !== 2 ||
        typeof longitude !== 'number' ||
        typeof latitude !== 'number' ||
        latitude < -90 || latitude > 90 ||
        longitude < -180 || longitude > 180
      ) {
        res.status(400);
        throw new Error('Invalid coordinates');
      }
    }

    // Update the station
    const updatedStation = await Station.findByIdAndUpdate(
      req.params.id,
      {
        name,
        address,
        operatingHours,
        stationMasterId,
        geofenceParameters,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.json(updatedStation);
  } catch (error) {
    console.error('Station update error:', error);
    res.status(400);
    throw new Error(error.message || 'Failed to update station');
  }
});

// @desc    Delete a station
// @route   DELETE /api/stations/:id
// @access  Private/Admin
const deleteStation = asyncHandler(async (req, res) => {
  const station = await Station.findById(req.params.id);

  if (!station) {
    res.status(404);
    throw new Error('Station not found');
  }

  // Check if there are EVs associated with this station
  if (station.evs && station.evs.length > 0) {
    res.status(400);
    throw new Error('Cannot delete station with associated EVs. Please reassign or delete the EVs first.');
  }

  await station.deleteOne();
  res.json({ message: 'Station removed' });
});

// @desc    Get station availability
// @route   GET /api/stations/:id/availability
// @access  Public
const getStationAvailability = asyncHandler(async (req, res) => {
  const station = await Station.findById(req.params.id)
    .populate({
      path: 'evs',
      select: 'status batteryLevel model manufacturer'
    });

  if (!station) {
    res.status(404);
    throw new Error('Station not found');
  }

  const availability = {
    totalEVs: station.evs.length,
    availableEVs: station.evs.filter(ev => ev.status === 'available').length,
    evs: station.evs.map(ev => ({
      id: ev._id,
      model: ev.model,
      manufacturer: ev.manufacturer,
      status: ev.status,
      batteryLevel: ev.batteryLevel
    }))
  };

  res.json(availability);
});

export {
  getStations,
  getStationById,
  getNearestStations,
  createStation,
  updateStation,
  deleteStation,
  getStationAvailability
}; 