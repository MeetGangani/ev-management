import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetBookingByIdQuery } from '../slices/bookingsApiSlice';
import { FaPrint, FaArrowLeft } from 'react-icons/fa';
import Loader from './Loader';

const PenaltyReceipt = () => {
  const { bookingId } = useParams();
  const { data: booking, isLoading } = useGetBookingByIdQuery(bookingId);
  const navigate = useNavigate();
  const receiptRef = useRef();

  // Function to handle printing
  const handlePrint = () => {
    const printContents = receiptRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = `
      <html>
        <head>
          <title>Penalty Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .receipt-container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-title { font-size: 24px; font-weight: bold; color: #e53e3e; }
            .receipt-details { border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 15px 0; }
            .receipt-row { display: flex; margin-bottom: 10px; }
            .receipt-label { width: 40%; font-weight: bold; }
            .receipt-value { width: 60%; }
            .receipt-amount { font-weight: bold; color: #e53e3e; }
            .receipt-footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            ${printContents}
          </div>
        </body>
      </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
  };

  if (isLoading) return <Loader />;

  // Determine the penalty data structure - could be booking.penalty or booking.penaltyAmount
  const hasPenalty = booking.penalty || booking.hasPenalty;
  const penaltyAmount = booking.penalty?.amount || booking.penaltyAmount || 0;
  const penaltyReason = booking.penalty?.reason || booking.penaltyReason || 'Penalty applied as per terms of service';
  const penaltyDate = booking.penalty?.timestamp 
    ? new Date(booking.penalty.timestamp) 
    : new Date(booking.updatedAt);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <FaPrint className="mr-2" /> Print Receipt
        </button>
      </div>
      
      <div ref={receiptRef}>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-red-600 mb-2">Penalty Receipt</h2>
          <p className="text-gray-500">EV Management System</p>
        </div>
      
        <div className="border-t border-b py-6 my-6">
          <div className="grid grid-cols-2 gap-4">
            <p className="text-gray-600">Booking ID:</p>
            <p className="font-semibold">{booking._id}</p>
            
            <p className="text-gray-600">Vehicle:</p>
            <p className="font-semibold">{booking.evId.manufacturer} {booking.evId.model}</p>
            
            <p className="text-gray-600">Registration Number:</p>
            <p className="font-semibold">{booking.evId.registrationNumber}</p>
            
            <p className="text-gray-600">Customer:</p>
            <p className="font-semibold">{booking.customerId?.name || 'Unknown'}</p>
            
            <p className="text-gray-600">Date:</p>
            <p className="font-semibold">
              {penaltyDate.toLocaleDateString()}
            </p>
            
            <p className="text-gray-600">Time:</p>
            <p className="font-semibold">
              {penaltyDate.toLocaleTimeString()}
            </p>
            
            <p className="text-gray-600">Amount:</p>
            <p className="font-semibold text-red-600 text-xl">
              ₹{penaltyAmount}
            </p>
            
            <p className="text-gray-600">Reason:</p>
            <p className="font-semibold">{penaltyReason}</p>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>This penalty has been applied according to our terms of service.</p>
          <p>Please contact customer support at support@ev-management.com if you have any questions or wish to dispute this penalty.</p>
          <div className="mt-4 pt-4 border-t text-xs">
            <p>Receipt generated on {new Date().toLocaleString()}</p>
            <p>EV Management System - All rights reserved</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PenaltyReceipt; 