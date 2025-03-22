import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaArrowLeft, FaCreditCard, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa';
import Loader from '../components/Loader';
import { useGetEVByIdQuery } from '../slices/evsApiSlice';
import { useCreateBookingMutation } from '../slices/bookingsApiSlice';
import { useGetStationsQuery } from '../slices/stationsApiSlice';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

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
          <strong>Note:</strong> You're viewing demo vehicle data. To make real bookings, please verify your Aadhaar on your profile page.
          <a href="/profile" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-1">
            Verify now
          </a>
        </p>
      </div>
    </div>
  </div>
);

const BookingScreen = () => {
  const { evId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedSourceStation, setSelectedSourceStation] = useState('');
  const [selectedDestinationStation, setSelectedDestinationStation] = useState('');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);
  
  // Fetch EV data from API
  const { 
    data: ev, 
    isLoading, 
    error 
  } = useGetEVByIdQuery(evId);
  
  // Fetch all stations
  const {
    data: stations,
    isLoading: stationsLoading,
    error: stationsError
  } = useGetStationsQuery();
  
  // Booking mutation
  const [createBooking, { isLoading: isBooking, error: bookingError }] = useCreateBookingMutation();
  
  // Set min date to today for the date picker
  const today = new Date().toISOString().split('T')[0];
  
  // FOR DEBUGGING
  useEffect(() => {
    console.log("BookingScreen: evId =", evId);
    console.log("BookingScreen: userInfo =", userInfo);
    console.log("BookingScreen: ev =", ev);
  }, [evId, userInfo, ev]);
  
  // Auto-select source station based on EV's current station
  useEffect(() => {
    if (ev && ev.station && ev.station._id) {
      setSelectedSourceStation(ev.station._id);
    }
  }, [ev]);
  
  // Calculate the total price whenever duration changes or when EV data is loaded
  useEffect(() => {
    if (ev) {
      setTotalPrice(calculateTotal(duration));
    }
  }, [duration, ev]);
  
  // Show booking error if it exists
  useEffect(() => {
    if (bookingError) {
      toast.error(bookingError?.data?.message || 'Failed to create booking');
    }
  }, [bookingError]);
  
  // Calculate the total price based on EV price and hours
  const calculateTotal = (hours) => {
    return ev ? ev.pricePerHour * hours : 0;
  };
  
  const handleDurationChange = (e) => {
    const hours = parseInt(e.target.value);
    setDuration(hours);
    if (ev) {
      setTotalPrice(calculateTotal(hours));
    }
  };
  
  // Check if the user is an unverified customer
  const isUnverifiedCustomer = () => {
    return userInfo && 
           userInfo.role === 'customer' && 
           userInfo.aadharVerified === false;
  };
  
  const validateFormData = () => {
    if (!startDate) {
      toast.error('Please select a pickup date');
      return false;
    }
    
    if (!startTime) {
      toast.error('Please select a pickup time');
      return false;
    }
    
    if (!ev) {
      toast.error('EV information not available');
      return false;
    }
    
    if (!selectedSourceStation) {
      toast.error('Please select a pickup station');
      return false;
    }
    
    if (!selectedDestinationStation) {
      toast.error('Please select a drop-off station');
      return false;
    }

    // Add check for unverified users
    if (isUnverifiedCustomer()) {
      toast.error('Please verify your Aadhaar to make a real booking');
      return false;
    }
    
    return true;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!validateFormData()) {
      return;
    }

    // Combine date and time
    const startDateTime = new Date(`${startDate}T${startTime}`);
      
    // Calculate end time based on duration
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);
    
    // Create booking data object
    const bookingData = {
      evId: ev._id,
      startStationId: selectedSourceStation,
      endStationId: selectedDestinationStation,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: duration, // Add duration field (in hours)
      totalCost: totalPrice, // Add totalCost field
      bookingType: 'scheduled',
    };
    
    console.log('Prepared booking data:', bookingData);
    
    // Store the booking data and show privacy policy
    setPendingBookingData(bookingData);
    setShowPrivacyPolicy(true);
  };
  
  // Function to complete the booking after privacy policy acceptance
  const handlePrivacyPolicyAccepted = async () => {
    try {
      // Make API call to create booking using the pending booking data
      console.log('Creating booking with data:', pendingBookingData);
      const response = await createBooking(pendingBookingData).unwrap();
      console.log('Booking created:', response);
      
      toast.success('Booking successful! Your EV is reserved.');
      
      // Navigate back to the station that had this EV
      if (ev.station && ev.station._id) {
        navigate(`/stations/${ev.station._id}`);
      } else {
        navigate('/stations');
      }
    } catch (err) {
      console.error('Failed to create booking:', err);
      toast.error(err?.data?.message || 'Failed to create booking. Please try again.');
    }
  };
  
  // Handle navigation back to station
  const handleBackClick = () => {
    if (ev && ev.station && ev.station._id) {
      navigate(`/stations/${ev.station._id}`);
    } else {
      navigate('/stations');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <button
        onClick={handleBackClick}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        <FaArrowLeft className="mr-2" /> Back to Station
      </button>
      
      {isUnverifiedCustomer() && <AadhaarVerificationMessage />}
      
      {isLoading || stationsLoading ? (
        <Loader />
      ) : error && !isUnverifiedCustomer() ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error?.data?.message || 'Error loading EV details'}
        </div>
      ) : stationsError ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {stationsError?.data?.message || 'Error loading stations'}
        </div>
      ) : !ev ? (
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-4">
          EV not found or currently unavailable
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-blue-50 p-6 border-b border-blue-100">
            <h1 className="text-2xl font-bold mb-2">Book Your EV</h1>
            <p className="text-gray-600">Fill in the details to book {ev.model}</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* EV Information */}
              <div>
                <h2 className="text-xl font-semibold mb-4">EV Details</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">{ev.model}</h3>
                  <p className="text-gray-700 mb-3">Manufacturer: {ev.manufacturer}</p>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Battery Capacity</p>
                        <p className="font-medium">{ev.batteryCapacity} kWh</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Battery Level</p>
                        <p className="font-medium">{ev.batteryLevel || 100}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Range</p>
                        <p className="font-medium">{ev.range} km</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Price per Hour</p>
                        <p className="font-medium text-blue-600">₹{ev.pricePerHour}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium">{ev.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Condition</p>
                        <p className="font-medium">{ev.condition}</p>
                      </div>
                    </div>
                  </div>
                  
                  {ev.features && (
                    <div className="mt-4 border-t border-gray-200 pt-3">
                      <p className="text-sm text-gray-500 mb-1">Features</p>
                      <p className="text-sm">{ev.features}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Booking Form */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Booking Details</h2>
                
                <form onSubmit={handleSubmit}>
                  {/* Station Selection Section */}
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">
                      <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                      Pickup Station
                    </label>
                    <select
                      value={selectedSourceStation}
                      onChange={(e) => setSelectedSourceStation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select pickup station</option>
                      {stations && stations.map((station) => (
                        <option 
                          key={station._id} 
                          value={station._id}
                          disabled={station.status !== 'active'}
                        >
                          {station.name} - {station.address}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">
                      <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
                      Drop-off Station
                    </label>
                    <select
                      value={selectedDestinationStation}
                      onChange={(e) => setSelectedDestinationStation(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select drop-off station</option>
                      {stations && stations.map((station) => (
                        <option 
                          key={station._id} 
                          value={station._id}
                          disabled={station.status !== 'active'}
                        >
                          {station.name} - {station.address}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">
                      <FaCalendarAlt className="inline mr-2 text-blue-500" />
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">
                      <FaClock className="inline mr-2 text-blue-500" />
                      Pickup Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">
                      Duration (hours)
                    </label>
                    <select
                      value={duration}
                      onChange={handleDurationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 12, 24].map((hours) => (
                        <option key={hours} value={hours}>
                          {hours} {hours === 1 ? 'hour' : 'hours'}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Price per hour:</span>
                      <span>₹{ev.pricePerHour}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Duration:</span>
                      <span>{duration} {duration === 1 ? 'hour' : 'hours'}</span>
                    </div>
                    {selectedSourceStation && selectedDestinationStation && selectedSourceStation !== selectedDestinationStation && (
                      <div className="flex justify-between mb-2 text-amber-600">
                        <span>Different drop-off station:</span>
                        <span>Will affect pricing</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Price:</span>
                        <span className="text-blue-600">₹{totalPrice}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isBooking || isUnverifiedCustomer()}
                    className={`w-full ${isUnverifiedCustomer() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-3 px-4 rounded-md flex justify-center items-center`}
                  >
                    {isBooking ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Processing...
                      </>
                    ) : isUnverifiedCustomer() ? (
                      <>Verify Aadhaar to Book</>
                    ) : (
                      <>
                        <FaCreditCard className="mr-2" /> Confirm Booking
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add the Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
        onAccept={handlePrivacyPolicyAccepted}
      />
    </div>
  );
};

export default BookingScreen; 