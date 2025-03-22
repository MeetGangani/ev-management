import { createContext, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { useGetUserNotificationsQuery } from '../../slices/notificationsApiSlice';
import 'react-toastify/dist/ReactToastify.css';

// Create context
const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  
  const {
    data,
    refetch,
  } = useGetUserNotificationsQuery({ skip: !userInfo });
  
  // Poll for new notifications every 30 seconds if user is logged in
  useEffect(() => {
    let interval;
    
    if (userInfo) {
      interval = setInterval(() => {
        refetch();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userInfo, refetch]);
  
  // Show toast notifications for new unread notifications
  useEffect(() => {
    if (data && data.notifications) {
      // Find the most recent unread notification
      const unreadNotifications = data.notifications.filter(
        (notification) => !notification.read
      );
      
      if (unreadNotifications.length > 0) {
        // Sort by timestamp and get the most recent one
        const latestNotification = unreadNotifications.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        )[0];
        
        // We'll use localStorage to track which notifications we've already shown
        const shownNotifications = JSON.parse(localStorage.getItem('shownNotifications') || '[]');
        
        // Only show toast if we haven't shown this notification before
        if (!shownNotifications.includes(latestNotification._id)) {
          // Show toast based on notification type
          switch (latestNotification.type) {
            case 'success':
              toast.success(latestNotification.message);
              break;
            case 'error':
              toast.error(latestNotification.message);
              break;
            case 'warning':
              toast.warning(latestNotification.message);
              break;
            case 'info':
            default:
              toast.info(latestNotification.message);
              break;
          }
          
          // Update localStorage to track that we've shown this notification
          localStorage.setItem(
            'shownNotifications',
            JSON.stringify([...shownNotifications, latestNotification._id])
          );
        }
      }
    }
  }, [data]);
  
  return (
    <NotificationContext.Provider
      value={{
        refetchNotifications: refetch,
      }}
    >
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 