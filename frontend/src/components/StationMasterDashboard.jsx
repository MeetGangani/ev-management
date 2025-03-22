import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const StationMasterDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [penaltyFormVisible, setPenaltyFormVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [penaltyType, setPenaltyType] = useState('');
  const [penaltyDescription, setPenaltyDescription] = useState('');
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const searchBookings = async () => {
    if (!searchQuery.trim()) {
      toast.warning('Please enter a search term');
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await axios.post('/api/bookings/search', { query: searchQuery });
      setSearchResults(response.data);
      
      if (response.data.length === 0) {
        toast.info('No bookings found with that search term');
      }
    } catch (error) {
      console.error('Error searching bookings:', error);
      toast.error('Failed to search bookings');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePenaltySubmit = async (e) => {
    e.preventDefault();
    
    if (!penaltyType || !penaltyDescription || !penaltyAmount) {
      toast.warning('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('penaltyType', penaltyType);
      formData.append('description', penaltyDescription);
      formData.append('amount', penaltyAmount);
      
      // Add any files if they exist
      if (selectedFiles && selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append('evidence', selectedFiles[i]);
        }
      }
      
      const response = await axios.post(`/api/bookings/${selectedBooking._id}/apply-penalty`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('Penalty applied successfully');
        setPenaltyFormVisible(false);
        // Reset the form
        setPenaltyType('');
        setPenaltyDescription('');
        setPenaltyAmount('');
        setSelectedFiles([]);
        // Refresh the search results if needed
        if (searchQuery) {
          searchBookings();
        }
      }
    } catch (error) {
      console.error('Error applying penalty:', error);
      toast.error(error.response?.data?.message || 'Failed to apply penalty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Apply Penalties to Past Bookings</h2>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Search Bookings by ID or Customer Name</label>
          <input 
            type="text" 
            placeholder="Enter booking ID or customer name" 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={searchBookings}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {isSearching ? (
          <div className="text-center py-4">
            <span className="text-gray-600">Searching...</span>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.customerId?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.evId?.model || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${booking.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'penalized' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setPenaltyFormVisible(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Apply Penalty
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : searchQuery ? (
          <div className="text-center py-4">
            <span className="text-gray-600">No bookings found</span>
          </div>
        ) : null}

        {/* Penalty Form Modal */}
        {penaltyFormVisible && selectedBooking && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Apply Penalty to Booking</h3>
              <form onSubmit={handlePenaltySubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                  <input 
                    type="text" 
                    value={selectedBooking._id} 
                    disabled
                    className="mt-1 bg-gray-100 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <input 
                    type="text" 
                    value={selectedBooking.customerId?.name || "Unknown"} 
                    disabled
                    className="mt-1 bg-gray-100 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Penalty Type</label>
                  <select
                    value={penaltyType}
                    onChange={(e) => setPenaltyType(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="">Select a penalty type</option>
                    <option value="damage">Vehicle Damage</option>
                    <option value="improper_parking">Improper Parking</option>
                    <option value="traffic_violation">Traffic Violation</option>
                    <option value="late_return">Late Return</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={penaltyDescription}
                    onChange={(e) => setPenaltyDescription(e.target.value)}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="Describe the reason for the penalty"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    placeholder="Enter penalty amount"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Evidence (optional)</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    multiple
                  />
                  <p className="mt-1 text-xs text-gray-500">You can upload photos or documents as evidence</p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setPenaltyFormVisible(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Applying...' : 'Apply Penalty'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StationMasterDashboard; 