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
  const mapContainerId = `map-container-${id}`;
  const containerRef = useRef(null);
  const [mapKey] = useState(`leaflet-${id}-${Date.now()}`);

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

  // Fix Leaflet's icon loading issues once when component mounts
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });
    
    // Set client-side rendering flag
    setIsClient(true);

    // Cleanup any existing map with this ID when component unmounts
    return () => {
      if (mapRef.current) {
        console.log(`Cleaning up map ${mapContainerId}`);
        try {
          // Attempt to properly remove the map
          mapRef.current.remove();
          mapRef.current = null;
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
      }
    };
  }, [mapContainerId]);

  // Wait until we're on the client side to render the map
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
      key={mapKey}
    >
      <MapContainer
        key={mapKey}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          console.log(`Map ${mapContainerId} created`);
          mapRef.current = map;
          setMapReady(true);
          
          // Apply any fixes needed for React strict mode
          setTimeout(() => {
            if (map && map.invalidateSize) {
              map.invalidateSize();
            }
          }, 0);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {mapReady && (
          <MapConsumer>
            {(map) => {
              // Store map reference if not already set
              if (!mapRef.current) {
                mapRef.current = map;
              }
              
              // Only return children when map is ready
              return children;
            }}
          </MapConsumer>
        )}
      </MapContainer>
    </div>
  );
});

export default MapWrapper; 