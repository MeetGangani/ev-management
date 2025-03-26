import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  href,
  to,
  onClick,
  className = '',
  icon,
  isLoading = false,
  ...rest
}) => {
  // Base classes shared by all buttons
  const baseClasses = `
    inline-flex items-center justify-center font-medium transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'cursor-not-allowed opacity-70' : ''}
  `;

  // Size variations
  const sizeClasses = {
    xs: 'text-xs px-2.5 py-1.5 rounded-lg',
    sm: 'text-sm px-3 py-2 rounded-lg',
    md: 'text-sm px-4 py-2.5 rounded-xl',
    lg: 'text-base px-5 py-3 rounded-xl',
    xl: 'text-lg px-6 py-4 rounded-xl',
  };

  // Variant variations
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-accent-teal to-accent-teal/80 text-white
      hover:shadow-glow-teal
      disabled:from-accent-teal/60 disabled:to-accent-teal/50 disabled:hover:shadow-none
    `,
    secondary: `
      bg-transparent border border-primary-500/50 text-white
      hover:bg-primary-800/50 hover:border-primary-400
      disabled:border-primary-600/30 disabled:hover:bg-transparent
    `,
    accent: `
      bg-gradient-to-r from-accent-purple to-accent-purple/80 text-white
      hover:shadow-glow-purple
      disabled:from-accent-purple/60 disabled:to-accent-purple/50 disabled:hover:shadow-none
    `,
    danger: `
      bg-gradient-to-r from-accent-red to-accent-red/80 text-white
      hover:shadow-glow-red
      disabled:from-accent-red/60 disabled:to-accent-red/50 disabled:hover:shadow-none
    `,
    ghost: `
      bg-transparent text-white hover:bg-primary-800/30
      disabled:hover:bg-transparent
    `,
    glass: `
      bg-primary-800/30 backdrop-blur-md border border-primary-700/30 text-white
      hover:bg-primary-700/40 hover:border-primary-600/40
      disabled:hover:bg-primary-800/30 disabled:hover:border-primary-700/30
    `,
  };

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${variantClasses[variant] || variantClasses.primary}
    ${className}
  `;

  // Render based on the button type (link, router link, or button)
  if (href) {
    return (
      <motion.a
        href={href}
        className={buttonClasses}
        whileTap={{ scale: 0.98 }}
        {...rest}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        ) : (
          children
        )}
      </motion.a>
    );
  } else if (to) {
    return (
      <motion.div whileTap={{ scale: 0.98 }}>
        <Link
          to={to}
          className={buttonClasses}
          onClick={onClick}
          {...rest}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          ) : (
            children
          )}
        </Link>
      </motion.div>
    );
  } else {
    return (
      <motion.button
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        onClick={onClick}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        {...rest}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {isLoading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
};

export default Button; 