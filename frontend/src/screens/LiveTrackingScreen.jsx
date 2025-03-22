import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LiveLocationTracker from '../components/LiveLocationTracker';
import { useGetBookingByIdQuery } from '../slices/bookingsApiSlice';
import Loader from '../components/Loader';

const LiveTrackingScreen = () => {
  const { bookingId } = useParams();
  const { data: booking, isLoading, error } = useGetBookingByIdQuery(bookingId);

  if (isLoading) return <Loader />;
  if (error) return <div className="text-red-600">Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Live Location Tracking</h1>
      <p className="mb-4 text-gray-600">Select a route to see its geofencing area</p>
      <LiveLocationTracker booking={booking} />
    </div>
  );
};

export default LiveTrackingScreen; 