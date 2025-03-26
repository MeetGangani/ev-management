import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGetUserRideHistoryQuery } from '../slices/ridesApiSlice';
import { toast } from 'react-toastify';
import { FaClock, FaCalendarAlt, FaMapMarkedAlt, FaArrowLeft, FaStar, FaRoute } from 'react-icons/fa';
import Loader from '../components/Loader';
import MessageAlert from '../components/MessageAlert';

const RideHistoryScreen = () => {
  const navigate = useNavigate();
  const [filteredRides, setFilteredRides] = useState([]);
  
  const { data: rides, isLoading, error, refetch } = useGetUserRideHistoryQuery();
  
  // Set filtered rides when data loads
  useEffect(() => {
    if (rides) {
      setFilteredRides(rides);
    }
  }, [rides]);
  
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
  
  // Format duration in hours and minutes
  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'In progress';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
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
        <h1 className="text-2xl font-bold">Ride History</h1>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => refetch()}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <Loader />
      ) : error ? (
        <MessageAlert variant="danger">
          {error?.data?.message || 'Error loading ride history'}
        </MessageAlert>
      ) : filteredRides.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
          <FaRoute className="text-gray-400 mx-auto text-4xl mb-3" />
          <h2 className="text-xl font-semibold mb-2">No ride history found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't taken any rides yet. Start by booking a ride!</p>
          <Link
            to="/stations"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-block"
          >
            Find Stations
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    EV
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time & Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Distance
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRides.map((ride) => (
                  <tr key={ride._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 mr-3">
                          <FaMapMarkedAlt className="text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {ride.ev?.make} {ride.ev?.model}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {ride.ev?.licensePlate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white mb-1">
                        <FaCalendarAlt className="inline-block mr-1 text-blue-500" />
                        {formatDate(ride.startTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <FaClock className="inline-block mr-1 text-blue-500" />
                        {formatDuration(ride.startTime, ride.endTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {ride.distanceTraveled ? `${ride.distanceTraveled.toFixed(2)} km` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {ride.cost ? `₹${ride.cost.toFixed(2)}` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {ride.rating ? (
                          <div className="flex items-center">
                            <FaStar className="text-yellow-400 mr-1" />
                            {ride.rating}
                          </div>
                        ) : ride.status === 'completed' ? (
                          <button
                            onClick={() => navigate(`/ride/${ride._id}/rate`)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Rate ride
                          </button>
                        ) : (
                          'N/A'
                        )}
                      </div>
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

export default RideHistoryScreen; 