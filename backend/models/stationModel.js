import mongoose from 'mongoose';

const stationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    operatingHours: {
      opening: {
        type: String,
        required: true,
        default: '09:00',
      },
      closing: {
        type: String,
        required: true,
        default: '18:00',
      },
    },
    geofenceParameters: {
      coordinates: {
        type: [Number], // [longitude, latitude] format for MongoDB
        required: true,
      },
      radius: {
        type: Number, // Radius in meters
        required: true,
        default: 100,
      },
    },
    stationMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    evs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EV',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on the geofenceParameters.coordinates field for geospatial queries
stationSchema.index({ 'geofenceParameters.coordinates': '2dsphere' });

const Station = mongoose.model('Station', stationSchema);

export default Station; 