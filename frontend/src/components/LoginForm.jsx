import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import FormContainer from './FormContainer';
import Button from './Button';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'admin') {
        navigate('/admin');
      } else if (userInfo.role === 'stationMaster') {
        navigate('/station-master');
      } else {
        navigate('/dashboard');
      }
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      
      // Show success toast
      toast.success('Login successful!');
      
      // Redirect based on role
      if (res.role === 'admin') {
        navigate('/admin');
      } else if (res.role === 'stationMaster') {
        navigate('/station-master');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'An error occurred');
    }
  };

  return (
    <FormContainer>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Sign In</h1>
        <p className="text-white/70">Access your account to manage your EVs</p>
      </div>
      
      <form onSubmit={submitHandler}>
        <div className="space-y-4">
          {/* Email Field */}
          <div className="group">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-white/90 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-white/50" />
              </div>
              <input
                type="email"
                id="email"
                className="block w-full pl-10 pr-3 py-2.5 bg-primary-800/50 border border-primary-600/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal/50 focus:border-accent-teal/50 transition-all duration-300"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Password Field */}
          <div className="group">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-white/90 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-white/50" />
              </div>
              <input
                type="password"
                id="password"
                className="block w-full pl-10 pr-3 py-2.5 bg-primary-800/50 border border-primary-600/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal/50 focus:border-accent-teal/50 transition-all duration-300"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            icon={<FaSignInAlt />}
            isLoading={isLoading}
          >
            Sign In
          </Button>
          
          {/* Register Link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-white/70">
              New to Volt Ride?{' '}
              <Link to="/register" className="text-accent-teal hover:text-accent-teal-light font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </form>
    </FormContainer>
  );
};

export default LoginForm; 