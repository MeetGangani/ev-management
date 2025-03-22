import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import FormContainer from '../components/FormContainer';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import { useUpdateUserMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { useVerifyAadharMutation } from '../slices/usersApiSlice';

const ProfileScreen = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: isUpdateLoading }] = useUpdateUserMutation();
  const [verifyAadhar, { isLoading: isVerifyLoading }] = useVerifyAadharMutation();

  useEffect(() => {
    setName(userInfo.name);
    setEmail(userInfo.email);
    setPhone(userInfo.phone || '');
    setAadhaar(userInfo.aadhaar || '');
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          name,
          email,
          phone,
          password,
        }).unwrap();
        dispatch(setCredentials(res));
        toast.success('Profile updated successfully');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const verifyAadharHandler = async (e) => {
    e.preventDefault();
    try {
      if (!aadhaar) {
        toast.error('Please enter your Aadhar number');
        return;
      }

      const res = await verifyAadhar({ aadhaar }).unwrap();
      dispatch(setCredentials({ ...userInfo, aadharVerified: true }));
      toast.success('Aadhar verified successfully!');
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };
  
  return (
    <FormContainer>
      <h1 className="text-2xl font-bold mb-6 text-center">Update Profile</h1>

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
          <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isUpdateLoading}
        >
          Update Profile
        </button>

        {isUpdateLoading && <div className="mt-4"><Loader /></div>}
      </form>

      {userInfo.role === 'customer' && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Aadhar Verification</h2>
          
          {userInfo.aadharVerified ? (
            <div className="bg-green-100 p-4 rounded-md mb-4">
              <p className="text-green-800">
                ✓ Your Aadhar is verified
              </p>
            </div>
          ) : (
            <form onSubmit={verifyAadharHandler}>
              <div className="mb-4">
                <label htmlFor="aadhaar" className="block text-gray-700 font-medium mb-2">
                  Aadhar Number
                </label>
                <input
                  type="text"
                  id="aadhaar"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your 12-digit Aadhar number"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value)}
                  disabled={userInfo.aadharVerified}
                  maxLength={12}
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
                disabled={isVerifyLoading}
              >
                Verify Aadhar
              </button>
              {isVerifyLoading && <div className="mt-4"><Loader /></div>}
            </form>
          )}
        </div>
      )}

      {userInfo.role === 'stationMaster' && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Station Master Info</h2>
          <p className="text-gray-700">
            You are registered as a Station Master. Please check with admin to get assigned to a station.
          </p>
        </div>
      )}

      {userInfo.role === 'admin' && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
          <p className="text-gray-700">
            You have admin privileges. You can manage users, stations, and EVs.
          </p>
        </div>
      )}
    </FormContainer>
  );
};

export default ProfileScreen;
