import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';
import { FaMapMarkerAlt, FaClock, FaCarAlt, FaBatteryFull, FaArrowLeft, FaUserTie, FaCompass } from 'react-icons/fa';
import { useGetStationByIdQuery } from '../slices/stationsApiSlice';
import { useGetEVsByStationQuery } from '../slices/evsApiSlice';

// Add a message component for unverified users
const AadhaarVerificationMessage = () => (
  <div className="bg-primary-800/30 backdrop-blur-sm border-l-4 border-accent-teal/70 p-4 mb-6 rounded-r-lg shadow-glass-sm">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-accent-teal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-white/90">
          <strong>Note:</strong> You're viewing demo vehicles. To access real-time availability and make bookings, please verify your Aadhaar on your profile page.
          <a href="/profile" className="font-medium underline text-accent-teal hover:text-accent-teal/80 ml-1 transition-colors duration-300">
            Verify now
          </a>
        </p>
      </div>
    </div>
  </div>
);

const StationDetailScreen = () => {
  const { id: stationId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Fetch station data
  const { 
    data: station, 
    isLoading: isLoadingStation, 
    error: stationError 
  } = useGetStationByIdQuery(stationId);

  // Fetch EVs for this station
  const { 
    data: evs, 
    isLoading: isLoadingEVs, 
    error: evsError,
    refetch: refetchEVs
  } = useGetEVsByStationQuery(stationId);

  // FOR DEBUGGING
  useEffect(() => {
    console.log("StationDetailScreen: stationId =", stationId);
    console.log("StationDetailScreen: userInfo =", userInfo);
    console.log("StationDetailScreen: userInfo.aadharVerified =", userInfo?.aadharVerified);
    console.log("StationDetailScreen: station =", station);
    console.log("StationDetailScreen: evs =", evs);
    console.log("StationDetailScreen: evsError =", evsError);

    // Attempt to refetch if we have an error but the user is verified
    if (evsError && userInfo?.aadharVerified) {
      console.log("User is verified but got error, retrying fetch");
      refetchEVs();
    }
  }, [stationId, userInfo, station, evs, evsError, refetchEVs]);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800'; // Default if status is undefined
    
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'booked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition) => {
    if (!condition) return 'text-white/60'; // Default if condition is undefined
    
    switch (condition.toLowerCase()) {
      case 'excellent':
        return 'text-accent-teal';
      case 'good':
        return 'text-accent-blue';
      case 'fair':
        return 'text-accent-yellow';
      case 'poor':
        return 'text-accent-red';
      default:
        return 'text-white/60';
    }
  };

  // Check if the user is an unverified customer
  const isUnverifiedCustomer = () => {
    return userInfo && 
           userInfo.role === 'customer' && 
           !userInfo.aadharVerified;
  };

  // Function to handle Aadhaar verification message actions
  const handleVerifyNow = () => {
    navigate('/profile');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-6"
    >
      <button
        onClick={() => navigate('/stations')}
        className="mb-6 flex items-center text-primary-400 hover:text-primary-300 transition-colors duration-300"
      >
        <FaArrowLeft className="mr-2" /> Back to Stations
      </button>

      {isLoadingStation ? (
        <Loader />
      ) : stationError ? (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100/20 backdrop-blur-sm border border-red-500/20 text-red-500 p-4 rounded-lg mb-6 shadow-glass-sm"
        >
          {stationError?.data?.message || 'Error loading station details'}
        </motion.div>
      ) : !station ? (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-100/20 backdrop-blur-sm border border-yellow-500/20 text-yellow-500 p-4 rounded-lg mb-6 shadow-glass-sm"
        >
          Station not found
        </motion.div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card-glass border border-primary-600/20 shadow-glass overflow-hidden mb-8"
          >
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-6 gradient-text">{station.name}</h1>
              
              <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-white/80 flex items-start">
                      <FaMapMarkerAlt className="mr-2 mt-1 text-accent-teal" />
                      <span>{station.address}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80 flex items-center mb-2">
                      <FaClock className="mr-2 text-accent-teal" />
                      <span>
                        Operating Hours: {station.operatingHours.opening} - {station.operatingHours.closing}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="p-4 bg-primary-800/40 border border-primary-700/30 rounded-lg shadow-glass-sm">
                    <h3 className="font-semibold text-lg mb-3 text-white">Station Details</h3>
                    <p className="text-sm text-white/80 mb-2 flex items-center">
                      <FaUserTie className="mr-2 text-accent-teal" />
                      Station Master: {
                        station.stationMasterId && typeof station.stationMasterId === 'object' 
                        ? station.stationMasterId.name 
                        : 'Not assigned'
                      }
                    </p>
                    <p className="text-sm text-white/80 flex items-center">
                      <FaCompass className="mr-2 text-accent-teal" />
                      Geofence Radius: {station.geofenceParameters?.radius || 100}m
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-semibold mb-6 gradient-text">Available EVs</h2>
            
            {/* Show verification message for unverified customers */}
            {isUnverifiedCustomer() && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-primary-800/30 backdrop-blur-sm border-l-4 border-accent-yellow/70 p-4 mb-6 rounded-r-lg shadow-glass-sm"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-accent-yellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-white/90">
                      <strong>Notice:</strong> You need to verify your Aadhaar to see real-time EV availability and make bookings.
                      <button 
                        onClick={handleVerifyNow}
                        className="font-medium underline text-accent-yellow hover:text-accent-yellow/80 ml-1 transition-colors duration-300"
                      >
                        Verify now
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Show EVs loading state */}
            {isLoadingEVs ? (
              <Loader />
            ) : evsError ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-primary-800/30 backdrop-blur-sm border border-red-500/30 text-white/90 p-4 rounded-lg mb-6 shadow-glass-sm"
              >
                <p className="font-semibold mb-1">Error loading EVs:</p>
                <p>{evsError?.data?.message || evsError?.error || 'Failed to load electric vehicles'}</p>
                {evsError?.status === 403 ? (
                  <div className="mt-3 p-3 bg-primary-800/50 border border-primary-700/30 rounded-md">
                    <p className="text-white font-medium">Please verify your Aadhaar to view available EVs</p>
                    <button
                      onClick={handleVerifyNow}
                      className="mt-3 bg-gradient-to-r from-accent-teal to-accent-teal/80 hover:shadow-glow-teal text-white py-2 px-4 rounded-lg transition-all duration-300"
                    >
                      Go to Profile Page
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-white/70">Try refreshing the page or contact support if the problem persists.</p>
                )}
              </motion.div>
            ) : !evs || evs.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-primary-800/30 backdrop-blur-sm border border-primary-700/30 p-6 rounded-lg text-center shadow-glass-sm"
              >
                <p className="text-lg text-white">No EVs are currently available at this station.</p>
                <p className="text-white/60 mt-2">Please check back later or try another station.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {evs.map((ev, index) => {
                  // Debug log each EV object
                  console.log('EV object from API:', ev);
                  return (
                    <motion.div 
                      key={ev._id} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                      className="card-glass border border-primary-600/20 shadow-glass overflow-hidden hover:shadow-glass-lg transition-all duration-300"
                    >
                      <div className="p-5">
                        <h3 className="text-xl font-semibold mb-2 text-white">{ev.model}</h3>
                        <p className="text-white/80 mb-3">Manufacturer: {ev.manufacturer}</p>
                        
                        <div className="mb-4 bg-primary-800/40 p-3 rounded-lg border border-primary-700/30">
                          <div className="flex items-center mb-2">
                            <FaBatteryFull className="text-accent-teal mr-2" />
                            <span className="text-white/80">{ev.batteryCapacity} kWh ({ev.batteryLevel || 100}%)</span>
                          </div>
                          <div className="flex items-center">
                            <FaCarAlt className="text-accent-blue mr-2" />
                            <span className="text-white/80">{ev.range} km range</span>
                          </div>
                        </div>
                        
                        <p className="text-lg font-bold text-accent-teal mb-3">
                          ₹{ev.pricePerHour}/hour
                        </p>
                        
                        <div className="flex justify-between items-center mt-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ev.status)}`}>
                            {ev.status || 'Unknown'}
                          </span>
                          <span className={`text-sm ${getConditionColor(ev.condition)}`}>
                            Condition: {ev.condition || 'Unknown'}
                          </span>
                        </div>
                        
                        {ev.status === 'available' ? (
                          <Link
                            to={`/booking/${ev._id}`}
                            className="mt-4 block w-full text-center bg-gradient-to-r from-accent-teal to-accent-teal/80 hover:shadow-glow-teal text-white px-4 py-2 rounded-lg transition-all duration-300"
                          >
                            Book Now
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="mt-4 block w-full text-center bg-primary-800/50 text-white/50 px-4 py-2 rounded-lg cursor-not-allowed"
                          >
                            Not Available
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default StationDetailScreen; 