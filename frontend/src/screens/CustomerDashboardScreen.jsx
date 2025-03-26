import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaMapMarkerAlt, FaClock, FaInfoCircle, FaLocationArrow, FaBolt, FaHistory, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useGetNearestStationsQuery } from '../slices/stationsApiSlice';
import { useGetMyBookingsQuery } from '../slices/bookingsApiSlice';

const CustomerDashboardScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [userLocation, setUserLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [penalties, setPenalties] = useState([]);

  // Get customer's bookings to check for penalties
  const { data: bookings, isLoading: isLoadingBookings } = useGetMyBookingsQuery();

  // Extract penalties from bookings
  useEffect(() => {
    if (bookings) {
      const bookingsWithPenalties = bookings.filter(booking => 
        booking.penalty || booking.hasPenalty
      );
      setPenalties(bookingsWithPenalties);
    }
  }, [bookings]);

  // Get nearest stations if location is available
  const { data: nearestStations, isLoading: isLoadingNearestStations, error: nearestStationsError } = 
    useGetNearestStationsQuery(
      userLocation ? { 
        lat: userLocation.lat, 
        lng: userLocation.lng, 
        maxDistance: 10000  // 10km in meters
      } : { 
        skip: true 
      },
      { skip: !userLocation }
    );

  // Get user location on component mount
  useEffect(() => {
    // Check if we already have location in localStorage
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setUserLocation(parsedLocation);
      } catch (error) {
        console.error('Failed to parse saved location:', error);
        // If parsing fails, get fresh location
        getUserLocation(false);
      }
    } else {
      // Get location silently on first load
      getUserLocation(false);
    }
  }, []);

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const getUserLocation = (showToasts = true) => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      if (showToasts) {
        toast.error('Geolocation is not supported by your browser');
      }
      return;
    }

    setIsGettingLocation(true);
    if (showToasts) {
      toast.info('Getting your location...');
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Save to localStorage for future visits
        localStorage.setItem('userLocation', JSON.stringify(userPos));
        
        setUserLocation(userPos);
        setIsGettingLocation(false);
        setLocationError('');
        
        if (showToasts) {
          toast.success('Found your location! Showing nearest stations.');
        }
      },
      (error) => {
        setIsGettingLocation(false);
        setLocationError(`Unable to retrieve your location: ${error.message}`);
        if (showToasts) {
          toast.error(`Unable to retrieve your location: ${error.message}`);
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  const handleFindNearestClick = () => {
    getUserLocation(true);
  };

  // Get the nearest station from the API response
  const nearestStation = nearestStations && nearestStations.length > 0 ? nearestStations[0] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {userInfo?.name || 'Customer'}</h1>
        <p className="text-gray-600">Find the nearest EV charging station and start your journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel - Nearest Station */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Nearest Station</h2>
              <button 
                onClick={handleFindNearestClick} 
                disabled={isGettingLocation}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2"
              >
                <FaLocationArrow className="mr-2" />
                {isGettingLocation ? 'Getting Location...' : 'Update Location'}
              </button>
            </div>

            {userLocation && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Location</h3>
                <p className="text-blue-700 flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  Latitude: {userLocation.lat.toFixed(6)}, Longitude: {userLocation.lng.toFixed(6)}
                </p>
              </div>
            )}

            {locationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-red-700">
                {locationError}
              </div>
            )}

            {isLoadingNearestStations ? (
              <Loader />
            ) : nearestStationsError ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-red-700">
                <p className="font-semibold mb-1">Error loading nearest station:</p>
                <p>{nearestStationsError.data?.message || nearestStationsError.error || 'An error occurred'}</p>
              </div>
            ) : nearestStation ? (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{nearestStation.name}</h3>
                  <p className="text-gray-600 mb-4 flex items-start">
                    <FaMapMarkerAlt className="mr-2 mt-1 text-gray-500" />
                    <span>{nearestStation.address}</span>
                  </p>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <FaClock className="mr-2 text-gray-500" />
                    <span>
                      {nearestStation.operatingHours.opening} - {nearestStation.operatingHours.closing}
                    </span>
                  </p>
                  
                  {userLocation && nearestStation.distance && (
                    <p className="text-green-700 font-medium mb-3">
                      {typeof nearestStation.distance === 'number' ? 
                        `${nearestStation.distance.toFixed(2)} km from your location` : 
                        'Distance unavailable'}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-sm text-blue-600 flex items-center">
                      <FaInfoCircle className="mr-1" /> 
                      {nearestStation.evCount || nearestStation.evs?.length || 0} EVs Available
                    </span>
                    <Link
                      to={`/stations/${nearestStation._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
                <p className="text-yellow-700 mb-4">No stations found near your location.</p>
                {!userLocation && (
                  <button 
                    onClick={handleFindNearestClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2"
                  >
                    Find Stations Near Me
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Side Panel - Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/stations" className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-md text-blue-700">
                <FaMapMarkerAlt className="mr-3" />
                Browse All Stations
              </Link>
              <Link to="/my-bookings" className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-md text-green-700">
                <FaHistory className="mr-3" />
                My Bookings
              </Link>
              <Link to="/profile" className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-md text-purple-700">
                <FaBolt className="mr-3" />
                Manage Profile
              </Link>
            </div>
          </div>

          {/* Penalties Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              Penalties
            </h2>
            
            {isLoadingBookings ? (
              <Loader />
            ) : penalties.length > 0 ? (
              <div className="space-y-4">
                {penalties.slice(0, 3).map((booking) => (
                  <div key={booking._id} className="border border-red-100 rounded-md p-3 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{booking.evId?.manufacturer} {booking.evId?.model}</p>
                        <p className="text-sm text-gray-600">
                          {booking.penalty ? 
                            new Date(booking.penalty.timestamp).toLocaleDateString() : 
                            new Date(booking.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-red-600 font-bold">
                        ₹{booking.penalty ? booking.penalty.amount : booking.penaltyAmount}
                      </div>
                    </div>
                    <p className="text-sm mb-2">
                      {booking.penalty ? booking.penalty.reason : booking.penaltyReason}
                    </p>
                    <Link 
                      to={`/bookings/${booking._id}/penalty-receipt`}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      View Receipt →
                    </Link>
                  </div>
                ))}
                
                {penalties.length > 3 && (
                  <Link 
                    to="/my-bookings"
                    className="block text-center text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    View all penalties
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No penalties on your account. Let's keep it that way!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboardScreen; 