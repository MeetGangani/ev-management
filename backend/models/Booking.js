const BookingSchema = new mongoose.Schema({
  // ... keep existing fields
  
  // Add penalty-related fields
  penalties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Penalty'
  }],
  totalPenaltyAmount: {
    type: Number,
    default: 0
  },
  baseCost: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    default: 0
  },

  // ... keep the rest of the existing fields
}); 