import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkerAlt, FaCrosshairs } from 'react-icons/fa';

// Custom component to center map on user location
const CenterMapOnLocation = ({ position }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
};

// Custom marker for user's location
const createUserLocationIcon = () => {
  return L.divIcon({
    html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
            <div class="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Custom marker for stations
const createStationIcon = () => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-6 h-6 bg-green-600 rounded-full border-2 border-white">
            <div class="w-3 h-3 bg-white rounded-sm"></div>
          </div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const LiveLocationMap = ({ 
  bookingData, 
  height = '50vh', 
  watchPosition = true,
  stations = []
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(true);
  const watchIdRef = useRef(null);
  
  // Start watching user's position
  useEffect(() => {
    if (watchPosition && navigator.geolocation) {
      setIsGettingLocation(true);
      
      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Initial position:", latitude, longitude);
          setUserLocation([latitude, longitude]);
          setIsGettingLocation(false);
        },
        (err) => {
          console.error("Error getting initial position:", err);
          setError(`Location error: ${err.message}`);
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true }
      );
      
      // Start watching position
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Updated position:", latitude, longitude);
          setUserLocation([latitude, longitude]);
          setError('');
        },
        (err) => {
          console.error("Error watching position:", err);
          setError(`Location error: ${err.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
      );
    }
    
    // Clean up the watcher when component unmounts
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [watchPosition]);
  
  // Get destination station coordinates
  const getDestinationCoords = () => {
    if (!bookingData?.startStationId) return null;
    
    const station = bookingData.startStationId;
    
    // Handle different formats of coordinates in the API
    if (station.coordinates?.lat && station.coordinates?.lng) {
      return [station.coordinates.lat, station.coordinates.lng];
    } else if (station.geofenceParameters?.coordinates) {
      // GeoJSON format: [longitude, latitude]
      const [lng, lat] = station.geofenceParameters.coordinates;
      return [lat, lng];
    }
    
    return null;
  };
  
  const destinationCoords = getDestinationCoords();
  const mapCenter = userLocation || destinationCoords || [20.5937, 78.9629]; // Default to center of India
  
  return (
    <div className="w-full" style={{ height }}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}
      
      {isGettingLocation && !userLocation && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white bg-opacity-75 p-3 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-2"></div>
            <span>Getting your location...</span>
          </div>
        </div>
      )}
      
      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-md overflow-hidden"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <>
            <Marker 
              position={userLocation} 
              icon={createUserLocationIcon()}
            >
              <Popup>
                Your current location
              </Popup>
            </Marker>
            
            {/* Accuracy circle around user location */}
            <Circle
              center={userLocation}
              radius={50} // 50 meters
              pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
            />
          </>
        )}
        
        {/* Render destination station */}
        {destinationCoords && (
          <Marker 
            position={destinationCoords} 
            icon={createStationIcon()}
          >
            <Popup>
              {bookingData?.startStationId?.name || 'Destination Station'}
              <br />
              {bookingData?.startStationId?.address || ''}
            </Popup>
          </Marker>
        )}
        
        {/* Render nearby stations */}
        {stations.map((station) => {
          // Skip if this is the destination station
          if (station._id === bookingData?.startStationId?._id) return null;
          
          let stationCoords = null;
          
          if (station.coordinates?.lat && station.coordinates?.lng) {
            stationCoords = [station.coordinates.lat, station.coordinates.lng];
          } else if (station.geofenceParameters?.coordinates) {
            const [lng, lat] = station.geofenceParameters.coordinates;
            stationCoords = [lat, lng];
          }
          
          if (!stationCoords) return null;
          
          return (
            <Marker 
              key={station._id} 
              position={stationCoords} 
              icon={createStationIcon()}
            >
              <Popup>
                {station.name}
                <br />
                {station.address}
              </Popup>
            </Marker>
          );
        })}
        
        {/* Center map component */}
        {userLocation && <CenterMapOnLocation position={userLocation} />}
      </MapContainer>
      
      {/* Recenter button */}
      {userLocation && (
        <button 
          className="absolute bottom-4 right-4 z-500 bg-white p-3 rounded-full shadow-md hover:bg-gray-100"
          onClick={() => {
            const map = document.querySelector('.leaflet-container')._leaflet_map;
            map.flyTo(userLocation, map.getZoom());
          }}
          aria-label="Center map on my location"
        >
          <FaCrosshairs className="text-blue-600" />
        </button>
      )}
    </div>
  );
};

export default LiveLocationMap; 