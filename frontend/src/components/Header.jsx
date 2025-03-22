import { FaSignInAlt, FaSignOutAlt, FaUser, FaIdCard, FaUserCog, FaCheckCircle, FaChevronDown, FaCalendarAlt, FaTachometerAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const logoutHandler = async () => {
    try {
      // Close the dropdown
      setShowDropdown(false);
      setIsOpen(false);
      
      await logoutApiCall().unwrap();
      dispatch(logout());
      
      // Force clear localStorage as backup
      localStorage.removeItem('userInfo');
      
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if the API call fails, we should still log the user out locally
      dispatch(logout());
      localStorage.removeItem('userInfo');
      navigate('/login');
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FaUserCog className="mr-1.5" />;
      case 'stationMaster':
        return <FaIdCard className="mr-1.5" />;
      default:
        return <FaUser className="mr-1.5" />;
    }
  };

  const headerVariants = {
    initial: { y: -100 },
    animate: { y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { 
        duration: 0.2
      }
    }
  };

  return (
    <motion.header 
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`sticky top-0 z-50 transition-all duration-300 
        ${scrolled 
          ? 'bg-white/80 dark:bg-dark-950/80 backdrop-blur-md shadow-md' 
          : 'bg-white dark:bg-dark-950'
        }`}
    >
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="mr-2"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3H8C5.79086 3 4 4.79086 4 7V17C4 19.2091 5.79086 21 8 21H16C18.2091 21 20 19.2091 20 17V7C20 4.79086 18.2091 3 16 3Z" 
                  className="stroke-primary-600 dark:stroke-primary-400" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"/>
                <path d="M11 8L15 12L11 16" 
                  className="stroke-primary-600 dark:stroke-primary-400" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"/>
              </svg>
            </motion.div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-400 dark:to-secondary-300">
              EV Rental
            </span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {userInfo ? (
              <div className="relative group">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center px-3 py-2 rounded-md text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700 transition-all duration-300"
                >
                  <span className="mr-1 font-medium">{userInfo.name}</span>
                  {userInfo.role && (
                    <span className="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full ml-2 font-medium">
                      {userInfo.role}
                    </span>
                  )}
                  <FaChevronDown className={`ml-2 text-xs transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                </motion.button>
                
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-900 rounded-lg shadow-lg py-1 z-10 border border-gray-100 dark:border-dark-800 backdrop-blur-sm overflow-hidden"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors duration-200"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FaUser className="mr-3 text-primary-500 dark:text-primary-400" />
                        <span>Profile</span>
                      </Link>
                      {userInfo.role === 'customer' && (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors duration-200"
                            onClick={() => setShowDropdown(false)}
                          >
                            <FaTachometerAlt className="mr-3 text-primary-500 dark:text-primary-400" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/my-bookings"
                            className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors duration-200"
                            onClick={() => setShowDropdown(false)}
                          >
                            <FaCalendarAlt className="mr-3 text-primary-500 dark:text-primary-400" />
                            <span>My Bookings</span>
                          </Link>
                        </>
                      )}
                      {userInfo.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors duration-200"
                          onClick={() => setShowDropdown(false)}
                        >
                          <FaUserCog className="mr-3 text-primary-500 dark:text-primary-400" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      {userInfo.role === 'stationMaster' && (
                        <>
                          <Link
                            to="/station-master"
                            className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors duration-200"
                            onClick={() => setShowDropdown(false)}
                          >
                            <FaIdCard className="mr-3 text-primary-500 dark:text-primary-400" />
                            <span>Station Dashboard</span>
                          </Link>
                          <Link
                            to="/station-master/bookings"
                            className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors duration-200"
                            onClick={() => setShowDropdown(false)}
                          >
                            <FaCalendarAlt className="mr-3 text-primary-500 dark:text-primary-400" />
                            <span>Station Bookings</span>
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-100 dark:border-dark-800 my-1"></div>
                      <button
                        onClick={logoutHandler}
                        className="flex w-full items-center px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                      >
                        <FaSignOutAlt className="mr-3" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/login" 
                    className="btn-ghost text-sm"
                  >
                    <FaSignInAlt className="mr-1.5" /> 
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/register" 
                    className="btn-primary text-sm"
                  >
                    <FaUser className="mr-1.5" /> 
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-3">
            <ThemeToggle />
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 focus:outline-none transition-colors duration-300"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden bg-white dark:bg-dark-900 rounded-b-lg shadow-lg mt-2 border-t border-gray-100 dark:border-dark-800"
            >
              <motion.div 
                className="px-2 pt-2 pb-3 space-y-1"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <Link
                    to="/"
                    className="block px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 font-medium transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                </motion.div>
                {userInfo ? (
                  <>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <Link
                        to="/profile"
                        className="block px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 font-medium transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        Profile
                      </Link>
                    </motion.div>
                    {userInfo.role === 'customer' && (
                      <>
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                          <Link
                            to="/dashboard"
                            className="block px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 font-medium transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <FaTachometerAlt className="inline mr-2 text-primary-500 dark:text-primary-400" />
                            Dashboard
                          </Link>
                        </motion.div>
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                          <Link
                            to="/stations"
                            className="block px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 font-medium transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            EV Stations
                          </Link>
                        </motion.div>
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                          <Link
                            to="/my-bookings"
                            className="block px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 font-medium transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <FaCalendarAlt className="inline mr-2 text-primary-500 dark:text-primary-400" />
                            My Bookings
                          </Link>
                        </motion.div>
                      </>
                    )}
                    {userInfo.role === 'admin' && (
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                      >
                        <Link
                          to="/admin"
                          className="block px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 font-medium transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          <FaUserCog className="inline mr-2 text-primary-500 dark:text-primary-400" />
                          Admin Dashboard
                        </Link>
                      </motion.div>
                    )}
                    {userInfo.role === 'stationMaster' && (
                      <>
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                          <Link
                            to="/station-master"
                            className="block px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 font-medium transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <FaIdCard className="inline mr-2 text-primary-500 dark:text-primary-400" />
                            Station Dashboard
                          </Link>
                        </motion.div>
                        <motion.div
                          variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                          }}
                        >
                          <Link
                            to="/station-master/bookings"
                            className="block px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 font-medium transition-colors duration-200"
                            onClick={() => setIsOpen(false)}
                          >
                            <FaCalendarAlt className="inline mr-2 text-primary-500 dark:text-primary-400" />
                            Station Bookings
                          </Link>
                        </motion.div>
                      </>
                    )}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      className="border-t border-gray-100 dark:border-dark-800 pt-2"
                    >
                      <button
                        onClick={logoutHandler}
                        className="w-full text-left block px-3 py-2.5 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors duration-200"
                      >
                        <FaSignOutAlt className="inline mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-dark-800">
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <Link
                        to="/login"
                        className="block px-3 py-2.5 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-800 font-medium transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaSignInAlt className="inline mr-2 text-primary-500 dark:text-primary-400" />
                        Sign In
                      </Link>
                    </motion.div>
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <Link
                        to="/register"
                        className="block px-3 py-2.5 rounded-md bg-primary-600 text-white hover:bg-primary-700 font-medium transition-colors duration-200 mt-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaUser className="inline mr-2" />
                        Sign Up
                      </Link>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header;
