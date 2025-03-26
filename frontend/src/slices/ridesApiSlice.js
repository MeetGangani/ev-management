import { apiSlice } from './apiSlice';

export const ridesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all rides
    getRides: builder.query({
      query: () => '/rides',
      providesTags: ['Ride'],
      keepUnusedDataFor: 5,
    }),
    
    // Get ride details by ID
    getRideDetails: builder.query({
      query: (id) => `/rides/${id}`,
      providesTags: ['Ride'],
      keepUnusedDataFor: 5,
    }),
    
    // Get active ride (if any) for the logged-in user
    getActiveRide: builder.query({
      query: () => '/rides/active',
      providesTags: ['Ride'],
      keepUnusedDataFor: 5,
    }),
    
    // Get active ride for a specific customer (admin/station master use)
    getCustomerActiveRide: builder.query({
      query: (customerId) => `/rides/customer/${customerId}/active`,
      providesTags: ['Ride'],
      keepUnusedDataFor: 5,
    }),
    
    // Start a new ride
    startRide: builder.mutation({
      query: (data) => ({
        url: '/rides/start',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Ride', 'Booking', 'EV'],
    }),
    
    // End an active ride
    endRide: builder.mutation({
      query: (rideId) => ({
        url: `/rides/${rideId}/end`,
        method: 'PUT',
      }),
      invalidatesTags: ['Ride', 'Booking', 'EV'],
    }),
    
    // Get ride statistics (admin/station master)
    getRideStats: builder.query({
      query: () => '/rides/stats',
      keepUnusedDataFor: 5,
    }),
    
    // Get user ride history
    getUserRideHistory: builder.query({
      query: () => '/rides/history',
      providesTags: ['Ride'],
      keepUnusedDataFor: 5,
    }),
    
    // Rate a completed ride
    rateRide: builder.mutation({
      query: (data) => ({
        url: `/rides/${data.rideId}/rate`,
        method: 'POST',
        body: { rating: data.rating, feedback: data.feedback },
      }),
      invalidatesTags: ['Ride'],
    }),
    
    // Report an issue with a ride
    reportRideIssue: builder.mutation({
      query: (data) => ({
        url: `/rides/${data.rideId}/report`,
        method: 'POST',
        body: { issue: data.issue, details: data.details },
      }),
      invalidatesTags: ['Ride'],
    }),
  }),
});

export const {
  useGetRidesQuery,
  useGetRideDetailsQuery,
  useGetActiveRideQuery,
  useGetCustomerActiveRideQuery,
  useStartRideMutation,
  useEndRideMutation,
  useGetRideStatsQuery,
  useGetUserRideHistoryQuery,
  useRateRideMutation,
  useReportRideIssueMutation,
} = ridesApiSlice; 