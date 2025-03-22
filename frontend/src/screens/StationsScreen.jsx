import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';
import { FaMapMarkerAlt, FaClock, FaInfoCircle, FaLocationArrow } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useGetStationsQuery, useGetNearestStationsQuery } from '../slices/stationsApiSlice';

const StationsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  // Create a ref to track if it's the initial mount
  const initialMountRef = useRef(true);
  // Track if location was explicitly requested by user
  const [userRequestedLocation, setUserRequestedLocation] = useState(false);

  // Get all stations if location not available
  const { data: allStations, isLoading: isLoadingAllStations, error: allStationsError } = useGetStationsQuery();

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

  // FOR DEBUGGING
  console.log("StationsScreen rendering, userInfo:", userInfo);
  console.log("userLocation:", userLocation);
  console.log("nearestStations:", nearestStations);
  console.log("nearestStationsError:", nearestStationsError);
  console.log("allStations:", allStations);

  // Get user location on component mount only once
  useEffect(() => {
    // Only auto-fetch location on first mount
    if (initialMountRef.current) {
      initialMountRef.current = false;
      
      // Check if we already have location in localStorage
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        try {
          const parsedLocation = JSON.parse(savedLocation);
          console.log('Using saved location from localStorage:', parsedLocation);
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

  // Add distance to stations if user location is available
  const stationsWithDistance = () => {
    if (!userLocation) return allStations || [];
    
    // Use nearest stations from API if available
    if (nearestStations && nearestStations.length > 0) {
      return nearestStations;
    }
    
    // Fall back to calculating distances manually if needed
    if (allStations && allStations.length > 0) {
      console.log('Falling back to manual distance calculation with allStations');
      const stationsWithDist = allStations.map(station => {
        // Check if station has coordinates in the right format
        const stationLat = station.coordinates?.lat || 
                           station.geofenceParameters?.coordinates?.[1];
        const stationLng = station.coordinates?.lng || 
                           station.geofenceParameters?.coordinates?.[0];
        
        if (!stationLat || !stationLng) {
          return { ...station, distance: null };
        }
        
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          stationLat,
          stationLng
        );
        
        return {
          ...station,
          distance: distance
        };
      });
      
      // Sort by distance
      return stationsWithDist
        .filter(s => s.distance !== null)
        .sort((a, b) => a.distance - b.distance);
    }
    
    return [];
  };

  // Add a parameter to indicate if this was a user-requested location update
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
    setUserRequestedLocation(showToasts);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('Geolocation success - raw position:', position);
        console.log('Setting user location to:', userPos);
        
        // Save to localStorage for future visits
        localStorage.setItem('userLocation', JSON.stringify(userPos));
        
        setUserLocation(userPos);
        setIsGettingLocation(false);
        setLocationError('');
        
        // Only show toast if user explicitly requested location
        if (showToasts) {
          toast.success('Found your location! Showing nearest stations.');
        }
        console.log('User location set to:', userPos);
      },
      (error) => {
        setIsGettingLocation(false);
        setLocationError(`Unable to retrieve your location: ${error.message}`);
        if (showToasts) {
          toast.error(`Unable to retrieve your location: ${error.message}`);
        }
        console.error('Geolocation error:', error);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  // Add function to handle the button click
  const handleFindNearestClick = () => {
    getUserLocation(true); // Explicitly show toasts when button is clicked
  };

  const displayedStations = stationsWithDistance();
  const isLoading = isLoadingAllStations || isLoadingNearestStations;
  // Only show API error if we're not showing fallback stations
  const error = (nearestStationsError && (!displayedStations || displayedStations.length === 0)) || allStationsError;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EV Stations</h1>
        <button 
          onClick={handleFindNearestClick} 
          disabled={isGettingLocation}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2"
        >
          <FaLocationArrow className="mr-2" />
          {isGettingLocation ? 'Getting Location...' : 'Find Nearest Stations'}
        </button>
      </div>

      {userLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Your Location</h2>
          <p className="text-blue-700 flex items-center">
            <FaMapMarkerAlt className="mr-2" />
            Latitude: {userLocation.lat.toFixed(6)}, Longitude: {userLocation.lng.toFixed(6)}
          </p>
          {nearestStationsError && displayedStations && displayedStations.length > 0 && (
            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-3 text-yellow-800 text-sm">
              <p className="font-medium">Note: Using calculated distances instead of nearest stations API.</p>
              <p>The nearest stations API encountered an error, but we're showing stations with calculated distances.</p>
            </div>
          )}
        </div>
      )}

      {locationError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-red-700">
          {locationError}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-red-700">
          <p className="font-semibold mb-1">Error loading stations:</p>
          <p>{error.data?.message || error.error || 'An error occurred'}</p>
          {nearestStationsError && userLocation && (
            <div className="mt-2 text-sm">
              <p>Failed to fetch nearest stations with:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>Latitude: {userLocation.lat}</li>
                <li>Longitude: {userLocation.lng}</li>
                <li>Status: {nearestStationsError.status}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <Loader />
      ) : displayedStations && displayedStations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedStations.map((station) => (
            <div key={station._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-2">{station.name}</h2>
                <p className="text-gray-600 mb-4 flex items-start">
                  <FaMapMarkerAlt className="mr-2 mt-1 text-gray-500" />
                  <span>{station.address}</span>
                </p>
                <p className="text-gray-600 mb-4 flex items-center">
                  <FaClock className="mr-2 text-gray-500" />
                  <span>
                    {station.operatingHours.opening} - {station.operatingHours.closing}
                  </span>
                </p>
                
                {userLocation && station.distance && (
                  <p className="text-green-700 font-medium mb-3">
                    {typeof station.distance === 'number' ? 
                      `${station.distance.toFixed(2)} km from your location` : 
                      'Distance unavailable'}
                  </p>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-blue-600 flex items-center">
                    <FaInfoCircle className="mr-1" /> 
                    {station.evCount || station.evs?.length || 0} EVs Available
                  </span>
                  <Link
                    to={`/stations/${station._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
          <p className="text-yellow-700 mb-4">No stations found.</p>
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
  );
};

export default StationsScreen; 