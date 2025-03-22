import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import LiveTrackingScreen from './screens/LiveTrackingScreen';

const App = () => {
  return (
    <>
      <Header />
      <ToastContainer />
      <div className="container mx-auto px-4 my-8">
        <Outlet />
      </div>
    </>
  );
};

export default App;
