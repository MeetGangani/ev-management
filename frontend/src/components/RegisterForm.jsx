import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaUserPlus } from 'react-icons/fa';
import FormContainer from './FormContainer';
import Button from './Button';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (userInfo) {
      navigate('/dashboard');
    }
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const res = await register({
        name,
        email,
        mobile,
        password,
      }).unwrap();
      
      dispatch(setCredentials({ ...res }));
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <FormContainer>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 gradient-text">Create Account</h1>
        <p className="text-white/70">Join Volt Ride to access electric mobility</p>
      </div>
      
      <form onSubmit={submitHandler}>
        <div className="space-y-4">
          {/* Name Field */}
          <div className="group">
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-white/90 mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-white/50" />
              </div>
              <input
                type="text"
                id="name"
                className="block w-full pl-10 pr-3 py-2.5 bg-primary-800/50 border border-primary-600/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal/50 focus:border-accent-teal/50 transition-all duration-300"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          
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
          
          {/* Mobile Field */}
          <div className="group">
            <label 
              htmlFor="mobile" 
              className="block text-sm font-medium text-white/90 mb-1.5"
            >
              Mobile Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaPhone className="h-5 w-5 text-white/50" />
              </div>
              <input
                type="tel"
                id="mobile"
                className="block w-full pl-10 pr-3 py-2.5 bg-primary-800/50 border border-primary-600/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal/50 focus:border-accent-teal/50 transition-all duration-300"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Confirm Password Field */}
          <div className="group">
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-white/90 mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-white/50" />
              </div>
              <input
                type="password"
                id="confirmPassword"
                className="block w-full pl-10 pr-3 py-2.5 bg-primary-800/50 border border-primary-600/30 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-teal/50 focus:border-accent-teal/50 transition-all duration-300"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            icon={<FaUserPlus />}
            isLoading={isLoading}
          >
            Register
          </Button>
          
          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-teal hover:text-accent-teal-light font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </form>
    </FormContainer>
  );
};

export default RegisterForm; 