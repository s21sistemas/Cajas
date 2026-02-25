import { useState } from 'react';
import { ApiError } from '@/lib/types';

interface UseApiMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: string, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: string | null, variables: TVariables) => void;
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseApiMutationOptions<TData, TVariables> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const { onSuccess, onError, onSettled } = options;

  const mutate = async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);

      const result = await mutationFn(variables);
      setData(result);

      onSuccess?.(result, variables);
      onSettled?.(result, null, variables);

      return result;
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError.message || 'Error desconocido';
      setError(errorMessage);

      onError?.(errorMessage, variables);
      onSettled?.(undefined, errorMessage, variables);

      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return {
    mutate,
    loading,
    error,
    data,
    reset,
    isSuccess: data !== null,
    isError: error !== null,
  };
}