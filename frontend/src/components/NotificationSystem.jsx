import { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    </NotificationContext.Provider>
  );
};

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
    </motion.div>
  );
};

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