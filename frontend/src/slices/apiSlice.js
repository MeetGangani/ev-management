import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: '/api' });

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ['User', 'Station', 'EV', 'Booking'],
  endpoints: (builder) => ({}),
});
