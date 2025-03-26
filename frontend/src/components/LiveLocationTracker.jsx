import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { useUpdateBookingLocationMutation } from '../slices/bookingsApiSlice';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LiveLocationTracker = ({ booking }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const polygonRef = useRef(null);
  const outOfZoneTimerRef = useRef(null);
  const [status, setStatus] = useState('Waiting for location...');
  const [outOfZoneDuration, setOutOfZoneDuration] = useState(0);
  const [updateBookingLocation] = useUpdateBookingLocationMutation();
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState('');
  const [locationError, setLocationError] = useState(null);
  const watchIdRef = useRef(null);

  // Predefined routes with their geofencing coordinates
  const predefinedRoutes = {
    'sabarmati-pdeu': {
      name: 'Sabarmati to PDEU',
      coordinates: [
        [72.57, 23.085],   // Bottom-left
        [72.608, 23.085],  // Bottom-right
        [72.688, 23.158],  // Top-right
        [72.65, 23.158],   // Top-left
        [72.57, 23.085],   // Close the polygon
      ],
      stations: {
        start: { name: 'Sabarmati Station', coords: [72.57, 23.085] },
        end: { name: 'PDEU Station', coords: [72.688, 23.158] }
      }
    },
    'pdeu-gift': {
      name: 'PDEU to GIFT City',
      coordinates: [
        [72.688, 23.158],  // PDEU
        [72.68, 23.16],    // Right point
        [72.67, 23.19],    // GIFT City
        [72.66, 23.18],    // Left point
        [72.688, 23.158],  // Close the polygon
      ],
      stations: {
        start: { name: 'PDEU Station', coords: [72.688, 23.158] },
        end: { name: 'GIFT City Station', coords: [72.67, 23.19] }
      }
    },
    'pdeu-gift-alternate': {
      name: 'PDEU to GIFT City (Alternate)',
      coordinates: [
        [72.688, 23.158],  // PDEU
        [72.68, 23.16],    // Right point
        [72.67, 23.19],    // GIFT City
        [72.66, 23.18],    // Left point
        [72.688, 23.158],  // Close the polygon
      ],
      stations: {
        start: { name: 'PDEU Station', coords: [72.688, 23.158] },
        end: { name: 'GIFT City Station', coords: [72.67, 23.19] }
      }
    },
    'gita-sabarmati': {
      name: 'Gita Mandir to Sabarmati',
      coordinates: [
        [72.590, 23.010],  // Bottom-right (Gita Mandir area)
        [72.575, 23.010],  // Bottom-left
        [72.575, 23.072],  // Top-left (Sabarmati area)
        [72.590, 23.072],  // Top-right
        [72.590, 23.010],  // Close the polygon
      ],
      stations: {
        start: { name: 'Gita Mandir Station', coords: [72.585, 23.012] },
        end: { name: 'Sabarmati Station', coords: [72.580, 23.070] }
      }
    },
    // Add more routes as needed
  };

  // Add this function to handle location watching
  const startLocationWatching = (route) => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    try {
      // Clear any existing watch
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setLocationError(null); // Clear any previous errors
          const { latitude, longitude } = position.coords;

          // Update or create user marker
          if (!markerRef.current) {
            markerRef.current = L.marker([latitude, longitude])
              .bindPopup('Your Location')
              .addTo(mapRef.current);
          } else {
            markerRef.current.setLatLng([latitude, longitude]);
          }

          // Check if user is inside polygon
          const point = turf.point([longitude, latitude]);
          const polygon = turf.polygon([route.coordinates]);
          const isInside = turf.booleanPointInPolygon(point, polygon);

          if (!isInside) {
            if (!outOfZoneTimerRef.current) {
              outOfZoneTimerRef.current = setInterval(() => {
                setOutOfZoneDuration(prev => {
                  const newDuration = prev + 1;
                  if (newDuration >= 600) { // 10 minutes
                    clearInterval(outOfZoneTimerRef.current);
                    generatePenaltyReceipt();
                    return 600;
                  }
                  return newDuration;
                });
              }, 1000);
            }
            setStatus(`⚠️ Outside allowed zone (${Math.floor((600 - outOfZoneDuration) / 60)}:${((600 - outOfZoneDuration) % 60).toString().padStart(2, '0')} until penalty)`);
            toast.warning('You are outside the allowed route!');
          } else {
            if (outOfZoneTimerRef.current) {
              clearInterval(outOfZoneTimerRef.current);
              outOfZoneTimerRef.current = null;
              setOutOfZoneDuration(0);
            }
            setStatus('✅ Inside allowed zone');
          }
        },
        (error) => {
          console.error('Location error:', error);
          let errorMessage = 'Location error: ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please enable location permissions in your browser.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += error.message;
          }
          setLocationError(errorMessage);
          toast.error(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // Increased timeout to 30 seconds
          maximumAge: 0
        }
      );
    } catch (error) {
      console.error('Error starting location watch:', error);
      setLocationError('Failed to start location tracking');
      toast.error('Failed to start location tracking');
    }
  };

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map('live-tracking-map').setView([23.12, 72.63], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Clear existing markers and polygons
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (polygonRef.current) {
      polygonRef.current.remove();
      polygonRef.current = null;
    }

    // If a route is selected, show its geofence
    if (selectedRoute && predefinedRoutes[selectedRoute]) {
      const route = predefinedRoutes[selectedRoute];
      
      // Add start station marker
      L.marker([route.stations.start.coords[1], route.stations.start.coords[0]])
        .bindPopup(route.stations.start.name)
        .addTo(mapRef.current);

      // Add end station marker
      L.marker([route.stations.end.coords[1], route.stations.end.coords[0]])
        .bindPopup(route.stations.end.name)
        .addTo(mapRef.current);

      // Add geofence polygon
      polygonRef.current = L.polygon(
        route.coordinates.map(coord => [coord[1], coord[0]]),
        {
          color: 'green',
          fillColor: '#00ff00',
          fillOpacity: 0.2,
          weight: 2
        }
      ).addTo(mapRef.current);

      // Fit map to polygon bounds
      mapRef.current.fitBounds(polygonRef.current.getBounds());

      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Create or update user marker
          if (!markerRef.current) {
            markerRef.current = L.marker([latitude, longitude])
              .bindPopup('Your Location')
              .addTo(mapRef.current);
          } else {
            markerRef.current.setLatLng([latitude, longitude]);
          }

          // Start continuous location watching
          startLocationWatching(route);
        },
        (error) => {
          console.error('Initial location error:', error);
          toast.error('Failed to get your initial location. Please check your location permissions.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    // Cleanup function
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (outOfZoneTimerRef.current) {
        clearInterval(outOfZoneTimerRef.current);
        outOfZoneTimerRef.current = null;
      }
    };
  }, [selectedRoute]); // Only re-run when selected route changes

  // Add cleanup for map on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const generatePenaltyReceipt = async () => {
    try {
      const penaltyAmount = 500; // ₹500 penalty
      await updateBookingLocation({
        bookingId: booking._id,
        penalty: {
          amount: penaltyAmount,
          reason: 'Outside allowed route for more than 10 minutes',
          timestamp: new Date().toISOString()
        }
      }).unwrap();

      toast.error(`Penalty of ₹${penaltyAmount} has been applied to your booking`);
      navigate(`/bookings/${booking._id}/penalty-receipt`);
    } catch (err) {
      console.error('Penalty error:', err);
      toast.error('Failed to process penalty');
    }
  };

  return (
    <div className="relative">
      {/* Route selector dropdown */}
      <div className="mb-4">
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="w-full p-2 border rounded-md shadow-sm"
        >
          <option value="">Select a route</option>
          {Object.entries(predefinedRoutes).map(([key, route]) => (
            <option key={key} value={key}>
              {route.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location error message */}
      {locationError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {locationError}
        </div>
      )}

      {/* Map container */}
      <div 
        id="live-tracking-map" 
        style={{ height: '70vh', width: '100%' }}
        className="rounded-lg shadow-lg"
      ></div>

      {/* Status indicator */}
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
        <p className="font-semibold">{status}</p>
        {outOfZoneDuration > 0 && (
          <p className="text-red-600 mt-2">
            Time outside zone: {Math.floor(outOfZoneDuration / 60)}:
            {(outOfZoneDuration % 60).toString().padStart(2, '0')}
          </p>
        )}
      </div>
    </div>
  );
};

export default LiveLocationTracker; 