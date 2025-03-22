import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

const Message = ({ variant = 'info', children }) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case 'danger':
        return <FaExclamationCircle className="text-red-500 text-xl" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500 text-xl" />;
      default:
        return <FaInfoCircle className="text-blue-500 text-xl" />;
    }
  };

  const getColorClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'danger':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <motion.div 
      className={`flex items-start p-4 mb-4 rounded-lg border ${getColorClasses()}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mr-3 mt-0.5">{getIcon()}</div>
      <div className="flex-1">{children}</div>
    </motion.div>
  );
};

export default Message; 