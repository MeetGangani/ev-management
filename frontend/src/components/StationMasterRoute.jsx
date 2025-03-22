import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const StationMasterRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();
  
  console.log('StationMasterRoute - checking auth for:', location.pathname);
  console.log('StationMasterRoute - userInfo:', userInfo);

  return userInfo && userInfo.role === 'stationMaster' ? (
    <Outlet />
  ) : userInfo ? (
    <Navigate to='/' state={{ from: location }} replace />
  ) : (
    <Navigate to='/login' state={{ from: location }} replace />
  );
};

export default StationMasterRoute; 