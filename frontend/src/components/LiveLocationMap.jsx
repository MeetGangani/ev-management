import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import * as turf from '@turf/turf';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';

// Make sure Leaflet default icon images work
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
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
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [isInParkingZone, setIsInParkingZone] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const styleRef = useRef(null);
  const watchIdRef = useRef(null);
  const geofencePolygonRef = useRef(null);
  const boundaryPointsRef = useRef(null);
  const lastGeofenceStatus = useRef(null);
  const [simulationMode, setSimulationMode] = useState(false);
  
  // Debug to check what data is actually coming from the backend
  useEffect(() => {
    if (bookingData?.endStationId) {
      console.log('Station data:', bookingData.endStationId);
      console.log('Geofence params:', bookingData.endStationId.geofenceParameters);
    }
  }, [bookingData]);
  
  // Configure geofence based on station data
  // Since geofenceParameters is undefined, we need to use a different approach
  const endStation = bookingData?.endStationId;
  
  // Create a polygon geofence instead of a circle
  // This will create a hexagonal geofence around the center point
  const createGeofencePolygon = (centerLat, centerLng, radiusInMeters) => {
    // Create points around the center to form a polygon
    // We'll create a hexagon for better visual appearance
    const points = [];
    const numPoints = 6; // Hexagon
    
    for (let i = 0; i < numPoints; i++) {
      // Calculate angle for each point (in radians)
      const angle = (Math.PI * 2 * i) / numPoints;
      
      // Convert radius from meters to degrees (rough approximation)
      // 111,111 meters = 1 degree of latitude
      const latOffset = (radiusInMeters / 111111) * Math.sin(angle);
      const lngOffset = (radiusInMeters / (111111 * Math.cos(centerLat * (Math.PI / 180)))) * Math.cos(angle);
      
      points.push([centerLng + lngOffset, centerLat + latOffset]);
    }
    
    // Close the polygon by adding the first point again
    points.push(points[0]);
    
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [points]
      }
    };
  };
  
  // Create center point and geofence
  const geofenceCenter = [
    endStation?._id ? 23.11 : 23.12, // Lat
    endStation?._id ? 72.62 : 72.63  // Lng
  ];
  
  const geofenceRadius = 300; // Fixed radius in meters
  const geofencePolygon = createGeofencePolygon(geofenceCenter[0], geofenceCenter[1], geofenceRadius);

  // When test mode is active, force geofence status
  useEffect(() => {
    if (testMode) {
      setIsInParkingZone(true);
      if (onLocationUpdate) {
        onLocationUpdate({
          position: { lat: geofenceCenter[0], lng: geofenceCenter[1] },
          accuracy: 10,
          isInGeofence: true
        });
      }
    }
  }, [testMode, onLocationUpdate, geofenceCenter]);
  
  // Fix Leaflet default icon on component mount
  useEffect(() => {
    fixLeafletIcon();
  }, []);
  
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
        .leaflet-alert {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px 20px;
          border-radius: 5px;
          font-weight: bold;
          z-index: 1000;
          animation: fadeInOut 5s forwards;
          text-align: center;
          border: 1px solid #f5c6cb;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .simulation-button {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
          padding: 8px 12px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        .simulation-button.active {
          background-color: #f44336;
        }
        .simulation-hint {
          position: absolute;
          top: 50px;
          right: 10px;
          z-index: 1000;
          padding: 8px 12px;
          background-color: rgba(255,255,255,0.8);
          color: #333;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 12px;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
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
  
  // Function to display a geofence alert on the map
  const showGeofenceAlert = (message) => {
    if (!mapRef.current) return;
    
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = 'leaflet-alert';
    alertDiv.innerText = message;
    
    // Add to map container
    mapRef.current.getContainer().appendChild(alertDiv);
    
    // Remove after animation completes
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 5000);
  };
  
  // Function to check if point is in geofence
  const checkGeofence = (lat, lng) => {
    // If in test mode and not in simulation mode, always return true
    if (testMode && !simulationMode) {
      return true;
    }
    
    try {
      const point = turf.point([lng, lat]); // [longitude, latitude] for turf
      return turf.booleanPointInPolygon(point, geofencePolygon);
    } catch (err) {
      console.error('Error checking geofence:', err);
      return false;
    }
  };
  
  // Function to update location (used by both real location tracking and simulation)
  const updateLocation = (position) => {
    if (!mapRef.current) return;
    
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
        .addTo(mapRef.current)
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
      }).addTo(mapRef.current);
    } else {
      circleRef.current.setLatLng([latitude, longitude]).setRadius(accuracy);
    }
    
    // Check if in geofence
    const inGeofence = checkGeofence(latitude, longitude);
    
    // If geofence status changed, show appropriate alert
    if (lastGeofenceStatus.current !== null && lastGeofenceStatus.current !== inGeofence) {
      if (inGeofence) {
        showGeofenceAlert('You have entered the parking zone');
        toast.success('You have entered the station parking zone!');
      } else {
        showGeofenceAlert('Warning: You have left the parking zone');
        toast.warning('You have left the station parking zone!');
      }
    }
    
    // Update current geofence status
    lastGeofenceStatus.current = inGeofence;
    
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
  };
  
  // Handle map click for simulation
  const handleMapClick = (e) => {
    if (!simulationMode || !mapRef.current) return;
    
    const { lat, lng } = e.latlng;
    console.log(`Map clicked at: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    
    // Create a fake position object that mimics the geolocation API
    const fakePosition = {
      coords: {
        latitude: lat,
        longitude: lng,
        accuracy: 10
      }
    };
    
    // Update location using the same function as real location updates
    updateLocation(fakePosition);
    
    // Show a popup at the clicked location
    L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <div>
          <strong>Simulated Location:</strong> ${lat.toFixed(6)}, ${lng.toFixed(6)}<br/>
          <strong>Status:</strong> ${isInParkingZone ? 
            '<span style="color:green">Inside geofence ✓</span>' : 
            '<span style="color:red">Outside geofence ✗</span>'}
        </div>
      `)
      .openOn(mapRef.current);
  };
  
  // Initialize map and location tracking
  useEffect(() => {
    // Ensure we only initialize once and when DOM is ready
    if (!mapContainerRef.current || mapRef.current) return;
    
    // Generate a unique ID for the map container to prevent initialization issues
    const mapId = `map-${bookingData?._id || 'default'}-${Date.now()}`;
    mapContainerRef.current.id = mapId;
    
    // Force a small delay to make sure the container is fully rendered
    setTimeout(() => {
      try {
        // Create map instance
        const map = L.map(mapId, { zoomControl: true }).setView(geofenceCenter, 15);
        mapRef.current = map;
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Add click handler for simulation mode
        map.on('click', handleMapClick);
        
        // Add simulation control button
        const simulationButton = document.createElement('button');
        simulationButton.className = 'simulation-button';
        simulationButton.innerText = 'Enable Simulation';
        simulationButton.onclick = (e) => {
          e.stopPropagation();
          setSimulationMode(!simulationMode);
          simulationButton.innerText = !simulationMode ? 'Disable Simulation' : 'Enable Simulation';
          simulationButton.classList.toggle('active', !simulationMode);
          
          // Show or hide the hint
          if (!simulationMode) {
            // Show hint
            if (!document.querySelector('.simulation-hint')) {
              const hintDiv = document.createElement('div');
              hintDiv.className = 'simulation-hint';
              hintDiv.innerText = 'Click anywhere on the map to simulate your location';
              map.getContainer().appendChild(hintDiv);
            }
          } else {
            // Hide hint
            const hint = document.querySelector('.simulation-hint');
            if (hint && hint.parentNode) {
              hint.parentNode.removeChild(hint);
            }
          }
        };
        map.getContainer().appendChild(simulationButton);
        
        // Add destination station marker and geofence polygon
        // Add destination marker with orange color
        const destinationIcon = L.divIcon({
          className: 'geofence-marker',
          html: '<div style="width:24px;height:24px;"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        L.marker(geofenceCenter, { icon: destinationIcon })
          .addTo(map)
          .bindPopup('Destination Station: ' + (bookingData?.endStationId?.name || 'End Point'))
          .openPopup();
        
        // Convert Turf polygon to Leaflet format
        const leafletPolygonPoints = geofencePolygon.geometry.coordinates[0].map(coord => 
          [coord[1], coord[0]] // Leaflet uses [lat, lng] while GeoJSON uses [lng, lat]
        );
        
        // Save boundary points for later use
        boundaryPointsRef.current = leafletPolygonPoints;
        
        // Add geofence polygon with styling
        geofencePolygonRef.current = L.polygon(leafletPolygonPoints, {
          color: 'orange',
          fillColor: 'orange',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map);
        
        // Zoom to include the polygon
        map.fitBounds(geofencePolygonRef.current.getBounds(), { padding: [50, 50] });
        
        // If in test mode and not in simulation mode, use simulated location
        if (testMode && !simulationMode) {
          const fakePosition = {
            coords: {
              latitude: simulatedLocation?.lat || geofenceCenter[0],
              longitude: simulatedLocation?.lng || geofenceCenter[1],
              accuracy: simulatedLocation?.accuracy || 10
            }
          };
          updateLocation(fakePosition);
          
          // Force set in parking zone for test mode
          setIsInParkingZone(true);
          if (onLocationUpdate) {
            onLocationUpdate({
              position: { 
                lat: fakePosition.coords.latitude, 
                lng: fakePosition.coords.longitude 
              },
              accuracy: fakePosition.coords.accuracy,
              isInGeofence: true
            });
          }
        } else if (watchPosition && !simulationMode) {
          // Watch real location
          if ('geolocation' in navigator) {
            // Get initial position
            navigator.geolocation.getCurrentPosition(
              updateLocation,
              (error) => {
                console.error('Error getting location:', error);
                toast.error(`Could not get your location: ${error.message}`);
                
                // If we can't get user location, just show the map with geofence
                map.invalidateSize();
                map.fitBounds(geofencePolygonRef.current.getBounds(), { padding: [50, 50] });
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
        
        // Add other stations
        if (stations && stations.length > 0) {
          stations.forEach(station => {
            // Skip destination station as it's already added
            if (station._id === bookingData?.endStationId?._id) return;
            
            // For simplicity, use fixed coordinates for stations
            const stationLat = 23.12; 
            const stationLng = 72.63;
            
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
        
        // Invalidate size after a delay to handle any container sizing issues
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
            
            // Fit to geofence bounds again to make sure it's visible
            if (geofencePolygonRef.current) {
              mapRef.current.fitBounds(geofencePolygonRef.current.getBounds(), { padding: [50, 50] });
            }
          }
        }, 300);
      } catch (error) {
        console.error('Error initializing map:', error);
        toast.error('Failed to initialize map. Please try again.');
      }
    }, 100);
    
  }, [bookingData, stations, geofenceCenter, geofencePolygon, watchPosition, onLocationUpdate, testMode, simulatedLocation, simulationMode]);
  
  // Update simulation mode status when it changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear watches if going into simulation mode
    if (simulationMode && watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log('Cleared geolocation watch for simulation mode');
    }
    
    // If exiting simulation mode and watch position is enabled, restart watching
    if (!simulationMode && watchPosition && !watchIdRef.current && 'geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        updateLocation,
        (error) => console.error('Error watching location:', error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
      console.log('Resumed geolocation watch after exiting simulation mode');
    }
  }, [simulationMode, watchPosition]);
  
  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: height }}
        className="leaflet-container"
      ></div>
      
      {/* Geofence indicator overlay */}
      {(watchPosition || simulationMode) && userLocation && (
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
            {simulationMode && (
              <div className="text-blue-700 text-xs mt-1">Simulation mode active</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveLocationMap; 