import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaSearch, FaPrint, FaTimesCircle, FaUser, FaCarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
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
      <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
        ₹{amount}
      </span>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <Link to='/admin' className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-800">
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </Link>
      
      <div className="flex justify-between items-center mb-6">
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
            </button>
          </div>
        </div>
      </div>
      
      {activeTab === 'bookings' ? (
        // BOOKINGS TAB
        isLoading ? (
          <Loader />
        ) : (
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map(booking => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking._id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerId?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customerId?.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.evId?.manufacturer} {booking.evId?.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.evId?.registrationNumber || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {booking.status}
                          </span>
                          {renderPenaltyBadge(booking)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBookingSelect(booking)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <FaPlus className="mr-1" /> Add Penalty
                          </button>
                          
                          {(booking.penalty || booking.hasPenalty) && (
                            <Link
                              to={`/bookings/${booking._id}/penalty-receipt`}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <FaPrint className="mr-1" /> View Receipt
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // STATISTICS TAB
        isLoadingStats ? (
          <Loader />
        ) : !penaltyStats ? (
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
                                  ₹{booking.amount}
                                </td>
                                <td className="px-2 py-2 text-sm">
                                  <Link
                                    to={`/bookings/${booking.bookingId}/penalty-receipt`}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    View Receipt
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      )}
      
      {/* Add Penalty Modal */}
      {showAddPenaltyModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Test Penalty</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Adding penalty to booking:</p>
              <p className="font-medium">ID: {selectedBooking._id}</p>
              <p className="font-medium">Customer: {selectedBooking.customerId?.name || 'Unknown'}</p>
              <p className="font-medium">Vehicle: {selectedBooking.evId?.manufacturer} {selectedBooking.evId?.model}</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Penalty Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 border rounded-md"
                value={penaltyAmount}
                onChange={(e) => setPenaltyAmount(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                value={penaltyReason}
                onChange={(e) => setPenaltyReason(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPenalty}
                disabled={isAddingPenalty}
                className="bg-red-600 text-white px-4 py-2 rounded-md"
              >
                {isAddingPenalty ? 'Adding...' : 'Add Penalty'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenaltyDashboardScreen; 