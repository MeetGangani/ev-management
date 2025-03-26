import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={toggleTheme}
      className={`p-2 rounded-full focus:outline-none transition-all duration-300 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
    >
      <div className={`relative w-12 h-6 bg-primary-100 dark:bg-black rounded-full shadow-inner overflow-hidden ${isDark ? 'shadow-[0_0_10px_rgba(72,255,128,0.5)]' : ''}`}>
        <motion.div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow flex items-center justify-center ${isDark ? 'bg-primary-500 text-black' : 'bg-white text-primary-600'}`}
          animate={{
            x: isDark ? 24 : 0,
            rotate: isDark ? 180 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
        >
          {isDark ? (
            <FaMoon className="text-xs" />
          ) : (
            <FaSun className="text-xs" />
          )}
        </motion.div>
        <div 
          className="absolute inset-0 flex items-center justify-between px-1.5 text-xs pointer-events-none"
        >
          <motion.span 
            className="text-primary-600"
            animate={{ opacity: isDark ? 0 : 0.8 }}
          >
            <FaSun size={10} />
          </motion.span>
          <motion.span 
            className="text-secondary-500" 
            animate={{ opacity: isDark ? 0.8 : 0 }}
          >
            <FaMoon size={10} />
          </motion.span>
        </div>
      </div>
    </motion.button>
  );
};

export default ThemeToggle; 