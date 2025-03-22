import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInfoCircle, FaExclamationCircle, FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const MessageAlert = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  position = 'top-center',
  onClose
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) setTimeout(onClose, 300); // Call onClose after exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) setTimeout(onClose, 300); // Call onClose after exit animation
  };

  // Define position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default: // top-center
        return 'top-4 left-1/2 transform -translate-x-1/2';
    }
  };

  // Define type-specific properties
  const getTypeProperties = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FaCheckCircle />,
          bgClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
        };
      case 'error':
        return {
          icon: <FaExclamationCircle />,
          bgClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        };
      case 'warning':
        return {
          icon: <FaExclamationTriangle />,
          bgClass: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
        };
      default: // info
        return {
          icon: <FaInfoCircle />,
          bgClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        };
    }
  };

  const typeProps = getTypeProperties();
  
  const variants = {
    initial: {
      opacity: 0,
      y: position.includes('top') ? -20 : 20,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeIn'
      }
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`fixed ${getPositionClasses()} z-50 max-w-md w-full shadow-lg rounded-lg border ${typeProps.bgClass}`}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="flex items-start p-4">
            <div className="flex-shrink-0 mr-3 mt-0.5 text-xl">
              {typeProps.icon}
            </div>
            <div className="flex-1 mr-2">{message}</div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors duration-200"
              aria-label="Close"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
          
          {duration && duration > 0 && (
            <motion.div
              className="h-1 bg-current opacity-30 rounded-b-lg"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageAlert; 