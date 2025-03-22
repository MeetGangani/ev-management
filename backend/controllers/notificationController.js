import asyncHandler from '../middleware/asyncHandler.js';
import Notification from '../models/notificationModel.js';
import User from '../models/userModel.js';

// Helper functions for API responses
const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

const errorResponse = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const filter = { userId: req.user._id };
  
  // Optional filters
  if (req.query.read === 'true') {
    filter.read = true;
  } else if (req.query.read === 'false') {
    filter.read = false;
  }
  
  if (req.query.type) {
    filter.type = req.query.type;
  }
  
  const totalCount = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);
  
  res.json({
    notifications,
    page,
    pages: Math.ceil(totalCount / limit),
    totalCount,
    hasUnread: await Notification.exists({ userId: req.user._id, read: false })
  });
});

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = asyncHandler(async (req, res) => {
  const { userId, type, message, description, link, metadata } = req.body;
  
  // Check if userId is provided and exists
  if (!userId) {
    res.status(400);
    throw new Error('User ID is required');
  }
  
  // Check if user exists
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Create notification
  const notification = await Notification.create({
    userId,
    type: type || 'info',
    message,
    description,
    link,
    metadata,
    sender: req.user ? {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    } : undefined
  });
  
  // If function was called programmatically, just return the notification
  if (!res) return notification;
  
  res.status(201).json(notification);
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  // Check if notification belongs to the user
  if (notification.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }
  
  if (notification.read) {
    res.status(400);
    throw new Error('Notification already marked as read');
  }
  
  notification.read = true;
  notification.readAt = Date.now();
  const updatedNotification = await notification.save();
  
  res.json(updatedNotification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, read: false },
    { read: true, readAt: Date.now() }
  );
  
  res.json({
    message: 'All notifications marked as read',
    modifiedCount: result.modifiedCount
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  
  // Check if notification belongs to the user
  if (notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }
  
  await notification.deleteOne();
  
  res.json({ message: 'Notification removed' });
});

// @desc    Delete all notifications
// @route   DELETE /api/notifications
// @access  Private
const deleteAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({ userId: req.user._id });
  
  res.json({
    message: 'All notifications deleted',
    deletedCount: result.deletedCount
  });
});

// @desc    Send bulk notifications to users
// @route   POST /api/notifications/bulk
// @access  Private/Admin
const sendBulkNotifications = asyncHandler(async (req, res) => {
  const { userIds, type, message, description, link, metadata } = req.body;
  
  if (!userIds || !userIds.length) {
    res.status(400);
    throw new Error('At least one user ID is required');
  }
  
  if (!message) {
    res.status(400);
    throw new Error('Message is required');
  }
  
  // Filter to ensure we only target existing users
  const existingUserIds = await User.distinct('_id', { 
    _id: { $in: userIds.map(id => id.toString()) } 
  });
  
  if (!existingUserIds.length) {
    res.status(404);
    throw new Error('No existing users found with provided IDs');
  }
  
  // Prepare notification documents
  const notificationDocs = existingUserIds.map(userId => ({
    userId,
    type: type || 'info',
    message,
    description,
    link,
    metadata,
    sender: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    }
  }));
  
  // Insert notifications in bulk
  const notifications = await Notification.insertMany(notificationDocs);
  
  res.status(201).json({
    message: 'Bulk notifications sent successfully',
    count: notifications.length,
    targetedUserCount: existingUserIds.length
  });
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private/Admin
const getNotificationStats = asyncHandler(async (req, res) => {
  // Total notification count
  const totalCount = await Notification.countDocuments();
  
  // Count by read status
  const readStats = await Notification.aggregate([
    {
      $group: {
        _id: '$read',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Count by type
  const typeStats = await Notification.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Last 7 days notification trends
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const dailyStats = await Notification.aggregate([
    {
      $match: {
        timestamp: { $gte: oneWeekAgo }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
  
  res.json({
    totalCount,
    readStats: readStats.reduce((acc, curr) => {
      acc[curr._id ? 'read' : 'unread'] = curr.count;
      return acc;
    }, { read: 0, unread: 0 }),
    typeStats: typeStats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    dailyStats
  });
});

export {
  getUserNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendBulkNotifications,
  getNotificationStats
}; 