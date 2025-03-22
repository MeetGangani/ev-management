import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Hero from '../components/Hero';

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      // Redirect to appropriate dashboard based on user role
      if (userInfo.isAdmin) {
        navigate('/admin');
      } else if (userInfo.isStationMaster) {
        navigate('/station-master');
      } else {
        // Regular customer
        navigate('/dashboard');
      }
    }
  }, [userInfo, navigate]);

  return <Hero />;
};
export default HomeScreen;
