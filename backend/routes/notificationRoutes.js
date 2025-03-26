import express from 'express';
import { 
  getUserNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendBulkNotifications,
  getNotificationStats
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected routes
router.route('/')
  .get(protect, getUserNotifications)
  .post(protect, createNotification);

router.route('/read-all')
  .put(protect, markAllNotificationsAsRead);

router.route('/:id')
  .put(protect, markNotificationAsRead)
  .delete(protect, deleteNotification);

// Admin only routes
router.route('/bulk')
  .post(protect, sendBulkNotifications);

router.route('/stats')
  .get(protect, getNotificationStats);

export default router; 