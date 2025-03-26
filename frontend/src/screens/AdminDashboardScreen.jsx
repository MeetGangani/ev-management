import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FaUsersCog, 
  FaMapMarkedAlt, 
  FaExclamationTriangle, 
  FaCarAlt, 
  FaChartBar, 
  FaUsers,
  FaWallet
} from 'react-icons/fa';
import { AnimatedBarChart, AnimatedPieChart } from '../components/AnimatedCharts';
import { SkeletonDashboard } from '../components/SkeletonLoaders';
import ScrollReveal from '../components/ScrollReveal';
import { useNotification } from '../components/NotificationSystem';

const AdminDashboardScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/');
    } else {
      // Simulate loading data
      setTimeout(() => {
        // Mock data for charts
        setDashboardData({
          userDistribution: {
            labels: ['Customers', 'Station Masters', 'Admins'],
            data: [85, 12, 3],
          },
          revenueData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [4500, 5200, 6800, 7900, 9200, 12000],
          },
          totalUsers: 583,
          totalStations: 28,
          totalBookings: 1247,
          totalRevenue: 984500,
          pendingApprovals: 7,
          activeRentals: 42,
        });
        setIsLoading(false);
        
        // Show notification when data is loaded
        addNotification({
          title: 'Dashboard Updated',
          message: 'Latest statistics have been loaded successfully.',
          type: 'success',
          duration: 3000
        });
      }, 1500);
    }
  }, [userInfo, navigate, addNotification]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 gradient-text">Admin Dashboard</h1>
        <SkeletonDashboard />
      </div>
    );
  }

  return (
    <ScrollReveal>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-8"
      >
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-3xl font-bold mb-8 gradient-text"
        >
          Admin Dashboard
        </motion.h1>
        
        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3 }}
            className="card-glass border border-primary-600/20 shadow-glass p-5"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-blue-500/10 rounded-lg mr-3">
                <FaUsers className="text-blue-400 text-xl" />
              </div>
              <h3 className="text-white text-lg font-medium">Total Users</h3>
            </div>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              {dashboardData.totalUsers}
            </p>
          </motion.div>
          
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card-glass border border-primary-600/20 shadow-glass p-5"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-purple-500/10 rounded-lg mr-3">
                <FaMapMarkedAlt className="text-purple-400 text-xl" />
              </div>
              <h3 className="text-white text-lg font-medium">Stations</h3>
            </div>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
              {dashboardData.totalStations}
            </p>
          </motion.div>
          
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card-glass border border-primary-600/20 shadow-glass p-5"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-teal-500/10 rounded-lg mr-3">
                <FaCarAlt className="text-teal-400 text-xl" />
              </div>
              <h3 className="text-white text-lg font-medium">Bookings</h3>
            </div>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
              {dashboardData.totalBookings}
            </p>
          </motion.div>
          
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card-glass border border-primary-600/20 shadow-glass p-5"
          >
            <div className="flex items-center mb-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg mr-3">
                <FaWallet className="text-yellow-400 text-xl" />
              </div>
              <h3 className="text-white text-lg font-medium">Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              ₹{dashboardData.totalRevenue.toLocaleString()}
            </p>
          </motion.div>
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnimatedPieChart
            data={dashboardData.userDistribution.data}
            labels={dashboardData.userDistribution.labels}
            title="User Distribution"
            doughnut={true}
            cutout={70}
            colors={['accent-blue', 'accent-purple', 'accent-teal']}
          />
          
          <AnimatedBarChart
            data={dashboardData.revenueData.data}
            labels={dashboardData.revenueData.labels}
            title="Monthly Revenue (₹)"
            color="accent-blue"
            yAxisLabel="Revenue (₹)"
            xAxisLabel="Month"
          />
        </div>
        
        {/* Admin Actions Cards */}
        <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card-glass border border-primary-600/20 shadow-glass overflow-hidden hover:shadow-glass-lg transition-all duration-300"
          >
            <div className="p-5 bg-primary-800/30 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-purple-600/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>
              <div className="relative z-10">
                <FaUsersCog className="text-4xl text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold mb-1 text-white">Station Masters</h3>
                <p className="text-white/70 text-sm mb-4">
                  Manage and create station master accounts
                </p>
                <Link 
                  to="/admin/stationmasters" 
                  className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-glow-sm text-white rounded-lg font-medium transition-all duration-300"
                >
                  Manage Station Masters
                </Link>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card-glass border border-primary-600/20 shadow-glass overflow-hidden hover:shadow-glass-lg transition-all duration-300"
          >
            <div className="p-5 bg-primary-800/30 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-600/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>
              <div className="relative z-10">
                <FaMapMarkedAlt className="text-4xl text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold mb-1 text-white">Stations</h3>
                <p className="text-white/70 text-sm mb-4">
                  Manage and create stations across locations
                </p>
                <Link 
                  to="/admin/stations" 
                  className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-glow-sm text-white rounded-lg font-medium transition-all duration-300"
                >
                  Manage Stations
                </Link>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.3 }}
            className="card-glass border border-primary-600/20 shadow-glass overflow-hidden hover:shadow-glass-lg transition-all duration-300"
          >
            <div className="p-5 bg-primary-800/30 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-red-600/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>
              <div className="relative z-10">
                <FaExclamationTriangle className="text-4xl text-red-400 mb-3" />
                <h3 className="text-lg font-semibold mb-1 text-white">Penalties</h3>
                <p className="text-white/70 text-sm mb-4">
                  Manage customer penalties and violations
                </p>
                <Link 
                  to="/admin/penalties" 
                  className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-glow-sm text-white rounded-lg font-medium transition-all duration-300"
                >
                  Manage Penalties
                </Link>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card-glass border border-primary-600/20 shadow-glass overflow-hidden hover:shadow-glass-lg transition-all duration-300"
          >
            <div className="p-5 bg-primary-800/30 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-teal-600/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>
              <div className="relative z-10">
                <FaCarAlt className="text-4xl text-teal-400 mb-3" />
                <h3 className="text-lg font-semibold mb-1 text-white">EVs</h3>
                <p className="text-white/70 text-sm mb-4">
                  Manage EV inventory and maintenance
                </p>
                <Link 
                  to="/admin/evs" 
                  className="inline-block px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-glow-sm text-white rounded-lg font-medium transition-all duration-300"
                >
                  Manage EVs
                </Link>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3, delay: 0.5 }}
            className="card-glass border border-primary-600/20 shadow-glass overflow-hidden hover:shadow-glass-lg transition-all duration-300"
          >
            <div className="p-5 bg-primary-800/30 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-green-600/10 rounded-bl-full -mr-8 -mt-8 z-0"></div>
              <div className="relative z-10">
                <FaChartBar className="text-4xl text-green-400 mb-3" />
                <h3 className="text-lg font-semibold mb-1 text-white">Analytics</h3>
                <p className="text-white/70 text-sm mb-4">
                  View booking statistics, revenue reports and usage patterns
                </p>
                <Link 
                  to="/admin/analytics" 
                  className="inline-block px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-glow-sm text-white rounded-lg font-medium transition-all duration-300"
                >
                  View Analytics
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Pending Actions Banner */}
        {dashboardData.pendingApprovals > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="card-glass border-l-4 border-accent-yellow p-6 shadow-glass mb-6"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="text-accent-yellow text-xl mr-4" />
              <div>
                <h3 className="text-white font-semibold mb-1">Pending Approvals</h3>
                <p className="text-white/80">
                  You have {dashboardData.pendingApprovals} station master {dashboardData.pendingApprovals === 1 ? 'application' : 'applications'} waiting for approval.
                </p>
              </div>
              <Link
                to="/admin/approvals"
                className="ml-auto inline-block px-4 py-2 bg-gradient-to-r from-accent-yellow to-accent-yellow/80 hover:shadow-glow-sm text-white rounded-lg font-medium transition-all duration-300"
              >
                Review Now
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </ScrollReveal>
  );
};

export default AdminDashboardScreen; 