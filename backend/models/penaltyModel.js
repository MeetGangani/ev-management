import mongoose from 'mongoose';

const penaltySchema = mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
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
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: ['damage', 'late_return', 'cancellation', 'improper_parking', 'other'],
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'disputed', 'waived'],
      default: 'pending',
    },
    evidencePhotos: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Penalty = mongoose.model('Penalty', penaltySchema);

export default Penalty; 