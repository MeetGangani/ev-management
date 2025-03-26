import { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const PrivacyPolicyModal = ({ isOpen, onClose, onAccept }) => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const modalRef = useRef(null);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg p-8 w-11/12 md:w-2/3 mx-auto my-10 shadow-lg max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center border-b pb-3 mb-5">
          <h2 className="text-2xl font-semibold">Terms and Conditions</h2>
          <button 
            className="text-gray-600 text-2xl hover:text-gray-800" 
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="text-lg text-gray-800 space-y-5 flex-1 overflow-y-auto">
          <h3 className="text-xl font-semibold">Terms & Conditions</h3>
          <p><strong>Effective Date:</strong> 22/03/2025</p>
          <p><strong>Last Updated:</strong> 22/03/2025</p>
          <p>Welcome to Volt Ride - an EV ride management system. By accessing and using our EV Ride Rental System, you agree to comply with these Terms & Conditions.</p>
          
          <h3 className="font-semibold text-xl">1. Ride Start & Completion</h3>
          <p><strong>Ride Start:</strong> After unlocking the EV by station master through our website, Rides are tracked in real-time via GPS monitoring.</p>
          <p><strong>Ride Completion:</strong> A ride can only end when the EV is returned to an authorized designated parking zone.</p>
          
          <h3 className="font-semibold text-xl">2. Cancellation Policy</h3>
          <table className="w-full border-collapse border border-gray-400 text-lg">
            <thead>
              <tr className="bg-gray-300">
                <th className="border border-gray-400 p-3">S. No.</th>
                <th className="border border-gray-400 p-3">Cancellation Time</th>
                <th className="border border-gray-400 p-3">Charges</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border p-3">1</td><td className="border p-3">Prior to 8 hours</td><td className="border p-3">20% charge</td></tr>
              <tr><td className="border p-3">2</td><td className="border p-3">4-8 hours</td><td className="border p-3">50% charge</td></tr>
              <tr><td className="border p-3">3</td><td className="border p-3">0-4 hours</td><td className="border p-3">80% charge</td></tr>
              <tr><td className="border p-3">4</td><td className="border p-3">No show</td><td className="border p-3">100% charge</td></tr>
            </tbody>
          </table>
          
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
        
        <div className="flex items-center mt-5">
          <input 
            type="checkbox" 
            id="accept" 
            className="mr-3 w-6 h-6"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
          />
          <label htmlFor="accept" className="text-lg text-gray-800">I accept the Terms and Conditions</label>
        </div>
        
        <div className="flex justify-between mt-5">
          <button 
            className="bg-gray-300 text-gray-800 text-lg px-5 py-3 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className={`bg-blue-600 text-white text-lg px-5 py-3 rounded hover:bg-blue-700 ${!acceptTerms ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!acceptTerms}
            onClick={onAccept}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal; 