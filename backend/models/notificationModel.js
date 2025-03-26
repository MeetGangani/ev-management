import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['info', 'success', 'error', 'warning'],
      default: 'info'
    },
    message: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    link: {
      type: String
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    sender: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      role: String
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for faster queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 