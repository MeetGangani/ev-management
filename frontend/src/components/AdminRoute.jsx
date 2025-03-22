import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  // Check if user is not only logged in but also has admin role
  return userInfo && userInfo.role === 'admin' ? (
    <Outlet />
  ) : (
    <Navigate to='/' replace />
  );
};

export default AdminRoute; 