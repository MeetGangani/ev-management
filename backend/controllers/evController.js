import asyncHandler from 'express-async-handler';
import EV from '../models/evModel.js';
import Station from '../models/stationModel.js';
import mongoose from 'mongoose';

// @desc    Get all EVs
// @route   GET /api/evs
// @access  Private/Admin
const getEVs = asyncHandler(async (req, res) => {
  const evs = await EV.find({})
    .select('-maintenanceHistory -createdAt -updatedAt -__v')
    .populate('station', 'name address');
  
  res.json(evs);
});

// @desc    Get EVs by station ID
// @route   GET /api/evs/station/:stationId
// @access  Private (verified customers, station masters, admins)
const getEVsByStation = asyncHandler(async (req, res) => {
  const stationId = req.params.stationId;
  
  // Verify station exists
  const station = await Station.findById(stationId);
  if (!station) {
    res.status(404);
    throw new Error('Station not found');
  }

  // Get EVs and ensure condition field is present
  let evs = await EV.find({ station: stationId, status: 'available' })
    .select('-maintenanceHistory -__v')
    .populate('station', 'name address operatingHours');
  
  // For the frontend, let's ensure all necessary fields are present
  // If any EV is missing condition, set a default value
  evs = evs.map(ev => {
    const evData = ev.toObject();
    
    // Ensure all required fields exist
    if (!evData.condition) {
      evData.condition = 'good'; // Default value
    }
    
    if (!evData.status) {
      evData.status = 'available';
    }
    
    return evData;
  });

  console.log('Sending EVs with data:', evs);
  res.json(evs);
});

// @desc    Get EV by ID
// @route   GET /api/evs/:id
// @access  Private (verified customers, station masters, admins)
const getEVById = asyncHandler(async (req, res) => {
  const ev = await EV.findById(req.params.id)
    .populate('station', 'name address operatingHours')
    .populate('bookings');

  if (ev) {
    res.json(ev);
  } else {
    res.status(404);
    throw new Error('EV not found');
  }
});

// @desc    Create an EV
// @route   POST /api/evs
// @access  Private/Admin
const createEV = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      registrationNumber,
      model,
      manufacturer,
      batteryCapacity,
      range,
      stationId,
      pricePerHour,
      features,
      imageUrl,
      colorCode,
      condition,
    } = req.body;

    // Verify station exists
    const station = await Station.findById(stationId);
    if (!station) {
      throw new Error('Station not found');
    }

    // Create the EV
    const ev = await EV.create([{
      registrationNumber,
      model,
      manufacturer,
      batteryCapacity,
      batteryLevel: 100, // Default to full battery
      range,
      status: 'available',
      station: stationId,
      currentStation: stationId,
      pricePerHour,
      features,
      imageUrl,
      colorCode,
      condition,
    }], { session });

    // Update station's EV list and count
    await Station.findByIdAndUpdate(
      stationId,
      { 
        $push: { evs: ev[0]._id },
        $inc: { availableEVs: 1 }
      },
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(ev[0]);
  } catch (error) {
    await session.abortTransaction();
    res.status(400);
    throw new Error(error.message);
  } finally {
    session.endSession();
  }
});

// @desc    Update an EV
// @route   PUT /api/evs/:id
// @access  Private/Admin or StationMaster
const updateEV = asyncHandler(async (req, res) => {
  const ev = await EV.findById(req.params.id);

  if (!ev) {
    res.status(404);
    throw new Error('EV not found');
  }

  const {
    registrationNumber,
    model,
    manufacturer,
    batteryCapacity,
    batteryLevel,
    range,
    status,
    condition,
    stationId,
    currentStationId,
    currentLocation,
    pricePerHour,
    features,
    imageUrl,
    colorCode,
  } = req.body;

  // If the station is being changed, handle it
  if (stationId && stationId !== ev.station.toString()) {
    // Verify new station exists
    const newStation = await Station.findById(stationId);
    if (!newStation) {
      res.status(404);
      throw new Error('New station not found');
    }

    // Remove EV from old station
    const oldStation = await Station.findById(ev.station);
    if (oldStation) {
      oldStation.evs = oldStation.evs.filter(
        (id) => id.toString() !== ev._id.toString()
      );
      await oldStation.save();
    }

    // Add EV to new station
    newStation.evs.push(ev._id);
    await newStation.save();

    // Update EV's station
    ev.station = stationId;
    ev.currentStation = stationId;
  }

  // Update the other EV fields
  if (registrationNumber) ev.registrationNumber = registrationNumber;
  if (model) ev.model = model;
  if (manufacturer) ev.manufacturer = manufacturer;
  if (batteryCapacity) ev.batteryCapacity = batteryCapacity;
  if (batteryLevel !== undefined) ev.batteryLevel = batteryLevel;
  if (range) ev.range = range;
  if (status) ev.status = status;
  if (condition) ev.condition = condition;
  if (pricePerHour) ev.pricePerHour = pricePerHour;
  if (features) ev.features = features;
  if (imageUrl) ev.imageUrl = imageUrl;
  if (colorCode) ev.colorCode = colorCode;
  if (currentStationId) ev.currentStation = currentStationId;

  // Update location if provided
  if (currentLocation && currentLocation.coordinates) {
    ev.currentLocation = {
      coordinates: currentLocation.coordinates,
      updatedAt: new Date(),
    };
  }

  const updatedEV = await ev.save();
  res.json(updatedEV);
});

// @desc    Delete an EV
// @route   DELETE /api/evs/:id
// @access  Private/Admin
const deleteEV = asyncHandler(async (req, res) => {
  const ev = await EV.findById(req.params.id);

  if (!ev) {
    res.status(404);
    throw new Error('EV not found');
  }

  // Check if the EV is booked or in use
  if (ev.status === 'booked' || ev.status === 'in-use') {
    res.status(400);
    throw new Error('Cannot delete an EV that is currently booked or in use');
  }

  // Remove the EV from its station
  const station = await Station.findById(ev.station);
  if (station) {
    station.evs = station.evs.filter(
      (id) => id.toString() !== ev._id.toString()
    );
    await station.save();
  }

  await ev.deleteOne();
  res.json({ message: 'EV removed' });
});

// @desc    Update EV battery level
// @route   PATCH /api/evs/:id/battery
// @access  Private/StationMaster
const updateBatteryLevel = asyncHandler(async (req, res) => {
  const { batteryLevel } = req.body;

  if (batteryLevel === undefined || batteryLevel < 0 || batteryLevel > 100) {
    res.status(400);
    throw new Error('Battery level must be between 0 and 100');
  }

  const ev = await EV.findById(req.params.id);

  if (!ev) {
    res.status(404);
    throw new Error('EV not found');
  }

  // Update the battery level
  ev.batteryLevel = batteryLevel;
  
  // If the battery is fully charged and the status is 'charging', update it to 'available'
  if (batteryLevel >= 100 && ev.status === 'charging') {
    ev.status = 'available';
  }

  const updatedEV = await ev.save();
  res.json(updatedEV);
});

// @desc    Add maintenance record to EV
// @route   POST /api/evs/:id/maintenance
// @access  Private/Admin or StationMaster
const addMaintenanceRecord = asyncHandler(async (req, res) => {
  const { description, cost, performedBy } = req.body;

  if (!description || !cost || !performedBy) {
    res.status(400);
    throw new Error('All fields are required for maintenance record');
  }

  const ev = await EV.findById(req.params.id);

  if (!ev) {
    res.status(404);
    throw new Error('EV not found');
  }

  // Create a new maintenance record
  const maintenanceRecord = {
    date: new Date(),
    description,
    cost,
    performedBy,
  };

  // Update the EV status to maintenance
  ev.status = 'maintenance';
  
  // Add the record to maintenance history
  ev.maintenanceHistory.push(maintenanceRecord);

  const updatedEV = await ev.save();
  res.status(201).json(updatedEV);
});

export {
  getEVs,
  getEVsByStation,
  getEVById,
  createEV,
  updateEV,
  deleteEV,
  updateBatteryLevel,
  addMaintenanceRecord,
}; 