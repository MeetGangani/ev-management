/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point in degrees
 * @param {number} lon1 - Longitude of first point in degrees
 * @param {number} lat2 - Latitude of second point in degrees
 * @param {number} lon2 - Longitude of second point in degrees
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Convert degrees to radians
  const toRad = (value) => (value * Math.PI) / 180;
  
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
};

/**
 * Check if a coordinate is within a certain radius of another coordinate
 * @param {number} lat1 - Latitude of center point in degrees
 * @param {number} lon1 - Longitude of center point in degrees
 * @param {number} lat2 - Latitude of test point in degrees
 * @param {number} lon2 - Longitude of test point in degrees
 * @param {number} radius - Radius in kilometers
 * @returns {boolean} - True if the coordinate is within the radius
 */
export const isWithinRadius = (lat1, lon1, lat2, lon2, radius) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radius;
};

/**
 * Convert a coordinate to a human-readable address format
 * This is a placeholder function - in a real application, this would likely 
 * use a geocoding service like Google Maps API
 * @param {number} lat - Latitude in degrees
 * @param {number} lon - Longitude in degrees
 * @returns {string} - Human-readable address
 */
export const coordinatesToAddress = (lat, lon) => {
  // This is a placeholder - in a real application you'd likely use a geocoding service
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}; 