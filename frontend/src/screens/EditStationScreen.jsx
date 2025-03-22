import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaSave, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { useGetStationMastersQuery } from '../slices/usersApiSlice';
import { 
  useGetStationByIdQuery,
  useUpdateStationMutation
} from '../slices/stationsApiSlice';

const EditStationScreen = () => {
  const { stationId } = useParams();
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

  // Fetch station and station masters from the API
  const { 
    data: station, 
    isLoading: isLoadingStation, 
    error: stationError 
  } = useGetStationByIdQuery(stationId);
  
  const { 
    data: stationMasters, 
    isLoading: isLoadingMasters 
  } = useGetStationMastersQuery();
  
  const [updateStation, { isLoading: isUpdating }] = useUpdateStationMutation();

  // Check if user is admin
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
    }
  }, [userInfo, navigate]);

  // Fill form with station data once loaded
  useEffect(() => {
    if (station) {
      setName(station.name || '');
      setAddress(station.address || '');
      
      if (station.operatingHours) {
        setOperatingHours({
          opening: station.operatingHours.opening || '09:00',
          closing: station.operatingHours.closing || '18:00'
        });
      }
      
      if (station.geofenceParameters && station.geofenceParameters.coordinates) {
        // MongoDB GeoJSON uses [longitude, latitude] format
        const coords = station.geofenceParameters.coordinates;
        setLongitude(coords[0]?.toString() || '');
        setLatitude(coords[1]?.toString() || '');
        setGeofenceRadius(station.geofenceParameters.radius || 100);
      }
      
      setStationMasterId(station.stationMasterId || '');
    }
  }, [station]);

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name || !address) {
      toast.error('Name and address are required');
      return;
    }

    // Validate coordinates
    if (!latitude || !longitude) {
      toast.error('Coordinates are required');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error('Please enter valid coordinates');
      return;
    }

    // Validate geofence radius
    const radius = parseInt(geofenceRadius);
    if (isNaN(radius) || radius <= 0) {
      toast.error('Please enter a valid geofence radius');
      return;
    }

    try {
      const updateData = {
        name: name.trim(),
        address: address.trim(),
        operatingHours: {
          opening: operatingHours.opening || '09:00',
          closing: operatingHours.closing || '18:00'
        },
        stationMasterId: stationMasterId || null,
        geofenceParameters: {
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
          radius: radius
        }
      };

      console.log('Updating station with data:', updateData); // Debug log

      await updateStation({
        stationId,
        data: updateData
      }).unwrap();

      toast.success('Station updated successfully');
      navigate('/admin/stations');
    } catch (err) {
      console.error('Update error:', err); // Debug log
      toast.error(err?.data?.message || 'Failed to update station');
    }
  };

  if (isLoadingStation) {
    return <Loader />;
  }

  if (stationError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          Error: {stationError?.data?.message || 'Failed to load station details'}
        </div>
        <button 
          onClick={() => navigate('/admin/stations')}
          className="mt-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Stations
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/admin/stations')}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <FaArrowLeft className="mr-2" /> Back to Stations
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Station: {station?.name}</h1>
      </div>

      <div className="mb-8">
        <FormContainer>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="latitude" className="block text-gray-700 font-medium mb-2">
                  Latitude
                </label>
                <input
                  type="text"
                  id="latitude"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 28.6139"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-gray-700 font-medium mb-2">
                  Longitude
                </label>
                <input
                  type="text"
                  id="longitude"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 77.2090"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
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
                <option value="">No Station Master</option>
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </FormContainer>
      </div>
    </div>
  );
};

export default EditStationScreen; 