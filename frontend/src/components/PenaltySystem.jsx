import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const PENALTY_TYPES = {
  VEHICLE_DAMAGE: {
    id: 'vehicle_damage',
    title: 'Vehicle Damage',
    description: 'Penalty for damaging the vehicle during your ride',
    baseAmount: 500
  },
  LATE_CANCELLATION: {
    id: 'late_cancellation',
    title: 'Last-minute Cancellation',
    description: 'Penalty for cancelling booking less than 30 minutes before ride',
    baseAmount: 100
  },
  IMPROPER_PARKING: {
    id: 'improper_parking',
    title: 'Improper Parking/Return',
    description: 'Penalty for returning vehicle outside designated area',
    baseAmount: 200
  },
  GEOFENCE_VIOLATION: {
    id: 'geofence_violation',
    title: 'Geofence Violation',
    description: 'Penalty for traveling outside allowed zone',
    baseAmount: 150
  }
};

const PenaltySystem = ({ 
  bookingId,
  userId,
  onPenaltyAdded = null,
  onPenaltyRemoved = null
}) => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch existing penalties on component mount
  useEffect(() => {
    if (bookingId) {
      fetchPenalties();
    }
  }, [bookingId]);
  
  // Fetch penalties from the API
  const fetchPenalties = async () => {
    if (!bookingId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/penalties?bookingId=${bookingId}`);
      setPenalties(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching penalties:', err);
      setError('Failed to load penalties. Please try again.');
      toast.error('Could not load penalty information');
    } finally {
      setLoading(false);
    }
  };
  
  // Add a new penalty
  const addPenalty = async (penaltyType, details = {}, amount = null) => {
    if (!bookingId || !userId) {
      toast.error('Missing booking or user information');
      return false;
    }
    
    const penaltyTypeInfo = PENALTY_TYPES[penaltyType];
    if (!penaltyTypeInfo) {
      toast.error('Invalid penalty type');
      return false;
    }
    
    const penaltyAmount = amount || penaltyTypeInfo.baseAmount;
    
    setLoading(true);
    try {
      const response = await axios.post('/api/penalties', {
        bookingId,
        userId,
        type: penaltyTypeInfo.id,
        amount: penaltyAmount,
        title: penaltyTypeInfo.title,
        description: penaltyTypeInfo.description,
        details,
        timestamp: new Date().toISOString()
      });
      
      // Add the new penalty to the state
      const newPenalty = response.data;
      setPenalties(prev => [...prev, newPenalty]);
      
      // Notify parent component
      if (onPenaltyAdded) {
        onPenaltyAdded(newPenalty);
      }
      
      toast.success(`${penaltyTypeInfo.title} penalty applied`);
      return true;
    } catch (err) {
      console.error('Error adding penalty:', err);
      toast.error('Failed to apply penalty');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Remove a penalty (for admin use)
  const removePenalty = async (penaltyId) => {
    if (!penaltyId) return false;
    
    setLoading(true);
    try {
      await axios.delete(`/api/penalties/${penaltyId}`);
      
      // Remove the penalty from state
      setPenalties(prev => prev.filter(p => p._id !== penaltyId));
      
      // Notify parent component
      if (onPenaltyRemoved) {
        onPenaltyRemoved(penaltyId);
      }
      
      toast.success('Penalty removed successfully');
      return true;
    } catch (err) {
      console.error('Error removing penalty:', err);
      toast.error('Failed to remove penalty');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Add specific penalty functions for different violation types
  const addVehicleDamagePenalty = (damageDetails, severity = 'medium') => {
    // Calculate amount based on severity
    let multiplier = 1;
    if (severity === 'high') multiplier = 2;
    if (severity === 'low') multiplier = 0.5;
    
    const amount = PENALTY_TYPES.VEHICLE_DAMAGE.baseAmount * multiplier;
    
    return addPenalty('VEHICLE_DAMAGE', {
      damageDetails,
      severity,
      reportedAt: new Date().toISOString()
    }, amount);
  };
  
  const addLateCancellationPenalty = (minutesBeforeRide) => {
    // Calculate penalty based on how late the cancellation was
    let multiplier = 1;
    if (minutesBeforeRide < 15) multiplier = 1.5;
    if (minutesBeforeRide < 5) multiplier = 2;
    
    const amount = PENALTY_TYPES.LATE_CANCELLATION.baseAmount * multiplier;
    
    return addPenalty('LATE_CANCELLATION', {
      minutesBeforeRide,
      cancelledAt: new Date().toISOString()
    }, amount);
  };
  
  const addImproperParkingPenalty = (location, distanceFromStation) => {
    // Calculate penalty based on distance from proper parking
    let multiplier = 1;
    if (distanceFromStation > 100) multiplier = 1.5;
    if (distanceFromStation > 500) multiplier = 2;
    
    const amount = PENALTY_TYPES.IMPROPER_PARKING.baseAmount * multiplier;
    
    return addPenalty('IMPROPER_PARKING', {
      location,
      distanceFromStation,
      timestamp: new Date().toISOString()
    }, amount);
  };
  
  const addGeofenceViolationPenalty = (location, distanceOutsideZone, durationInMinutes = 1) => {
    // Calculate penalty based on distance and duration outside geofence
    let multiplier = 1;
    if (distanceOutsideZone > 500) multiplier = 1.5;
    if (durationInMinutes > 10) multiplier += 0.5;
    if (durationInMinutes > 30) multiplier += 0.5;
    
    const amount = PENALTY_TYPES.GEOFENCE_VIOLATION.baseAmount * multiplier;
    
    return addPenalty('GEOFENCE_VIOLATION', {
      location,
      distanceOutsideZone,
      durationInMinutes,
      timestamp: new Date().toISOString()
    }, amount);
  };
  
  // Calculate the total penalty amount
  const getTotalPenaltyAmount = () => {
    return penalties.reduce((total, penalty) => total + (penalty.amount || 0), 0);
  };
  
  // Check if a specific type of penalty exists
  const hasPenaltyOfType = (penaltyType) => {
    return penalties.some(p => p.type === PENALTY_TYPES[penaltyType]?.id);
  };
  
  // Get all penalties of a specific type
  const getPenaltiesByType = (penaltyType) => {
    return penalties.filter(p => p.type === PENALTY_TYPES[penaltyType]?.id);
  };
  
  // Return utility functions to be used by parent components
  return {
    penalties,
    loading,
    error,
    totalAmount: getTotalPenaltyAmount(),
    addVehicleDamagePenalty,
    addLateCancellationPenalty,
    addImproperParkingPenalty,
    addGeofenceViolationPenalty,
    removePenalty,
    hasPenaltyOfType,
    getPenaltiesByType,
    refreshPenalties: fetchPenalties
  };
};

export default PenaltySystem; 