import { apiSlice } from './apiSlice';

export const paymentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserPayments: builder.query({
      query: () => ({
        url: '/api/payments/user',
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Payment'],
    }),
    getPaymentById: builder.query({
      query: (id) => ({
        url: `/api/payments/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),
    processPayment: builder.mutation({
      query: (data) => ({
        url: '/api/payments/process',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { bookingId }) => [
        'Payment',
        { type: 'Booking', id: bookingId }
      ],
    }),
    getPaymentStats: builder.query({
      query: () => ({
        url: '/api/payments/stats',
      }),
      keepUnusedDataFor: 5,
    }),
    cancelPayment: builder.mutation({
      query: (id) => ({
        url: `/api/payments/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        'Payment',
        { type: 'Payment', id }
      ],
    }),
    refundPayment: builder.mutation({
      query: ({ id, reason, refundAmount }) => ({
        url: `/api/payments/${id}/refund`,
        method: 'PUT',
        body: { reason, refundAmount },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Payment',
        { type: 'Payment', id }
      ],
    }),
  }),
});

export const {
  useGetUserPaymentsQuery,
  useGetPaymentByIdQuery,
  useProcessPaymentMutation,
  useGetPaymentStatsQuery,
  useCancelPaymentMutation,
  useRefundPaymentMutation,
} = paymentsApiSlice; 