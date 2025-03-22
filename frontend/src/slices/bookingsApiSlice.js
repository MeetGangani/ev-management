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
        url: `${BOOKINGS_URL}/my`,
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
      query: ({ id, status }) => ({
        url: `${BOOKINGS_URL}/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Booking', 'EV'],
    }),
    cancelBooking: builder.mutation({
      query: (id) => ({
        url: `${BOOKINGS_URL}/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Booking', 'EV'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
  useCancelBookingMutation,
} = bookingsApiSlice; 