import { apiSlice } from './apiSlice';

const BOOKINGS_URL = '/bookings';

export const bookingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Queries
    getBookings: builder.query({
      query: () => ({
        url: `${BOOKINGS_URL}`,
      }),
      transformResponse: (response) => {
        console.log('Transformed bookings', response);
        return response;
      },
      providesTags: ['Booking'],
      keepUnusedDataFor: 5,
    }),
    getMyBookings: builder.query({
      query: () => ({
        url: `${BOOKINGS_URL}/my-bookings`,
      }),
      transformResponse: (response) => {
        console.log('Transforming my bookings data');
        // Ensure fare, pricePerHour, and station data are always present
        return response.map(booking => ({
          ...booking,
          fare: booking.fare || booking.totalCost || 0,
          evId: booking.evId ? {
            ...booking.evId,
            pricePerHour: booking.evId.pricePerHour || 0
          } : {},
          startStationId: booking.startStationId || {
            name: 'Unknown Station',
            address: 'No address available'
          },
          endStationId: booking.endStationId || {
            name: 'Unknown Station',
            address: 'No address available'
          }
        }));
      },
      keepUnusedDataFor: 5,
      providesTags: ['Booking'],
    }),
    getBookingById: builder.query({
      query: (id) => ({
        url: `${BOOKINGS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Booking'],
    }),
    getPenaltyStatistics: builder.query({
      query: () => ({
        url: `${BOOKINGS_URL}/penalty-stats`,
      }),
      transformResponse: (response) => {
        console.log('Transformed penalty stats:', response);
        
        // Ensure we always have valid data structure even if response is missing fields
        const transformedResponse = {
          totalPenaltyCount: response?.totalPenaltyCount || 0,
          totalPenaltyAmount: response?.totalPenaltyAmount || 0,
          customerPenalties: response?.customerPenalties || []
        };
        
        return transformedResponse;
      },
      keepUnusedDataFor: 5,
      providesTags: ['Booking'],
    }),

    // Mutations
    createBooking: builder.mutation({
      query: (data) => ({
        url: BOOKINGS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Booking', 'EV'],
    }),
    updateBookingStatus: builder.mutation({
      query: ({ id, status, damageReport, penaltyAmount, penaltyReason }) => {
        // Sanitize ID and ensure proper URL formation
        const sanitizedId = id.trim();
        console.log(`Making status update request to: ${BOOKINGS_URL}/${sanitizedId}/status with status ${status}`);
        
        // Create a body object with only defined values to prevent sending undefined fields
        const body = { status };
        
        // Only add these fields if they are defined
        if (damageReport !== undefined) body.damageReport = damageReport;
        if (penaltyAmount !== undefined) body.penaltyAmount = penaltyAmount;
        if (penaltyReason !== undefined) body.penaltyReason = penaltyReason;
        
        console.log('Request body:', body);
        
        return {
          url: `${BOOKINGS_URL}/${sanitizedId}/status`,
          method: 'PUT',
          body,
        };
      },
      invalidatesTags: ['Booking'],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `${BOOKINGS_URL}/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Booking', 'EV'],
    }),
    reportDamage: builder.mutation({
      query: ({ id, damageDescription, penaltyAmount, images }) => ({
        url: `${BOOKINGS_URL}/${id}/damage-report`,
        method: 'POST',
        body: { damageDescription, penaltyAmount, images },
      }),
      invalidatesTags: ['Booking'],
    }),
    updateUserLocation: builder.mutation({
      query: ({ bookingId, location }) => ({
        url: `${BOOKINGS_URL}/${bookingId}/location`,
        method: 'PUT',
        body: { location },
      }),
    }),
    updateBooking: builder.mutation({
      query: ({ bookingId, ...data }) => ({
        url: `${BOOKINGS_URL}/${bookingId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBookingLocation: builder.mutation({
      query: ({ bookingId, location, penalty }) => ({
        url: `${BOOKINGS_URL}/${bookingId}/location`,
        method: 'PUT',
        body: { location, penalty },
      }),
    }),
    // For testing - add test penalties
    addTestPenalty: builder.mutation({
      query: ({ bookingId, penaltyAmount, reason }) => {
        // Ensure proper URL format
        const sanitizedBookingId = bookingId.trim();
        console.log(`Making test penalty request to: ${BOOKINGS_URL}/${sanitizedBookingId}/test-penalty`);
        
        return {
          url: `${BOOKINGS_URL}/${sanitizedBookingId}/test-penalty`,
          method: 'POST',
          body: { penaltyAmount, reason },
        };
      },
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useGetPenaltyStatisticsQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
  useCancelBookingMutation,
  useReportDamageMutation,
  useUpdateUserLocationMutation,
  useUpdateBookingMutation,
  useUpdateBookingLocationMutation,
  useAddTestPenaltyMutation,
} = bookingsApiSlice; 