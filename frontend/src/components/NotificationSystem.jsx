import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
<<<<<<< HEAD
import PropTypes from 'prop-types';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

// Create notification context
const NotificationContext = createContext();

// Notification types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Create unique IDs for notifications
const generateId = () => `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Notification Provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add notification
  const addNotification = (type, message, options = {}) => {
    const id = generateId();
    const notification = {
      id,
      type,
      message,
      duration: options.duration || (type === NOTIFICATION_TYPES.ERROR ? 8000 : 5000),
      dismissible: options.dismissible !== undefined ? options.dismissible : true,
      position: options.position || 'top-right',
      onClose: options.onClose || null,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);
    return id;
  };

  // Remove notification
  const removeNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && notification.onClose) {
      notification.onClose();
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Helper methods for specific notification types
  const success = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.SUCCESS, message, options);
  
  const error = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.ERROR, message, options);
  
  const warning = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.WARNING, message, options);
  
  const info = (message, options = {}) => 
    addNotification(NOTIFICATION_TYPES.INFO, message, options);

  // Clear all notifications
  const clearAll = () => {
    notifications.forEach(notification => {
      if (notification.onClose) {
        notification.onClose();
      }
    });
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
        clearAll
      }}
    >
      {children}
      <NotificationContainer />
=======
import { FaBell, FaCheck, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle, FaTimes, FaEye } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { 
  useGetNotificationsQuery, 
  useMarkNotificationAsReadMutation, 
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation
} from '../slices/notificationsApiSlice';

// Create a context for notifications
const NotificationContext = createContext();

// Types of notifications
const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning'
};

// Provider component for the notification system
export const NotificationProvider = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  // Use RTK Query hooks for data fetching
  const { 
    data: notificationsData, 
    error: notificationsError, 
    isLoading,
    refetch: refetchNotifications
  } = useGetNotificationsQuery({}, { skip: !userInfo?._id });
  
  const [markAsReadMutation] = useMarkNotificationAsReadMutation();
  const [markAllAsReadMutation] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotificationMutation] = useDeleteNotificationMutation();

  // Update notifications when data changes
  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData.notifications || []);
      setUnreadCount((notificationsData.notifications || []).filter(notif => !notif.read).length);
    }
  }, [notificationsData]);

  // Poll for new notifications
  useEffect(() => {
    if (userInfo?._id) {
      // Set up notification polling (in production, use WebSockets instead)
      const pollingInterval = setInterval(() => {
        refetchNotifications();
      }, 30000); // Poll every 30 seconds
      
      return () => clearInterval(pollingInterval);
    }
  }, [userInfo, refetchNotifications]);

  // Handle errors
  useEffect(() => {
    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
    }
  }, [notificationsError]);

  // Add a new notification
  const addNotification = (type, message, details = {}) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      ...details
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    showNotificationToast(newNotification);
    
    return newNotification.id;
  };

  // Show a toast with the notification
  const showNotificationToast = (notification) => {
    setCurrentNotification(notification);
    setIsVisible(true);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
      setCurrentNotification(null);
    }, 5000);
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    if (!userInfo?._id) return;
    
    try {
      await markAsReadMutation(id).unwrap();
      
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userInfo?._id) return;
    
    try {
      await markAllAsReadMutation().unwrap();
      
      // Optimistically update UI
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    if (!userInfo?._id) return;
    
    try {
      await deleteNotificationMutation(id).unwrap();
      
      // Optimistically update UI
      const notifToDelete = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
      
      // Update unread count if needed
      if (notifToDelete && !notifToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Convenience methods for different notification types
  const sendInfoNotification = (message, details = {}) => 
    addNotification(NOTIFICATION_TYPES.INFO, message, details);
    
  const sendSuccessNotification = (message, details = {}) => 
    addNotification(NOTIFICATION_TYPES.SUCCESS, message, details);
    
  const sendErrorNotification = (message, details = {}) => 
    addNotification(NOTIFICATION_TYPES.ERROR, message, details);
    
  const sendWarningNotification = (message, details = {}) => 
    addNotification(NOTIFICATION_TYPES.WARNING, message, details);

  // The value provided to consumers of the context
  const contextValue = {
    notifications,
    unreadCount,
    sendInfoNotification,
    sendSuccessNotification,
    sendErrorNotification,
    sendWarningNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications: refetchNotifications
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Toast notification that appears temporarily */}
      <AnimatePresence>
        {isVisible && currentNotification && (
          <NotificationToast 
            notification={currentNotification} 
            onClose={() => setIsVisible(false)}
            onRead={() => markAsRead(currentNotification.id)}
          />
        )}
      </AnimatePresence>
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
    </NotificationContext.Provider>
  );
};

<<<<<<< HEAD
NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Container to display notifications
const NotificationContainer = () => {
  const { notifications, removeNotification } = useContext(NotificationContext);

  // Group notifications by position
  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.position]) {
      acc[notification.position] = [];
    }
    acc[notification.position].push(notification);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(groupedNotifications).map(([position, items]) => (
        <div
          key={position}
          className={`fixed z-50 flex flex-col gap-2 p-4 max-w-md w-full ${getPositionClasses(position)}`}
        >
          <AnimatePresence>
            {items.map(notification => (
              <Notification
                key={notification.id}
                notification={notification}
                onClose={() => removeNotification(notification.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
};

// Helper to get position classes
const getPositionClasses = (position) => {
  switch (position) {
    case 'top-right':
      return 'top-0 right-0';
    case 'top-left':
      return 'top-0 left-0';
    case 'bottom-right':
      return 'bottom-0 right-0';
    case 'bottom-left':
      return 'bottom-0 left-0';
    case 'top-center':
      return 'top-0 left-1/2 -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-0 left-1/2 -translate-x-1/2';
    default:
      return 'top-0 right-0';
  }
};

// Single notification component
const Notification = ({ notification, onClose }) => {
  const { id, type, message, duration, dismissible } = notification;
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <FaCheckCircle className="text-green-400 text-lg" />;
      case NOTIFICATION_TYPES.ERROR:
        return <FaExclamationCircle className="text-accent-red text-lg" />;
      case NOTIFICATION_TYPES.WARNING:
        return <FaExclamationTriangle className="text-accent-yellow text-lg" />;
      case NOTIFICATION_TYPES.INFO:
        return <FaInfoCircle className="text-accent-blue text-lg" />;
      default:
        return null;
    }
  };

  // Get container classes based on type
  const getContainerClasses = () => {
    const baseClasses = 'card-glass border shadow-glass p-4 rounded-lg';
    
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return `${baseClasses} border-green-500/30`;
      case NOTIFICATION_TYPES.ERROR:
        return `${baseClasses} border-accent-red/30`;
      case NOTIFICATION_TYPES.WARNING:
        return `${baseClasses} border-accent-yellow/30`;
      case NOTIFICATION_TYPES.INFO:
        return `${baseClasses} border-accent-blue/30`;
      default:
        return baseClasses;
    }
  };

  // Progress bar animation
  const progressBarVariants = {
    initial: { width: '100%' },
    animate: { 
      width: '0%',
      transition: { 
        duration: duration / 1000,
        ease: 'linear'
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={getContainerClasses()}
      key={id}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 pr-8">
          <p className="text-sm text-white">{message}</p>
        </div>
        {dismissible && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-white/70 hover:text-white transition-colors"
            aria-label="Close notification"
          >
            <FaTimes />
          </button>
        )}
      </div>
      
      {duration > 0 && (
        <motion.div
          variants={progressBarVariants}
          initial="initial"
          animate="animate"
          className="h-1 bg-white/20 mt-3 rounded-full"
        />
      )}
=======
// Get the icon for a notification type
const getNotificationIcon = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return <FaCheck className="text-green-500" />;
    case NOTIFICATION_TYPES.ERROR:
      return <FaExclamationCircle className="text-red-500" />;
    case NOTIFICATION_TYPES.WARNING:
      return <FaExclamationTriangle className="text-yellow-500" />;
    default:
      return <FaInfoCircle className="text-blue-500" />;
  }
};

// Get the background color class based on notification type
const getNotificationBgClass = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    case NOTIFICATION_TYPES.ERROR:
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    case NOTIFICATION_TYPES.WARNING:
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    default:
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  }
};

// Get the text color class based on notification type
const getNotificationTextClass = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return 'text-green-800 dark:text-green-200';
    case NOTIFICATION_TYPES.ERROR:
      return 'text-red-800 dark:text-red-200';
    case NOTIFICATION_TYPES.WARNING:
      return 'text-yellow-800 dark:text-yellow-200';
    default:
      return 'text-blue-800 dark:text-blue-200';
  }
};

// Toast notification component
const NotificationToast = ({ notification, onClose, onRead }) => {
  const bgClass = getNotificationBgClass(notification.type);
  const textClass = getNotificationTextClass(notification.type);
  
  return (
    <motion.div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full shadow-lg rounded-lg border ${bgClass} ${textClass}`}
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 mr-3 mt-0.5 text-xl">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 mr-2">
          <div className="font-medium">{notification.message}</div>
          {notification.description && (
            <div className="mt-1 text-sm opacity-80">{notification.description}</div>
          )}
          {notification.timestamp && (
            <div className="mt-1 text-xs opacity-60">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          <button
            onClick={onRead}
            className="p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors duration-200"
            aria-label="Mark as read"
            title="Mark as read"
          >
            <FaEye className="text-sm" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors duration-200"
            aria-label="Close"
            title="Close"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      </div>
      
      <motion.div
        className="h-1 bg-current opacity-30 rounded-b-lg"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
    </motion.div>
  );
};

<<<<<<< HEAD
Notification.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.values(NOTIFICATION_TYPES)).isRequired,
    message: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    dismissible: PropTypes.bool.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired
};

export { NOTIFICATION_TYPES }; 
=======
// Notification Bell indicator with count
export const NotificationBell = () => {
  const { unreadCount, notifications } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
        aria-label="Notifications"
      >
        <FaBell className="text-gray-600 dark:text-gray-300 text-xl" />
        
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>
      
      {/* Dropdown menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            <NotificationList 
              notifications={notifications} 
              onClose={() => setIsOpen(false)} 
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Notification list dropdown
const NotificationList = ({ notifications, onClose }) => {
  const { markAsRead, markAllAsRead, deleteNotification } = useContext(NotificationContext);
  
  return (
    <motion.div
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-dark-700 overflow-hidden"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex space-x-2">
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
          >
            Mark all as read
          </button>
          <button
            onClick={() => deleteNotification(notifications[0]._id)}
            className="text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Clear all
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id}
              className={`p-3 border-b border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors duration-200 ${
                notification.read ? 'opacity-75' : 'bg-blue-50/50 dark:bg-blue-900/10'
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${getNotificationTextClass(notification.type)}`}>
                    {notification.message}
                  </div>
                  {notification.description && (
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {notification.description}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    {new Date(notification.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="ml-2 flex flex-col space-y-1">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-blue-600 dark:text-blue-400"
                      title="Mark as read"
                    >
                      <FaEye size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 text-red-600 dark:text-red-400"
                    title="Delete"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

// Hook to use the notification system
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default { 
  NotificationProvider, 
  NotificationBell, 
  useNotifications,
  NOTIFICATION_TYPES
}; 
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
