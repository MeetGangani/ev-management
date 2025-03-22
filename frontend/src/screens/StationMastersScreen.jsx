import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaArrowLeft, FaUserPlus, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { 
  useCreateStationMasterMutation, 
  useGetStationMastersQuery 
} from '../slices/usersApiSlice';

const StationMastersScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Fetch station masters from the API
  const { data: stationMasters, isLoading, error, refetch } = useGetStationMastersQuery();
  const [createStationMaster, { isLoading: isCreating }] = useCreateStationMasterMutation();

  // Check if user is admin
  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate Aadhar number (12 digits)
    if (aadhaar && !/^\d{12}$/.test(aadhaar)) {
      toast.error('Aadhar number must be 12 digits');
      return;
    }

    try {
      await createStationMaster({
        name,
        email,
        password,
        phone,
        aadhaar
      }).unwrap();

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setPhone('');
      setAadhaar('');
      setShowForm(false);

      // Refresh the station masters list
      refetch();

      toast.success('Station master created successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create station master');
    }
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
        <h1 className="text-2xl font-bold">Station Masters</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center"
          onClick={() => setShowForm(!showForm)}
        >
          <FaUserPlus className="mr-2" />
          {showForm ? 'Cancel' : 'Add Station Master'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <FormContainer>
            <h2 className="text-xl font-semibold mb-4">Create Station Master</h2>
            <form onSubmit={submitHandler}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="aadhaar" className="block text-gray-700 font-medium mb-2">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    id="aadhaar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12-digit Aadhar number"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    maxLength={12}
                  />
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
                    'Create Station Master'
                  )}
                </button>
              </div>
            </form>
          </FormContainer>
        </div>
      )}

      {/* Station Masters List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 text-center">
              <Loader />
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">
              {error?.data?.message || 'Failed to load station masters'}
            </div>
          ) : stationMasters?.length > 0 ? (
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Aadhar</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stationMasters.map((master) => (
                  <tr key={master._id}>
                    <td className="py-3 px-4">{master.name}</td>
                    <td className="py-3 px-4">{master.email}</td>
                    <td className="py-3 px-4">{master.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {/* Display only last 4 digits for privacy */}
                      {master.aadhaar ? ('xxxxxxxx' + master.aadhaar.slice(-4)) : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => navigate(`/admin/station-masters/${master._id}/edit`)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this station master?')) {
                              // Delete logic here
                            }
                          }}
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
              No station masters found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StationMastersScreen; 