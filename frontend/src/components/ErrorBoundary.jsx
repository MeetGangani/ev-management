import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div 
          className="min-h-[400px] flex items-center justify-center p-6 bg-gray-50 dark:bg-dark-900 rounded-lg shadow-inner"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card-glass text-center max-w-md p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 text-3xl">
                <FaExclamationTriangle />
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Something went wrong
            </motion.h2>
            
            <motion.p 
              className="text-gray-600 dark:text-gray-300 mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              An error occurred in this component. You can try resetting the component or reload the page.
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex justify-center space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.resetError}
                className="btn-primary flex items-center"
              >
                <FaRedo className="mr-2" /> Reset Component
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="btn-outline"
              >
                Reload Page
              </motion.button>
            </motion.div>
            
            {this.props.showDetails && this.state.error && (
              <motion.div 
                className="mt-8 p-4 bg-gray-100 dark:bg-dark-800 rounded-md text-left overflow-auto max-h-60 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <details>
                  <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium">
                    Error Details (for developers)
                  </summary>
                  <div className="mt-2 text-gray-800 dark:text-gray-200 font-mono">
                    <p>{this.state.error && this.state.error.toString()}</p>
                    <p className="mt-2 whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                  </div>
                </details>
              </motion.div>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 