import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

const PageTransition = ({ children, customVariants, customTransition }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="exit"
      variants={customVariants || pageVariants}
      transition={customTransition || pageTransition}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
};

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  customVariants: PropTypes.object,
  customTransition: PropTypes.object
};

export default PageTransition; 