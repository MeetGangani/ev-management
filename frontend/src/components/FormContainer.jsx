import { motion } from 'framer-motion';

const FormContainer = ({ children }) => {
  return (
    <motion.div 
      className="container mx-auto px-4 py-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-center">
        <motion.div 
          className="card-glass w-full max-w-md p-6 md:p-8"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.3,
            delay: 0.2,
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FormContainer;
