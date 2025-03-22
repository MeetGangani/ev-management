const express = require('express');
const router = express.Router();
const penaltyController = require('../controllers/penaltyController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

// Get penalties for a booking
router.get('/', authenticateUser, penaltyController.getPenaltiesByBooking);

// Get penalties for a user
router.get('/user', authenticateUser, penaltyController.getPenaltiesByUser);

// Create a new penalty (restricted to admins and the system)
router.post(
  '/', 
  authenticateUser, 
  authorizeRoles(['admin', 'system']), 
  penaltyController.createPenalty
);

// Update penalty status (admin only)
router.patch(
  '/:id', 
  authenticateUser, 
  authorizeRoles(['admin']), 
  penaltyController.updatePenalty
);

// Delete a penalty (admin only)
router.delete(
  '/:id', 
  authenticateUser, 
  authorizeRoles(['admin']), 
  penaltyController.deletePenalty
);

// Mark penalty as paid
router.post(
  '/:id/pay', 
  authenticateUser, 
  penaltyController.markPenaltyAsPaid
);

module.exports = router; 