import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';

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
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [isInParkingZone, setIsInParkingZone] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const styleRef = useRef(null);
  const watchIdRef = useRef(null);
  
  // Configure geofence based on destination station
  const geofence = bookingData?.endStationId ? {
    center: [
      bookingData.endStationId.coordinates?.lat || bookingData.endStationId.geofenceParameters?.coordinates[1] || 0,
      bookingData.endStationId.coordinates?.lng || bookingData.endStationId.geofenceParameters?.coordinates[0] || 0
    ],
    radius: bookingData.endStationId.geofenceParameters?.radius || 100
  } : null;
  
  // Add CSS for custom markers
  useEffect(() => {
    console.log('LiveLocationMap mounted with booking:', bookingData?._id);
    
    // Only add the style once
    if (!styleRef.current) {
      const style = document.createElement('style');
      style.textContent = `
        .user-marker-icon {
          background-color: #3b82f6;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 3px rgba(0,0,0,0.3);
        }
        .geofence-marker {
          background-color: orange;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 3px rgba(0,0,0,0.3);
        }
        .station-marker {
          background-color: green;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 3px rgba(0,0,0,0.3);
        }
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }
    
    // Clean up resources when component unmounts
    return () => {
      console.log('LiveLocationMap unmounting, cleaning up');
      
      // Clear geolocation watch
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      
      // Remove map instance
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      
      // Remove style if we added it
      if (styleRef.current && document.head.contains(styleRef.current)) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, [bookingData?._id]);
  
  // Initialize map and location tracking
  useEffect(() => {
    // Ensure we only initialize once and when DOM is ready
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Create map instance
    const map = L.map(mapContainerRef.current).setView([23.12, 72.63], 13);
    mapRef.current = map;
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add destination station marker and geofence circle
    if (geofence && geofence.center) {
      // Add destination marker
      const destinationIcon = L.divIcon({
        className: 'geofence-marker',
        html: '<div style="width:24px;height:24px;"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      L.marker(geofence.center, { icon: destinationIcon })
        .addTo(map)
        .bindPopup('Destination Station: ' + (bookingData?.endStationId?.name || 'End Point'))
        .openPopup();
      
      // Add geofence circle
      const circle = L.circle(geofence.center, {
        radius: geofence.radius,
        color: 'orange',
        fillColor: 'orange',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(map);
      
      // Create turf circle for geofence checking
      const turfCircle = turf.circle(
        [geofence.center[1], geofence.center[0]], // [longitude, latitude] for turf
        geofence.radius / 1000, // Convert meters to kilometers
        { steps: 64, units: 'kilometers' }
      );
      
      // Zoom to include the circle
      map.fitBounds(circle.getBounds(), { padding: [50, 50] });
      
      // Function to check if point is in geofence
      const checkGeofence = (lat, lng) => {
        // If in test mode with simulated location and forceInGeofence, always return true
        if (testMode && simulatedLocation && simulatedLocation.forceInGeofence) {
          return true;
        }
        
        const point = turf.point([lng, lat]); // [longitude, latitude] for turf
        return turf.booleanPointInPolygon(point, turfCircle);
      };
      
      // Setup location tracking
      const updateLocation = (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Update user marker
        if (!markerRef.current) {
          const userIcon = L.divIcon({
            className: 'user-marker-icon',
            html: '<div style="width:16px;height:16px;"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });
          
          markerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('Your Location')
            .openPopup();
        } else {
          markerRef.current.setLatLng([latitude, longitude]);
        }
        
        // Update accuracy circle
        if (!circleRef.current) {
          circleRef.current = L.circle([latitude, longitude], {
            radius: accuracy,
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.1,
            weight: 1
          }).addTo(map);
        } else {
          circleRef.current.setLatLng([latitude, longitude]).setRadius(accuracy);
        }
        
        // Check if in geofence
        const inGeofence = checkGeofence(latitude, longitude);
        
        // Update state
        const locationData = {
          position: { lat: latitude, lng: longitude },
          accuracy,
          isInGeofence: inGeofence
        };
        
        setUserLocation(locationData);
        setIsInParkingZone(inGeofence);
        
        // Notify parent component
        if (onLocationUpdate) {
          onLocationUpdate(locationData);
        }
        
        // Notify if geofence status changed
        if (inGeofence !== isInParkingZone) {
          if (inGeofence) {
            toast.success('You have entered the station parking zone!');
          } else {
            toast.warning('You have left the station parking zone!');
          }
        }
      };
      
      // If in test mode with simulated location, use that instead of real geolocation
      if (testMode && simulatedLocation) {
        const fakePosition = {
          coords: {
            latitude: simulatedLocation.lat || geofence.center[0],
            longitude: simulatedLocation.lng || geofence.center[1],
            accuracy: simulatedLocation.accuracy || 10
          }
        };
        updateLocation(fakePosition);
      } else if (watchPosition) {
        // Watch real location
        if ('geolocation' in navigator) {
          // Get initial position
          navigator.geolocation.getCurrentPosition(
            updateLocation,
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
          
          // Setup continuous tracking
          watchIdRef.current = navigator.geolocation.watchPosition(
            updateLocation,
            (error) => {
              console.error('Error watching location:', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        } else {
          toast.error('Geolocation is not supported by your browser');
        }
      }
    }
    
    // Add other stations
    if (stations && stations.length > 0) {
      stations.forEach(station => {
        // Skip destination station as it's already added
        if (station._id === bookingData?.endStationId?._id) return;
        
        // Get coordinates (handle different formats)
        const stationLat = station.coordinates?.lat || station.geofenceParameters?.coordinates[1];
        const stationLng = station.coordinates?.lng || station.geofenceParameters?.coordinates[0];
        
        if (stationLat && stationLng) {
          // Create station icon
          const stationIcon = L.divIcon({
            className: 'station-marker',
            html: '<div style="width:20px;height:20px;"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          L.marker([stationLat, stationLng], { icon: stationIcon })
            .addTo(map)
            .bindPopup(`
              <div>
                <h3 style="font-weight:bold">${station.name}</h3>
                <p>${station.address}</p>
                <p>Operating Hours: ${station.operatingHours?.opening || 'N/A'} - ${station.operatingHours?.closing || 'N/A'}</p>
              </div>
            `);
        }
      });
    }
    
    // Prevent map issues with size in container
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 100);
    
  }, [bookingData, stations, geofence, watchPosition, onLocationUpdate, testMode, simulatedLocation, isInParkingZone]);
  
  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainerRef} 
        id={`map-${bookingData?._id || 'default'}-${Date.now()}`} 
        style={{ width: '100%', height: '100%' }}
      ></div>
      
      {/* Geofence indicator overlay */}
      {watchPosition && userLocation && geofence && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white bg-opacity-80 p-3 rounded-lg shadow-md max-w-xs">
          <div className="font-medium text-sm">
            {isInParkingZone ? (
              <div className="text-green-700 flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Inside parking zone
              </div>
            ) : (
              <div className="text-orange-700 flex items-center">
                <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                Outside parking zone
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveLocationMap; 