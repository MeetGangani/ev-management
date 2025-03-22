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
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'ongoing', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    fare: {
      type: Number,
      default: 0,
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
    penaltyAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking; 