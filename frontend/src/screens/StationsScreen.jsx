import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';
import { FaMapMarkerAlt, FaClock, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useGetStationsQuery } from '../slices/stationsApiSlice';

const StationsScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Get all stations
  const { data: allStations, isLoading, error } = useGetStationsQuery();

  // FOR DEBUGGING
  console.log("StationsScreen rendering, userInfo:", userInfo);
  console.log("allStations:", allStations);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EV Stations</h1>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-green-800 mb-2">Browsing All Stations</h2>
        <p className="text-green-700">
          Showing all available EV stations.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-red-700">
          <p className="font-semibold mb-1">Error loading stations:</p>
          <p>{error.data?.message || error.error || 'An error occurred'}</p>
        </div>
      )}

      {isLoading ? (
        <Loader />
      ) : allStations && allStations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allStations.map((station) => (
            <div key={station._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-2">{station.name}</h2>
                <p className="text-gray-600 mb-4 flex items-start">
                  <FaMapMarkerAlt className="mr-2 mt-1 text-gray-500" />
                  <span>{station.address}</span>
                </p>
                <p className="text-gray-600 mb-4 flex items-center">
                  <FaClock className="mr-2 text-gray-500" />
                  <span>
                    {station.operatingHours.opening} - {station.operatingHours.closing}
                  </span>
                </p>
                
                <div className="flex justify-between items-center mt-4">
                  <span className={`text-sm flex items-center ${
                    (station.evCount || station.evs?.length || 0) > 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    <FaInfoCircle className="mr-1" /> 
                    {station.evCount || station.evs?.length || 0} EVs Available
                  </span>
                  <Link
                    to={`/stations/${station._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
          <p className="text-yellow-700 mb-4">No stations found.</p>
        </div>
      )}
    </div>
  );
};

export default StationsScreen; 