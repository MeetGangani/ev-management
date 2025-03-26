import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaLock, FaCheckCircle, FaBuilding } from 'react-icons/fa';
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold mb-6 text-center gradient-text">Update Profile</h1>

        <motion.form 
          onSubmit={submitHandler}
          className="card-glass border border-primary-600/20 shadow-glass p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="mb-4">
            <label htmlFor="name" className="block text-white font-medium mb-2 flex items-center gap-2">
              <FaUser className="text-accent-blue" /> Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue text-white placeholder-white/50"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-white font-medium mb-2 flex items-center gap-2">
              <FaEnvelope className="text-accent-teal" /> Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-teal text-white placeholder-white/50"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="phone" className="block text-white font-medium mb-2 flex items-center gap-2">
              <FaPhone className="text-accent-purple" /> Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-purple text-white placeholder-white/50"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-white font-medium mb-2 flex items-center gap-2">
              <FaLock className="text-accent-red" /> Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red text-white placeholder-white/50"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-white font-medium mb-2 flex items-center gap-2">
              <FaLock className="text-accent-red" /> Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-red text-white placeholder-white/50"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <motion.button 
            type="submit" 
            className="w-full bg-gradient-to-r from-accent-blue to-accent-blue/80 hover:shadow-glow-blue text-white font-medium py-3 px-4 rounded-md mt-4 focus:outline-none focus:ring-2 focus:ring-accent-blue disabled:opacity-50 transition-all duration-300"
            disabled={isUpdateLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Update Profile
          </motion.button>

          {isUpdateLoading && <div className="mt-4"><Loader /></div>}
        </motion.form>

        {userInfo.role === 'customer' && (
          <motion.div 
            className="mt-8 border-t border-primary-600/30 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4 gradient-text flex items-center gap-2">
              <FaIdCard /> Aadhar Verification
            </h2>
            
            {userInfo.aadharVerified ? (
              <div className="card-glass border border-green-500/30 p-6 rounded-md mb-4 backdrop-blur-sm">
                <p className="text-green-400 flex items-center gap-2">
                  <FaCheckCircle className="text-xl" /> Your Aadhar is verified
                </p>
              </div>
            ) : (
              <form onSubmit={verifyAadharHandler} className="card-glass border border-primary-600/20 shadow-glass p-6">
                <div className="mb-4">
                  <label htmlFor="aadhaar" className="block text-white font-medium mb-2 flex items-center gap-2">
                    <FaIdCard className="text-accent-yellow" /> Aadhar Number
                  </label>
                  <input
                    type="text"
                    id="aadhaar"
                    className="w-full px-4 py-3 bg-primary-800/50 border border-primary-600/30 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-yellow text-white placeholder-white/50"
                    placeholder="Enter your 12-digit Aadhar number"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                    disabled={userInfo.aadharVerified}
                    maxLength={12}
                  />
                </div>
                <motion.button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-accent-yellow to-accent-yellow/80 hover:shadow-glow-yellow text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-yellow disabled:opacity-50 transition-all duration-300"
                  disabled={isVerifyLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Verify Aadhar
                </motion.button>
                {isVerifyLoading && <div className="mt-4"><Loader /></div>}
              </form>
            )}
          </motion.div>
        )}

        {userInfo.role === 'stationMaster' && (
          <motion.div 
            className="mt-8 border-t border-primary-600/30 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4 gradient-text flex items-center gap-2">
              <FaBuilding /> Station Master Info
            </h2>
            <div className="card-glass border border-primary-600/20 shadow-glass p-6">
              <p className="text-white/80">
                You are registered as a Station Master. Please check with admin to get assigned to a station.
              </p>
            </div>
          </motion.div>
        )}

        {userInfo.role === 'admin' && (
          <motion.div 
            className="mt-8 border-t border-primary-600/30 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4 gradient-text flex items-center gap-2">
              <FaUser /> Admin Dashboard
            </h2>
            <div className="card-glass border border-primary-600/20 shadow-glass p-6">
              <p className="text-white/80">
                You have admin privileges. You can manage users, stations, and EVs.
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </FormContainer>
  );
};

export default ProfileScreen;
