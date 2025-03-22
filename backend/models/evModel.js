import mongoose from 'mongoose';

const evSchema = mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    batteryCapacity: {
      type: Number, // in kWh
      required: true,
    },
    batteryLevel: {
      type: Number, // percentage (0-100)
      required: true,
      default: 100,
      min: 0,
      max: 100,
    },
    range: {
      type: Number, // in kilometers
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'maintenance', 'charging', 'in-use'],
      default: 'available',
    },
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good',
    },
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    currentLocation: {
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    pricePerHour: {
      type: Number,
      required: true,
      default: 50, // in INR
    },
    features: [String],
    imageUrl: {
      type: String,
      default: '/images/default-ev.jpg',
    },
    colorCode: {
      type: String,
      default: '#000000',
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
    maintenanceHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        cost: {
          type: Number,
          required: true,
        },
        performedBy: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on the currentLocation.coordinates field for geospatial queries
evSchema.index({ 'currentLocation.coordinates': '2dsphere' });

const EV = mongoose.model('EV', evSchema);

export default EV; 