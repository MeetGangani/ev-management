import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Privacy Policy Modal Component
 * 
 * Shows a modal with privacy policy information that requires user agreement
 * before proceeding with a booking
 */
const PrivacyPolicyModal = ({ isOpen, onClose, onAccept }) => {
  const [isChecked, setIsChecked] = useState(false);
  
  // Reset checkbox when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);
  
  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };
  
  // Handle accept button click
  const handleAccept = () => {
    if (isChecked) {
      onAccept();
      onClose();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] shadow-xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b dark:border-gray-700 p-4 md:p-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Terms and Conditions</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-2xl focus:outline-none"
                onClick={onClose}
              >
                &times;
              </button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
              <div className="text-gray-800 dark:text-gray-200 space-y-5">
                <h3 className="text-xl font-semibold">Terms & Conditions</h3>
                <p><strong>Effective Date:</strong> 22/03/2025</p>
                <p><strong>Last Updated:</strong> 22/03/2030</p>
                <p>Welcome to Volt Ride - an EV ride management system. By accessing and using our EV Ride Rental System, you agree to comply with these Terms & Conditions.</p>
                
                <h3 className="font-semibold text-xl">1. Ride Start & Completion</h3>
                <p><strong>Ride Start:</strong> After unlocking the EV by station master through our website, Rides are tracked in real-time via GPS monitoring.</p>
                <p><strong>Ride Completion:</strong> A ride can only end when the EV is returned to an authorized designated parking zone.</p>
                
                <h3 className="font-semibold text-xl">2. Cancellation Policy</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-400 dark:border-gray-600 text-lg">
                    <thead>
                      <tr className="bg-gray-300 dark:bg-gray-700">
                        <th className="border border-gray-400 dark:border-gray-600 p-3">S. No.</th>
                        <th className="border border-gray-400 dark:border-gray-600 p-3">Cancellation Time</th>
                        <th className="border border-gray-400 dark:border-gray-600 p-3">Charges</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="dark:bg-gray-800">
                        <td className="border border-gray-400 dark:border-gray-600 p-3">1</td>
                        <td className="border border-gray-400 dark:border-gray-600 p-3">Prior to 8 hours</td>
                        <td className="border border-gray-400 dark:border-gray-600 p-3">20% charge</td>
                      </tr>
                      <tr className="dark:bg-gray-800">
                        <td className="border border-gray-400 dark:border-gray-600 p-3">2</td>
                        <td className="border border-gray-400 dark:border-gray-600 p-3">4-8 hours</td>
                        <td className="border border-gray-400 dark:border-gray-600 p-3">50% charge</td>
                      </tr>
                      <tr className="dark:bg-gray-800">
                        <td className="border border-gray-400 dark:border-gray-600 p-3">3</td>
                        <td className="border border-gray-400 dark:border-gray-600 p-3">0-4 hours</td>
                        <td className="border border-gray-400 dark:border-gray-600 p-3">80% charge</td>
                      </tr>
                      <tr className="dark:bg-gray-800">
                        <td className="border border-gray-400 dark:border-gray-600 p-3">4</td>
                        <td className="border border-gray-400 dark:border-gray-600 p-3">No show</td>
                        <td className="border border-gray-400 dark:border-gray-600 p-3">100% charge</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h3 className="font-semibold text-xl">3. Penalty Management & Fees</h3>
                <p>Users are responsible for late returns, unauthorized parking, damages, and traffic violations.</p>
                
                <h3 className="font-semibold text-xl">4. Parking, Tolls, & Interstate Taxes</h3>
                <p>Users must bear parking fees, toll charges, and interstate taxes.</p>
                
                <h3 className="font-semibold text-xl">5. Additional Usage Policy</h3>
                <p>Extra usage beyond the rental agreement will be charged.</p>
                
                <h3 className="font-semibold text-xl">6. Extra Usage Rates</h3>
                <p>Rates vary based on car type and location.</p>
                
                <h3 className="font-semibold text-xl">7. Modify & Refund Policy</h3>
                <p>Revised bookings cannot be canceled or refunded.</p>
                
                <h3 className="font-semibold text-xl">8. GPS Tracking & Data Usage</h3>
                <p>Location data is collected for security and compliance.</p>
                
                <h3 className="font-semibold text-xl">9. Account Suspension & Termination</h3>
                <p>Violations of these terms may lead to suspension or legal action.</p>
                
                <h3 className="font-semibold text-xl">10. Contact Us</h3>
                <p>Email: support@voltride.com | Phone: +91 5234567991 | Website: www.voltride.com</p>
              </div>
            </div>
            
            <div className="border-t dark:border-gray-700 p-4 md:p-6">
              <div className="flex items-center mb-4">
                <input 
                  type="checkbox" 
                  id="accept-terms" 
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="accept-terms" className="ml-2 text-gray-700 dark:text-gray-300">
                  I have read and accept the Terms and Conditions
                </label>
              </div>
              
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md mr-2 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isChecked 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' 
                      : 'bg-blue-300 text-white cursor-not-allowed dark:bg-blue-800 dark:text-gray-300'
                  }`}
                  onClick={handleAccept}
                  disabled={!isChecked}
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrivacyPolicyModal; 