import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaCheck, FaTrash, FaFilter, FaSync, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useGetUserNotificationsQuery, 
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation
} from '../slices/notificationsApiSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Spinner from '../components/Spinner';
import Paginate from '../components/Paginate';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import Meta from '../components/Meta';

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ read: '', type: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { 
    data,
    isLoading,
    error,
    refetch
  } = useGetUserNotificationsQuery({ 
    page,
    read: filter.read,
    type: filter.type
  });
  
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [deleteAllNotifications] = useDeleteAllNotificationsMutation();
  
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id).unwrap();
      refetch();
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to mark notification as read');
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to mark all notifications as read');
    }
  };
  
  const handleDeleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(id).unwrap();
        refetch();
        toast.success('Notification deleted');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete notification');
      }
    }
  };
  
  const handleDeleteAllNotifications = async () => {
    if (window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      try {
        await deleteAllNotifications().unwrap();
        refetch();
        toast.success('All notifications deleted');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete all notifications');
      }
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    setPage(1); // Reset to first page when filter changes
  };
  
  const applyFilter = () => {
    refetch();
    setIsFilterOpen(false);
  };
  
  const resetFilter = () => {
    setFilter({ read: '', type: '' });
    setPage(1);
    refetch();
  };
  
  return (
    <>
      <Meta title="Notifications" />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Link to="/" className="text-primary-600 hover:underline flex items-center mr-4">
                <FaArrowLeft className="mr-2" /> Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaBell className="mr-3 h-6 w-6 text-primary-600 dark:text-primary-400" />
                Notifications
              </h1>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="mr-2 p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
                title="Filter notifications"
              >
                <FaFilter />
              </button>
              
              <button
                onClick={refetch}
                className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700"
                title="Refresh notifications"
              >
                <FaSync />
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6"
              >
                <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Filter Notifications</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="read" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      id="read"
                      name="read"
                      value={filter.read}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="true">Read</option>
                      <option value="false">Unread</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={filter.type}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Types</option>
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={resetFilter}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilter}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  All Notifications
                </h2>
                {data && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {data.totalCount} total
                    {data.hasUnread && ' • Unread notifications available'}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800/50 flex items-center"
                  disabled={isLoading || (data && !data.hasUnread)}
                >
                  <FaCheck className="mr-1" /> Mark all as read
                </button>
                
                <button
                  onClick={handleDeleteAllNotifications}
                  className="px-3 py-1 text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md hover:bg-red-100 dark:hover:bg-red-800/50 flex items-center"
                  disabled={isLoading || (data && data.notifications?.length === 0)}
                >
                  <FaTrash className="mr-1" /> Delete all
                </button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600 dark:text-red-400">
                <p>{error?.data?.message || 'Failed to load notifications'}</p>
                <button
                  onClick={refetch}
                  className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
                >
                  Try Again
                </button>
              </div>
            ) : data.notifications?.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                <FaBell className="mx-auto h-12 w-12 mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium mb-2">No notifications</p>
                <p>You don't have any notifications at the moment.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {data.notifications.map((notification) => (
                    <div 
                      key={notification._id} 
                      className={`p-4 transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 mr-4">
                          <div className={`font-medium mb-1 ${getTypeClass(notification.type)}`}>
                            {notification.message}
                          </div>
                          
                          {notification.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {notification.description}
                            </p>
                          )}
                          
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                            <span className="mr-2">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </span>
                            
                            {notification.read && (
                              <span className="text-green-600 dark:text-green-400 flex items-center mr-2">
                                <FaCheck className="h-3 w-3 mr-1" /> Read
                              </span>
                            )}
                            
                            {notification.sender && (
                              <span className="mr-2">
                                From: {notification.sender.name} ({notification.sender.role})
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-shrink-0 space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Mark as read"
                            >
                              <FaCheck className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteNotification(notification._id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete notification"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {notification.link && (
                        <div className="mt-2">
                          <Link 
                            to={notification.link}
                            className="inline-block text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            onClick={() => {
                              if (!notification.read) {
                                handleMarkAsRead(notification._id);
                              }
                            }}
                          >
                            View details
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {data.pages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-center">
                    <Paginate
                      pages={data.pages}
                      page={page}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

// Helper function to determine text color based on notification type
const getTypeClass = (type) => {
  switch (type) {
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'error':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'info':
    default:
      return 'text-blue-600 dark:text-blue-400';
  }
};

export default NotificationsScreen; 