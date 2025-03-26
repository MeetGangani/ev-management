import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaCreditCard, FaPaypal, FaGoogle, FaApple, FaArrowLeft, FaCheck, FaLock } from 'react-icons/fa';
import { useGetBookingDetailsQuery } from '../slices/bookingsApiSlice';
import { useProcessPaymentMutation } from '../slices/paymentsApiSlice';
import Spinner from '../components/Spinner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import Meta from '../components/Meta';

const PaymentScreen = () => {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: booking, isLoading, error, refetch } = useGetBookingDetailsQuery(bookingId);
  const [processPayment] = useProcessPaymentMutation();
  
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [userInfo, navigate]);
  
  // Format card number with spaces every 4 digits
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format expiry date as MM/YY
  const formatExpiryDate = (value) => {
    const expiry = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (expiry.length <= 2) {
      return expiry;
    }
    
    return `${expiry.substring(0, 2)}/${expiry.substring(2, 4)}`;
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };
  
  const handleExpiryChange = (e) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setCardExpiry(formattedValue);
  };
  
  const handleCvvChange = (e) => {
    const cvv = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (cvv.length <= 4) {
      setCardCvv(cvv);
    }
  };
  
  const validateForm = () => {
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!cardNumber || cardNumber.replace(/\s+/g, '').length < 16) {
        toast.error('Please enter a valid card number');
        return false;
      }
      
      if (!cardName) {
        toast.error('Please enter the name on card');
        return false;
      }
      
      if (!cardExpiry || cardExpiry.length < 5) {
        toast.error('Please enter a valid expiry date');
        return false;
      }
      
      if (!cardCvv || cardCvv.length < 3) {
        toast.error('Please enter a valid CVV code');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setProcessing(true);
      
      const res = await processPayment({
        bookingId,
        paymentMethod,
        amount: booking.totalPrice
      }).unwrap();
      
      // Simulate processing time for demo purposes
      setTimeout(() => {
        setProcessing(false);
        setPaymentComplete(true);
        
        // Redirect to my bookings page after a short delay
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      }, 2000);
      
    } catch (err) {
      setProcessing(false);
      toast.error(err?.data?.message || 'Payment processing failed');
    }
  };
  
  if (isLoading) {
    return (
      <>
        <Meta title="Payment" />
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Spinner size="lg" />
        </div>
        <Footer />
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Meta title="Payment" />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <p className="text-red-700">
                {error?.data?.message || 'Error loading booking details'}
              </p>
            </div>
          </div>
          <Link to="/bookings" className="text-primary-600 hover:underline flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Bookings
          </Link>
        </div>
        <Footer />
      </>
    );
  }
  
  if (booking && booking.paymentStatus === 'paid') {
    return (
      <>
        <Meta title="Payment" />
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-center mb-6">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Payment Already Completed</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This booking has already been paid for.
              </p>
              <Link
                to={`/bookings/${bookingId}`}
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-300"
              >
                <FaArrowLeft className="mr-2" /> View Booking Details
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Meta title="Payment" />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Link to={`/bookings/${bookingId}`} className="text-primary-600 hover:underline flex items-center mr-4">
              <FaArrowLeft className="mr-2" /> Back to Booking
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Payment for Booking
            </h1>
          </div>
          
          {paymentComplete ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
            >
              <div className="text-center mb-6">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Payment Successful</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Thank you for your payment. A confirmation has been sent to your email.
                </p>
                <p className="text-green-600 font-medium mb-6">
                  You'll be redirected to your booking details shortly.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left column - Booking summary */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Booking Summary
                    </h2>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <span className="font-medium">Booking ID:</span> {booking._id.substring(booking._id.length - 8)}
                    </p>
                    
                    <div className="border-t dark:border-gray-700 mt-3 pt-3">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">Station Details</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {booking.station?.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {booking.station?.location?.address}
                      </p>
                    </div>
                    
                    <div className="border-t dark:border-gray-700 mt-3 pt-3">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">Booking Details</h3>
                      <div className="space-y-1 text-sm">
                        <p className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Start Time:</span>
                          <span>{new Date(booking.startTime).toLocaleString()}</span>
                        </p>
                        <p className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>End Time:</span>
                          <span>{new Date(booking.endTime).toLocaleString()}</span>
                        </p>
                        <p className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Duration:</span>
                          <span>{booking.duration} min</span>
                        </p>
                        <p className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Status:</span>
                          <span className="capitalize">{booking.status}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t dark:border-gray-700 mt-3 pt-3">
                      <h3 className="font-medium text-gray-800 dark:text-white mb-2">Payment Details</h3>
                      <div className="space-y-1 text-sm">
                        <p className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Charging Fee:</span>
                          <span>${booking.chargingFee?.toFixed(2)}</span>
                        </p>
                        <p className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Service Fee:</span>
                          <span>${booking.serviceFee?.toFixed(2)}</span>
                        </p>
                        <p className="flex justify-between text-gray-600 dark:text-gray-300">
                          <span>Tax:</span>
                          <span>${booking.tax?.toFixed(2)}</span>
                        </p>
                        <p className="flex justify-between font-medium text-gray-800 dark:text-white text-base mt-2">
                          <span>Total:</span>
                          <span>${booking.totalPrice?.toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Payment form */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Payment Method
                    </h2>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange('credit_card')}
                        className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors
                          ${paymentMethod === 'credit_card'
                          ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/30 dark:border-primary-500'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <FaCreditCard className={`h-6 w-6 mb-2 ${
                          paymentMethod === 'credit_card' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          paymentMethod === 'credit_card' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          Credit Card
                        </span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange('debit_card')}
                        className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors
                          ${paymentMethod === 'debit_card'
                          ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/30 dark:border-primary-500'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <FaCreditCard className={`h-6 w-6 mb-2 ${
                          paymentMethod === 'debit_card' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          paymentMethod === 'debit_card' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          Debit Card
                        </span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange('paypal')}
                        className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors
                          ${paymentMethod === 'paypal'
                          ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/30 dark:border-primary-500'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <FaPaypal className={`h-6 w-6 mb-2 ${
                          paymentMethod === 'paypal' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          paymentMethod === 'paypal' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          PayPal
                        </span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodChange('google_pay')}
                        className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors
                          ${paymentMethod === 'google_pay'
                          ? 'bg-primary-50 border-primary-500 dark:bg-primary-900/30 dark:border-primary-500'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <FaGoogle className={`h-6 w-6 mb-2 ${
                          paymentMethod === 'google_pay' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          paymentMethod === 'google_pay' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          Google Pay
                        </span>
                      </button>
                    </div>
                    
                    {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
                      <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              maxLength="19"
                              className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                              required
                            />
                            <FaCreditCard className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name on Card
                          </label>
                          <input
                            type="text"
                            id="cardName"
                            placeholder="John Doe"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              id="cardExpiry"
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              maxLength="5"
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              id="cardCvv"
                              placeholder="123"
                              value={cardCvv}
                              onChange={handleCvvChange}
                              maxLength="4"
                              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={processing}
                          className="w-full flex justify-center items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70"
                        >
                          {processing ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Processing Payment...
                            </>
                          ) : (
                            <>
                              Pay ${booking.totalPrice?.toFixed(2)}
                            </>
                          )}
                        </button>
                      </form>
                    )}
                    
                    {(paymentMethod === 'paypal' || paymentMethod === 'google_pay' || paymentMethod === 'apple_pay') && (
                      <div className="text-center p-8">
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          Click the button below to continue with {paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'google_pay' ? 'Google Pay' : 'Apple Pay'}
                        </p>
                        <button
                          onClick={handleSubmit}
                          disabled={processing}
                          className="w-full sm:w-auto flex justify-center items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70"
                        >
                          {processing ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              {paymentMethod === 'paypal' && <FaPaypal className="mr-2" />}
                              {paymentMethod === 'google_pay' && <FaGoogle className="mr-2" />}
                              {paymentMethod === 'apple_pay' && <FaApple className="mr-2" />}
                              
                              Continue with {paymentMethod === 'paypal' ? 'PayPal' : paymentMethod === 'google_pay' ? 'Google Pay' : 'Apple Pay'}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    <div className="mt-6 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                      <FaLock className="h-4 w-4 mr-2" />
                      <span>Your payment is secure and encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentScreen; 