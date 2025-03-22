import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    description: {
      type: String,
      required: false
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'upi', 'wallet', 'cash', 'other'],
      default: 'other'
    },
    transactionDetails: {
      transactionId: String,
      paymentGateway: String,
      paymentDate: Date,
      additionalInfo: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment; 