import React from 'react';
import { FaExclamationTriangle, FaInfoCircle, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const Message = ({ variant = 'info', children }) => {
  // Define styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          containerClass: 'bg-green-50 border-green-400 text-green-700',
          iconComponent: <FaCheckCircle className="h-5 w-5 text-green-400" />
        };
      case 'danger':
        return {
          containerClass: 'bg-red-50 border-red-400 text-red-700',
          iconComponent: <FaExclamationCircle className="h-5 w-5 text-red-400" />
        };
      case 'warning':
        return {
          containerClass: 'bg-yellow-50 border-yellow-400 text-yellow-700',
          iconComponent: <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
        };
      case 'info':
      default:
        return {
          containerClass: 'bg-blue-50 border-blue-400 text-blue-700',
          iconComponent: <FaInfoCircle className="h-5 w-5 text-blue-400" />
        };
    }
  };

  const { containerClass, iconComponent } = getVariantStyles();

  return (
    <div className={`border-l-4 p-4 rounded-r mb-4 ${containerClass}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {iconComponent}
        </div>
        <div className="ml-3">
          <p className="text-sm">
            {children}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Message; 