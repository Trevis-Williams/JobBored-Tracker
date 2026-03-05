import { useState, useCallback } from 'react';
import api from '../api/axios';

export default function useScanner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [food, setFood] = useState(null);

  const lookupBarcode = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    setFood(null);

    try {
      const { data } = await api.get(`/food/barcode/${code}`);
      setFood(data);
      return data;
    } catch (err) {
      const msg =
        err.response?.status === 404
          ? 'Product not found. Try searching by name.'
          : 'Failed to look up product.';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setFood(null);
    setError(null);
    setLoading(false);
  }, []);

  return { food, loading, error, lookupBarcode, reset };
}
