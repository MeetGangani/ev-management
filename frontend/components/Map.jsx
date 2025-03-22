import { MapContainer, TileLayer } from 'react-leaflet';
import { useEffect } from 'react';

const Map = () => {
  useEffect(() => {
    // Cleanup function
    return () => {
      // Clean up the map instance when component unmounts
      const container = document.getElementById('map-container');
      if (container._leaflet_id) {
        container._leaflet_id = null;
      }
    };
  }, []);

  return (
    <div id="map-container">
      <MapContainer
        key={Math.random()} // Only use this as a last resort
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );
};

export default Map; 