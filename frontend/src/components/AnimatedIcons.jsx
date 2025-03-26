import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { 
  FaBatteryFull, FaBatteryHalf, FaBatteryQuarter, 
  FaCar, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle,
  FaChargingStation, FaArrowRight, FaTools, FaUserCheck
} from 'react-icons/fa';

// Base animation variants
const pulseVariants = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.1, 1],
    transition: { 
      repeat: Infinity, 
      repeatType: "reverse", 
      duration: 2
    }
  }
};

const bounceVariants = {
  initial: { y: 0 },
  animate: { 
    y: [0, -4, 0],
    transition: { 
      repeat: Infinity, 
      repeatType: "reverse", 
      duration: 1.5
    }
  }
};

const spinVariants = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: { 
      repeat: Infinity, 
      duration: 10,
      ease: "linear"
    }
  }
};

const batteryPulseVariants = {
  initial: { opacity: 0.7 },
  animate: { 
    opacity: [0.7, 1, 0.7],
    transition: { 
      repeat: Infinity, 
      repeatType: "reverse", 
      duration: 2.5
    }
  }
};

const checkmarkVariants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: { 
    pathLength: 1,
    opacity: 1,
    transition: { 
      duration: 1,
      ease: "easeInOut"
    }
  }
};

// Helper function to get battery icon based on level
const getBatteryIcon = (level, animate = true) => {
  let icon;
  let color = '';
  
  if (level >= 70) {
    icon = FaBatteryFull;
    color = 'text-green-400';
  } else if (level >= 30) {
    icon = FaBatteryHalf;
    color = 'text-yellow-400';
  } else {
    icon = FaBatteryQuarter;
    color = 'text-accent-red';
  }
  
  if (animate) {
    return (
      <motion.div
        variants={batteryPulseVariants}
        initial="initial"
        animate="animate"
        className={`${color}`}
      >
        {icon && <icon.type {...icon.props} />}
      </motion.div>
    );
  }
  
  return <span className={`${color}`}>{icon && <icon.type {...icon.props} />}</span>;
};

// Animated EVIcon
const EVIcon = ({ className, animate = true }) => {
  if (animate) {
    return (
      <motion.div
        variants={bounceVariants}
        initial="initial"
        animate="animate"
        className={className}
      >
        <FaCar />
      </motion.div>
    );
  }
  
  return <FaCar className={className} />;
};

// Animated Location Icon
const LocationIcon = ({ className, animate = true }) => {
  if (animate) {
    return (
      <motion.div
        variants={pulseVariants}
        initial="initial"
        animate="animate"
        className={className}
      >
        <FaMapMarkerAlt />
      </motion.div>
    );
  }
  
  return <FaMapMarkerAlt className={className} />;
};

// Animated Check Icon
const CheckIcon = ({ className, animate = true }) => {
  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          transition: { type: "spring", stiffness: 300, damping: 15 }
        }}
        className={className}
      >
        <FaCheckCircle />
      </motion.div>
    );
  }
  
  return <FaCheckCircle className={className} />;
};

// Animated Warning Icon
const WarningIcon = ({ className, animate = true }) => {
  if (animate) {
    return (
      <motion.div
        variants={pulseVariants}
        initial="initial"
        animate="animate"
        className={className}
      >
        <FaExclamationTriangle />
      </motion.div>
    );
  }
  
  return <FaExclamationTriangle className={className} />;
};

// Animated Charging Station Icon
const ChargingStationIcon = ({ className, animate = true }) => {
  if (animate) {
    return (
      <motion.div
        variants={spinVariants}
        initial="initial"
        animate="animate"
        className={className}
      >
        <FaChargingStation />
      </motion.div>
    );
  }
  
  return <FaChargingStation className={className} />;
};

// Animated Arrow Icon
const ArrowIcon = ({ className, animate = true }) => {
  if (animate) {
    return (
      <motion.div
        initial={{ x: 0 }}
        animate={{ 
          x: [0, 5, 0],
          transition: { 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 1
          }
        }}
        className={className}
      >
        <FaArrowRight />
      </motion.div>
    );
  }
  
  return <FaArrowRight className={className} />;
};

// Animated Maintenance Icon
const MaintenanceIcon = ({ className, animate = true }) => {
  if (animate) {
    return (
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ 
          rotate: [-10, 10, -10],
          transition: { 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 1
          }
        }}
        className={className}
      >
        <FaTools />
      </motion.div>
    );
  }
  
  return <FaTools className={className} />;
};

// Animated User Verified Icon
const UserVerifiedIcon = ({ className, animate = true }) => {
  if (animate) {
    return (
      <motion.div
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.1, 1],
          transition: { 
            repeat: 1, 
            repeatType: "reverse", 
            duration: 1
          }
        }}
        className={className}
      >
        <FaUserCheck />
      </motion.div>
    );
  }
  
  return <FaUserCheck className={className} />;
};

// PropTypes for all components
const iconPropTypes = {
  className: PropTypes.string,
  animate: PropTypes.bool
};

EVIcon.propTypes = iconPropTypes;
LocationIcon.propTypes = iconPropTypes;
CheckIcon.propTypes = iconPropTypes;
WarningIcon.propTypes = iconPropTypes;
ChargingStationIcon.propTypes = iconPropTypes;
ArrowIcon.propTypes = iconPropTypes;
MaintenanceIcon.propTypes = iconPropTypes;
UserVerifiedIcon.propTypes = iconPropTypes;

export {
  getBatteryIcon,
  EVIcon,
  LocationIcon,
  CheckIcon,
  WarningIcon,
  ChargingStationIcon,
  ArrowIcon,
  MaintenanceIcon,
  UserVerifiedIcon
}; 