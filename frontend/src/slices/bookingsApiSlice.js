import { apiSlice } from './apiSlice';

const BOOKINGS_URL = '/bookings';

export const bookingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Queries
    getBookings: builder.query({
      query: () => ({
        url: BOOKINGS_URL,
      }),
      transformResponse: (response) => {
        console.log('Transformed booking data:', response);
        return response;
      },
      keepUnusedDataFor: 5,
      providesTags: ['Booking'],
    }),
    getMyBookings: builder.query({
      query: () => ({
        url: `${BOOKINGS_URL}/my-bookings`,
      }),
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
      query: ({ id, status, damageReport, penaltyAmount, penaltyReason }) => ({
        url: `${BOOKINGS_URL}/${id}/status`,
        method: 'PUT',
        body: { status, damageReport, penaltyAmount, penaltyReason },
      }),
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