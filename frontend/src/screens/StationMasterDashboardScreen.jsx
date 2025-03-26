import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaBatteryHalf, FaBatteryFull, FaBatteryQuarter, FaWrench, FaCar, FaEdit, FaClipboardList, FaCalendarAlt, FaArrowRight, FaBuilding, FaEnvelope, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useGetEVsByStationQuery, useUpdateBatteryLevelMutation, useAddMaintenanceRecordMutation } from '../slices/evsApiSlice';
import StationMasterStatsCard from '../components/StationMasterStatsCard';

const StationMasterDashboardScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

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
    if (level >= 70) return <FaBatteryFull className="text-green-400" />;
    if (level >= 30) return <FaBatteryHalf className="text-yellow-400" />;
    return <FaBatteryQuarter className="text-accent-red" />;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'available':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'booked':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'maintenance':
        return 'bg-gradient-to-r from-accent-red to-accent-red/80 text-white';
      case 'charging':
        return 'bg-gradient-to-r from-accent-blue to-accent-blue/80 text-white';
      case 'in-use':
        return 'bg-gradient-to-r from-accent-purple to-accent-purple/80 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  // Extract the necessary station data for the stats card
  const prepareStationStatsData = () => {
    const availableEVs = evs?.filter(ev => ev.available && ev.batteryLevel > 20).length || 0;
    const totalEVs = evs?.length || 0;
    const maintenanceRequired = evs?.filter(ev => ev.maintenanceStatus === 'required').length || 0;
    
    // Calculate average battery health across all EVs
    const batteryHealth = evs?.length 
      ? Math.round(evs.reduce((acc, ev) => acc + ev.batteryHealth, 0) / evs.length) 
      : 0;

    return {
      totalEVs,
      availableEVs,
      unavailableEVs: totalEVs - availableEVs,
      maintenanceRequired,
      batteryHealth,
      bookingsCompleted: evs?.completedBookings || 0,
      revenueGenerated: evs?.revenue || 0,
      customerSatisfaction: evs?.customerRating || 85, // Default to 85% if not available
    };
  };

  // Add this before the return statement
  const stationStats = prepareStationStatsData();

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8"
    >
      <motion.h1 
        variants={itemVariants}
        className="text-3xl font-bold mb-8 gradient-text"
      >
        Station Master Dashboard
      </motion.h1>
      
      {/* Bookings Card - Always show this */}
      <motion.div 
        variants={itemVariants}
        className="card-glass border border-primary-600/20 shadow-glass p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-white">Manage Bookings</h2>
            <p className="text-white/70">View and manage incoming and upcoming bookings</p>
          </div>
          <motion.button 
            onClick={() => navigate('/station-master/bookings')}
            className="bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:shadow-glow-blue text-white font-medium py-2 px-4 rounded-lg flex items-center transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FaCalendarAlt className="mr-2" />
            View Bookings
            <FaArrowRight className="ml-2" />
          </motion.button>
        </div>
      </motion.div>
      
      {userInfo?.stationId ? (
        <div>
          <motion.div 
            variants={itemVariants}
            className="card-glass border border-primary-600/20 shadow-glass p-6 mb-6"
          >
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <FaBuilding className="text-accent-teal" /> My Station
            </h2>
            <p className="text-white/80 mb-2 flex items-center gap-2">
              <strong>Name:</strong> {userInfo.stationName || 'Not assigned'}
            </p>
            <p className="text-white/80 flex items-center gap-2">
              <FaEnvelope className="text-accent-teal" /> {userInfo.email}
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="card-glass border border-primary-600/20 shadow-glass overflow-hidden"
          >
            <div className="p-4 border-b border-primary-600/20 bg-primary-800/30">
              <h2 className="text-xl font-semibold text-white">Manage EVs</h2>
              <p className="text-white/70">View and manage EVs at your station</p>
            </div>

            {isLoading ? (
              <div className="p-6 text-center">
                <Loader />
              </div>
            ) : error ? (
              <div className="p-6 text-center text-accent-red">
                {error?.data?.message || 'Failed to load EVs'}
              </div>
            ) : evs?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary-600/20">
                  <thead className="bg-primary-800/40">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Registration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Battery
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary-600/20">
                    {evs.map((ev, index) => (
                      <motion.tr 
                        key={ev._id}
                        variants={tableRowVariants}
                        custom={index}
                        className="bg-primary-800/20 hover:bg-primary-700/20 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-700/30 rounded-full">
                              <FaCar className="text-accent-teal" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {ev.manufacturer} {ev.model}
                              </div>
                              <div className="text-sm text-white/60">
                                Range: {ev.range} km
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                          {ev.registrationNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getBatteryIcon(ev.batteryLevel)}
                            <span className="ml-2 text-white">{ev.batteryLevel}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ev.status)}`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <motion.button
                              onClick={() => openBatteryForm(ev)}
                              className={`text-accent-blue hover:text-white/90 flex items-center ${(ev.status === 'in-use' || ev.status === 'booked') ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={ev.status === 'in-use' || ev.status === 'booked'}
                              whileHover={!(ev.status === 'in-use' || ev.status === 'booked') ? { scale: 1.05 } : {}}
                            >
                              <FaBatteryHalf className="mr-1" /> Update Battery
                            </motion.button>
                            <motion.button
                              onClick={() => openMaintenanceForm(ev)}
                              className={`text-accent-yellow hover:text-white/90 flex items-center ${(ev.status === 'in-use' || ev.status === 'booked') ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={ev.status === 'in-use' || ev.status === 'booked'}
                              whileHover={!(ev.status === 'in-use' || ev.status === 'booked') ? { scale: 1.05 } : {}}
                            >
                              <FaWrench className="mr-1" /> Maintenance
                            </motion.button>
                            <motion.button
                              onClick={() => navigate(`/station-master/maintenance-history/${ev._id}`)}
                              className="text-white/70 hover:text-white/90 flex items-center"
                              whileHover={{ scale: 1.05 }}
                            >
                              <FaClipboardList className="mr-1" /> History
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-white/50">
                No EVs found for your station.
              </div>
            )}
          </motion.div>
          
          {/* Battery Update Form */}
          {showBatteryForm && selectedEV && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 25 }}
                className="card-glass border border-primary-600/20 shadow-glass p-6 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Update Battery Level</h2>
                  <button 
                    onClick={() => {
                      setShowBatteryForm(false);
                      setSelectedEV(null);
                    }}
                    className="text-white/70 hover:text-white"
                  >
                    <FaTimes />
                  </button>
                </div>
                <p className="mb-6 text-white/80">
                  {selectedEV.manufacturer} {selectedEV.model} - {selectedEV.registrationNumber}
                </p>
                
                <form onSubmit={handleBatteryUpdate}>
                  <div className="mb-6">
                    <label htmlFor="batteryLevel" className="block text-white font-medium mb-2">
                      Battery Level (%)
                    </label>
                    <input
                      type="range"
                      id="batteryLevel"
                      className="w-full accent-accent-blue"
                      min="0"
                      max="100"
                      value={batteryLevel}
                      onChange={(e) => setBatteryLevel(e.target.value)}
                    />
                    <div className="flex justify-between text-white/70 text-sm mt-1">
                      <span>0%</span>
                      <span>{batteryLevel}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setShowBatteryForm(false);
                        setSelectedEV(null);
                      }}
                      className="px-4 py-2 border border-primary-600/30 text-white/80 rounded-md hover:bg-primary-700/40 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:shadow-glow-blue text-white rounded-md disabled:opacity-50 transition-all duration-300"
                      disabled={isUpdatingBattery}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isUpdatingBattery ? 'Updating...' : 'Update Battery'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
          
          {/* Maintenance Form */}
          {showMaintenanceForm && selectedEV && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 25 }}
                className="card-glass border border-primary-600/20 shadow-glass p-6 w-full max-w-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Add Maintenance Record</h2>
                  <button 
                    onClick={() => {
                      setShowMaintenanceForm(false);
                      setSelectedEV(null);
                    }}
                    className="text-white/70 hover:text-white"
                  >
                    <FaTimes />
                  </button>
                </div>
                <p className="mb-6 text-white/80">
                  {selectedEV.manufacturer} {selectedEV.model} - {selectedEV.registrationNumber}
                </p>
                
                <form onSubmit={handleMaintenanceSubmit}>
                  <div className="mb-4">
                    <label htmlFor="description" className="block text-white font-medium mb-2">
                      Maintenance Description
                    </label>
                    <textarea
                      id="description"
                      className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-yellow text-white placeholder-white/50"
                      rows="3"
                      placeholder="Describe the maintenance work"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="cost" className="block text-white font-medium mb-2">
                      Cost (INR)
                    </label>
                    <input
                      type="number"
                      id="cost"
                      className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-yellow text-white placeholder-white/50"
                      placeholder="Enter maintenance cost"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <motion.button
                      type="button"
                      onClick={() => {
                        setShowMaintenanceForm(false);
                        setSelectedEV(null);
                      }}
                      className="px-4 py-2 border border-primary-600/30 text-white/80 rounded-md hover:bg-primary-700/40 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-accent-yellow to-accent-yellow/80 hover:shadow-glow-yellow text-white rounded-md disabled:opacity-50 transition-all duration-300"
                      disabled={isAddingMaintenance}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isAddingMaintenance ? 'Adding...' : 'Add Record'}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}

          {/* Replace the existing stats section with this */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 mt-6">
              <div className="card-glass border border-primary-600/20 shadow-glass p-6">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-6 py-1">
                    <div className="h-4 bg-slate-700 rounded"></div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-4 bg-slate-700 rounded col-span-2"></div>
                        <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                      </div>
                      <div className="h-4 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="text-red-500 bg-red-100 p-4 rounded-lg shadow">
              {error}
            </div>
          ) : (
            // Add new StationMasterStatsCard component here
            <div className="mb-8">
              <StationMasterStatsCard stationData={stationStats} />
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className="card-glass border-l-4 border-accent-yellow/80 p-6 shadow-glass mb-6"
        >
          <div className="flex">
            <div>
              <p className="text-white/90">
                You haven't been assigned to a specific station yet. You can still manage bookings, but you won't see station-specific EVs.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StationMasterDashboardScreen;