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
  const {
    name,
    address,
    operatingHours,
    stationMasterId,
    geofenceParameters,
    status
  } = req.body;

  const station = await Station.findById(req.params.id);

  if (!station) {
    res.status(404);
    throw new Error('Station not found');
  }

  // Verify the station master if provided
  if (stationMasterId && stationMasterId !== station.stationMasterId.toString()) {
    const stationMaster = await User.findById(stationMasterId);
    if (!stationMaster || stationMaster.role !== 'stationMaster') {
      res.status(400);
      throw new Error('Invalid station master');
    }
  }

  // Update station fields
  station.name = name || station.name;
  station.address = address || station.address;
  
  if (operatingHours) {
    station.operatingHours = {
      opening: operatingHours.opening || station.operatingHours.opening,
      closing: operatingHours.closing || station.operatingHours.closing
    };
  }
  
  if (stationMasterId) {
    station.stationMasterId = stationMasterId;
  }
  
  if (geofenceParameters) {
    station.geofenceParameters = {
      coordinates: geofenceParameters.coordinates || station.geofenceParameters.coordinates,
      radius: geofenceParameters.radius || station.geofenceParameters.radius
    };
  }
  
  if (status) {
    station.status = status;
  }

  const updatedStation = await station.save();
  res.json(updatedStation);
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

export {
  getStations,
  getStationById,
  getNearestStations,
  createStation,
  updateStation,
  deleteStation
}; 