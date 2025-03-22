import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';
import { FaMapMarkerAlt, FaClock, FaCarAlt, FaBatteryFull, FaArrowLeft } from 'react-icons/fa';
import { useGetStationByIdQuery } from '../slices/stationsApiSlice';
import { useGetEVsByStationQuery } from '../slices/evsApiSlice';

// Add a message component for unverified users
const AadhaarVerificationMessage = () => (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-yellow-700">
          <strong>Note:</strong> You're viewing demo vehicles. To access real-time availability and make bookings, please verify your Aadhaar on your profile page.
          <a href="/profile" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
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
    if (!condition) return 'text-gray-600'; // Default if condition is undefined
    
    switch (condition.toLowerCase()) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
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
    <div className="container mx-auto px-4 py-6">
      <button
        onClick={() => navigate('/stations')}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <FaArrowLeft className="mr-2" /> Back to Stations
      </button>

      {isLoadingStation ? (
        <Loader />
      ) : stationError ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {stationError?.data?.message || 'Error loading station details'}
        </div>
      ) : !station ? (
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-4">
          Station not found
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{station.name}</h1>
              
              <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-gray-600 flex items-start">
                      <FaMapMarkerAlt className="mr-2 mt-1 text-gray-500" />
                      <span>{station.address}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 flex items-center mb-2">
                      <FaClock className="mr-2 text-gray-500" />
                      <span>
                        Operating Hours: {station.operatingHours.opening} - {station.operatingHours.closing}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Station Details</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Station Master: {
                        station.stationMasterId && typeof station.stationMasterId === 'object' 
                        ? station.stationMasterId.name 
                        : 'Not assigned'
                      }
                    </p>
                    <p className="text-sm text-gray-600">
                      Geofence Radius: {station.geofenceParameters?.radius || 100}m
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Available EVs</h2>
            
            {/* Show verification message for unverified customers */}
            {isUnverifiedCustomer() && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Notice:</strong> You need to verify your Aadhaar to see real-time EV availability and make bookings.
                      <button 
                        onClick={handleVerifyNow}
                        className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1"
                      >
                        Verify now
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Show EVs loading state */}
            {isLoadingEVs ? (
              <Loader />
            ) : evsError ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                <p className="font-semibold mb-1">Error loading EVs:</p>
                <p>{evsError?.data?.message || evsError?.error || 'Failed to load electric vehicles'}</p>
                {evsError?.status === 403 ? (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-blue-800 font-medium">Please verify your Aadhaar to view available EVs</p>
                    <button
                      onClick={handleVerifyNow}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                    >
                      Go to Profile Page
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm">Try refreshing the page or contact support if the problem persists.</p>
                )}
              </div>
            ) : !evs || evs.length === 0 ? (
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <p className="text-lg text-blue-700">No EVs are currently available at this station.</p>
                <p className="text-gray-600 mt-2">Please check back later or try another station.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evs.map((ev) => {
                  // Debug log each EV object
                  console.log('EV object from API:', ev);
                  return (
                    <div 
                      key={ev._id} 
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <div className="p-5">
                        <h3 className="text-xl font-semibold mb-2">{ev.model}</h3>
                        <p className="text-gray-700 mb-2">Manufacturer: {ev.manufacturer}</p>
                        
                        <div className="mb-4">
                          <div className="flex items-center mb-1">
                            <FaBatteryFull className="text-green-500 mr-2" />
                            <span>{ev.batteryCapacity} kWh ({ev.batteryLevel || 100}%)</span>
                          </div>
                          <div className="flex items-center">
                            <FaCarAlt className="text-blue-500 mr-2" />
                            <span>{ev.range} km range</span>
                          </div>
                        </div>
                        
                        <p className="text-lg font-bold text-blue-700 mb-2">
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
                            className="mt-4 block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                          >
                            Book Now
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="mt-4 block w-full text-center bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed"
                          >
                            Not Available
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StationDetailScreen; 