import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PenaltySystem from '../components/PenaltySystem';
import PenaltyDisplay from '../components/PenaltyDisplay';
import LiveLocationMap from '../components/LiveLocationMap';

const ActiveRideScreen = () => {
  const [penalties, setPenalties] = useState([]);
  const [totalPenaltyAmount, setTotalPenaltyAmount] = useState(0);
  const penaltySystemRef = useRef(null);
  
  useEffect(() => {
    if (booking?._id && user?._id) {
      penaltySystemRef.current = PenaltySystem({
        bookingId: booking._id,
        userId: user._id,
        onPenaltyAdded: (newPenalty) => {
          setPenalties(prev => [...prev, newPenalty]);
          setTotalPenaltyAmount(prev => prev + newPenalty.amount);
        },
        onPenaltyRemoved: (penaltyId) => {
          const penaltyToRemove = penalties.find(p => p._id === penaltyId);
          if (penaltyToRemove) {
            setPenalties(prev => prev.filter(p => p._id !== penaltyId));
            setTotalPenaltyAmount(prev => prev - penaltyToRemove.amount);
          }
        }
      });
      
      fetchPenalties();
    }
  }, [booking?._id, user?._id]);
  
  const fetchPenalties = async () => {
    if (!booking?._id) return;
    
    try {
      const response = await axios.get(`/api/penalties?bookingId=${booking._id}`);
      setPenalties(response.data || []);
      
      const total = (response.data || []).reduce((sum, penalty) => sum + penalty.amount, 0);
      setTotalPenaltyAmount(total);
    } catch (error) {
      console.error('Error fetching penalties:', error);
    }
  };
  
  const handleGeofencePenalty = (penaltyData) => {
    if (!penaltySystemRef.current) return;
    
    penaltySystemRef.current.addGeofenceViolationPenalty(
      penaltyData.details.location,
      penaltyData.details.distanceOutsideZone,
      penaltyData.details.durationInMinutes
    );
  };
  
  const handleImproperParking = async (location, distanceFromStation) => {
    if (!penaltySystemRef.current) return;
    
    await penaltySystemRef.current.addImproperParkingPenalty(
      location,
      distanceFromStation
    );
    
    toast.error(`Penalty applied: Improper parking (${distanceFromStation}m from station)`);
  };
  
  const handleVehicleDamageReport = async (damageDetails, severity) => {
    if (!penaltySystemRef.current) return;
    
    await penaltySystemRef.current.addVehicleDamagePenalty(
      damageDetails,
      severity
    );
    
    toast.error(`Penalty applied: Vehicle damage reported (${severity})`);
  };
  
  const handleCompleteRide = async () => {
    if (userLocation && booking?.endStationId) {
      const endStationLocation = {
        lat: booking.endStationId.latitude || booking.endStationId.location?.lat,
        lng: booking.endStationId.longitude || booking.endStationId.location?.lng
      };
      
      if (endStationLocation.lat && endStationLocation.lng) {
        const distance = calculateDistance(
          userLocation.position.lat,
          userLocation.position.lng,
          endStationLocation.lat,
          endStationLocation.lng
        );
        
        if (distance > 50) {
          await handleImproperParking(userLocation.position, distance);
          toast.warning(`You are ${distance}m away from the designated parking area. A penalty has been applied.`);
        }
      }
    }
    
    try {
      const response = await axios.post(`/api/bookings/${bookingId}/complete`);
      toast.success('Ride completed successfully!');
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error('Failed to complete the ride. Please try again.');
    }
  };
  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Active Ride</h1>
      
      {loading && <p className="text-gray-500">Loading ride details...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {booking && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Ride Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Vehicle:</span> {booking.vehicleId?.name || 'N/A'}</p>
              <p><span className="font-medium">Start Station:</span> {booking.startStationId?.name || 'N/A'}</p>
              <p><span className="font-medium">End Station:</span> {booking.endStationId?.name || 'N/A'}</p>
            </div>
            <div>
              <p><span className="font-medium">Started:</span> {new Date(booking.startTime).toLocaleString()}</p>
              <p><span className="font-medium">Duration:</span> {formatDuration(rideDuration)}</p>
              <p><span className="font-medium">Current Cost:</span> ₹{estimatedCost.toFixed(2)}</p>
            </div>
          </div>
          
          {penalties.length > 0 && (
            <div className="mt-4">
              <PenaltyDisplay 
                penalties={penalties} 
                showDetails={true}
              />
            </div>
          )}
          
          <div className="mt-4">
            <button
              onClick={handleCompleteRide}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Complete Ride
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Live Location</h2>
        <LiveLocationMap
          bookingData={booking}
          stations={stations}
          height="400px"
          watchPosition={true}
          onLocationUpdate={handleLocationUpdate}
          onPenalty={handleGeofencePenalty}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-xl font-semibold mb-2">Report an Issue</h2>
        <div className="mt-2">
          <button
            onClick={() => setShowDamageForm(!showDamageForm)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Report Vehicle Damage
          </button>
        </div>
        
        {showDamageForm && (
          <div className="mt-4 p-4 border border-yellow-300 rounded-lg bg-yellow-50">
            <h3 className="font-semibold mb-2">Report Vehicle Damage</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Damage Description
              </label>
              <textarea
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows="3"
                placeholder="Describe the damage..."
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={damageSeverity}
                onChange={(e) => setDamageSeverity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="low">Low (Minor scratches)</option>
                <option value="medium">Medium (Dents, broken lights)</option>
                <option value="high">High (Major damage, not drivable)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleVehicleDamageReport(damageDescription, damageSeverity);
                  setShowDamageForm(false);
                  setDamageDescription('');
                  setDamageSeverity('medium');
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
                disabled={!damageDescription.trim()}
              >
                Submit Report
              </button>
              <button
                onClick={() => setShowDamageForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-1 px-3 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveRideScreen; 