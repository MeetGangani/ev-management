import { motion } from 'framer-motion';

const FormContainer = ({ children }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="relative w-full max-w-md">
          {/* Background blur effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800/20 to-primary-700/20 rounded-xl blur-xl transform scale-105"></div>
          
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-teal/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-purple/10 rounded-full blur-2xl"></div>
          
          {/* Form container */}
          <div className="relative bg-gradient-to-br from-primary-900/90 to-primary-800/90 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-glass-lg border border-primary-700/30 text-white">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FormContainer;
