import { useState, useEffect } from 'react';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [role, setRole] = useState('customer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  // Password validation function
  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordError(validatePassword(newPassword));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Validate password again before submission
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      toast.error(passwordValidationError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await register({ 
          name, 
          email, 
          password,
          role,
          phone,
          aadhaar
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate('/');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };
  
  return (
    <FormContainer>
      <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
      
      <form onSubmit={submitHandler}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="aadhaar" className="block text-gray-700 font-medium mb-2">
            Aadhar Number
          </label>
          <input
            type="text"
            id="aadhaar"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={role === 'customer' ? 'Enter 12-digit Aadhar (required)' : 'Enter 12-digit Aadhar (optional)'}
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            required={role === 'customer'}
            maxLength={12}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
            Role
          </label>
          <select
            id="role"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="customer">Customer</option>
            <option value="stationMaster">Station Master</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className={`w-full px-3 py-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-1">{passwordError}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            Password must contain at least 8 characters, include an uppercase letter, 
            lowercase letter, number, and special character.
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className={`w-full px-3 py-2 border ${password !== confirmPassword && confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {password !== confirmPassword && confirmPassword && (
            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading || passwordError || (password !== confirmPassword && confirmPassword)}
        >
          Register
        </button>

        {isLoading && <div className="mt-4"><Loader /></div>}
      </form>

      <div className="mt-6 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </div>
    </FormContainer>
  );
};

export default RegisterScreen;
