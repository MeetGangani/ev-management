import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const PenaltyDashboardScreen = () => {
  return (
    <div className="container mx-auto px-4">
      <Link to='/admin' className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-800">
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </Link>
      
      <h1 className="text-2xl font-bold mb-6">Penalty Management Dashboard</h1>
      
      <p className="text-lg">This is a simplified version of the dashboard for debugging.</p>
    </div>
  );
};

export default PenaltyDashboardScreen; 