import { motion } from 'framer-motion';

const Loader = () => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const circleVariants = {
    initial: { 
      y: 0,
      opacity: 0.3
    },
    animate: {
      y: [0, -15, 0],
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-6">
      <motion.div 
        className="flex space-x-2"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {[...Array(3)].map((_, i) => (
          <motion.div 
            key={i}
            className="w-3 h-3 rounded-full bg-primary-500 dark:bg-primary-400"
            variants={circleVariants}
            style={{ 
              animationDelay: `${i * 0.15}s` 
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Loader;
