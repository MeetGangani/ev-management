import React from 'react';

const PenaltyDisplay = ({ penalties = [], loading = false, error = null, showDetails = true }) => {
  if (loading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-center">Loading penalties...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  
  if (!penalties || penalties.length === 0) {
    return (
      <div className="p-4 bg-green-50 rounded-lg">
        <p className="text-green-500 text-center">No penalties applied to this booking</p>
      </div>
    );
  }
  
  // Calculate total amount
  const totalAmount = penalties.reduce((sum, penalty) => sum + (penalty.amount || 0), 0);
  
  return (
    <div className="penalties-container border border-red-200 rounded-lg overflow-hidden">
      <div className="bg-red-100 p-3 border-b border-red-200">
        <h3 className="text-lg font-semibold text-red-800">Penalties</h3>
      </div>
      
      <div className="divide-y divide-red-100">
        {penalties.map((penalty, index) => (
          <div key={penalty._id || index} className="p-3 hover:bg-red-50">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-red-700">{penalty.title}</h4>
                <p className="text-sm text-gray-600">{penalty.description}</p>
                
                {showDetails && penalty.details && (
                  <div className="mt-2 text-xs text-gray-500">
                    {penalty.details.timestamp && (
                      <div>Time: {new Date(penalty.details.timestamp).toLocaleString()}</div>
                    )}
                    
                    {penalty.details.location && (
                      <div>Location: {typeof penalty.details.location === 'object' 
                        ? `${penalty.details.location.lat.toFixed(6)}, ${penalty.details.location.lng.toFixed(6)}`
                        : penalty.details.location
                      }</div>
                    )}
                    
                    {penalty.details.damageDetails && (
                      <div>Damage: {penalty.details.damageDetails}</div>
                    )}
                    
                    {penalty.details.distanceOutsideZone && (
                      <div>Distance outside zone: {penalty.details.distanceOutsideZone}m</div>
                    )}
                    
                    {penalty.details.durationInMinutes && (
                      <div>Duration: {penalty.details.durationInMinutes} minutes</div>
                    )}
                    
                    {penalty.details.severity && (
                      <div>Severity: {penalty.details.severity}</div>
                    )}
                  </div>
                )}
              </div>
              
              <span className="font-bold text-red-700">₹{penalty.amount}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-red-50 flex justify-between items-center border-t border-red-200">
        <span className="font-semibold">Total Penalties</span>
        <span className="font-bold text-lg text-red-700">₹{totalAmount}</span>
      </div>
    </div>
  );
};

export default PenaltyDisplay; 