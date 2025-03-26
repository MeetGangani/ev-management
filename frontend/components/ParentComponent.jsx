import React, { useState } from 'react';
import Map from './Map';

const ParentComponent = () => {
  const [showMap, setShowMap] = useState(true);

  return (
    <div>
      {showMap && <Map key="unique-map-key" />}
    </div>
  );
};

export default ParentComponent; 