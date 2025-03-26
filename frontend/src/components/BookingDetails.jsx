import { Link } from 'react-router-dom';

// Inside your component's render
{booking.status === 'ongoing' && (
  <Link 
    to={`/bookings/${booking._id}/track`}
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  >
    Track Location
  </Link>
)} 