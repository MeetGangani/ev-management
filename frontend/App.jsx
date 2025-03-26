import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <Routes>
      <Route path="/map" element={<Map />} />
      {/* other routes */}
    </Routes>
  );
}; 