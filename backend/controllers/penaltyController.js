const Penalty = require('../models/Penalty');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Get all penalties for a booking
exports.getPenaltiesByBooking = async (req, res) => {
  try {
    const { bookingId } = req.query;
    
    if (!bookingId) {
      return errorResponse(res, 'Booking ID is required', 400);
    }
    
    const penalties = await Penalty.find({ bookingId });
    return successResponse(res, 'Penalties retrieved successfully', penalties);
  } catch (error) {
    console.error('Error retrieving penalties:', error);
    return errorResponse(res, 'Failed to retrieve penalties', 500);
  }
};

// Get all penalties for a user
exports.getPenaltiesByUser = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return errorResponse(res, 'User ID is required', 400);
    }
    
    const penalties = await Penalty.find({ userId });
    return successResponse(res, 'Penalties retrieved successfully', penalties);
  } catch (error) {
    console.error('Error retrieving penalties:', error);
    return errorResponse(res, 'Failed to retrieve penalties', 500);
  }
};

// Create a new penalty
exports.createPenalty = async (req, res) => {
  try {
    const { bookingId, userId, type, amount, title, description, details, timestamp } = req.body;
    
    // Basic validation
    if (!bookingId || !userId || !type || !amount) {
      return errorResponse(res, 'Missing required fields', 400);
    }
    
    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    // Create the penalty
    const penalty = new Penalty({
      bookingId,
      userId,
      type,
      amount,
      title: title || type,
      description: description || '',
      details,
      timestamp: timestamp || new Date().toISOString(),
      status: 'pending' // Default status
    });
    
    // Save the penalty
    const savedPenalty = await penalty.save();
    
    // Update booking with penalty reference
    await Booking.findByIdAndUpdate(
      bookingId,
      { 
        $push: { penalties: savedPenalty._id },
        $inc: { totalPenaltyAmount: amount }
      }
    );
    
    return successResponse(res, 'Penalty created successfully', savedPenalty);
  } catch (error) {
    console.error('Error creating penalty:', error);
    return errorResponse(res, 'Failed to create penalty', 500);
  }
};

// Update a penalty
exports.updatePenalty = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, paidAmount, paidAt } = req.body;
    
    // Find the penalty
    const penalty = await Penalty.findById(id);
    if (!penalty) {
      return errorResponse(res, 'Penalty not found', 404);
    }
    
    // Update fields if provided
    if (status) penalty.status = status;
    if (paymentStatus) penalty.paymentStatus = paymentStatus;
    if (paidAmount !== undefined) penalty.paidAmount = paidAmount;
    if (paidAt) penalty.paidAt = paidAt;
    
    // Save the changes
    const updatedPenalty = await penalty.save();
    
    return successResponse(res, 'Penalty updated successfully', updatedPenalty);
  } catch (error) {
    console.error('Error updating penalty:', error);
    return errorResponse(res, 'Failed to update penalty', 500);
  }
};

// Delete a penalty
exports.deletePenalty = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the penalty
    const penalty = await Penalty.findById(id);
    if (!penalty) {
      return errorResponse(res, 'Penalty not found', 404);
    }
    
    // Get penalty amount and booking ID for update
    const { amount, bookingId } = penalty;
    
    // Delete the penalty
    await Penalty.findByIdAndDelete(id);
    
    // Update booking to remove penalty reference and adjust amount
    await Booking.findByIdAndUpdate(
      bookingId,
      { 
        $pull: { penalties: id },
        $inc: { totalPenaltyAmount: -amount }
      }
    );
    
    return successResponse(res, 'Penalty deleted successfully');
  } catch (error) {
    console.error('Error deleting penalty:', error);
    return errorResponse(res, 'Failed to delete penalty', 500);
  }
};

// Mark penalty as paid
exports.markPenaltyAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount, paymentMethod, transactionId } = req.body;
    
    if (!paidAmount || !paymentMethod) {
      return errorResponse(res, 'Payment amount and method are required', 400);
    }
    
    // Find the penalty
    const penalty = await Penalty.findById(id);
    if (!penalty) {
      return errorResponse(res, 'Penalty not found', 404);
    }
    
    // Update penalty payment info
    penalty.paymentStatus = 'paid';
    penalty.status = 'resolved';
    penalty.paidAmount = paidAmount;
    penalty.paidAt = new Date().toISOString();
    penalty.paymentMethod = paymentMethod;
    penalty.paymentDetails = { transactionId };
    
    // Save the changes
    const updatedPenalty = await penalty.save();
    
    return successResponse(res, 'Penalty marked as paid', updatedPenalty);
  } catch (error) {
    console.error('Error marking penalty as paid:', error);
    return errorResponse(res, 'Failed to update payment status', 500);
  }
}; 