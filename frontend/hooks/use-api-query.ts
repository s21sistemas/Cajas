import { useState, useEffect } from 'react';
import { ApiError } from '@/lib/types';

interface UseApiQueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  options: UseApiQueryOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    onSuccess,
    onError,
    enabled = true,
    refetchOnWindowFocus = false
  } = options;

  const executeQuery = async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Error desconocido';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeQuery();
  }, [enabled]);

  useEffect(() => {
    if (refetchOnWindowFocus) {
      const handleFocus = () => executeQuery();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [refetchOnWindowFocus]);

  return {
    data,
    loading,
    error,
    refetch: executeQuery,
  };
}