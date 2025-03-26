import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSearch, FaPrint, FaTimesCircle, FaUser, FaCarAlt, FaChartBar, FaDatabase, FaPlusCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { 
  useGetBookingsQuery, 
  useAddTestPenaltyMutation,
  useGetPenaltyStatisticsQuery
} from '../slices/bookingsApiSlice';
import { BOOKINGS_URL } from '../constants';
import Loader from '../components/Loader';

const PenaltyDashboardScreen = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [penaltyAmount, setPenaltyAmount] = useState(100);
  const [penaltyReason, setPenaltyReason] = useState('Test penalty');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showAddPenaltyModal, setShowAddPenaltyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'statistics'
  
  const { data: bookings, isLoading, refetch } = useGetBookingsQuery();
  const { data: penaltyStats, isLoading: isLoadingStats } = useGetPenaltyStatisticsQuery();
  const [addTestPenalty, { isLoading: isAddingPenalty }] = useAddTestPenaltyMutation();
  
  // Filter bookings based on search term
  useEffect(() => {
    if (bookings) {
      if (!searchTerm) {
        setFilteredBookings(bookings);
      } else {
        const filtered = bookings.filter(booking => 
          booking._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (booking.customerId?.name && booking.customerId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (booking.evId?.registrationNumber && booking.evId.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredBookings(filtered);
      }
    }
  }, [bookings, searchTerm]);
  
  const handleBookingSelect = (booking) => {
    setSelectedBooking(booking);
    setShowAddPenaltyModal(true);
  };
  
  const handleAddPenalty = async () => {
    if (!selectedBooking) return;
    
    try {
      console.log('Sending penalty to:', `${BOOKINGS_URL}/${selectedBooking._id}/test-penalty`);
      await addTestPenalty({
        bookingId: selectedBooking._id,
        penaltyAmount: Number(penaltyAmount),
        reason: penaltyReason
      }).unwrap();
      
      toast.success(`Test penalty added to booking #${selectedBooking._id}`);
      setShowAddPenaltyModal(false);
      refetch();
    } catch (err) {
      console.error('Penalty API error:', err);
      toast.error(err?.data?.message || `Failed to add test penalty: ${err.message || 'Unknown error'}`);
    }
  };
  
  const closeModal = () => {
    setShowAddPenaltyModal(false);
    setSelectedBooking(null);
  };
  
  const renderPenaltyBadge = (booking) => {
    if (!booking.penalty && !booking.hasPenalty) return null;
    
    const amount = booking.penalty?.amount || booking.penaltyAmount;
    
    return (
      <span className="text-accent-red font-medium">
        ₹{amount}
      </span>
    );
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-6"
    >
      <Link to='/admin' className="inline-flex items-center mb-4 text-primary-400 hover:text-primary-300 transition-colors duration-300">
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </Link>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold gradient-text">Penalty Management Dashboard</h1>
        <div className="flex items-center gap-4">
          {activeTab === 'bookings' && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings..."
                className="pl-10 pr-4 py-2 bg-primary-800/30 border border-primary-700/30 rounded-lg w-64 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent-teal/50 focus:border-accent-teal/50 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-white/50" />
            </div>
          )}
          <div className="bg-primary-800/30 backdrop-blur-sm border border-primary-700/30 rounded-lg shadow-glass-sm">
            <button
              className={`px-6 py-2 rounded-lg ${activeTab === 'bookings' ? 'bg-accent-teal/20 text-accent-teal shadow-glow-teal-sm' : 'text-white/80 hover:text-white'} transition-all duration-300`}
              onClick={() => setActiveTab('bookings')}
            >
              <span className="flex items-center">
                <FaDatabase className="mr-2" />
                Bookings
              </span>
            </button>
            <button
              className={`px-6 py-2 rounded-lg ${activeTab === 'statistics' ? 'bg-accent-purple/20 text-accent-purple shadow-glow-purple-sm' : 'text-white/80 hover:text-white'} transition-all duration-300`}
              onClick={() => setActiveTab('statistics')}
            >
              <span className="flex items-center">
                <FaChartBar className="mr-2" />
                Statistics
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {activeTab === 'bookings' ? (
        // BOOKINGS TAB
        isLoading ? (
          <Loader />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="card-glass border border-primary-600/20 shadow-glass overflow-hidden"
          >
            <table className="min-w-full divide-y divide-primary-700/30">
              <thead className="bg-primary-800/50">
                <tr className="text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  <th scope="col" className="px-6 py-3">
                    Booking ID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Vehicle
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-700/30">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-white/60">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking, index) => (
                    <motion.tr 
                      key={booking._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                      className="hover:bg-primary-800/30 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {booking._id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {booking.customerId?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-white/60">
                          {booking.customerId?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {booking.evId?.manufacturer} {booking.evId?.model}
                        </div>
                        <div className="text-sm text-white/60">
                          {booking.evId?.registrationNumber || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {booking.status}
                          </span>
                          {renderPenaltyBadge(booking)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleBookingSelect(booking)}
                            className="text-accent-teal hover:text-white flex items-center bg-primary-800/40 px-3 py-1.5 rounded-lg transition-colors duration-300 hover:bg-primary-700/50"
                          >
                            <FaPlusCircle className="mr-1.5" />
                            <span className="text-sm">Add Penalty</span>
                          </button>
                          
                          {(booking.penalty || booking.hasPenalty) && (
                            <Link
                              to={`/bookings/${booking._id}/penalty-receipt`}
                              className="text-white flex items-center bg-gradient-to-r from-green-500 to-green-600 px-3 py-1.5 rounded-lg transition-all duration-300 hover:shadow-glow-sm"
                            >
                              <span className="text-sm">View Receipt</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        )
      ) : (
        // STATISTICS TAB
        isLoadingStats ? (
          <Loader />
        ) : !penaltyStats ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-primary-800/20 backdrop-blur-sm border border-primary-700/30 rounded-xl p-6 text-white/80"
          >
            No penalty statistics available.
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card-glass border border-primary-600/20 shadow-glass p-6"
            >
              <h2 className="text-xl font-semibold mb-4 gradient-text">Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary-800/40 border border-primary-700/30 rounded-xl p-4">
                  <p className="text-sm text-accent-teal">Total Penalties</p>
                  <p className="text-2xl font-bold text-white">{penaltyStats.totalPenaltyCount}</p>
                </div>
                <div className="bg-primary-800/40 border border-primary-700/30 rounded-xl p-4">
                  <p className="text-sm text-accent-teal">Total Amount</p>
                  <p className="text-2xl font-bold text-white">₹{penaltyStats.totalPenaltyAmount}</p>
                </div>
              </div>
            </motion.div>

            {/* Customer Penalties */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="card-glass border border-primary-600/20 shadow-glass p-6"
            >
              <h2 className="text-xl font-semibold mb-4 gradient-text">Customer Penalties</h2>
              {penaltyStats.customerPenalties.length === 0 ? (
                <p className="text-white/60">No customer penalties to display.</p>
              ) : (
                <div className="space-y-6">
                  {penaltyStats.customerPenalties.map((customer, index) => (
                    <motion.div 
                      key={customer.customerId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                      className="border border-primary-700/30 rounded-xl overflow-hidden"
                    >
                      <div className="bg-primary-800/50 p-4 border-b border-primary-700/30 flex justify-between items-center">
                        <div className="flex items-center">
                          <FaUser className="text-accent-teal mr-2" />
                          <div>
                            <p className="font-medium text-white">{customer.customerName}</p>
                            <p className="text-sm text-white/60">{customer.customerEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-accent-red">₹{customer.totalAmount}</p>
                          <p className="text-sm text-white/60">{customer.count} penalties</p>
                        </div>
                      </div>
                      <div className="p-4 bg-primary-900/50">
                        <table className="min-w-full divide-y divide-primary-700/30">
                          <thead>
                            <tr>
                              <th className="px-2 py-2 text-left text-xs font-medium text-white/60">Date</th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-white/60">Vehicle</th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-white/60">Reason</th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-white/60">Amount</th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-white/60">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-primary-700/20">
                            {customer.bookings.map(booking => (
                              <tr key={booking.bookingId} className="hover:bg-primary-800/30 transition-colors duration-200">
                                <td className="px-2 py-2 text-sm text-white/80">
                                  {new Date(booking.date).toLocaleDateString()}
                                </td>
                                <td className="px-2 py-2 text-sm text-white/80 flex items-center">
                                  <FaCarAlt className="text-accent-teal mr-1.5" />
                                  {booking.vehicle}
                                </td>
                                <td className="px-2 py-2 text-sm text-white/80">
                                  {booking.reason}
                                </td>
                                <td className="px-2 py-2 text-sm font-medium text-accent-red">
                                  ₹{booking.amount}
                                </td>
                                <td className="px-2 py-2 text-sm">
                                  <Link
                                    to={`/bookings/${booking.bookingId}/penalty-receipt`}
                                    className="text-accent-teal hover:text-white transition-colors duration-300"
                                  >
                                    View Receipt
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )
      )}
      
      {/* Add Penalty Modal */}
      {showAddPenaltyModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-primary-900/95 to-primary-800/95 border border-primary-700/50 rounded-xl shadow-glass-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold gradient-text">Add Test Penalty</h2>
              <button onClick={closeModal} className="text-white/70 hover:text-white transition-colors duration-300">
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="mb-4 bg-primary-800/40 rounded-lg p-3 border border-primary-700/30">
              <p className="text-sm text-white/60 mb-2">Adding penalty to booking:</p>
              <p className="font-medium text-white">ID: {selectedBooking._id}</p>
              <p className="font-medium text-white">Customer: {selectedBooking.customerId?.name || 'Unknown'}</p>
              <p className="font-medium text-white">Vehicle: {selectedBooking.evId?.manufacturer} {selectedBooking.evId?.model}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Penalty Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2.5 bg-primary-800/50 border border-primary-700/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal/50 focus:border-accent-teal/50 transition-all duration-300"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Reason
              </label>
              <textarea
                className="w-full px-3 py-2.5 bg-primary-800/50 border border-primary-700/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal/50 focus:border-accent-teal/50 transition-all duration-300"
                rows="3"
                value={penaltyReason}
                onChange={(e) => setPenaltyReason(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-primary-800/70 text-white/80 hover:text-white rounded-lg border border-primary-700/30 hover:border-primary-600/50 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPenalty}
                disabled={isAddingPenalty}
                className="bg-gradient-to-r from-accent-red to-accent-red/80 text-white px-4 py-2 rounded-lg hover:shadow-glow-red transition-all duration-300 disabled:opacity-70"
              >
                {isAddingPenalty ? 'Adding...' : 'Add Penalty'}
              </button>
            </div>
          </motion.div>
    </div>
      )}
    </motion.div>
  );
};

export default PenaltyDashboardScreen; 