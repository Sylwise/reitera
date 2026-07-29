import { useState, useEffect } from 'react';
import { fetchStats } from '../api/stats';
import { mapStatsResponse } from '../utils/statsHelpers';

export function useStats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  function load() {
    return fetchStats()
      .then(raw => setStats(mapStatsResponse(raw)))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }

  function refetch() {
    setError(null);
    setIsLoading(true);
    return load();
  }

  useEffect(() => { load(); }, []);

  return { stats, isLoading, error, refetch };
}
