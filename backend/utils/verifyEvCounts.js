const verifyEvCounts = asyncHandler(async (stationId) => {
  const station = await Station.findById(stationId).populate('evs');
  
  if (!station) {
    throw new Error('Station not found');
  }

  // Count available EVs
  const actualAvailableCount = station.evs.filter(ev => ev.status === 'available').length;

  // Update if count is incorrect
  if (station.availableEVs !== actualAvailableCount) {
    await Station.findByIdAndUpdate(stationId, {
      availableEVs: actualAvailableCount
    });
    console.log(`Fixed EV count for station ${station.name}: ${station.availableEVs} → ${actualAvailableCount}`);
  }

  return actualAvailableCount;
}); 