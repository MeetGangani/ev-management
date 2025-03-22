import { apiSlice } from './apiSlice';

const STATIONS_URL = '/stations';

// Utility function to log API calls for debugging
const logApiCall = (name, url, method = 'GET', body = null) => {
  console.log(`🔍 API Call: ${name}`);
  console.log(`URL: ${url}`);
  console.log(`Method: ${method}`);
  if (body) console.log('Body:', body);
};

export const stationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStations: builder.query({
      query: () => {
        logApiCall('getStations', STATIONS_URL);
        return {
          url: STATIONS_URL,
        };
      },
      keepUnusedDataFor: 5,
      providesTags: ['Station'],
    }),
    getStationById: builder.query({
      query: (stationId) => {
        const url = `${STATIONS_URL}/${stationId}`;
        logApiCall('getStationById', url);
        return {
          url,
        };
      },
      keepUnusedDataFor: 5,
      providesTags: ['Station'],
    }),
    getNearestStations: builder.query({
      query: ({ lat, lng, maxDistance = 10000 }) => {
        const url = `${STATIONS_URL}/nearest?latitude=${lat}&longitude=${lng}&maxDistance=${maxDistance}`;
        logApiCall('getNearestStations', url);
        return {
          url,
        };
      },
      keepUnusedDataFor: 5,
      providesTags: ['Station'],
    }),
    // Admin endpoints
    createStation: builder.mutation({
      query: (data) => ({
        url: `${STATIONS_URL}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Station'],
    }),
    updateStation: builder.mutation({
      query: ({ stationId, data }) => {
        const url = `${STATIONS_URL}/${stationId}`;
        logApiCall('updateStation', url, 'PUT', data);
        return {
          url,
          method: 'PUT',
          body: data,
        };
      },
      // Invalidate specific station and all stations
      invalidatesTags: (result, error, { stationId }) => 
        error ? [] : [{ type: 'Station', id: stationId }, 'Station'],
    }),
    deleteStation: builder.mutation({
      query: (stationId) => ({
        url: `${STATIONS_URL}/${stationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Station'],
    }),
    assignStationMaster: builder.mutation({
      query: ({ stationId, stationMasterId }) => {
        const url = `${STATIONS_URL}/${stationId}/assign-station-master`;
        logApiCall('assignStationMaster', url, 'POST', { stationMasterId });
        return {
          url,
          method: 'POST',
          body: { stationMasterId },
        };
      },
      invalidatesTags: ['Station'],
    }),
  }),
});

export const {
  useGetStationsQuery,
  useGetStationByIdQuery,
  useGetNearestStationsQuery,
  useCreateStationMutation,
  useUpdateStationMutation,
  useDeleteStationMutation,
  useAssignStationMasterMutation,
} = stationsApiSlice; 