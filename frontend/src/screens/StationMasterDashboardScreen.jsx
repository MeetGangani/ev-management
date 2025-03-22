import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaBatteryHalf, FaBatteryFull, FaBatteryQuarter, FaWrench, FaCar, FaEdit, FaClipboardList, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useGetEVsByStationQuery, useUpdateBatteryLevelMutation, useAddMaintenanceRecordMutation } from '../slices/evsApiSlice';

const StationMasterDashboardScreen = () => {
  console.log('Rendering StationMasterDashboardScreen');
  
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  console.log('Station master dashboard - userInfo:', userInfo);

  // States for maintenance form
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [selectedEV, setSelectedEV] = useState(null);
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');

  // States for battery update form
  const [showBatteryForm, setShowBatteryForm] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(100);

  // Fetch EVs for the station master's station
  const { data: evs, isLoading, error, refetch } = useGetEVsByStationQuery(
    userInfo?.stationId || 'none'
  );

  // Mutations
  const [updateBatteryLevel, { isLoading: isUpdatingBattery }] = useUpdateBatteryLevelMutation();
  const [addMaintenanceRecord, { isLoading: isAddingMaintenance }] = useAddMaintenanceRecordMutation();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'stationMaster') {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const handleBatteryUpdate = async (e) => {
    e.preventDefault();
    
    if (!selectedEV) return;
    
    try {
      await updateBatteryLevel({ 
        id: selectedEV._id, 
        batteryLevel: parseInt(batteryLevel) 
      }).unwrap();
      
      toast.success('Battery level updated successfully');
      setShowBatteryForm(false);
      setSelectedEV(null);
      setBatteryLevel(100);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update battery level');
    }
  };

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedEV) return;
    
    try {
      await addMaintenanceRecord({ 
        id: selectedEV._id, 
        data: {
          description,
          cost: parseFloat(cost),
          performedBy: userInfo.name
        }
      }).unwrap();
      
      toast.success('Maintenance record added successfully');
      setShowMaintenanceForm(false);
      setSelectedEV(null);
      setDescription('');
      setCost('');
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add maintenance record');
    }
  };

  const openBatteryForm = (ev) => {
    setSelectedEV(ev);
    setBatteryLevel(ev.batteryLevel);
    setShowBatteryForm(true);
    setShowMaintenanceForm(false);
  };

  const openMaintenanceForm = (ev) => {
    setSelectedEV(ev);
    setShowMaintenanceForm(true);
    setShowBatteryForm(false);
  };

  const getBatteryIcon = (level) => {
    if (level >= 70) return <FaBatteryFull className="text-green-500" />;
    if (level >= 30) return <FaBatteryHalf className="text-yellow-500" />;
    return <FaBatteryQuarter className="text-red-500" />;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'charging':
        return 'bg-blue-100 text-blue-800';
      case 'in-use':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Station Master Dashboard</h1>
      
      {/* Bookings Card - Always show this */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">Manage Bookings</h2>
            <p className="text-gray-600">View and manage incoming and upcoming bookings</p>
          </div>
          <button 
            onClick={() => navigate('/station-master/bookings')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
          >
            <FaCalendarAlt className="mr-2" />
            View Bookings
            <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
      
      {userInfo?.stationId ? (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">My Station</h2>
            <p><strong>Name:</strong> {userInfo.stationName || 'Not assigned'}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Manage EVs</h2>
              <p className="text-gray-600">View and manage EVs at your station</p>
            </div>

            {isLoading ? (
              <div className="p-6 text-center">
                <Loader />
              </div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">
                {error?.data?.message || 'Failed to load EVs'}
              </div>
            ) : evs?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Battery
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {evs.map((ev) => (
                      <tr key={ev._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                              <FaCar className="text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {ev.manufacturer} {ev.model}
                              </div>
                              <div className="text-sm text-gray-500">
                                Range: {ev.range} km
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ev.registrationNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getBatteryIcon(ev.batteryLevel)}
                            <span className="ml-2">{ev.batteryLevel}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ev.status)}`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openBatteryForm(ev)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              disabled={ev.status === 'in-use' || ev.status === 'booked'}
                            >
                              <FaBatteryHalf className="mr-1" /> Update Battery
                            </button>
                            <button
                              onClick={() => openMaintenanceForm(ev)}
                              className="text-yellow-600 hover:text-yellow-900 flex items-center ml-2"
                              disabled={ev.status === 'in-use' || ev.status === 'booked'}
                            >
                              <FaWrench className="mr-1" /> Maintenance
                            </button>
                            <button
                              onClick={() => navigate(`/station-master/maintenance-history/${ev._id}`)}
                              className="text-gray-600 hover:text-gray-900 flex items-center ml-2"
                            >
                              <FaClipboardList className="mr-1" /> History
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No EVs found for your station.
              </div>
            )}
          </div>
          
          {/* Battery Update Form */}
          {showBatteryForm && selectedEV && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Update Battery Level</h2>
                <p className="mb-4">
                  {selectedEV.manufacturer} {selectedEV.model} - {selectedEV.registrationNumber}
                </p>
                
                <form onSubmit={handleBatteryUpdate}>
                  <div className="mb-4">
                    <label htmlFor="batteryLevel" className="block text-gray-700 font-medium mb-2">
                      Battery Level (%)
                    </label>
                    <input
                      type="range"
                      id="batteryLevel"
                      className="w-full"
                      min="0"
                      max="100"
                      value={batteryLevel}
                      onChange={(e) => setBatteryLevel(e.target.value)}
                    />
                    <div className="flex justify-between text-gray-600 text-sm">
                      <span>0%</span>
                      <span>{batteryLevel}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBatteryForm(false);
                        setSelectedEV(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      disabled={isUpdatingBattery}
                    >
                      {isUpdatingBattery ? 'Updating...' : 'Update Battery'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Maintenance Form */}
          {showMaintenanceForm && selectedEV && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Add Maintenance Record</h2>
                <p className="mb-4">
                  {selectedEV.manufacturer} {selectedEV.model} - {selectedEV.registrationNumber}
                </p>
                
                <form onSubmit={handleMaintenanceSubmit}>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                      Maintenance Description
                    </label>
                    <textarea
                      id="description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Describe the maintenance work"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="cost" className="block text-gray-700 font-medium mb-2">
                      Cost (INR)
                    </label>
                    <input
                      type="number"
                      id="cost"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter maintenance cost"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMaintenanceForm(false);
                        setSelectedEV(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                      disabled={isAddingMaintenance}
                    >
                      {isAddingMaintenance ? 'Adding...' : 'Add Record'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-yellow-700">
                You haven't been assigned to a specific station yet. You can still manage bookings, but you won't see station-specific EVs.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationMasterDashboardScreen; 