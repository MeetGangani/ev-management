import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import './index.css';
import store from './store';
import { Provider } from 'react-redux';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen.jsx';
import RegisterScreen from './screens/RegisterScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import StationsScreen from './screens/StationsScreen.jsx';
import StationDetailScreen from './screens/StationDetailScreen.jsx';
import BookingScreen from './screens/BookingScreen.jsx';
import MyBookingsScreen from './screens/MyBookingsScreen.jsx';
import AdminDashboardScreen from './screens/AdminDashboardScreen.jsx';
import AdminStationsScreen from './screens/AdminStationsScreen.jsx';
import AdminStationEVsScreen from './screens/AdminStationEVsScreen.jsx';
import StationMastersScreen from './screens/StationMastersScreen.jsx';
import StationMasterDashboardScreen from './screens/StationMasterDashboardScreen.jsx';
import StationBookingsScreen from './screens/StationBookingsScreen.jsx';
import ActiveRideScreen from './screens/ActiveRideScreen.jsx';
import CustomerDashboardScreen from './screens/CustomerDashboardScreen.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import StationMasterRoute from './components/StationMasterRoute.jsx';
import VerifiedCustomerRoute from './components/VerifiedCustomerRoute.jsx';
import EditStationScreen from './screens/EditStationScreen.jsx';
import PenaltyDashboardScreen from './screens/PenaltyDashboardScreen.jsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route index={true} path='/' element={<HomeScreen />} />
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      
      {/* Customer Routes - Moved outside of private routes for direct access */}
      <Route path='/stations' element={<StationsScreen />} />
      <Route path='/stations/:id' element={<StationDetailScreen />} />
      <Route path='/booking/:evId' element={<BookingScreen />} />
      
      {/* Private Routes */}
      <Route path='' element={<PrivateRoute />}>
        <Route path='/profile' element={<ProfileScreen />} />
        <Route path='/my-bookings' element={<MyBookingsScreen />} />
        <Route path='/ride/:bookingId' element={<ActiveRideScreen />} />
        <Route path='/dashboard' element={<CustomerDashboardScreen />} />
        
        {/* Admin Routes */}
        <Route path='/admin' element={<AdminRoute />}>
          <Route index element={<AdminDashboardScreen />} />
          <Route path='station-masters' element={<StationMastersScreen />} />
          <Route path='stations' element={<AdminStationsScreen />} />
          <Route path='stations/:stationId/edit' element={<EditStationScreen />} />
          <Route path='stations/:stationId/evs' element={<AdminStationEVsScreen />} />
          <Route path='penalties' element={<PenaltyDashboardScreen />} />
        </Route>
        
        {/* Station Master Routes */}
        <Route path='/station-master' element={<StationMasterRoute />}>
          <Route index element={<StationMasterDashboardScreen />} />
          <Route path='bookings' element={<StationBookingsScreen />} />
        </Route>
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);
