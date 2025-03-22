import { apiSlice } from './apiSlice';

const EVS_URL = '/evs';

// Mock data for EVs to show when API call fails due to verification
const mockEVs = [
  {
    _id: '101',
    model: 'Tesla Model 3',
    manufacturer: 'Tesla',
    batteryCapacity: 75,
    batteryLevel: 90,
    range: 350,
    pricePerHour: 300,
    status: 'available',
    condition: 'excellent',
    features: 'Autopilot, Premium Sound System, 15" Touchscreen'
  },
  {
    _id: '102',
    model: 'Nissan Leaf',
    manufacturer: 'Nissan',
    batteryCapacity: 62,
    batteryLevel: 85,
    range: 270,
    pricePerHour: 200,
    status: 'available',
    condition: 'good',
    features: 'ProPilot Assist, 8" Touchscreen, Apple CarPlay'
  },
  {
    _id: '103',
    model: 'Hyundai Kona Electric',
    manufacturer: 'Hyundai',
    batteryCapacity: 64,
    batteryLevel: 95,
    range: 300,
    pricePerHour: 250,
    status: 'available',
    condition: 'excellent',
    features: 'BlueLink Connected Car, 10.25" Touchscreen, Heated Seats'
  },
  {
    _id: '104',
    model: 'MG ZS EV',
    manufacturer: 'MG',
    batteryCapacity: 50,
    batteryLevel: 80,
    range: 320,
    pricePerHour: 220,
    status: 'available',
    condition: 'good',
    features: 'i-SMART Connectivity, Panoramic Sunroof, PM 2.5 Filter'
  }
];

export const evsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Queries
    getEVs: builder.query({
      query: () => ({
        url: EVS_URL,
      }),
      keepUnusedDataFor: 5, // 5 seconds
      providesTags: ['EV'],
    }),
    getEVById: builder.query({
      query: (id) => ({
        url: `${EVS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['EV'],
      // Log responses for debugging
      transformResponse: (response, meta, arg) => {
        console.log('EV API success response:', response);
        return response;
      },
      // Log errors for debugging
      transformErrorResponse: (error, meta, arg) => {
        console.log('EV by ID API error:', error);
        return error;
      }
    }),
    getEVsByStation: builder.query({
      query: (stationId) => ({
        url: `${EVS_URL}/station/${stationId}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['EV'],
      // Log responses for debugging
      transformResponse: (response, meta, arg) => {
        console.log('EVs by station API success response:', response);
        return response;
      },
      // Log errors for debugging
      transformErrorResponse: (error, meta, arg) => {
        console.log('EVs by station API error:', error);
        return error;
      }
    }),

    // Mutations
    createEV: builder.mutation({
      query: (data) => ({
        url: EVS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EV'],
    }),
    updateEV: builder.mutation({
      query: ({ id, data }) => ({
        url: `${EVS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['EV'],
    }),
    deleteEV: builder.mutation({
      query: (id) => ({
        url: `${EVS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EV'],
    }),
    updateBatteryLevel: builder.mutation({
      query: ({ id, batteryLevel }) => ({
        url: `${EVS_URL}/${id}/battery`,
        method: 'PATCH',
        body: { batteryLevel },
      }),
      invalidatesTags: ['EV'],
    }),
    addMaintenanceRecord: builder.mutation({
      query: ({ id, data }) => ({
        url: `${EVS_URL}/${id}/maintenance`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EV'],
    }),
  }),
});

export const {
  useGetEVsQuery,
  useGetEVByIdQuery,
  useGetEVsByStationQuery,
  useCreateEVMutation,
  useUpdateEVMutation,
  useDeleteEVMutation,
  useUpdateBatteryLevelMutation,
  useAddMaintenanceRecordMutation,
} = evsApiSlice; 