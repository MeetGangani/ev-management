import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaSadTear } from 'react-icons/fa';

const NotFoundScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <FaSadTear className="mx-auto h-16 w-16 text-blue-500 dark:text-blue-400" />
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col space-y-4 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
          
          <Link
            to="/"
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FaHome className="mr-2" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundScreen; 