import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const VerifiedCustomerRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();

  // Helper function to check verification status
  // Only consider explicitly false as unverified
  const isCustomerVerified = () => {
    if (!userInfo) return false;
    if (userInfo.role !== 'customer') return true;
    
    // Only consider explicitly set to false as unverified
    return userInfo.aadharVerified !== false;
  };

  useEffect(() => {
    // Add console logs for debugging
    console.log('VerifiedCustomerRoute - userInfo:', userInfo);
    
    if (userInfo) {
      console.log('User role:', userInfo.role);
      console.log('Aadhar verified:', userInfo.aadharVerified);
      console.log('Is customer verified:', isCustomerVerified());
    }
    
    // Only show message if the user is explicitly not verified (aadharVerified === false)
    if (userInfo && userInfo.role === 'customer' && userInfo.aadharVerified === false) {
      toast.error('Please verify your Aadhar to access this feature');
    }
  }, [userInfo]);

  if (!userInfo) {
    console.log('No user info, redirecting to login');
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // Allow admin and station master to access
  if (userInfo.role === 'admin' || userInfo.role === 'stationMaster') {
    console.log('Admin or station master, allowing access');
    return children;
  }

  // Check if customer is verified (or verification status is undefined)
  if (userInfo.role === 'customer' && isCustomerVerified()) {
    console.log('Verified customer, allowing access');
    return children;
  }

  // Redirect unverified customers to profile page
  if (userInfo.role === 'customer' && userInfo.aadharVerified === false) {
    console.log('Unverified customer, redirecting to profile');
    return <Navigate to='/profile' state={{ from: location }} replace />;
  }

  // Fallback
  console.log('Fallback case, redirecting to home');
  return <Navigate to='/' state={{ from: location }} replace />;
};

export default VerifiedCustomerRoute; 