import { useState } from 'react';
import { FaUserCircle, FaSignOutAlt, FaUser, FaCog, FaTachometerAlt, FaCalendarAlt, FaMapMarkerAlt, FaCarAlt, FaBars, FaTimes } from 'react-icons/fa';
import { RiFlashlightFill } from 'react-icons/ri';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [logoutApiCall] = useLogoutMutation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-md relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-white group"
          >
            <RiFlashlightFill className="text-accent-teal text-2xl transform group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xl font-bold tracking-tight relative overflow-hidden">
              <span className="inline-block transform transition-transform duration-300 group-hover:-translate-y-full">
                Volt Ride
              </span>
              <span className="absolute top-0 left-0 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0 text-accent-teal">
                Volt Ride
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="relative px-4 py-2 text-white/90 hover:text-white rounded-md group"
            >
              <span className="relative z-10">Home</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
            </Link>
            
            {userInfo ? (
              <>
                <Link 
                  to="/profile" 
                  className="relative px-4 py-2 text-white/90 hover:text-white rounded-md group"
                >
                  <span className="relative z-10">Profile</span>
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                </Link>
                
                {userInfo.role === 'customer' && (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="relative px-4 py-2 text-white/90 hover:text-white rounded-md group"
                    >
                      <span className="relative z-10 flex items-center">
                        <FaTachometerAlt className="mr-1.5 text-accent-teal" />
                        Dashboard
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                    </Link>
                    
                    <Link 
                      to="/stations" 
                      className="relative px-4 py-2 text-white/90 hover:text-white rounded-md group"
                    >
                      <span className="relative z-10 flex items-center">
                        <FaMapMarkerAlt className="mr-1.5 text-accent-teal" />
                        Stations
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                    </Link>
                    
                    <Link 
                      to="/my-bookings" 
                      className="relative px-4 py-2 text-white/90 hover:text-white rounded-md group"
                    >
                      <span className="relative z-10 flex items-center">
                        <FaCalendarAlt className="mr-1.5 text-accent-teal" />
                        My Bookings
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                    </Link>
                  </>
                )}
                
                {userInfo.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="relative px-4 py-2 text-white/90 hover:text-white rounded-md group"
                  >
                    <span className="relative z-10 flex items-center">
                      <FaCog className="mr-1.5 text-accent-teal" />
                      Admin
                    </span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                  </Link>
                )}
                
                {userInfo.role === 'stationMaster' && (
                  <Link 
                    to="/station-master" 
                    className="relative px-4 py-2 text-white/90 hover:text-white rounded-md group"
                  >
                    <span className="relative z-10 flex items-center">
                      <FaCarAlt className="mr-1.5 text-accent-teal" />
                      Station Dashboard
                    </span>
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-teal transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                  </Link>
                )}
                
                {/* User Profile Menu */}
                <div className="relative ml-3">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-3 py-2 rounded-xl hover:bg-primary-500 transition-colors duration-300"
                  >
                    <FaUserCircle className="text-lg" />
                    <span className="text-sm font-medium">{userInfo.name.split(' ')[0]}</span>
                    <span className="w-1.5 h-1.5 bg-accent-teal rounded-full animate-pulse"></span>
                  </button>
                  
                  {showProfileMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-primary-800/90 to-primary-900/90 backdrop-blur-md border border-primary-600/30 rounded-lg shadow-glass-lg overflow-hidden transform origin-top-right animate-fade-in"
                    >
                      <div className="py-2 text-white">
                        <div className="px-4 py-2 text-sm text-white/70">
                          Signed in as <br />
                          <span className="font-semibold text-white">{userInfo.email}</span>
                        </div>
                        <div className="border-t border-primary-600/30"></div>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm hover:bg-primary-700/50 transition-colors"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <FaUser className="mr-2 text-accent-teal" />
                          Your Profile
                        </Link>
                        <button
                          onClick={() => {
                            logoutHandler();
                            setShowProfileMenu(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-accent-red hover:bg-primary-700/50 transition-colors"
                        >
                          <FaSignOutAlt className="mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-500 text-white transition-colors duration-300 hover:shadow-glow"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 rounded-md bg-primary-700/50 hover:bg-primary-600/50 text-white border border-primary-500/30 transition-all duration-300 hover:border-primary-400/50"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isOpen ? (
              <FaTimes className="h-6 w-6 text-accent-teal transition-transform duration-300 ease-in-out transform rotate-90" />
            ) : (
              <FaBars className="h-6 w-6 transition-transform duration-300 ease-in-out transform" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-gradient-to-b from-primary-800 to-primary-900 shadow-inner-light animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className="flex items-center rounded-md px-3 py-2 text-white hover:bg-primary-700 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {userInfo ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center rounded-md px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="mr-2 text-accent-teal" />
                  Profile
                </Link>
                {userInfo.role === 'customer' && (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center rounded-md px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaTachometerAlt className="mr-2 text-accent-teal" />
                      Dashboard
                    </Link>
                    <Link
                      to="/stations"
                      className="flex items-center rounded-md px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaMapMarkerAlt className="mr-2 text-accent-teal" />
                      EV Stations
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="flex items-center rounded-md px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <FaCalendarAlt className="mr-2 text-accent-teal" />
                      My Bookings
                    </Link>
                  </>
                )}
                {userInfo.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center rounded-md px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaCog className="mr-2 text-accent-teal" />
                    Admin Dashboard
                  </Link>
                )}
                {userInfo.role === 'stationMaster' && (
                  <Link
                    to="/station-master"
                    className="flex items-center rounded-md px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaCarAlt className="mr-2 text-accent-teal" />
                    Station Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logoutHandler();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center rounded-md px-3 py-2 text-accent-red hover:bg-primary-700 transition-colors"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block rounded-md px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block rounded-md px-3 py-2 text-white hover:bg-primary-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
