const mongoose = require('mongoose');

const PenaltySchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['vehicle_damage', 'late_cancellation', 'improper_parking', 'geofence_violation', 'other'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'disputed', 'resolved', 'waived'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid', 'waived'],
    default: 'unpaid'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paidAt: {
    type: Date
  },
  paymentMethod: {
    type: String
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Fields for disputing penalties
  disputed: {
    type: Boolean,
    default: false
  },
  disputeReason: {
    type: String
  },
  disputeDate: {
    type: Date
  },
  disputeResolution: {
    type: String
  },
  disputeResolvedAt: {
    type: Date
  },
  // Admin fields
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

// Index for faster queries
PenaltySchema.index({ bookingId: 1 });
PenaltySchema.index({ userId: 1 });
PenaltySchema.index({ type: 1 });
PenaltySchema.index({ status: 1 });
PenaltySchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Penalty', PenaltySchema); 