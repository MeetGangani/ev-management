import { motion } from 'framer-motion';
import { 
  FaCar, 
  FaChargingStation, 
  FaRoute, 
  FaCalendarCheck, 
  FaMoneyBillWave,
  FaClock
} from 'react-icons/fa';

const DashboardStats = ({ stats }) => {
  if (!stats) {
    return null;
  }
  
  const { totalSpent, totalRides, upcomingBooking, activeBooking } = stats;
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  // Calculate remaining time for active booking
  const getRemainingTime = () => {
    if (!activeBooking || !activeBooking.endTime) return null;
    
    const endTime = new Date(activeBooking.endTime);
    const now = new Date();
    const diff = endTime - now;
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };
  
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
    >
      {/* Total Spent Card */}
      <motion.div 
        variants={item}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800/20 to-primary-700/20 rounded-xl blur-xl transform group-hover:scale-105 transition-all duration-300 opacity-70"></div>
        <div className="relative overflow-hidden rounded-xl border border-primary-600/20 shadow-glass-sm backdrop-blur-sm bg-gradient-to-br from-primary-900/80 to-primary-800/80 p-5 h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-teal/10 rounded-full blur-2xl -mr-10 -mt-10 opacity-70"></div>
          
          <div className="flex items-center mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-700/70 to-primary-800/70 rounded-lg shadow-glass-sm border border-primary-600/10 mr-4">
              <FaMoneyBillWave className="text-accent-teal text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-white">Total Spent</h3>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold gradient-text mb-1">₹{totalSpent || '0'}</p>
              <p className="text-white/60 text-sm">On EV Rentals</p>
            </div>
            <div className="text-white/60 text-sm flex items-center">
              <FaCalendarCheck className="mr-1.5 text-accent-teal" />
              {totalRides || 0} rides completed
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Total Rides Card */}
      <motion.div 
        variants={item}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800/20 to-primary-700/20 rounded-xl blur-xl transform group-hover:scale-105 transition-all duration-300 opacity-70"></div>
        <div className="relative overflow-hidden rounded-xl border border-primary-600/20 shadow-glass-sm backdrop-blur-sm bg-gradient-to-br from-primary-900/80 to-primary-800/80 p-5 h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-2xl -mr-10 -mt-10 opacity-70"></div>
          
          <div className="flex items-center mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-700/70 to-primary-800/70 rounded-lg shadow-glass-sm border border-primary-600/10 mr-4">
              <FaRoute className="text-accent-purple text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-white">Rides Completed</h3>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-accent-purple mb-1">{totalRides || 0}</p>
              <p className="text-white/60 text-sm">Total journeys</p>
            </div>
            <div className="text-white/60 text-sm">
              <span className="px-2 py-1 bg-accent-purple/20 rounded-lg text-accent-purple text-xs font-medium">
                Eco-friendly miles
              </span>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Active Booking Card */}
      <motion.div 
        variants={item}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800/20 to-primary-700/20 rounded-xl blur-xl transform group-hover:scale-105 transition-all duration-300 opacity-70"></div>
        <div className="relative overflow-hidden rounded-xl border border-primary-600/20 shadow-glass-sm backdrop-blur-sm bg-gradient-to-br from-primary-900/80 to-primary-800/80 p-5 h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10 opacity-70"></div>
          
          <div className="flex items-center mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-700/70 to-primary-800/70 rounded-lg shadow-glass-sm border border-primary-600/10 mr-4">
              <FaCar className="text-green-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-white">Active Ride</h3>
          </div>
          
          {activeBooking ? (
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-white font-medium">{activeBooking.ev?.model || 'EV'}</p>
                <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">Active</span>
              </div>
              <div className="text-white/60 text-sm space-y-1">
                <p className="flex items-center">
                  <FaChargingStation className="mr-1.5 text-green-400" />
                  {activeBooking.station?.name || 'Station'}
                </p>
                <p className="flex items-center">
                  <FaClock className="mr-1.5 text-green-400" />
                  {getRemainingTime()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-white/60 text-sm">
              No active ride at the moment
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Upcoming Booking Card */}
      <motion.div 
        variants={item}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800/20 to-primary-700/20 rounded-xl blur-xl transform group-hover:scale-105 transition-all duration-300 opacity-70"></div>
        <div className="relative overflow-hidden rounded-xl border border-primary-600/20 shadow-glass-sm backdrop-blur-sm bg-gradient-to-br from-primary-900/80 to-primary-800/80 p-5 h-full">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 opacity-70"></div>
          
          <div className="flex items-center mb-4">
            <div className="p-3 bg-gradient-to-br from-primary-700/70 to-primary-800/70 rounded-lg shadow-glass-sm border border-primary-600/10 mr-4">
              <FaCalendarCheck className="text-blue-400 text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-white">Upcoming Ride</h3>
          </div>
          
          {upcomingBooking ? (
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-white font-medium">{upcomingBooking.ev?.model || 'EV'}</p>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">Scheduled</span>
              </div>
              <div className="text-white/60 text-sm space-y-1">
                <p className="flex items-center">
                  <FaChargingStation className="mr-1.5 text-blue-400" />
                  {upcomingBooking.station?.name || 'Station'}
                </p>
                <p className="flex items-center">
                  <FaCalendarCheck className="mr-1.5 text-blue-400" />
                  {formatDate(upcomingBooking.startTime)} at {formatTime(upcomingBooking.startTime)}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-white/60 text-sm">
              No upcoming rides scheduled
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardStats; 