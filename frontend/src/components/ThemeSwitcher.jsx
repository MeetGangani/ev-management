import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeSwitcher = () => {
  // Check local storage for theme preference or default to system preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  useEffect(() => {
    setMounted(true);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle theme toggle
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // To prevent flash of incorrect theme before component mounts
  if (!mounted) {
    return null;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="relative w-12 h-12 flex items-center justify-center rounded-full overflow-hidden"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 0 : 180,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-full h-full">
          <div className={`absolute inset-0 flex items-center justify-center transform ${theme === 'dark' ? 'opacity-100' : 'opacity-0 rotate-90'} transition-opacity duration-500`}>
            <FaMoon className="text-accent-blue text-xl" />
          </div>
          <div className={`absolute inset-0 flex items-center justify-center transform ${theme === 'dark' ? 'opacity-0 -rotate-90' : 'opacity-100'} transition-opacity duration-500`}>
            <FaSun className="text-accent-yellow text-xl" />
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
};

export default ThemeSwitcher; 