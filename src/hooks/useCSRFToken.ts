'use client';

import { useState, useEffect, useCallback } from 'react';

interface CSRFTokenState {
  token: string | null;
  loading: boolean;
  error: Error | null;
}

export function useCSRFToken() {
  const [state, setState] = useState<CSRFTokenState>({
    token: null,
    loading: true,
    error: null,
  });

  const fetchToken = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
      }

      const data = await response.json();
      
      setState({
        token: data.token,
        loading: false,
        error: null,
      });
      
      return data.token;
    } catch (error) {
      setState({
        token: null,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      });
      return null;
    }
  }, []);

  const refreshToken = useCallback(async () => {
    return fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return {
    token: state.token,
    loading: state.loading,
    error: state.error,
    refreshToken,
  };
}