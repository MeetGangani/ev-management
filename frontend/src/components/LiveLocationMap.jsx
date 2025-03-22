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
  simulatedLocation = null,
  onPenalty = null
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
  const isMountedRef = useRef(true);
  const [simulationMode, setSimulationMode] = useState(false);
  
  // State for penalty tracking
  const [geofenceViolation, setGeofenceViolation] = useState(false);
  const geofenceViolationStartTime = useRef(null);
  const lastPenaltyTime = useRef(null);
  const geofenceViolationDistance = useRef(0);
  const penaltyCooldown = useRef(false);
  
  // Add this at the top of the component with other refs
  const animationFrameIds = useRef([]);
  
  // Add a stable ID ref
  const mapIdRef = useRef(`map-${Math.random().toString(36).substring(2, 10)}`);
  
  // Debug to check what data is actually coming from the backend
  useEffect(() => {
    // Log booking and station data for debugging
    console.log('BookingData:', bookingData);
    if (bookingData?.endStationId) {
      console.log('Station data:', bookingData.endStationId);
      console.log('Geofence params:', bookingData.endStationId.geofenceParameters);
    }
  }, [bookingData]);
  
  // Configure geofence based on station data or use defaults
  const endStation = bookingData?.endStationId || {};
  const DEFAULT_LATITUDE = 23.11;
  const DEFAULT_LONGITUDE = 72.62;
  const DEFAULT_RADIUS = 300; // meters
  
  // Create a polygon geofence instead of a circle
  // This will create a hexagonal geofence around the center point
  const createGeofencePolygon = (centerLat, centerLng, radiusInMeters) => {
    // Handle invalid inputs by providing defaults
    centerLat = isNaN(parseFloat(centerLat)) ? DEFAULT_LATITUDE : parseFloat(centerLat);
    centerLng = isNaN(parseFloat(centerLng)) ? DEFAULT_LONGITUDE : parseFloat(centerLng);
    radiusInMeters = isNaN(parseFloat(radiusInMeters)) ? DEFAULT_RADIUS : parseFloat(radiusInMeters);
    
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
  
  // Get coordinates from the station or use defaults
  const getStationCoordinates = () => {
    const coordinates = [DEFAULT_LATITUDE, DEFAULT_LONGITUDE];
    
    // Try to get coordinates from the endStation if available
    if (endStation) {
      // If the station has explicit coordinates, use them
      if (endStation.latitude && endStation.longitude) {
        return [parseFloat(endStation.latitude), parseFloat(endStation.longitude)];
      }
      
      // If the station has a location object, use those coordinates
      if (endStation.location && endStation.location.coordinates && endStation.location.coordinates.length >= 2) {
        // GeoJSON format is [longitude, latitude]
        return [parseFloat(endStation.location.coordinates[1]), parseFloat(endStation.location.coordinates[0])];
      }
    }
    
    return coordinates;
  };
  
  // Create center point and geofence using station data or defaults
  const geofenceCenter = getStationCoordinates();
  const geofenceRadius = endStation?.geofenceRadius || DEFAULT_RADIUS;
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
  
  // Function to check if point is in geofence and handle violations
  const checkGeofence = (lat, lng) => {
    // If in test mode and not in simulation mode, always return true
    if (testMode && !simulationMode) {
      return true;
    }
    
    try {
      const point = turf.point([lng, lat]); // [longitude, latitude] for turf
      const isInside = turf.booleanPointInPolygon(point, geofencePolygon);
      
      // Handle geofence violation penalties
      if (!isInside) {
        // Calculate distance from geofence
        const distance = calculateDistanceFromGeofence(lat, lng);
        geofenceViolationDistance.current = Math.max(geofenceViolationDistance.current, distance);
        
        // If this is a new violation, record the start time
        if (!geofenceViolation) {
          setGeofenceViolation(true);
          geofenceViolationStartTime.current = new Date();
        }
        
        // Apply penalty after being outside for more than 1 minute
        // but only if we haven't already applied one recently (cooldown)
        const now = new Date();
        if (
          geofenceViolationStartTime.current && 
          !penaltyCooldown.current &&
          (now - geofenceViolationStartTime.current) > 60000 // 1 minute
        ) {
          // Apply penalty
          applyGeofenceViolationPenalty(lat, lng, distance);
          
          // Set cooldown to avoid spamming penalties
          penaltyCooldown.current = true;
          lastPenaltyTime.current = now;
          
          // Reset cooldown after 5 minutes
          setTimeout(() => {
            penaltyCooldown.current = false;
          }, 5 * 60 * 1000); // 5 minutes
        }
      } else {
        // Reset violation tracking if we're back inside
        if (geofenceViolation) {
          setGeofenceViolation(false);
          geofenceViolationStartTime.current = null;
          geofenceViolationDistance.current = 0;
        }
      }
      
      return isInside;
    } catch (err) {
      console.error('Error checking geofence:', err);
      return false;
    }
  };
  
  // Calculate distance from geofence boundary
  const calculateDistanceFromGeofence = (lat, lng) => {
    if (!boundaryPointsRef.current) return 0;
    
    try {
      const point = turf.point([lng, lat]);
      
      // Create a LineString from the boundary points
      const boundaryLine = turf.lineString(
        boundaryPointsRef.current.map(coord => [coord[1], coord[0]])
      );
      
      // Calculate the distance to the boundary
      const distance = turf.pointToLineDistance(point, boundaryLine, { units: 'meters' });
      return Math.round(distance);
    } catch (err) {
      console.error('Error calculating distance from geofence:', err);
      return 0;
    }
  };
  
  // Apply geofence violation penalty
  const applyGeofenceViolationPenalty = (lat, lng, distance) => {
    // Don't apply penalties in test or simulation mode
    if (testMode || simulationMode) return;
    
    if (!onPenalty) {
      // Just show toast notification if no penalty handler
      toast.error(`Penalty applied: Outside allowed zone for extended period (${distance}m)`);
      return;
    }
    
    // Calculate duration in minutes
    const durationMs = new Date() - geofenceViolationStartTime.current;
    const durationMinutes = Math.round(durationMs / 60000);
    
    // Call parent penalty handler
    onPenalty({
      type: 'GEOFENCE_VIOLATION',
      details: {
        location: { lat, lng },
        distanceOutsideZone: distance,
        durationInMinutes: durationMinutes,
        timestamp: new Date().toISOString()
      }
    });
    
    // Show toast notification
    toast.error(`Penalty applied: Outside allowed zone for ${durationMinutes} minutes (${distance}m)`);
    
    // Also show an alert on the map
    showGeofenceAlert(`Penalty applied: Outside allowed zone for ${durationMinutes} minutes (${distance}m)`);
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
    
    // Check if in geofence with enhanced violation handling
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
      isInGeofence: inGeofence,
      isViolatingGeofence: geofenceViolation,
      violationDuration: geofenceViolationStartTime.current 
        ? Math.round((new Date() - geofenceViolationStartTime.current) / 1000) 
        : 0,
      distanceFromGeofence: !inGeofence ? calculateDistanceFromGeofence(latitude, longitude) : 0
    };
    
    setUserLocation(locationData);
    setIsInParkingZone(inGeofence);
    
    // Notify parent component with enhanced data
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
  
  // Function to fix the map initialization issue
  const cleanupExistingMap = (container) => {
    // Remove any existing map instance
    if (container) {
      // Check if the container has a Leaflet map instance
      const existingLeafletMap = L.DomUtil.get(container);
      if (existingLeafletMap && existingLeafletMap._leaflet_id) {
        // Clean up the existing map properly
        existingLeafletMap._leaflet_id = null;
        
        // Remove all child nodes from the container
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    }
  };

  // Initialize map and location tracking
  useEffect(() => {
    // Ensure we only initialize once and when DOM is ready
    if (!mapContainerRef.current) return;
    
    // Log what we're working with
    console.log('Attempting to initialize map with:', { 
      bookingId: bookingData?._id,
      endStation,
      geofenceCenter
    });
    
    // Validate center coordinates
    if (!geofenceCenter || geofenceCenter[0] === undefined || geofenceCenter[1] === undefined) {
      console.error('Invalid geofence center coordinates:', geofenceCenter);
      if (isMountedRef.current) {
        toast.error('Could not initialize map: Invalid location data');
      }
      return;
    }
    
    // Generate a unique stable ID for the map container to prevent initialization issues
    const mapId = mapIdRef.current;
    const container = mapContainerRef.current;
    container.id = mapId;
    
    // Clean up existing map if one exists
    cleanupExistingMap(container);
    
    // Clear any existing map in our ref
    if (mapRef.current) {
      try {
        mapRef.current.off();
        mapRef.current.remove();
      } catch (e) {
        console.error('Error removing existing map:', e);
      }
      mapRef.current = null;
    }
    
    // Set isMountedRef to true when this effect runs
    isMountedRef.current = true;
    let mapInitialized = false;
    
    // Force a small delay to make sure the container is fully rendered
    const initTimer = setTimeout(() => {
      if (!isMountedRef.current) return; // Don't initialize if unmounted
      
      try {
        // Create map instance with animation disabled to prevent race conditions
        console.log('Initializing map with ID:', mapId);
        const map = L.map(mapId, { 
          zoomControl: true,
          zoomAnimation: false, // Disable zoom animation to prevent errors
          fadeAnimation: false, // Disable fade animation
          markerZoomAnimation: false, // Disable marker animations
          preferCanvas: true, // Use canvas for better performance
          renderer: L.canvas() // Force canvas renderer
        }).setView(geofenceCenter, 15);
        
        mapRef.current = map;
        mapInitialized = true;
        
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
        
        // Only add button if map is still mounted
        if (isMountedRef.current && map.getContainer()) {
          map.getContainer().appendChild(simulationButton);
        }
        
        // Add destination station marker and geofence polygon
        // Add destination marker with orange color
        const destinationIcon = L.divIcon({
          className: 'geofence-marker',
          html: '<div style="width:24px;height:24px;"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        if (isMountedRef.current) {
          // Check if map is still valid before adding more elements
          try {
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
            
            // Use a safer approach to set bounds without animation
            if (geofencePolygonRef.current && map) {
              try {
                // Disable animation temporarily during initial fitBounds
                const originalAnimate = map._animate;
                map._animate = false;
                
                map.fitBounds(geofencePolygonRef.current.getBounds(), { 
                  padding: [50, 50],
                  animate: false // Explicitly disable animation
                });
                
                // Restore original animation setting
                map._animate = originalAnimate;
              } catch (e) {
                console.error('Error setting map bounds:', e);
              }
            }
          } catch (e) {
            console.error('Error adding elements to map:', e);
          }
        }

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

        // Instead of the while loop for canceling animations, use this approach
        if (window.requestAnimationFrame) {
          // Store animation frame ID
          const frameId = window.requestAnimationFrame(() => {});
          animationFrameIds.current.push(frameId);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        if (isMountedRef.current) {
          toast.error('Failed to initialize map: ' + error.message);
        }
      }
    }, 100);

    // Clean up resources when component unmounts
    return () => {
      console.log('LiveLocationMap unmounting, cleaning up resources');
      
      // Clear timeout without reassigning any refs
      if (initTimer) {
        clearTimeout(initTimer);
      }
      
      // Cancel any pending animations more safely - without using refs that might cause issues
      try {
        // Cancel any saved animation frames
        animationFrameIds.current.forEach(id => {
          window.cancelAnimationFrame(id);
        });
        animationFrameIds.current = [];
      } catch (e) {
        console.error('Error canceling animations:', e);
      }
      
      // Clear geolocation watch safely
      try {
        if (watchIdRef.current) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      } catch (e) {
        console.error('Error clearing geolocation watch:', e);
      }
      
      // Remove map instance safely
      if (mapRef.current) {
        try {
          // Remove event listeners first
          mapRef.current.off();
          
          // Remove layers
          if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
          }
          
          if (circleRef.current) {
            circleRef.current.remove();
            circleRef.current = null;
          }
          
          if (geofencePolygonRef.current) {
            geofencePolygonRef.current.remove();
            geofencePolygonRef.current = null;
          }
          
          // Turn off animations before removal
          if (mapRef.current._mapPane) {
            mapRef.current.options.zoomAnimation = false;
            mapRef.current.options.fadeAnimation = false;
            mapRef.current.options.markerZoomAnimation = false;
          }
          
          // Finally remove the map
          mapRef.current.remove();
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
        mapRef.current = null;
      }
    };
  }, [geofenceCenter]);
  
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
  
  // Add a useEffect hook solely dedicated to mounting state management
  // This should be separate from other effects to avoid conflicts
  useEffect(() => {
    console.log('LiveLocationMap mounted - setting ref');
    // Set mounted flag
    isMountedRef.current = true;
    
    return () => {
      console.log('LiveLocationMap unmounting - clearing mounted ref');
      // Clear mounted flag
      isMountedRef.current = false;
    };
  }, []);
  
  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainerRef} 
        style={{ width: '100%', height: height }}
        className="leaflet-container"
      ></div>
      
      {/* Geofence indicator overlay with enhanced violation info */}
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
            
            {geofenceViolation && (
              <div className="text-red-700 text-xs mt-1 font-bold">
                Geofence violation detected!
                {geofenceViolationStartTime.current && (
                  <div>
                    Duration: {Math.round((new Date() - geofenceViolationStartTime.current) / 1000)}s
                  </div>
                )}
                {geofenceViolationDistance.current > 0 && (
                  <div>
                    Distance: {geofenceViolationDistance.current}m outside
                  </div>
                )}
              </div>
            )}
            
            {penaltyCooldown.current && (
              <div className="text-red-700 text-xs mt-1">
                Penalty applied
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