import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash, FaCheckDouble } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetUserNotificationsQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation } from '../../slices/notificationsApiSlice';
import Spinner from '../Spinner';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '../../context/ThemeContext';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetUserNotificationsQuery();
  
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  
  useEffect(() => {
    if (data && data.notifications) {
      const unread = data.notifications.filter(notification => !notification.read).length;
      setUnreadCount(unread);
    }
  }, [data]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    // If opening, refetch to get latest notifications
    if (!isOpen) refetch();
  };
  
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`relative p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 focus:outline-none ${isDark ? 'hover:drop-shadow-[0_0_8px_rgba(72,255,128,0.6)]' : ''}`}
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <FaBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs font-bold leading-none text-black ${isDark ? 'bg-secondary-500 shadow-[0_0_8px_rgba(255,230,0,0.7)]' : 'bg-red-500 text-white'}`}
          >
            {unreadCount}
          </motion.span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-80 bg-white dark:bg-black rounded-md shadow-lg z-50 overflow-hidden ${isDark ? 'border border-primary-800 shadow-[0_0_15px_rgba(72,255,128,0.3)]' : 'border border-gray-200'}`}
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-primary-800 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-primary-400">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 flex items-center"
                >
                  <FaCheckDouble className="mr-1" />
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="py-6 flex justify-center">
                  <Spinner />
                </div>
              ) : error ? (
                <div className="py-4 px-4 text-center text-red-500 dark:text-red-400">
                  Failed to load notifications
                </div>
              ) : data && data.notifications.length > 0 ? (
                <div>
                  {data.notifications.map(notification => (
                    <div
                      key={notification._id}
                      className={`px-4 py-3 border-b border-gray-200 dark:border-primary-800 ${
                        !notification.read ? (isDark ? 'bg-primary-900/20' : 'bg-blue-50') : ''
                      }`}
                    >
                      <div className="flex justify-between">
                        <div className={`text-sm font-medium mb-1 ${getTypeClass(notification.type, isDark)}`}>
                          {notification.message}
                        </div>
                        <div className="flex space-x-1">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className={`text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                              title="Mark as read"
                            >
                              <FaCheck className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {notification.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{notification.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                        
                        {notification.link && (
                          <Link
                            to={notification.link}
                            className={`text-xs text-primary-600 dark:text-primary-400 hover:underline ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                            onClick={() => {
                              setIsOpen(false);
                              if (!notification.read) {
                                handleMarkAsRead(notification._id);
                              }
                            }}
                          >
                            View details
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 px-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications
                </div>
              )}
            </div>
            
            {data && data.notifications.length > 0 && data.pages > 1 && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-black text-center border-t border-gray-200 dark:border-primary-800">
                <Link
                  to="/notifications"
                  className={`text-sm text-primary-600 dark:text-primary-400 hover:underline ${isDark ? 'hover:drop-shadow-[0_0_4px_rgba(72,255,128,0.6)]' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function to determine text color based on notification type
const getTypeClass = (type, isDark) => {
  if (isDark) {
    switch (type) {
      case 'success':
        return 'text-primary-400 drop-shadow-[0_0_2px_rgba(72,255,128,0.5)]';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-secondary-400 drop-shadow-[0_0_2px_rgba(255,230,0,0.5)]';
      case 'info':
      default:
        return 'text-primary-400';
    }
  } else {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  }
};

export default NotificationBell; 