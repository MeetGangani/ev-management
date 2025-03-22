import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUsersCog, FaMapMarkedAlt, FaCarAlt, FaUser, FaChartLine } from 'react-icons/fa';

const AdminDashboardScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
    }
  }, [userInfo, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FaUser className="mr-2 text-blue-600" />
          Welcome, {userInfo?.name}
        </h2>
        <p className="text-gray-600 mb-4">
          You have admin access to manage the EV rental system. Use the cards below to navigate to different management sections.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Station Masters Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-5 bg-indigo-50">
            <FaUsersCog className="text-4xl text-indigo-600 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Station Masters</h3>
            <p className="text-gray-600 text-sm mb-4">
              Add, edit and manage station masters for all locations
            </p>
            <Link 
              to="/admin/station-masters" 
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Manage Station Masters
            </Link>
          </div>
        </div>

        {/* Stations Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-5 bg-blue-50">
            <FaMapMarkedAlt className="text-4xl text-blue-600 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Stations</h3>
            <p className="text-gray-600 text-sm mb-4">
              Create and manage charging stations across locations
            </p>
            <Link 
              to="/admin/stations" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Manage Stations
            </Link>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-5 bg-green-50">
            <FaChartLine className="text-4xl text-green-600 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Analytics</h3>
            <p className="text-gray-600 text-sm mb-4">
              View system statistics and booking analytics
            </p>
            <button
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardScreen; 