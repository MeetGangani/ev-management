import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSpinner, FaMapMarkerAlt, FaUserEdit, FaMapMarkedAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { useGetStationMastersQuery } from '../slices/usersApiSlice';
// Import Leaflet components
import { Marker, useMapEvents } from 'react-leaflet';
// Import custom MapWrapper
import MapWrapper from '../components/MapWrapper';
import { 
  useGetStationsQuery,
  useCreateStationMutation,
  useDeleteStationMutation,
  useUpdateStationMutation,
  useAssignStationMasterMutation
} from '../slices/stationsApiSlice';

// Map Marker Component
const MapMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    },
  });

  return position ? (
    <Marker 
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          setPosition([position.lat, position.lng]);
        },
      }}
    />
  ) : null;
};

const AdminStationsScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState({
    opening: '09:00',
    closing: '18:00'
  });
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [stationMasterId, setStationMasterId] = useState('');
  const [geofenceRadius, setGeofenceRadius] = useState(100);
  const [showForm, setShowForm] = useState(false);
  
  // Edit station master modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedStationMaster, setSelectedStationMaster] = useState(null);

  // Fetch stations and station masters from the API
  const { data: stations, isLoading: isLoadingStations, error: stationsError, refetch } = useGetStationsQuery();
  const { data: stationMasters, isLoading: isLoadingMasters } = useGetStationMastersQuery();
  const [createStation, { isLoading: isCreating }] = useCreateStationMutation();
  const [deleteStation, { isLoading: isDeleting }] = useDeleteStationMutation();
  const [updateStation] = useUpdateStationMutation();
  const [assignStationMaster, { isLoading: isAssigning }] = useAssignStationMasterMutation();

  // Add a state to store locally updated stations data
  const [localStations, setLocalStations] = useState(null);

  // Add these state variables at the top with the other state variables
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Update the state for coordinates
  const [mapPosition, setMapPosition] = useState([28.6139, 77.2090]); // Default to Delhi, India

  // Add an effect to update latitude and longitude when map position changes
  useEffect(() => {
    if (mapPosition) {
      setLatitude(mapPosition[0].toFixed(6));
      setLongitude(mapPosition[1].toFixed(6));
    }
  }, [mapPosition]);

  // Check if user is admin
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
    }
  }, [userInfo, navigate]);

  // Use effect to initialize local stations from API data when it loads
  useEffect(() => {
    if (stations) {
      console.log('Raw stations data from API:', JSON.stringify(stations, null, 2));
      
      // Even if stationMasterId is populated, ensure we have consistent access
      const processedStations = stations.map(station => ({
        ...station,
        // Extract name from populated stationMasterId if available
        stationMasterName: station.stationMasterId && typeof station.stationMasterId === 'object' 
          ? station.stationMasterId.name 
          : undefined
      }));
      
      console.log('Processed stations data:', processedStations);
      setLocalStations(processedStations);
    }
  }, [stations]);

  // Add this debugging effect to check the data format
  useEffect(() => {
    if (stations && stations.length > 0) {
      console.log('First station object structure:', JSON.stringify(stations[0], null, 2));
      // Specifically look at the stationMasterId format
      console.log('stationMasterId type:', typeof stations[0].stationMasterId);
      console.log('stationMasterId value:', stations[0].stationMasterId);
      
      // Check station masters data structure
      if (stationMasters && stationMasters.length > 0) {
        console.log('First station master object structure:', JSON.stringify(stationMasters[0], null, 2));
        console.log('Station master _id type:', typeof stationMasters[0]._id);
        console.log('Station master _id value:', stationMasters[0]._id);
      }
    }
  }, [stations, stationMasters]);

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validate coordinates
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        toast.error('Please enter valid coordinates');
        return;
      }
    }

    try {
      await createStation({
        name,
        address,
        operatingHours,
        stationMasterId: stationMasterId || undefined,
        geofenceParameters: {
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
          radius: parseInt(geofenceRadius)
        }
      }).unwrap();

      // Reset form
      setName('');
      setAddress('');
      setOperatingHours({
        opening: '09:00',
        closing: '18:00'
      });
      setLatitude('');
      setLongitude('');
      setStationMasterId('');
      setGeofenceRadius(100);
      setShowForm(false);

      // Refresh the stations list
      refetch();

      toast.success('Station created successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create station');
    }
  };

  const handleDeleteStation = async (id) => {
    if (window.confirm('Are you sure you want to delete this station?')) {
      try {
        await deleteStation(id).unwrap();
        toast.success('Station deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete station');
      }
    }
  };

  const getStationMasterName = (id) => {
    // Check if id is actually an object with name (case when stationMasterId is populated)
    if (id && typeof id === 'object' && id.name) {
      return id.name;
    }
    
    // Skip processing if we don't have a valid ID or no station masters are loaded
    if (!id || !stationMasters || !stationMasters.length) {
      return 'Not Assigned';
    }
    
    // Log for debugging
    console.log('Looking for station master with ID:', id);
    
    // MongoDB ObjectIDs are stored as strings in the frontend
    // Make sure we're comparing strings to strings
    const stationMasterId = typeof id === 'string' ? id : String(id);
    
    // Find the station master with the matching ID
    const master = stationMasters.find(m => {
      const masterId = typeof m._id === 'string' ? m._id : String(m._id);
      return masterId === stationMasterId;
    });
    
    // Return the name if found, otherwise "Not Assigned"
    return master ? master.name : 'Not Assigned';
  };
  
  const openEditModal = (station) => {
    setSelectedStation(station);
    
    // If station already has a station master, pre-select it
    if (station.stationMasterId) {
      // If stationMasterId is a string
      if (typeof station.stationMasterId === 'string') {
        const existingStationMaster = stationMasters?.find(
          sm => sm._id === station.stationMasterId
        );
        if (existingStationMaster) {
          setSelectedStationMaster(existingStationMaster);
        }
      } 
      // If stationMasterId is an object with _id
      else if (typeof station.stationMasterId === 'object' && station.stationMasterId?._id) {
        const existingStationMaster = stationMasters?.find(
          sm => sm._id === station.stationMasterId._id
        );
        if (existingStationMaster) {
          setSelectedStationMaster(existingStationMaster);
        }
      }
    } else {
      // Clear the selection if no station master
      setSelectedStationMaster(null);
    }
    
    setShowEditModal(true);
  };
  
  const handleUpdateStationMaster = async () => {
    try {
      setIsUpdating(true);
      
      if (!selectedStation || !selectedStationMaster) {
        setUpdateError('Both station and station master must be selected');
        setIsUpdating(false);
        return;
      }
      
      // Clean the ID
      const stationId = selectedStation._id && selectedStation._id.toString().trim();
      
      console.log('Updating station master with:', {
        stationId,
        stationMasterId: selectedStationMaster._id
      });
      
      const result = await updateStation({
        stationId, 
        stationMasterId: selectedStationMaster._id
      }).unwrap();
      
      console.log('Station update result:', result);
      
      // Update the local state immediately
      setLocalStations(prevStations => 
        prevStations.map(station => 
          station._id === stationId 
            ? { 
                ...station, 
                stationMasterId: selectedStationMaster._id,
                stationMasterName: selectedStationMaster.name
              } 
            : station
        )
      );
      
      setUpdateSuccess(`Station master assigned successfully to ${selectedStation.name}`);
      
      // Force a refetch
      refetch();
      
      closeEditModal();
    } catch (err) {
      console.error('Error updating station master:', err);
      setUpdateError(err?.data?.message || 'Failed to update station master');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // For debugging
  useEffect(() => {
    if (stations) {
      console.log('Stations data:', stations);
    }
  }, [stations]);

  // Add closeEditModal function if it doesn't exist
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedStation(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/admin')}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Stations</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus className="mr-2" />
          {showForm ? 'Cancel' : 'Add New Station'}
        </button>
      </div>

      {updateSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          {updateSuccess}
        </div>
      )}
      {updateError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {updateError}
        </div>
      )}

      {showForm && (
        <div className="mb-8">
          <FormContainer>
            <h2 className="text-xl font-semibold mb-4">Create New Station</h2>
            <form onSubmit={submitHandler}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Station Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter station name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter complete address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="opening" className="block text-gray-700 font-medium mb-2">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    id="opening"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={operatingHours.opening}
                    onChange={(e) => setOperatingHours({...operatingHours, opening: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="closing" className="block text-gray-700 font-medium mb-2">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    id="closing"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={operatingHours.closing}
                    onChange={(e) => setOperatingHours({...operatingHours, closing: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Location (Click on map to set coordinates)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div>
                    <label htmlFor="latitude" className="block text-gray-700 text-sm mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      id="latitude"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 28.6139"
                      value={latitude}
                      onChange={(e) => {
                        setLatitude(e.target.value);
                        if (e.target.value && longitude) {
                          try {
                            const lat = parseFloat(e.target.value);
                            const lng = parseFloat(longitude);
                            if (!isNaN(lat) && !isNaN(lng)) {
                              setMapPosition([lat, lng]);
                            }
                          } catch (error) {
                            // Invalid coordinates, ignore
                          }
                        }
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-gray-700 text-sm mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      id="longitude"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. 77.2090"
                      value={longitude}
                      onChange={(e) => {
                        setLongitude(e.target.value);
                        if (latitude && e.target.value) {
                          try {
                            const lat = parseFloat(latitude);
                            const lng = parseFloat(e.target.value);
                            if (!isNaN(lat) && !isNaN(lng)) {
                              setMapPosition([lat, lng]);
                            }
                          } catch (error) {
                            // Invalid coordinates, ignore
                          }
                        }
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="h-[300px] w-full border border-gray-300 rounded-md overflow-hidden">
                  <MapWrapper
                    center={mapPosition}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <MapMarker position={mapPosition} setPosition={setMapPosition} />
                  </MapWrapper>
                </div>
                <div className="mt-2 flex items-center justify-center">
                  <button
                    type="button"
                    className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                    onClick={() => {
                      // Try to get user's current location
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const { latitude, longitude } = position.coords;
                            setMapPosition([latitude, longitude]);
                          },
                          (error) => {
                            toast.error('Error getting your location. Please select manually.');
                          }
                        );
                      } else {
                        toast.error('Geolocation is not supported by your browser');
                      }
                    }}
                  >
                    <FaMapMarkedAlt className="mr-1" /> Use My Current Location
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="stationMaster" className="block text-gray-700 font-medium mb-2">
                  Station Master
                </label>
                <select
                  id="stationMaster"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={stationMasterId}
                  onChange={(e) => setStationMasterId(e.target.value)}
                >
                  <option value="">Select Station Master (Optional)</option>
                  {isLoadingMasters ? (
                    <option disabled>Loading station masters...</option>
                  ) : stationMasters?.length > 0 ? (
                    stationMasters.map((master) => (
                      <option key={master._id} value={master._id}>
                        {master.name} ({master.email})
                      </option>
                    ))
                  ) : (
                    <option disabled>No station masters available</option>
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="geofenceRadius" className="block text-gray-700 font-medium mb-2">
                  Geofence Radius (meters)
                </label>
                <input
                  type="number"
                  id="geofenceRadius"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Radius in meters"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(e.target.value)}
                  min="50"
                  max="1000"
                  required
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Creating...
                    </span>
                  ) : (
                    'Create Station'
                  )}
                </button>
              </div>
            </form>
          </FormContainer>
        </div>
      )}

      {/* Stations List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {isLoadingStations ? (
            <div className="p-6 text-center">
              <Loader />
            </div>
          ) : stationsError ? (
            <div className="p-6 text-center text-red-600">
              {stationsError?.data?.message || 'Failed to load stations'}
            </div>
          ) : localStations?.length > 0 ? (
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Address</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hours</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Station Master</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {localStations.map((station) => (
                  <tr key={station._id}>
                    <td className="py-3 px-4 font-medium">{station.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-start">
                        <FaMapMarkerAlt className="text-red-500 mt-1 mr-1 flex-shrink-0" />
                        <span className="text-sm">{station.address}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {station.operatingHours.opening} - {station.operatingHours.closing}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <span>
                          {station.stationMasterName || getStationMasterName(station.stationMasterId) || 'Not Assigned'}
                        </span>
                        <button 
                          className="text-blue-600 hover:text-blue-900 ml-2"
                          onClick={() => openEditModal(station)}
                          title="Change Station Master"
                        >
                          <FaUserEdit />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => navigate(`/admin/stations/${station._id}/edit`)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteStation(station._id)}
                          disabled={isDeleting}
                        >
                          <FaTrash />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 text-sm ml-2"
                          onClick={() => navigate(`/admin/stations/${station._id}/evs`)}
                        >
                          Manage EVs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No stations found. Create a new station to get started.
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Station Master Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              Update Station Master for {selectedStation?.name}
            </h2>
            
            {updateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {updateError}
              </div>
            )}
            
            {updateSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                {updateSuccess}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Station Master</label>
              <select
                className="border rounded w-full py-2 px-3"
                value={selectedStationMaster?._id || ''}
                onChange={(e) => {
                  const selected = stationMasters.find(sm => sm._id === e.target.value);
                  setSelectedStationMaster(selected || null);
                }}
              >
                <option value="">-- None --</option>
                {stationMasters?.map((sm) => (
                  <option key={sm._id} value={sm._id}>
                    {sm.name} ({sm.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleUpdateStationMaster}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStationsScreen; 