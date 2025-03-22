import { apiSlice } from './apiSlice';
const USERS_URL = '/users';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: 'POST',
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: 'POST',
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: 'POST',
        body: data,
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: 'PUT',
        body: data,
      }),
    }),
    verifyAadhar: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-aadhar`,
        method: 'POST',
        body: data,
      }),
    }),
    createStationMaster: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/admin/create-station-master`,
        method: 'POST',
        body: data,
      }),
    }),
    getStationMasters: builder.query({
      query: () => ({
        url: `${USERS_URL}/admin/station-masters`,
        method: 'GET',
      }),
      providesTags: ['StationMasters'],
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: `${USERS_URL}/admin/users`,
        method: 'GET',
      }),
      providesTags: ['Users'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateUserMutation,
  useVerifyAadharMutation,
  useCreateStationMasterMutation,
  useGetStationMastersQuery,
  useGetAllUsersQuery,
} = usersApiSlice;
