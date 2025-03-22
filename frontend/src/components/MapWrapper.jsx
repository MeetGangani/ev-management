import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * MapWrapper component ensures the map loads only in the browser.
 * This prevents SSR issues with Leaflet which requires a browser environment.
 * Uses a more direct approach to handle React StrictMode remounting.
 */
const MapWrapper = ({ center, zoom, children, className, style, id = 'map' }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const mapContainerId = `map-container-${id}`;

  // Initialize the map when the component mounts
  useEffect(() => {
    // Make sure we're in the browser environment
    if (typeof window === 'undefined' || !mapContainerRef.current) {
      return;
    }

    // Prevent re-initialization if map instance already exists
    if (mapInstanceRef.current) {
      console.log(`Map ${mapContainerId} already exists, skipping initialization`);
      setMapReady(true);
      return;
    }

    // Fix Leaflet's icon loading issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Check if this container already has a map
    const container = mapContainerRef.current;
    if (container._leaflet_id) {
      console.log(`Container ${mapContainerId} already has a map, reusing`);
      return;
    }

    try {
      console.log(`Creating map ${mapContainerId}`);
      // Create new map instance
      const mapInstance = L.map(container, {
        center: center,
        zoom: zoom,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      // Store the map instance
      mapInstanceRef.current = mapInstance;
      setMapReady(true);
      console.log(`Map ${mapContainerId} created successfully`);
    } catch (e) {
      console.error('Error creating map:', e);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        try {
          console.log(`Removing map ${mapContainerId}`);
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.error('Error removing map:', e);
        }
      }
    };
  }, [center, zoom, mapContainerId]);

  // Since we cannot use react-leaflet components directly with our custom map instance,
  // we need to implement a different approach for showing child components
  useEffect(() => {
    // Only run this effect if the map is ready and we have children to show
    if (!mapReady || !mapInstanceRef.current || !children) return;

    const map = mapInstanceRef.current;
    
    // We could implement custom marker logic here
    // For example:
    // if (userLocation) {
    //   L.marker([userLocation.lat, userLocation.lng]).addTo(map);
    // }
    
    // For now, just make sure the map is rendered correctly
    map.invalidateSize();
    
  }, [mapReady, children]);

  return (
    <div
      id={mapContainerId}
      ref={mapContainerRef}
      style={{ ...style, position: 'relative' }}
      className={className}
    >
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          Loading map...
        </div>
      )}
    </div>
  );
};

export default MapWrapper; 