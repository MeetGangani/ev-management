import React from 'react';
import Loader from './Loader';

// This is a wrapper around Loader to maintain compatibility with components expecting a "Spinner"
const Spinner = ({ size }) => {
  return <Loader />;
};

export default Spinner; 