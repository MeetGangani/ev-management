import mongoose from 'mongoose';

const rideSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    ev: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'EV',
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Booking',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    startLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    endLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    distanceTraveled: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    cost: {
      type: Number,
      default: 0,
    },
    issues: [
      {
        issue: {
          type: String,
          required: true,
        },
        details: String,
        reportedAt: {
          type: Date,
          default: Date.now,
        },
        resolved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for efficient queries
rideSchema.index({ user: 1, status: 1 });
rideSchema.index({ ev: 1, status: 1 });
rideSchema.index({ booking: 1 });
rideSchema.index({ startTime: 1 });
rideSchema.index({ endTime: 1 });
rideSchema.index({ status: 1 });

const Ride = mongoose.model('Ride', rideSchema);

export default Ride; 