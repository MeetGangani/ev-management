import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCar, FaMapMarkerAlt, FaUserCheck } from 'react-icons/fa';

const Hero = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <div className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center mb-4">Intelligent EV Rental System</h1>
          <p className="text-center text-gray-600 mb-8">
            Rent electric vehicles for your journeys with our easy-to-use platform.
            Book, track, and return vehicles with just a few clicks.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 bg-blue-50 rounded-md text-center">
              <div className="flex justify-center mb-2">
                <FaCar className="text-3xl text-blue-500" />
              </div>
              <h3 className="font-semibold mb-1">Book EVs</h3>
              <p className="text-sm text-gray-600">Choose from available electric vehicles at your nearest station</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-md text-center">
              <div className="flex justify-center mb-2">
                <FaMapMarkerAlt className="text-3xl text-green-500" />
              </div>
              <h3 className="font-semibold mb-1">Track Journeys</h3>
              <p className="text-sm text-gray-600">Real-time tracking and journey management</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-md text-center">
              <div className="flex justify-center mb-2">
                <FaUserCheck className="text-3xl text-yellow-500" />
              </div>
              <h3 className="font-semibold mb-1">Easy Verification</h3>
              <p className="text-sm text-gray-600">Quick Aadhar verification for secure rentals</p>
            </div>
          </div>

          {!userInfo ? (
            <div className="flex justify-center space-x-4">
              <Link 
                to="/login" 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="text-center">
              {userInfo.role === 'customer' && userInfo.aadharVerified === false ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <p className="text-yellow-800 mb-2">
                    Please verify your Aadhar to start booking EVs
                  </p>
                  <Link 
                    to="/profile" 
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-md transition-colors inline-block"
                  >
                    Verify Now
                  </Link>
                </div>
              ) : userInfo.role === 'customer' && userInfo.aadharVerified === true ? (
                <Link 
                  to="/stations" 
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors inline-block"
                >
                  Find Stations & Book Now
                </Link>
              ) : userInfo.role === 'stationMaster' ? (
                <Link 
                  to="/station-master" 
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors inline-block"
                >
                  Manage Your Station
                </Link>
              ) : (
                <Link 
                  to="/admin" 
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors inline-block"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
