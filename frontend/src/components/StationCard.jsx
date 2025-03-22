const StationCard = ({ station }) => {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold">{station.name}</h3>
      <p className="text-gray-600">{station.address}</p>
      <div className="mt-2">
        <span className="font-medium">Available EVs: </span>
        <span className={`${station.availableEVs > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {station.availableEVs}
        </span>
      </div>
      {/* ... other station details ... */}
    </div>
  );
}; 