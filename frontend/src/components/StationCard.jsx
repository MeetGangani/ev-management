import { Link } from 'react-router-dom';
import { FaClock, FaMapMarkerAlt, FaChargingStation, FaCar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StationCard = ({ station }) => {
  const isEvAvailable = (station.evCount || station.evs?.length || 0) > 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-800/20 to-primary-800/10 rounded-xl blur-xl transform group-hover:scale-105 transition-all duration-300 opacity-70"></div>
      
      <div className="relative h-full flex flex-col rounded-xl overflow-hidden border border-primary-600/20 shadow-glass-sm backdrop-blur-sm bg-gradient-to-br from-primary-900/80 to-primary-800/80 text-white transform transition-all duration-300 group-hover:shadow-glass-lg">
        {/* Station Header */}
        <div className="relative p-4 border-b border-primary-600/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-teal/10 rounded-full blur-2xl -mr-10 -mt-10 opacity-70"></div>
          
          <h3 className="text-xl font-bold mb-1 tracking-tight flex items-start">
            <FaChargingStation className="text-accent-teal mr-2 mt-1" />
            <span className="gradient-text">{station.name}</span>
          </h3>
          
          <div className="flex items-start text-sm text-white/80">
            <FaMapMarkerAlt className="text-accent-teal mt-0.5 mr-1.5 flex-shrink-0" />
            <p>{station.address}</p>
          </div>
        </div>
        
        {/* Station Info */}
        <div className="flex-grow p-4 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Operating Hours */}
            <div className="flex items-start text-sm">
              <FaClock className="text-accent-teal mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium text-white/90">Operating Hours</p>
                <p className="text-white/70">
                  {station.operatingHours?.open} - {station.operatingHours?.close}
                </p>
              </div>
            </div>
            
            {/* EVs Available */}
            <div className="flex items-start">
              <FaCar className="text-accent-teal mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className={`text-sm font-medium ${isEvAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {isEvAvailable 
                    ? `${station.evCount || station.evs?.length || 0} EVs Available` 
                    : 'No EVs Available'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-4 flex space-x-2">
            <Link 
              to={`/station/${station._id}`} 
              className="flex-1 py-2 px-3 bg-primary-700/50 hover:bg-primary-600/60 text-white rounded-lg text-center text-sm font-medium transition-colors duration-300 hover:shadow-glow-sm"
            >
              View Details
            </Link>
            
            <Link 
              to={`/booking/${station._id}`} 
              className={`flex-1 py-2 px-3 rounded-lg text-center text-sm font-medium transition-all duration-300 
                ${isEvAvailable 
                  ? 'bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal border border-accent-teal/30 hover:border-accent-teal/50 hover:shadow-glow-teal-sm' 
                  : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'}`}
              disabled={!isEvAvailable}
            >
              Book Now
            </Link>
          </div>
        </div>
        
        {/* Station Indicator */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-teal to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </motion.div>
  );
};

export default StationCard; 