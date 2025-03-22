import { apiSlice } from './apiSlice';

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params) => ({
        url: '/notifications',
        params
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Notification']
    }),
    
    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'PUT'
      }),
      invalidatesTags: ['Notification']
    }),
    
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT'
      }),
      invalidatesTags: ['Notification']
    }),
    
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Notification']
    })
  })
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation
} = notificationsApiSlice; 