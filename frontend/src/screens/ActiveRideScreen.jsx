import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaCarSide, FaCheck, FaCamera, FaTools } from 'react-icons/fa';
import Loader from '../components/Loader';
import MessageAlert from '../components/MessageAlert';
import LiveLocationMap from '../components/LiveLocationMap';
import { useGetBookingByIdQuery, useUpdateBookingStatusMutation } from '../slices/bookingsApiSlice';
import { useGetStationsQuery } from '../slices/stationsApiSlice';
import ErrorBoundary from '../components/ErrorBoundary';

const ActiveRideScreen = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [isInParkingZone, setIsInParkingZone] = useState(false);
  const [userLocationData, setUserLocationData] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now().toString());
  const [mapError, setMapError] = useState(false);
  const [nearestStation, setNearestStation] = useState(null);
  const [showDestinationSelector, setShowDestinationSelector] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [testMode, setTestMode] = useState(false);
  const [simulatedLocation, setSimulatedLocation] = useState(null);
  
  // Cleanup any existing Leaflet map instances when component unmounts
  useEffect(() => {
    // Ensure Leaflet is defined in browser environment
    if (typeof window !== 'undefined' && window.L) {
      console.log('ActiveRideScreen mounted');
    }
    
    return () => {
      console.log('ActiveRideScreen unmounting');
      // Clean up global leaflet containers to prevent duplicate map initialization
      if (typeof document !== 'undefined') {
        const containers = document.querySelectorAll('.leaflet-container');
        containers.forEach(container => {
          // Try to identify if this container has a Leaflet map instance
          if (container._leaflet_id) {
            console.log('Cleaning up leaflet container on unmount');
          }
        });
      }
    };
  }, []);
  
  // Fetch booking details
  const { 
    data: booking, 
    isLoading: isLoadingBooking, 
    error: bookingError,
    refetch 
  } = useGetBookingByIdQuery(bookingId);
  
  // Get all stations for the map
  const { data: allStations } = useGetStationsQuery();
  
  // Mutation for updating booking status
  const [updateBookingStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();
  
  // Calculate elapsed time
  useEffect(() => {
    if (booking && booking.status === 'ongoing') {
      const startTime = new Date(booking.startTime).getTime();
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const elapsed = now - startTime;
        setElapsedTime(Math.floor(elapsed / 1000)); // Convert to seconds
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [booking]);
  
  // Format elapsed time as HH:MM:SS
  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Handle location updates from LiveLocationMap
  const handleLocationUpdate = (locationData) => {
    setUserLocationData(locationData);
    setIsInParkingZone(locationData.isInGeofence);
    
    // Update nearest station information if available
    if (locationData.nearestStation) {
      setNearestStation(locationData.nearestStation);
    }
  };
  
  // When test mode is toggled, setup simulated location data
  useEffect(() => {
    if (testMode && booking?.endStationId) {
      // In test mode, simulate being at the destination station with high accuracy
      const destination = booking.endStationId;
      const stationLat = destination.coordinates?.lat || destination.geofenceParameters?.coordinates[1];
      const stationLng = destination.coordinates?.lng || destination.geofenceParameters?.coordinates[0];
      
      setSimulatedLocation({
        lat: stationLat,
        lng: stationLng,
        accuracy: 5, // 5 meters accuracy
        forceInGeofence: true // Force location to be considered inside geofence
      });
      
      // Toast notification about test mode
      toast.info('Test mode enabled: Location simulated at destination station');
    } else {
      setSimulatedLocation(null);
    }
  }, [testMode, booking]);
  
  // Handle starting the ride
  const handleStartRide = async () => {
    if (!booking) return;
    
    try {
      await updateBookingStatus({
        id: bookingId,
        status: 'ongoing'
      }).unwrap();
      
      toast.success('Your ride has started!');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to start the ride');
    }
  };
  
  // Handle completing the ride
  const handleCompleteRide = async () => {
    if (!booking) return;
    
    // Check if user is in the parking zone (bypass in test mode)
    if (!isInParkingZone && !testMode) {
      toast.error('You must be in the designated parking zone to complete the ride');
      setShowCompleteConfirm(false);
      return;
    }
    
    try {
      await updateBookingStatus({
        id: bookingId,
        status: 'completed'
      }).unwrap();
      
      toast.success('Ride completed successfully!');
      refetch();
      setShowCompleteConfirm(false);
      
      // Navigate to booking details or history after a short delay
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to complete the ride');
    }
  };
  
  // Check if the booking belongs to the current user
  const isUsersBooking = () => {
    return userInfo && booking && booking.customerId && 
           (booking.customerId._id === userInfo._id || booking.customerId === userInfo._id);
  };
  
  // Calculate remaining time based on booking end time
  const getRemainingTime = () => {
    if (!booking || !booking.endTime) return null;
    
    const endTime = new Date(booking.endTime).getTime();
    const now = new Date().getTime();
    const remaining = endTime - now;
    
    if (remaining <= 0) {
      return 'Time expired';
    }
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };
  
  // Main render
  return (
    <div className="container mx-auto px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>
      
      <h1 className="text-2xl font-bold mb-6">
        Active Ride
        {booking?.status === 'ongoing' && 
          <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
            In Progress
          </span>
        }
        
        {/* Test Mode Toggle */}
        <button 
          onClick={() => setTestMode(!testMode)} 
          className={`ml-4 text-sm ${testMode ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'} px-3 py-1 rounded-full flex items-center`}
        >
          <FaTools className="mr-1" />
          {testMode ? 'Test Mode ON' : 'Test Mode OFF'}
        </button>
      </h1>
      
      {isLoadingBooking ? (
        <Loader />
      ) : bookingError ? (
        <MessageAlert variant="danger">
          {bookingError?.data?.message || 'Error loading booking details'}
        </MessageAlert>
      ) : !booking ? (
        <MessageAlert variant="warning">
          Booking not found
        </MessageAlert>
      ) : !isUsersBooking() ? (
        <MessageAlert variant="danger">
          You don't have permission to view this booking
        </MessageAlert>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Map section */}
          <div className="h-[50vh] w-full relative">
            {mapError ? (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <div className="text-center p-4">
                  <p className="text-red-600 mb-2">Map failed to load</p>
                  <button 
                    onClick={() => {
                      setMapKey(Date.now().toString());
                      setMapError(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : booking && (
              <ErrorBoundary onError={() => setMapError(true)}>
                <LiveLocationMap 
                  key={`ride-map-${mapKey}`}
                  bookingData={booking} 
                  stations={allStations || []}
                  height="100%"
                  watchPosition={booking.status === 'ongoing'}
                  onLocationUpdate={handleLocationUpdate}
                  testMode={testMode}
                  simulatedLocation={simulatedLocation}
                />
              </ErrorBoundary>
            )}
            
            {booking && booking.status === 'ongoing' && (
              <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-blue-800">
                    <FaClock className="mr-2" />
                    <span className="font-mono font-bold">{formatElapsedTime(elapsedTime)}</span>
                  </div>
                  <div className="text-green-700 font-medium">
                    {getRemainingTime()}
                  </div>
                </div>
              </div>
            )}
            
            {/* Geofence Status Indicator */}
            {booking && booking.status === 'ongoing' && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className={`p-3 rounded-lg shadow-md text-center font-medium ${
                  isInParkingZone 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isInParkingZone 
                    ? '✅ You are in the designated parking zone' 
                    : '⚠️ You must return to the designated parking zone to end ride'}
                </div>
              </div>
            )}
            
            {/* Test Mode Helper Panel */}
            {testMode && booking?.status === 'ongoing' && (
              <div className="absolute top-16 left-4 right-4 bg-red-100 border border-red-300 p-3 rounded-lg shadow-md my-2">
                <p className="text-red-700 font-bold text-sm text-center">
                  TEST MODE: Ride can be completed regardless of location
                </p>
              </div>
            )}
          </div>
          
          {/* Nearest Station Information */}
          {nearestStation && (
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <h3 className="font-semibold flex items-center">
                <FaMapMarkerAlt className="text-blue-600 mr-2" />
                Nearest Station
              </h3>
              <div className="mt-2">
                <p className="text-gray-800 font-medium">{nearestStation.name}</p>
                <p className="text-gray-600">{nearestStation.address}</p>
                <p className="text-blue-700 text-sm mt-1">
                  <strong>{nearestStation.distance} km</strong> from your current location
                </p>
              </div>
              
              {!selectedDestination && !booking?.endStationId && (
                <button 
                  onClick={() => setShowDestinationSelector(!showDestinationSelector)}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center"
                >
                  <FaMapMarkerAlt className="mr-2" />
                  {showDestinationSelector ? 'Hide Destinations' : 'Set as Destination'}
                </button>
              )}
            </div>
          )}
          
          {/* Destination Selector */}
          {showDestinationSelector && allStations && allStations.length > 0 && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold mb-2">Select Destination Station</h3>
              <div className="max-h-40 overflow-y-auto">
                {allStations.map(station => (
                  <div 
                    key={station._id}
                    className={`p-2 mb-2 rounded-md cursor-pointer hover:bg-blue-50 ${
                      selectedDestination?._id === station._id ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'
                    }`}
                    onClick={() => setSelectedDestination(station)}
                  >
                    <p className="font-medium">{station.name}</p>
                    <p className="text-xs text-gray-600">{station.address}</p>
                  </div>
                ))}
              </div>
              
              {selectedDestination && (
                <div className="mt-3 flex">
                  <button 
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm mr-2"
                    onClick={() => {
                      toast.success(`Destination set to ${selectedDestination.name}`);
                      setShowDestinationSelector(false);
                      // Here you would update the booking endpoint with new destination
                    }}
                  >
                    Confirm Destination
                  </button>
                  <button 
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                    onClick={() => setSelectedDestination(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Booking details */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">
                {booking.evId.manufacturer} {booking.evId.model}
              </h2>
              <p className="text-gray-700 mb-1">
                <strong>Registration:</strong> {booking.evId.registrationNumber || 'Not available'}
              </p>
              <p className="text-gray-700">
                <strong>Battery Level:</strong> {booking.evId.batteryLevel || '100'}%
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <FaMapMarkerAlt className="text-green-600 mr-2" />
                  Pickup Station
                </h3>
                <p className="text-gray-800 font-medium">{booking.startStationId.name}</p>
                <p className="text-gray-600">{booking.startStationId.address}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <FaClock className="text-blue-600 mr-2" />
                  Booking Time
                </h3>
                <p className="text-gray-800">
                  <strong>Start:</strong> {new Date(booking.startTime).toLocaleString()}
                </p>
                <p className="text-gray-800">
                  <strong>End:</strong> {new Date(booking.endTime).toLocaleString()}
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col space-y-4">
              {booking.status === 'approved' && (
                <button
                  onClick={handleStartRide}
                  disabled={isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                >
                  <FaCarSide className="mr-2" />
                  Start My Ride
                </button>
              )}
              
              {booking.status === 'ongoing' && (
                <>
                  <button
                    onClick={() => setShowCompleteConfirm(true)}
                    disabled={isUpdating || (!isInParkingZone && !testMode)}
                    className={`w-full ${
                      isInParkingZone || testMode
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-400 cursor-not-allowed'
                    } text-white py-3 rounded-lg font-medium flex items-center justify-center`}
                  >
                    <FaCheck className="mr-2" />
                    {isInParkingZone || testMode ? 'End Ride' : 'Return to Parking Zone to End Ride'}
                  </button>
                  
                  <button
                    onClick={() => navigate(`/upload-photos/${bookingId}`)}
                    className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-medium flex items-center justify-center"
                  >
                    <FaCamera className="mr-2" />
                    Upload Vehicle Photos
                  </button>
                </>
              )}
              
              {booking.status === 'completed' && (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
                  Your ride was completed successfully!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Complete Your Ride</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to end your ride? Make sure you have parked the EV at the designated station and taken photos of its condition.
              {testMode && (
                <span className="block mt-2 text-red-600 font-semibold">
                  ⚠️ Test Mode: Geofence requirements are bypassed
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCompleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteRide}
                disabled={isUpdating || (!isInParkingZone && !testMode)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating ? 'Processing...' : 'Yes, End Ride'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveRideScreen; 