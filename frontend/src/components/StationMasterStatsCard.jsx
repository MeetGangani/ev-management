import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { AnimatedBarChart, AnimatedPieChart, AnimatedLineChart } from './AnimatedCharts';
import { FaChargingStation, FaListAlt, FaBatteryHalf, FaUsers } from 'react-icons/fa';
import ScrollReveal from './ScrollReveal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

// Simple stat card for high-level metrics
const StatCard = ({ title, value, icon: Icon, color = 'accent-blue' }) => {
  const getGradient = () => {
    const colors = {
      'accent-blue': 'from-blue-500/20 to-blue-600/10',
      'accent-teal': 'from-teal-500/20 to-teal-600/10',
      'accent-purple': 'from-purple-500/20 to-purple-600/10',
      'accent-yellow': 'from-yellow-500/20 to-yellow-600/10',
      'accent-red': 'from-red-500/20 to-red-600/10',
    };
    return colors[color] || colors['accent-blue'];
  };

  const getTextColor = () => {
    const colors = {
      'accent-blue': 'text-blue-400',
      'accent-teal': 'text-teal-400',
      'accent-purple': 'text-purple-400',
      'accent-yellow': 'text-yellow-400',
      'accent-red': 'text-red-400',
    };
    return colors[color] || colors['accent-blue'];
  };

  return (
    <motion.div 
      variants={itemVariants}
      className={`card-glass border border-primary-600/20 shadow-glass overflow-hidden relative
                  p-6 bg-gradient-to-br ${getGradient()}`}
    >
      <div className="absolute right-4 top-4 text-4xl opacity-70">
        <Icon className={getTextColor()} />
      </div>
      <div className="space-y-1">
        <p className="text-slate-400 text-sm">{title}</p>
        <h3 className={`text-3xl font-bold ${getTextColor()}`}>{value}</h3>
      </div>
    </motion.div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string
};

// Main component that displays all station master statistics
const StationMasterStatsCard = ({ 
  stationData = {
    totalEVs: 0,
    availableEVs: 0,
    unavailableEVs: 0,
    maintenanceRequired: 0,
    batteryHealth: 0,
    bookingsCompleted: 0,
    revenueGenerated: 0,
    customerSatisfaction: 0,
    dailyBookingsTrend: [],
    evStatusDistribution: [],
    monthlyRevenue: []
  }
}) => {
  const { 
    totalEVs, 
    availableEVs, 
    unavailableEVs, 
    maintenanceRequired, 
    batteryHealth, 
    bookingsCompleted, 
    revenueGenerated, 
    customerSatisfaction,
    dailyBookingsTrend = [],
    evStatusDistribution = [],
    monthlyRevenue = []
  } = stationData;

  // Chart data calculations
  const evStatusLabels = ['Available', 'In-Use', 'Maintenance', 'Charging'];
  const evStatusData = evStatusDistribution.length ? evStatusDistribution : [
    availableEVs, 
    (totalEVs - availableEVs - maintenanceRequired), 
    maintenanceRequired, 
    Math.round(totalEVs * 0.15) // Default estimate for charging
  ];

  // Generate placeholder data if actual data not provided
  const getLastNDays = (n) => {
    const result = [];
    const today = new Date();
    
    for (let i = n - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      result.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    return result;
  };

  const generateTrendData = (length, min, max) => {
    if (dailyBookingsTrend.length) return dailyBookingsTrend;
    
    return Array.from({ length }, () => 
      Math.floor(Math.random() * (max - min + 1)) + min
    );
  };

  const weeklyBookingsLabels = getLastNDays(7);
  const weeklyBookingsData = generateTrendData(7, 5, 20);

  // Monthly revenue data
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = monthlyRevenue.length ? monthlyRevenue : generateTrendData(12, 500, 5000);

  return (
    <ScrollReveal>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Top stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total EVs" 
            value={totalEVs} 
            icon={FaChargingStation} 
            color="accent-teal" 
          />
          <StatCard 
            title="Available EVs" 
            value={availableEVs} 
            icon={FaListAlt}
            color="accent-blue"
          />
          <StatCard 
            title="Battery Health" 
            value={`${batteryHealth}%`} 
            icon={FaBatteryHalf}
            color="accent-yellow"
          />
          <StatCard 
            title="Bookings Completed" 
            value={bookingsCompleted} 
            icon={FaUsers}
            color="accent-purple"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedBarChart
            data={weeklyBookingsData}
            labels={weeklyBookingsLabels}
            title="Weekly Bookings"
            color="accent-purple"
            yAxisLabel="Number of Bookings"
            xAxisLabel="Day"
            showLegend={false}
            height={250}
          />
          <AnimatedPieChart
            data={evStatusData}
            labels={evStatusLabels}
            title="EV Status Distribution"
            doughnut={true}
            cutout={60}
            colors={['accent-teal', 'accent-blue', 'accent-red', 'accent-yellow']}
            height={250}
          />
        </div>

        {/* Monthly revenue chart */}
        <AnimatedLineChart
          data={revenueData}
          labels={monthLabels}
          title="Monthly Revenue"
          color="accent-blue"
          yAxisLabel="Revenue (₹)"
          xAxisLabel="Month"
          fill={true}
          tension={0.4}
          height={300}
        />

        {/* Additional stats in cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div 
            variants={itemVariants}
            className="card-glass border border-primary-600/20 shadow-glass p-6"
          >
            <h3 className="text-lg text-white mb-2">Revenue Generated</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
              ₹{revenueGenerated.toLocaleString()}
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="card-glass border border-primary-600/20 shadow-glass p-6"
          >
            <h3 className="text-lg text-white mb-2">Customer Satisfaction</h3>
            <div className="flex items-end">
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-transparent bg-clip-text">
                {customerSatisfaction}%
              </p>
              <div className="ml-2 h-6 w-full max-w-32 bg-gray-700 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${customerSatisfaction}%` }}
                />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="card-glass border border-primary-600/20 shadow-glass p-6"
          >
            <h3 className="text-lg text-white mb-2">Maintenance Required</h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-500 text-transparent bg-clip-text">
              {maintenanceRequired} EVs
            </p>
          </motion.div>
        </div>
      </motion.div>
    </ScrollReveal>
  );
};

StationMasterStatsCard.propTypes = {
  stationData: PropTypes.shape({
    totalEVs: PropTypes.number,
    availableEVs: PropTypes.number,
    unavailableEVs: PropTypes.number,
    maintenanceRequired: PropTypes.number,
    batteryHealth: PropTypes.number,
    bookingsCompleted: PropTypes.number,
    revenueGenerated: PropTypes.number,
    customerSatisfaction: PropTypes.number,
    dailyBookingsTrend: PropTypes.array,
    evStatusDistribution: PropTypes.array,
    monthlyRevenue: PropTypes.array
  })
};

export default StationMasterStatsCard; 