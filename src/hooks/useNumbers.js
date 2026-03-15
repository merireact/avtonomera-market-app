import { useState, useEffect, useCallback } from 'react';
import { fetchNumbers } from '../api/numbers';
import numbersData from '../data/numbers.json';

export function useNumbers() {
  const [numbers, setNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const { data, error: err } = await fetchNumbers();
    if (err) {
      setError(err);
      setNumbers(numbersData);
    } else {
      setError(null);
      setNumbers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  return { numbers, loading, error, refetch: load };
}
