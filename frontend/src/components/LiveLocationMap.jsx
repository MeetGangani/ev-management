import { useState, useEffect, useRef } from 'react';
import { TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import MapWrapper from './MapWrapper';

// Component to handle location tracking and map centering
const LocationMarker = ({ watchPosition, onLocationChange, geofence, stations, testMode, simulatedLocation }) => {
  const [position, setPosition] = useState(null);
  const [isInGeofence, setIsInGeofence] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [nearestStation, setNearestStation] = useState(null);
  const map = useMap();
  const watchIdRef = useRef(null);
  
  // Find the nearest station to a position
  const findNearestStation = (pos, stationsList) => {
    if (!stationsList || stationsList.length === 0) return null;
    
    let nearest = null;
    let shortestDistance = Infinity;
    
    stationsList.forEach(station => {
      // Get station coordinates (handle different formats)
      const stationLat = station.coordinates?.lat || station.geofenceParameters?.coordinates[1];
      const stationLng = station.coordinates?.lng || station.geofenceParameters?.coordinates[0];
      
      if (stationLat && stationLng) {
        const distance = map.distance([pos.lat, pos.lng], [stationLat, stationLng]);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearest = {
            ...station,
            distance: Math.round(distance / 1000 * 10) / 10 // Convert to km with 1 decimal
          };
        }
      }
    });
    
    return nearest;
  };
  
  // Check if a position is within the geofence
  const checkGeofence = (pos) => {
    if (!geofence || !geofence.center) return false;
    
    // If we're in test mode and using simulated location, always return true
    if (testMode && simulatedLocation && simulatedLocation.forceInGeofence) {
      return true;
    }
    
    const distance = map.distance(
      [pos.lat, pos.lng],
      [geofence.center[0], geofence.center[1]]
    );
    
    const isInside = distance <= geofence.radius;
    
    // Notify if entering or leaving geofence
    if (isInside !== isInGeofence) {
      if (isInside) {
        toast.success('You have entered the station parking zone!');
      } else {
        toast.warning('You have left the station parking zone!');
      }
    }
    
    setIsInGeofence(isInside);
    return isInside;
  };
  
  useEffect(() => {
    // If we have a simulated location in test mode, use it
    if (testMode && simulatedLocation) {
      const newPos = { 
        lat: simulatedLocation.lat || geofence?.center[0] || 23.2156,
        lng: simulatedLocation.lng || geofence?.center[1] || 72.6369
      };
      
      setPosition(newPos);
      setAccuracy(simulatedLocation.accuracy || 10);
      map.setView(newPos, map.getZoom());
      
      // Force in geofence if that option is set
      const inGeofence = simulatedLocation.forceInGeofence ? true : checkGeofence(newPos);
      setIsInGeofence(inGeofence);
      
      // Find nearest station
      if (stations && stations.length > 0) {
        const nearest = findNearestStation(newPos, stations);
        setNearestStation(nearest);
      }
      
      // Notify parent component
      if (onLocationChange) {
        onLocationChange({ 
          position: newPos, 
          accuracy: simulatedLocation.accuracy || 10, 
          isInGeofence: inGeofence,
          nearestStation: findNearestStation(newPos, stations)
        });
      }
      
      // Skip real geolocation in test mode with simulated location
      return;
    }
    
    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };
        setPosition(newPos);
        setAccuracy(accuracy);
        map.setView(newPos, map.getZoom());
        
        // Check if in geofence
        if (geofence && geofence.center) {
          checkGeofence(newPos);
        }
        
        // Find nearest station
        if (stations && stations.length > 0) {
          const nearest = findNearestStation(newPos, stations);
          setNearestStation(nearest);
        }
        
        // Notify parent component
        if (onLocationChange) {
          onLocationChange({ 
            position: newPos, 
            accuracy, 
            isInGeofence: checkGeofence(newPos),
            nearestStation: findNearestStation(newPos, stations)
          });
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error(`Could not get your location: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
    
    // Set up watchPosition if enabled and not in test mode with simulated location
    if (watchPosition && !(testMode && simulatedLocation)) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const newPos = { lat: latitude, lng: longitude };
          setPosition(newPos);
          setAccuracy(accuracy);
          map.setView(newPos, map.getZoom());
          
          // Check if in geofence
          const inGeofence = checkGeofence(newPos);
          
          // Find nearest station
          if (stations && stations.length > 0) {
            const nearest = findNearestStation(newPos, stations);
            setNearestStation(nearest);
          }
          
          // Notify parent component
          if (onLocationChange) {
            onLocationChange({ 
              position: newPos, 
              accuracy, 
              isInGeofence: inGeofence,
              nearestStation: findNearestStation(newPos, stations)
            });
          }
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
    
    // Cleanup watch
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [map, watchPosition, onLocationChange, geofence, stations, testMode, simulatedLocation]);
  
  return position === null ? null : (
    <>
      <Marker position={position}>
        <Popup>
          Your current location
          <br />
          Accuracy: {Math.round(accuracy)} meters
          <br />
          {isInGeofence 
            ? '✅ Inside parking zone' 
            : '⚠️ Outside parking zone'}
          {testMode && simulatedLocation && (
            <span className="block text-red-600 font-bold">TEST MODE</span>
          )}
          {nearestStation && (
            <>
              <br />
              <strong>Nearest station:</strong> {nearestStation.name}
              <br />
              {nearestStation.distance} km away
            </>
          )}
        </Popup>
      </Marker>
      {position && accuracy > 0 && (
        <Circle 
          center={position}
          radius={accuracy}
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
        />
      )}
    </>
  );
};

// Station marker component
const StationMarker = ({ station, isDestination }) => {
  return (
    <Marker
      position={[
        station.coordinates?.lat || station.geofenceParameters?.coordinates[1], 
        station.coordinates?.lng || station.geofenceParameters?.coordinates[0]
      ]}
      icon={
        L.divIcon({
          className: 'custom-station-marker',
          html: `<div class="station-marker ${isDestination ? 'destination' : ''}">
                   <div class="inner"></div>
                 </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        })
      }
    >
      <Popup>
        <div>
          <h3 className="font-bold">{station.name}</h3>
          <p>{station.address}</p>
          <p>Operating Hours: {station.operatingHours?.opening} - {station.operatingHours?.closing}</p>
        </div>
      </Popup>
    </Marker>
  );
};

// Main component
const LiveLocationMap = ({ 
  bookingData, 
  stations = [], 
  height = '400px',
  watchPosition = false,
  onLocationUpdate = null,
  testMode = false,
  simulatedLocation = null
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const mapId = bookingData?._id || 'default-map';
  const styleRef = useRef(null);  // Reference to hold the style element
  const mapInstanceRef = useRef(null);
  
  // Configure geofence based on destination station
  const geofence = bookingData?.endStationId ? {
    center: [
      bookingData.endStationId.coordinates?.lat || bookingData.endStationId.geofenceParameters?.coordinates[1] || 0,
      bookingData.endStationId.coordinates?.lng || bookingData.endStationId.geofenceParameters?.coordinates[0] || 0
    ],
    radius: bookingData.endStationId.geofenceParameters?.radius || 100
  } : null;
  
  // Handle location updates from LocationMarker
  const handleLocationChange = (locationData) => {
    setUserLocation(locationData);
    
    if (onLocationUpdate) {
      onLocationUpdate(locationData);
    }
  };
  
  // Add CSS for custom station markers
  useEffect(() => {
    console.log('LiveLocationMap mounted with booking:', bookingData?._id);
    
    // Only add the style once
    if (!styleRef.current) {
      // Add CSS for custom station markers
      const style = document.createElement('style');
      style.textContent = `
        .custom-station-marker {
          background-color: transparent;
        }
        .station-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: rgba(0, 128, 0, 0.3);
          border: 2px solid green;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .station-marker.destination {
          background-color: rgba(255, 165, 0, 0.3);
          border: 2px solid orange;
        }
        .station-marker .inner {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background-color: green;
        }
        .station-marker.destination .inner {
          background-color: orange;
        }
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }
    
    setMapReady(true);
    
    // Clean up resources when component unmounts
    return () => {
      console.log('LiveLocationMap unmounting, cleaning up');
      // Only remove the style if we added it
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, [bookingData?._id]);
  
  // Get destination station from booking
  const destinationStation = bookingData?.endStationId;
  
  // Calculate initial map center
  const getInitialCenter = () => {
    // If in test mode with simulated location, use that
    if (testMode && simulatedLocation) {
      const center = [
        simulatedLocation.lat || 23.2156,
        simulatedLocation.lng || 72.6369
      ];
      return center;
    }
    
    // First check if we have the user's location from browser geolocation
    if (navigator.geolocation) {
      try {
        // Try to get a quick position for initial rendering
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            // If we have a map instance, set its view to the current position
            if (mapReady && mapInstanceRef.current) {
              mapInstanceRef.current.setView([latitude, longitude], 13);
            }
            return [latitude, longitude];
          },
          () => {
            // Error or permission denied, fall back to booking location or default
            console.log("Geolocation permission denied, using fallback location");
          },
          { timeout: 2000, maximumAge: 60000 } // Use a cached position if available
        );
      } catch (e) {
        console.error("Error getting geolocation:", e);
      }
    }

    // If no geolocation or it failed, try to use booking location
    if (bookingData && bookingData.startStationId) {
      return [
        bookingData.startStationId.coordinates?.lat || bookingData.startStationId.geofenceParameters?.coordinates[1] || 23.2156, // Gandhinagar coordinates
        bookingData.startStationId.coordinates?.lng || bookingData.startStationId.geofenceParameters?.coordinates[0] || 72.6369
      ];
    }
    
    // Default to Gandhinagar instead of Delhi if no other location is available
    return [23.2156, 72.6369]; // Gandhinagar coordinates
  };
  
  if (!mapReady) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100" 
        style={{ height }}
      >
        Loading map...
      </div>
    );
  }
  
  return (
    <div className="w-full h-full">
      <MapWrapper
        id={mapId}
        center={getInitialCenter()}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapInstanceRef}
      >
        {/* Current Location */}
        <LocationMarker 
          watchPosition={watchPosition} 
          onLocationChange={handleLocationChange}
          geofence={geofence}
          stations={stations}
          testMode={testMode}
          simulatedLocation={simulatedLocation}
        />
        
        {/* Destination Station with Geofence */}
        {destinationStation && (
          <>
            <StationMarker station={destinationStation} isDestination={true} />
            {geofence && geofence.center && (
              <Circle
                center={geofence.center}
                radius={geofence.radius}
                pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.1 }}
              />
            )}
          </>
        )}
        
        {/* Other Stations */}
        {stations.map((station) => (
          (station._id !== destinationStation?._id && 
           station.coordinates?.lat && station.coordinates?.lng) && (
            <StationMarker 
              key={station._id} 
              station={station} 
              isDestination={false}
            />
          )
        ))}
      </MapWrapper>
    </div>
  );
};

export default LiveLocationMap; 