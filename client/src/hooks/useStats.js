import { useState, useEffect } from 'react';
import { fetchStats } from '../api/stats';
import { mapStatsResponse, EMPTY_STATS } from '../utils/statsHelpers';

export function useStats() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats()
      .then(raw => setStats(mapStatsResponse(raw)))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  return { stats, isLoading, error };
}
