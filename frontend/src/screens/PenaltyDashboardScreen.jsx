import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { FaArrowLeft, FaPlus, FaSearch, FaPrint, FaTimesCircle, FaUser, FaCarAlt, FaChartBar, FaDatabase, FaPlusCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
=======
import { FaArrowLeft, FaPlus, FaSearch, FaPrint, FaTimesCircle, FaUser, FaCarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
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
<<<<<<< HEAD
      <span className="text-accent-red font-medium">
=======
      <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
        ₹{amount}
      </span>
    );
  };
  
  return (
<<<<<<< HEAD
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-6"
    >
      <Link to='/admin' className="inline-flex items-center mb-4 text-primary-400 hover:text-primary-300 transition-colors duration-300">
=======
    <div className="container mx-auto px-4 py-6">
      <Link to='/admin' className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-800">
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </Link>
      
      <div className="flex justify-between items-center mb-6">
<<<<<<< HEAD
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
=======
        <h1 className="text-2xl font-bold">Penalty Management Dashboard</h1>
        <div className="flex items-center gap-4">
          {activeTab === 'bookings' && (
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="pl-10 pr-4 py-2 border rounded-md w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md ${activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              onClick={() => setActiveTab('bookings')}
            >
              Bookings
            </button>
            <button
              className={`px-4 py-2 rounded-md ${activeTab === 'statistics' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
              onClick={() => setActiveTab('statistics')}
            >
              Statistics
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
            </button>
          </div>
        </div>
      </div>
      
      {activeTab === 'bookings' ? (
        // BOOKINGS TAB
        isLoading ? (
          <Loader />
        ) : (
<<<<<<< HEAD
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
=======
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                    Actions
                  </th>
                </tr>
              </thead>
<<<<<<< HEAD
              <tbody className="divide-y divide-primary-700/30">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-white/60">
=======
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                      No bookings found
                    </td>
                  </tr>
                ) : (
<<<<<<< HEAD
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
=======
                  filteredBookings.map(booking => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                          {booking._id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
<<<<<<< HEAD
                        <div className="text-sm font-medium text-white">
                          {booking.customerId?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-white/60">
=======
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerId?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                          {booking.customerId?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
<<<<<<< HEAD
                        <div className="text-sm font-medium text-white">
                          {booking.evId?.manufacturer} {booking.evId?.model}
                        </div>
                        <div className="text-sm text-white/60">
=======
                        <div className="text-sm font-medium text-gray-900">
                          {booking.evId?.manufacturer} {booking.evId?.model}
                        </div>
                        <div className="text-sm text-gray-500">
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                          {booking.evId?.registrationNumber || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
<<<<<<< HEAD
                          <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
=======
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                            ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {booking.status}
                          </span>
                          {renderPenaltyBadge(booking)}
                        </div>
                      </td>
<<<<<<< HEAD
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleBookingSelect(booking)}
                            className="text-accent-teal hover:text-white flex items-center bg-primary-800/40 px-3 py-1.5 rounded-lg transition-colors duration-300 hover:bg-primary-700/50"
                          >
                            <FaPlusCircle className="mr-1.5" />
                            <span className="text-sm">Add Penalty</span>
=======
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBookingSelect(booking)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <FaPlus className="mr-1" /> Add Penalty
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                          </button>
                          
                          {(booking.penalty || booking.hasPenalty) && (
                            <Link
                              to={`/bookings/${booking._id}/penalty-receipt`}
<<<<<<< HEAD
                              className="text-white flex items-center bg-gradient-to-r from-green-500 to-green-600 px-3 py-1.5 rounded-lg transition-all duration-300 hover:shadow-glow-sm"
                            >
                              <span className="text-sm">View Receipt</span>
=======
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <FaPrint className="mr-1" /> View Receipt
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                            </Link>
                          )}
                        </div>
                      </td>
<<<<<<< HEAD
                    </motion.tr>
=======
                    </tr>
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                  ))
                )}
              </tbody>
            </table>
<<<<<<< HEAD
          </motion.div>
=======
          </div>
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
        )
      ) : (
        // STATISTICS TAB
        isLoadingStats ? (
          <Loader />
        ) : !penaltyStats ? (
<<<<<<< HEAD
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
=======
          <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 text-yellow-800">
            No penalty statistics available.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                  <p className="text-sm text-blue-600">Total Penalties</p>
                  <p className="text-2xl font-bold">{penaltyStats.totalPenaltyCount}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-md p-4">
                  <p className="text-sm text-green-600">Total Amount</p>
                  <p className="text-2xl font-bold">₹{penaltyStats.totalPenaltyAmount}</p>
                </div>
              </div>
            </div>

            {/* Customer Penalties */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Customer Penalties</h2>
              {penaltyStats.customerPenalties.length === 0 ? (
                <p className="text-gray-500">No customer penalties to display.</p>
              ) : (
                <div className="space-y-6">
                  {penaltyStats.customerPenalties.map(customer => (
                    <div key={customer.customerId} className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                        <div className="flex items-center">
                          <FaUser className="text-gray-400 mr-2" />
                          <div>
                            <p className="font-medium">{customer.customerName}</p>
                            <p className="text-sm text-gray-500">{customer.customerEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">₹{customer.totalAmount}</p>
                          <p className="text-sm text-gray-500">{customer.count} penalties</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Vehicle</th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Reason</th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {customer.bookings.map(booking => (
                              <tr key={booking.bookingId} className="hover:bg-gray-50">
                                <td className="px-2 py-2 text-sm">
                                  {new Date(booking.date).toLocaleDateString()}
                                </td>
                                <td className="px-2 py-2 text-sm flex items-center">
                                  <FaCarAlt className="text-gray-400 mr-1" />
                                  {booking.vehicle}
                                </td>
                                <td className="px-2 py-2 text-sm">
                                  {booking.reason}
                                </td>
                                <td className="px-2 py-2 text-sm font-medium text-red-600">
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                                  ₹{booking.amount}
                                </td>
                                <td className="px-2 py-2 text-sm">
                                  <Link
                                    to={`/bookings/${booking.bookingId}/penalty-receipt`}
<<<<<<< HEAD
                                    className="text-accent-teal hover:text-white transition-colors duration-300"
=======
                                    className="text-blue-600 hover:text-blue-800"
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                                  >
                                    View Receipt
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
<<<<<<< HEAD
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
=======
                    </div>
                  ))}
                </div>
              )}
            </div>
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
          </div>
        )
      )}
      
      {/* Add Penalty Modal */}
      {showAddPenaltyModal && selectedBooking && (
<<<<<<< HEAD
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
=======
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Test Penalty</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                <FaTimesCircle />
              </button>
            </div>
            
<<<<<<< HEAD
            <div className="mb-4 bg-primary-800/40 rounded-lg p-3 border border-primary-700/30">
              <p className="text-sm text-white/60 mb-2">Adding penalty to booking:</p>
              <p className="font-medium text-white">ID: {selectedBooking._id}</p>
              <p className="font-medium text-white">Customer: {selectedBooking.customerId?.name || 'Unknown'}</p>
              <p className="font-medium text-white">Vehicle: {selectedBooking.evId?.manufacturer} {selectedBooking.evId?.model}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-1.5">
=======
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Adding penalty to booking:</p>
              <p className="font-medium">ID: {selectedBooking._id}</p>
              <p className="font-medium">Customer: {selectedBooking.customerId?.name || 'Unknown'}</p>
              <p className="font-medium">Vehicle: {selectedBooking.evId?.manufacturer} {selectedBooking.evId?.model}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                Penalty Amount (₹)
              </label>
              <input
                type="number"
                min="1"
<<<<<<< HEAD
                className="w-full px-3 py-2.5 bg-primary-800/50 border border-primary-700/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal/50 focus:border-accent-teal/50 transition-all duration-300"
=======
                className="w-full px-3 py-2 border rounded-md"
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
<<<<<<< HEAD
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Reason
              </label>
              <textarea
                className="w-full px-3 py-2.5 bg-primary-800/50 border border-primary-700/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal/50 focus:border-accent-teal/50 transition-all duration-300"
=======
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
                rows="3"
                value={penaltyReason}
                onChange={(e) => setPenaltyReason(e.target.value)}
              />
            </div>
            
<<<<<<< HEAD
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-primary-800/70 text-white/80 hover:text-white rounded-lg border border-primary-700/30 hover:border-primary-600/50 transition-all duration-300"
=======
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
              >
                Cancel
              </button>
              <button
                onClick={handleAddPenalty}
                disabled={isAddingPenalty}
<<<<<<< HEAD
                className="bg-gradient-to-r from-accent-red to-accent-red/80 text-white px-4 py-2 rounded-lg hover:shadow-glow-red transition-all duration-300 disabled:opacity-70"
=======
                className="bg-red-600 text-white px-4 py-2 rounded-md"
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
              >
                {isAddingPenalty ? 'Adding...' : 'Add Penalty'}
              </button>
            </div>
<<<<<<< HEAD
          </motion.div>
=======
          </div>
        </div>
      )}
>>>>>>> 346e70c09998fca2573e110616823bdfca03111d
    </div>
      )}
    </motion.div>
  );
};

export default PenaltyDashboardScreen; 