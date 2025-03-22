import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaFilter, FaArrowLeft, FaUser, FaClock, FaCalendarAlt, FaPhoneAlt, FaEnvelope, FaCheck, FaTimes, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import MessageAlert from '../components/MessageAlert';
import { useGetBookingsQuery, useUpdateBookingStatusMutation } from '../slices/bookingsApiSlice';

const StationBookingsScreen = () => {
  console.log('Rendering StationBookingsScreen');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('incoming');
  const [filteredBookings, setFilteredBookings] = useState([]);
  
  const { userInfo } = useSelector((state) => state.auth);
  console.log('User info:', userInfo);
  
  // Check if user is a station master
  if (!userInfo || userInfo.role !== 'stationMaster') {
    console.error('User is not a station master');
  }
  
  // Get all bookings
  const { data: bookings, isLoading, error, refetch } = useGetBookingsQuery({}, {
    // Add error handling option
    skip: !userInfo || userInfo.role !== 'stationMaster'
  });
  const [updateBookingStatus, { isLoading: isUpdating }] = useUpdateBookingStatusMutation();
  
  // Handle refetch if there's an authorization error
  const handleRefetch = () => {
    toast.info('Refreshing booking data...');
    refetch();
  };
  
  useEffect(() => {
    if (error) {
      console.error('Booking fetch error:', error);
      if (error.status === 401) {
        toast.error('Authorization error. Please log in again or refresh the page.');
      }
    }
  }, [error]);
  
  useEffect(() => {
    if (bookings && userInfo?.role === 'stationMaster') {
      console.log('Total bookings:', bookings.length);
      
      // For now, don't filter by station since stationId is not present
      // Just show all bookings to the station master
      const stationBookings = bookings;
      
      console.log('Station bookings:', stationBookings.length);
      
      // Further filter based on active tab
      let tabFilteredBookings = [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (activeTab === 'incoming') {
        // Incoming = today's bookings
        tabFilteredBookings = stationBookings.filter(booking => {
          const bookingDate = new Date(booking.startTime);
          return bookingDate >= today && bookingDate < tomorrow && booking.status !== 'cancelled';
        });
      } else if (activeTab === 'upcoming') {
        // Upcoming = future bookings (after today)
        tabFilteredBookings = stationBookings.filter(booking => {
          const bookingDate = new Date(booking.startTime);
          return bookingDate >= tomorrow && booking.status !== 'cancelled';
        });
      } else if (activeTab === 'past') {
        // Past = previous bookings
        tabFilteredBookings = stationBookings.filter(booking => {
          const bookingDate = new Date(booking.startTime);
          return bookingDate < today || booking.status === 'completed' || booking.status === 'cancelled';
        });
      }
      
      console.log('Filtered bookings for tab:', tabFilteredBookings.length);
      setFilteredBookings(tabFilteredBookings);
    }
  }, [bookings, userInfo, activeTab]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Format phone number
  const formatPhoneNumber = (phone) => {
    return phone ? phone : 'No phone provided';
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle booking status update
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus({
        id: bookingId,
        status: newStatus
      }).unwrap();
      
      toast.success(`Booking ${newStatus} successfully`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || `Failed to update booking status to ${newStatus}`);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 md:mb-0"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>
        <h1 className="text-2xl font-bold">Station Bookings</h1>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <FaFilter className="text-gray-500" />
          <div className="flex bg-gray-100 rounded-lg">
            <button
              className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'incoming' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              onClick={() => setActiveTab('incoming')}
            >
              Today
            </button>
            <button
              className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'upcoming' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'past' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              onClick={() => setActiveTab('past')}
            >
              Past
            </button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <div>
          <MessageAlert variant="danger">
            {error?.data?.message || 'Error accessing bookings. You may not have the right permissions.'}
          </MessageAlert>
          <div className="text-center mt-4">
            <button 
              onClick={handleRefetch}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaSync className="mr-2" /> Refresh Data
            </button>
          </div>
        </div>
      ) : !bookings ? (
        <MessageAlert variant="warning">
          No booking data available. Please check your connection to the API.
        </MessageAlert>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-500">
            {activeTab === 'incoming' 
              ? "There are no bookings scheduled for today." 
              : activeTab === 'upcoming' 
                ? "There are no upcoming bookings for your station." 
                : "There are no past bookings for your station."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="border-b border-gray-200 p-6 hover:bg-gray-50">
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="mb-4 lg:mb-0">
                  <div className="flex items-center mb-2">
                    <h2 className="text-lg font-semibold">
                      {booking.evId.manufacturer} {booking.evId.model}
                    </h2>
                    <span 
                      className={`ml-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-2 text-blue-500" />
                      {formatDate(booking.startTime)}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="mr-2 text-blue-500" />
                      Duration: {Math.round((new Date(booking.endTime) - new Date(booking.startTime)) / (60 * 60 * 1000))} hours
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUser className="mr-2 text-blue-500" />
                      {booking.customerId?.name || 'Unknown Customer'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaEnvelope className="mr-2 text-blue-500" />
                      {booking.customerId?.email || 'No email provided'}
                    </div>
                    {booking.customerId?.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaPhoneAlt className="mr-2 text-blue-500" />
                        {formatPhoneNumber(booking.customerId.phone)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="text-lg font-bold text-blue-600 mb-2">
                    ₹{booking.fare}
                  </div>
                  
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'approved')}
                        disabled={isUpdating}
                        className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        <FaCheck className="mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'cancelled')}
                        disabled={isUpdating}
                        className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        <FaTimes className="mr-2" />
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'approved' && (
                    <button
                      onClick={() => handleStatusUpdate(booking._id, 'completed')}
                      disabled={isUpdating}
                      className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      <FaCheck className="mr-2" />
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StationBookingsScreen; 