import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGetMyBookingsQuery } from '../slices/bookingsApiSlice';
import { toast } from 'react-toastify';
import { FaClock, FaCalendarAlt, FaCheck, FaTimes, FaSpinner, FaArrowLeft, FaFilter, FaCarSide, FaMapMarkedAlt } from 'react-icons/fa';
import Loader from '../components/Loader';
import MessageAlert from '../components/MessageAlert';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-400 hover:text-primary-300 transition-colors duration-300 mb-4 md:mb-0"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>
        <h1 className="text-2xl font-bold gradient-text">My Bookings</h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-2 mt-4 md:mt-0"
        >
          <FaFilter className="text-accent-teal" />
          <div className="bg-primary-800/30 backdrop-blur-sm rounded-lg border border-primary-700/30 shadow-glass-sm">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeFilter === 'all' ? 'bg-accent-teal/20 text-accent-teal shadow-glow-teal-sm' : 'text-white/80 hover:text-white'}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeFilter === 'active' ? 'bg-accent-teal/20 text-accent-teal shadow-glow-teal-sm' : 'text-white/80 hover:text-white'}`}
              onClick={() => setActiveFilter('active')}
            >
              Active
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeFilter === 'upcoming' ? 'bg-accent-teal/20 text-accent-teal shadow-glow-teal-sm' : 'text-white/80 hover:text-white'}`}
              onClick={() => setActiveFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeFilter === 'past' ? 'bg-accent-teal/20 text-accent-teal shadow-glow-teal-sm' : 'text-white/80 hover:text-white'}`}
              onClick={() => setActiveFilter('past')}
            >
              Past
            </button>
          </div>
        </motion.div>
      </div>
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <MessageAlert variant="danger">
          {error?.data?.message || 'Error loading your bookings'}
        </MessageAlert>
      ) : filteredBookings && filteredBookings.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-primary-800/20 backdrop-blur-sm rounded-xl border border-primary-700/30 p-8 text-center shadow-glass"
        >
          <h3 className="text-lg font-medium text-white mb-2">No bookings found</h3>
          <p className="text-white/70 mb-6">
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
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-teal to-accent-teal/80 text-white rounded-xl font-medium shadow-glow-teal hover:shadow-glow-teal-lg transition-all duration-300"
          >
            Browse Stations
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card-glass border border-primary-600/20 shadow-glass overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-700/30">
              <thead className="bg-primary-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    EV Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Booking Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Station
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700/30">
                {filteredBookings.map((booking, index) => (
                  <motion.tr 
                    key={booking._id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-primary-800/30 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {booking.evId.imageUrl ? (
                          <div className="h-12 w-16 rounded-md overflow-hidden border border-primary-600/30 shadow-glass-sm mr-3">
                            <img
                              className="h-full w-full object-cover"
                              src={booking.evId.imageUrl}
                              alt={booking.evId.model}
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-16 bg-primary-800/50 rounded-md border border-primary-600/30 mr-3 flex items-center justify-center text-white/50 text-xs">
                            No image
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-white">
                            {booking.evId?.manufacturer} {booking.evId?.model}
                          </div>
                          <div className="text-xs text-white/60">
                            {booking.evId?.registrationNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white mb-1 flex items-center">
                        <FaCalendarAlt className="mr-1.5 text-accent-teal" />
                        {formatDate(booking.startTime)}
                      </div>
                      <div className="text-xs text-white/60 flex items-center">
                        <FaClock className="mr-1.5 text-white/40" />
                        {calculateDuration(booking.startTime, booking.endTime)} hours
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {booking.startStationId?.name || 'Unknown Station'}
                      </div>
                      <div className="text-xs text-white/60">
                        {booking.startStationId?.address || 'No address available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        ₹{booking.fare || booking.totalCost || '0'}
                      </div>
                      <div className="text-xs text-white/60">
                        {booking.evId?.pricePerHour ? `₹${booking.evId.pricePerHour}/hr` : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {(booking.penalty || booking.hasPenalty) && (
                        <span className="ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Penalty
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isActiveBooking(booking) ? (
                        <Link 
                          to={`/ride/${booking._id}`}
                          className="bg-gradient-to-r from-accent-teal to-accent-teal/80 hover:shadow-glow-teal text-white text-sm px-3 py-1.5 rounded-lg inline-flex items-center transition-all duration-300"
                        >
                          {booking.status === 'ongoing' ? (
                            <>
                              <FaMapMarkedAlt className="mr-1.5" />
                              Track Ride
                            </>
                          ) : (
                            <>
                              <FaCarSide className="mr-1.5" />
                              Start Ride
                            </>
                          )}
                        </Link>
                      ) : (
                        <div>
                          {(booking.penalty || booking.hasPenalty) ? (
                            <Link 
                              to={`/bookings/${booking._id}/penalty-receipt`}
                              className="bg-gradient-to-r from-accent-red to-accent-red/80 hover:shadow-glow-red text-white text-sm px-3 py-1.5 rounded-lg inline-flex items-center transition-all duration-300"
                            >
                              View Receipt
                            </Link>
                          ) : (
                            <span className="text-xs text-white/60">
                              {booking.status === 'completed' ? 'Completed' : 
                               booking.status === 'cancelled' ? 'Cancelled' : 
                               'Awaiting approval'}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MyBookingsScreen; 