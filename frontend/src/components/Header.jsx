import { FaSignInAlt, FaSignOutAlt, FaUser, FaIdCard, FaUserCog, FaCheckCircle, FaChevronDown, FaCalendarAlt, FaTachometerAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../slices/usersApiSlice';
import { logout } from '../slices/authSlice';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      console.log('Logout initiated');
      // Close the dropdown
      setShowDropdown(false);
      setIsOpen(false);
      
      await logoutApiCall().unwrap();
      dispatch(logout());
      
      // Force clear localStorage as backup
      localStorage.removeItem('userInfo');
      
      console.log('Logout successful, redirecting to login page');
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

  return (
    <header className="bg-gray-800 text-white">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            EV Rental
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            {userInfo ? (
              <>
                <div className="relative group">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center text-gray-800 hover:text-blue-600 focus:outline-none"
                  >
                    <span className="mr-1">{userInfo.name}</span>
                    {userInfo.role && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded ml-2">
                        {userInfo.role}
                      </span>
                    )}
                    <FaChevronDown className="ml-1 text-xs" />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        Profile
                      </Link>
                      {userInfo.role === 'customer' && (
                        <>
                          <Link
                            to="/dashboard"
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                            onClick={() => setShowDropdown(false)}
                          >
                            <FaTachometerAlt className="inline mr-2" />
                            Dashboard
                          </Link>
                          <Link
                            to="/my-bookings"
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                            onClick={() => setShowDropdown(false)}
                          >
                            <FaCalendarAlt className="inline mr-2" />
                            My Bookings
                          </Link>
                        </>
                      )}
                      {userInfo.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                          onClick={() => setShowDropdown(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      {userInfo.role === 'stationMaster' && (
                        <>
                          <Link
                            to="/station-master"
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                            onClick={() => setShowDropdown(false)}
                          >
                            Station Dashboard
                          </Link>
                          <Link
                            to="/station-master/bookings"
                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                            onClick={() => setShowDropdown(false)}
                          >
                            Station Bookings
                          </Link>
                        </>
                      )}
                      <button
                        onClick={logoutHandler}
                        className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="py-2 px-3 flex items-center hover:bg-gray-700 rounded">
                  <FaSignInAlt className="mr-1" /> Sign In
                </Link>
                <Link to="/register" className="py-2 px-3 flex items-center hover:bg-gray-700 rounded">
                  <FaSignOutAlt className="mr-1" /> Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-200"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              {userInfo ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  {userInfo.role === 'customer' && (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaTachometerAlt className="inline mr-2" />
                        Dashboard
                      </Link>
                      <Link
                        to="/stations"
                        className="block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-200"
                        onClick={() => setIsOpen(false)}
                      >
                        EV Stations
                      </Link>
                      <Link
                        to="/my-bookings"
                        className="block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <FaCalendarAlt className="inline mr-2" />
                        My Bookings
                      </Link>
                    </>
                  )}
                  {userInfo.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {userInfo.role === 'stationMaster' && (
                    <>
                      <Link
                        to="/station-master"
                        className="block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-200"
                        onClick={() => setIsOpen(false)}
                      >
                        Station Dashboard
                      </Link>
                      <Link
                        to="/station-master/bookings"
                        className="block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-200"
                        onClick={() => setIsOpen(false)}
                      >
                        Station Bookings
                      </Link>
                    </>
                  )}
                  <button
                    onClick={logoutHandler}
                    className="w-full text-left block px-3 py-2 rounded-md text-gray-800 hover:bg-gray-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block py-2 px-4 hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaSignInAlt className="inline mr-1" /> Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="block py-2 px-4 hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaSignOutAlt className="inline mr-1" /> Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
