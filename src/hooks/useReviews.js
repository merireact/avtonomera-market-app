import { useState, useEffect, useCallback } from 'react';
import { fetchReviews, addReview as apiAddReview, deleteReview as apiDeleteReview } from '../api/reviews';
import reviewsData from '../data/reviews.json';

export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const { data, error: err } = await fetchReviews();
    if (err) {
      setError(err);
      setReviews(reviewsData);
    } else {
      setError(null);
      setReviews(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const addReview = useCallback(
    async (payload) => {
      const { data, error: err } = await apiAddReview(payload);
      if (err) return { error: err };
      await load();
      return { data };
    },
    [load]
  );

  const deleteReview = useCallback(
    async (reviewId) => {
      const { error: err } = await apiDeleteReview(reviewId);
      if (err) return { error: err };
      await load();
      return {};
    },
    [load]
  );

  return { reviews, loading, error, refetch: load, addReview, deleteReview };
}
