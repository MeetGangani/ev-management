import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import { FaSignInAlt, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigateToProperDashboard(userInfo);
    }
  }, [userInfo, navigate]);

  const navigateToProperDashboard = (user) => {
    if (user.role === 'admin') {
      navigate('/admin');
    } else if (user.role === 'stationMaster') {
      navigate('/station-master');
    } else {
      navigate('/dashboard');
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success('Login successful');
      navigateToProperDashboard(res);
    } catch (err) {
      toast.error(err?.data?.message || 'An error occurred during login');
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  return (
    <FormContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center font-display">
          Sign In
        </h1>

        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400 dark:text-gray-600" />
              </div>
              <motion.input
                type="email"
                id="email"
                className="input-field pl-10"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                whileFocus="focus"
                whileBlur="blur"
                variants={inputVariants}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400 dark:text-gray-600" />
              </div>
              <motion.input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field pl-10 pr-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                whileFocus="focus"
                whileBlur="blur"
                variants={inputVariants}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors" />
                ) : (
                  <FaEye className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors" />
                )}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-primary w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </span>
            ) : (
              <span className="inline-flex items-center">
                <FaSignInAlt className="mr-2" />
                Sign In
              </span>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            New Customer?{' '}
            <Link 
              to="/register" 
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </FormContainer>
  );
};

export default LoginScreen;
