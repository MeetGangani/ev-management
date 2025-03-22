import React from 'react';
import { Helmet } from 'react-helmet-async';

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
};

Meta.defaultProps = {
  title: 'EV Rental System',
  description: 'Rent electric vehicles for sustainable transportation',
  keywords: 'electric vehicles, EV, rental, sustainable, transportation, green energy',
};

export default Meta; 