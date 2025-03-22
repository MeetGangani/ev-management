import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaSpinner, FaCar, FaBatteryThreeQuarters } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { useGetStationByIdQuery } from '../slices/stationsApiSlice';
import { 
  useGetEVsByStationQuery,
  useCreateEVMutation,
  useDeleteEVMutation
} from '../slices/evsApiSlice';

const AdminStationEVsScreen = () => {
  const { stationId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Form state
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [model, setModel] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [batteryCapacity, setBatteryCapacity] = useState('');
  const [range, setRange] = useState('');
  const [pricePerHour, setPricePerHour] = useState(50);
  const [features, setFeatures] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [colorCode, setColorCode] = useState('#000000');
  const [showForm, setShowForm] = useState(false);

  // Fetch station and EVs from the API
  const { data: station, isLoading: isLoadingStation } = useGetStationByIdQuery(stationId);
  const { data: evs, isLoading: isLoadingEVs, error: evsError, refetch } = useGetEVsByStationQuery(stationId);
  const [createEV, { isLoading: isCreating }] = useCreateEVMutation();
  const [deleteEV, { isLoading: isDeleting }] = useDeleteEVMutation();

  // Check if user is admin
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!registrationNumber || !model || !manufacturer || !batteryCapacity || !range) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const featuresArray = features
        ? features.split(',').map(item => item.trim())
        : [];

      await createEV({
        registrationNumber,
        model,
        manufacturer,
        batteryCapacity: parseFloat(batteryCapacity),
        range: parseFloat(range),
        stationId,
        pricePerHour: parseFloat(pricePerHour),
        features: featuresArray,
        imageUrl: imageUrl || undefined,
        colorCode,
      }).unwrap();

      // Reset form
      setRegistrationNumber('');
      setModel('');
      setManufacturer('');
      setBatteryCapacity('');
      setRange('');
      setPricePerHour(50);
      setFeatures('');
      setImageUrl('');
      setColorCode('#000000');
      setShowForm(false);

      // Refresh the EVs list
      refetch();

      toast.success('EV created successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create EV');
    }
  };

  const handleDeleteEV = async (id) => {
    if (window.confirm('Are you sure you want to delete this EV?')) {
      try {
        await deleteEV(id).unwrap();
        toast.success('EV deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err?.data?.message || 'Failed to delete EV');
      }
    }
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
      <button 
        onClick={() => navigate('/admin/stations')}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <FaArrowLeft className="mr-2" /> Back to Stations
      </button>

      {isLoadingStation ? (
        <Loader />
      ) : !station ? (
        <div className="text-center text-red-600">Station not found</div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">EVs at {station.name}</h1>
              <p className="text-gray-600">{station.address}</p>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
              onClick={() => setShowForm(!showForm)}
            >
              <FaPlus className="mr-2" />
              {showForm ? 'Cancel' : 'Add New EV'}
            </button>
          </div>

          {showForm && (
            <div className="mb-8">
              <FormContainer>
                <h2 className="text-xl font-semibold mb-4">Create New EV</h2>
                <form onSubmit={submitHandler}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="registrationNumber" className="block text-gray-700 font-medium mb-2">
                        Registration Number*
                      </label>
                      <input
                        type="text"
                        id="registrationNumber"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. DL01AB1234"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="model" className="block text-gray-700 font-medium mb-2">
                        Model*
                      </label>
                      <input
                        type="text"
                        id="model"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Model 3"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="manufacturer" className="block text-gray-700 font-medium mb-2">
                        Manufacturer*
                      </label>
                      <input
                        type="text"
                        id="manufacturer"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Tesla"
                        value={manufacturer}
                        onChange={(e) => setManufacturer(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="batteryCapacity" className="block text-gray-700 font-medium mb-2">
                        Battery Capacity (kWh)*
                      </label>
                      <input
                        type="number"
                        id="batteryCapacity"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 75"
                        value={batteryCapacity}
                        onChange={(e) => setBatteryCapacity(e.target.value)}
                        min="1"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="range" className="block text-gray-700 font-medium mb-2">
                        Range (km)*
                      </label>
                      <input
                        type="number"
                        id="range"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 400"
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        min="1"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="pricePerHour" className="block text-gray-700 font-medium mb-2">
                        Price Per Hour (INR)*
                      </label>
                      <input
                        type="number"
                        id="pricePerHour"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. 50"
                        value={pricePerHour}
                        onChange={(e) => setPricePerHour(e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="features" className="block text-gray-700 font-medium mb-2">
                      Features (comma separated)
                    </label>
                    <input
                      type="text"
                      id="features"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. GPS, Auto-pilot, Climate Control"
                      value={features}
                      onChange={(e) => setFeatures(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="mb-4">
                      <label htmlFor="imageUrl" className="block text-gray-700 font-medium mb-2">
                        Image URL
                      </label>
                      <input
                        type="text"
                        id="imageUrl"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. /images/tesla-model3.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="colorCode" className="block text-gray-700 font-medium mb-2">
                        Color
                      </label>
                      <div className="flex">
                        <input
                          type="color"
                          id="colorCode"
                          className="h-10 w-10 border border-gray-300 rounded"
                          value={colorCode}
                          onChange={(e) => setColorCode(e.target.value)}
                        />
                        <input
                          type="text"
                          className="w-full ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={colorCode}
                          onChange={(e) => setColorCode(e.target.value)}
                        />
                      </div>
                    </div>
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
                        'Create EV'
                      )}
                    </button>
                  </div>
                </form>
              </FormContainer>
            </div>
          )}

          {/* EVs List */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              {isLoadingEVs ? (
                <div className="p-6 text-center">
                  <Loader />
                </div>
              ) : evsError ? (
                <div className="p-6 text-center text-red-600">
                  {evsError?.data?.message || 'Failed to load EVs'}
                </div>
              ) : evs?.length > 0 ? (
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Vehicle</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Registration</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Battery</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Range</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Price/Hour</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {evs.map((ev) => (
                      <tr key={ev._id}>
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div 
                              className="h-10 w-10 rounded-full flex items-center justify-center" 
                              style={{ backgroundColor: ev.colorCode || '#f3f4f6' }}
                            >
                              <FaCar className="text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {ev.manufacturer} {ev.model}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {ev.registrationNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-sm">
                            <FaBatteryThreeQuarters className={ev.batteryLevel > 50 ? "text-green-500" : "text-yellow-500"} />
                            <span className="ml-2">
                              {ev.batteryLevel}% / {ev.batteryCapacity} kWh
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {ev.range} km
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          ₹{ev.pricePerHour}/hr
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ev.status)}`}>
                            {ev.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => navigate(`/admin/evs/${ev._id}/edit`)}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteEV(ev._id)}
                              disabled={isDeleting || ev.status === 'booked' || ev.status === 'in-use'}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No EVs found at this station. Add a new EV to get started.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminStationEVsScreen; 