import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGetMyBookingsQuery } from '../slices/bookingsApiSlice';
import { toast } from 'react-toastify';
import { FaClock, FaCalendarAlt, FaCheck, FaTimes, FaSpinner, FaArrowLeft, FaFilter, FaCarSide, FaMapMarkedAlt } from 'react-icons/fa';
import Loader from '../components/Loader';
import MessageAlert from '../components/MessageAlert';

const MyBookingsScreen = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredBookings, setFilteredBookings] = useState([]);
  
  const { data: bookings, isLoading, error, refetch } = useGetMyBookingsQuery();
  
  // Apply filter when bookings data changes or filter changes
  useEffect(() => {
    if (bookings) {
      if (activeFilter === 'all') {
        setFilteredBookings(bookings);
      } else if (activeFilter === 'upcoming') {
        setFilteredBookings(
          bookings.filter(booking => 
            booking.status !== 'cancelled' && 
            booking.status !== 'completed' && 
            new Date(booking.startTime) > new Date()
          )
        );
      } else if (activeFilter === 'past') {
        setFilteredBookings(
          bookings.filter(booking => 
            booking.status === 'completed' || 
            booking.status === 'cancelled' || 
            new Date(booking.endTime) < new Date()
          )
        );
      } else if (activeFilter === 'active') {
        setFilteredBookings(
          bookings.filter(booking => 
            booking.status === 'approved' || 
            booking.status === 'ongoing'
          )
        );
      }
    }
  }, [bookings, activeFilter]);
  
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
      case 'ongoing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
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
  
  // Calculate booking duration in hours
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const durationHours = Math.round(durationMs / (1000 * 60 * 60));
    return durationHours;
  };
  
  // Checks if booking is active (approved or ongoing)
  const isActiveBooking = (booking) => {
    return booking.status === 'approved' || booking.status === 'ongoing';
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
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <FaFilter className="text-gray-500" />
          <div className="flex bg-gray-100 rounded-lg">
            <button
              className={`px-3 py-1 rounded-lg text-sm ${activeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded-lg text-sm ${activeFilter === 'active' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </button>
            <button
              className={`px-3 py-1 rounded-lg text-sm ${activeFilter === 'upcoming' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              onClick={() => setActiveFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`px-3 py-1 rounded-lg text-sm ${activeFilter === 'past' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              onClick={() => setActiveFilter('past')}
            >
              Past
            </button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <MessageAlert variant="danger">
          {error?.data?.message || 'Error loading your bookings'}
        </MessageAlert>
      ) : filteredBookings && filteredBookings.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-4">
            {activeFilter === 'upcoming' 
              ? "You don't have any upcoming bookings." 
              : activeFilter === 'past' 
                ? "You don't have any past bookings."
                : activeFilter === 'active'
                ? "You don't have any active bookings."  
                : "You haven't made any bookings yet."}
          </p>
          <button
            onClick={() => navigate('/stations')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Stations
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EV Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Station
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {booking.evId.imageUrl ? (
                          <img
                            className="h-10 w-16 object-cover rounded-md mr-3"
                            src={booking.evId.imageUrl}
                            alt={booking.evId.model}
                          />
                        ) : (
                          <div className="h-10 w-16 bg-gray-200 rounded-md mr-3 flex items-center justify-center text-gray-500 text-xs">
                            No image
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.evId?.manufacturer} {booking.evId?.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 mb-1">
                        <FaCalendarAlt className="inline-block mr-1 text-blue-500" />
                        {formatDate(booking.startTime)}
                      </div>
                      <div className="text-xs text-gray-500">
                        <FaClock className="inline-block mr-1" />
                        {calculateDuration(booking.startTime, booking.endTime)} hours
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.startStationId.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.startStationId.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{booking.fare}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {(booking.penalty || booking.hasPenalty) && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Penalty
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isActiveBooking(booking) ? (
                        <Link 
                          to={`/ride/${booking._id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-md inline-flex items-center"
                        >
                          {booking.status === 'ongoing' ? (
                            <>
                              <FaMapMarkedAlt className="mr-1" />
                              Track Ride
                            </>
                          ) : (
                            <>
                              <FaCarSide className="mr-1" />
                              Start Ride
                            </>
                          )}
                        </Link>
                      ) : (
                        <div>
                          {(booking.penalty || booking.hasPenalty) ? (
                            <Link 
                              to={`/bookings/${booking._id}/penalty-receipt`}
                              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1.5 rounded-md inline-flex items-center"
                            >
                              View Receipt
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {booking.status === 'completed' ? 'Completed' : 
                               booking.status === 'cancelled' ? 'Cancelled' : 
                               'Awaiting approval'}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsScreen; 