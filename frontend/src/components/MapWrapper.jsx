import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MapContainer, MapConsumer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * MapWrapper component ensures the map loads only in the browser.
 * This provides a simplified wrapper around react-leaflet's MapContainer that works better
 * with React's StrictMode and handles leaflet properly.
 */
const MapWrapper = forwardRef(({ center, zoom, children, className, style, id = 'map' }, ref) => {
  const [isClient, setIsClient] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const mapContainerId = `map-container-${id}-${Math.random().toString(36).substr(2, 9)}`; // Unique ID
  const containerRef = useRef(null);

  // Expose the map instance through the ref
  useImperativeHandle(ref, () => ({
    setView(center, zoom) {
      if (mapRef.current) {
        mapRef.current.setView(center, zoom);
      }
    },
    getMap() {
      return mapRef.current;
    }
  }));

  // Initialize Leaflet only once on client side
  useEffect(() => {
    setIsClient(true);

    // Fix Leaflet's icon loading issues
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Cleanup function
    return () => {
      if (mapRef.current) {
        console.log(`Cleaning up map ${mapContainerId}`);
        mapRef.current.remove();
        mapRef.current = null;
        setMapReady(false);
      }
    };
  }, []); // Empty dependency array - only run once

  if (!isClient) {
    return (
      <div
        id={mapContainerId}
        ref={containerRef}
        style={{ ...style, position: 'relative' }}
        className={className}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div
      id={mapContainerId}
      ref={containerRef}
      style={{ ...style, position: 'relative' }}
      className={className}
    >
      <MapContainer
        key={mapContainerId} // Use unique key
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          console.log(`Map ${mapContainerId} created`);
          mapRef.current = map;
          setMapReady(true);
          
          // Fix map size after a short delay
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {mapReady && children}
      </MapContainer>
    </div>
  );
});

export default MapWrapper; 