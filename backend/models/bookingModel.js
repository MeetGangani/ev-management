import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    evId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EV',
      required: true,
    },
    startStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    endStationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    actualEndTime: {
      type: Date,
    },
    duration: {
      type: Number,
      required: true,
    },
    totalCost: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', 'cancelled', 'ongoing', 'completed', 'penalized'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    hasPenalty: {
      type: Boolean,
      default: false,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
    },
    penaltyReason: {
      type: String,
    },
    penaltyPaid: {
      type: Boolean,
      default: false,
    },
    damageReport: {
      type: String,
    },
    damageImages: [
      {
        type: String,
      }
    ],
    vehiclePhotosBeforeRide: [
      {
        type: String,
      }
    ],
    vehiclePhotosAfterRide: [
      {
        type: String,
      }
    ],
    geofenceData: {
      startLocation: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
        }
      },
      endLocation: {
        type: {
          type: String,
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
        }
      },
      wasWithinGeofence: {
        type: Boolean,
      }
    },
    lastKnownLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
      timestamp: {
        type: Date
      }
    },
    bookingType: {
      type: String,
      enum: ['immediate', 'scheduled'],
      required: true,
    },
    verificationStatus: {
      pickup: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      return: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
    },
    pickupPhotos: [
      {
        type: String,
      },
    ],
    returnPhotos: [
      {
        type: String,
      },
    ],
    damageReported: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on the lastKnownLocation field for geospatial queries
bookingSchema.index({ 'lastKnownLocation': '2dsphere' });
bookingSchema.index({ 'geofenceData.startLocation': '2dsphere' });
bookingSchema.index({ 'geofenceData.endLocation': '2dsphere' });

// Add virtual for late return status
bookingSchema.virtual('isLateReturn').get(function() {
  if (!this.actualEndTime || !this.endTime) {
    return false;
  }
  
  return this.actualEndTime > this.endTime;
});

// Add virtual for late minutes
bookingSchema.virtual('lateMinutes').get(function() {
  if (!this.isLateReturn) {
    return 0;
  }
  
  return Math.ceil((this.actualEndTime - this.endTime) / (1000 * 60));
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking; 