import { useCallback, useEffect, useState } from 'react'
import { vehicleInputSchema, type VehicleInput } from '../lib/schemas/schemas'
import { logger } from '@/lib/logger'

export function useURLState() {
  const [urlState, setUrlState] = useState<VehicleInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFromURL = useCallback(() => {
    setIsLoading(true);
    try {
      // Get URL search params
      const searchParams = new URLSearchParams(window.location.search);
      const stateParam = searchParams.get('state');

      if (!stateParam) {
        setUrlState(null);
        return;
      }

      // Parse the state from URL
      let urlParams;
      try {
        urlParams = JSON.parse(decodeURIComponent(stateParam));
      } catch {
        logger.warn('Failed to parse state from URL');
        setUrlState(null);
        setIsLoading(false);
        return;
      }

      if (!urlParams) {
        setUrlState(null);
        return;
      }

      // Validate the URL parameters against our schema
      const validatedInput = vehicleInputSchema.safeParse(urlParams);
      if (validatedInput.success) {
        setUrlState(validatedInput.data);
      } else {
        setUrlState(null);
      }
    } catch (error) {
      logger.warn('Error loading state from URL:', { error: String(error) });
      setUrlState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load state from URL on initial mount
  useEffect(() => {
    loadFromURL();
  }, [loadFromURL]);

  // Save state to URL
  const saveToURL = useCallback((state: VehicleInput) => {
    try {
      // Validate the state before saving
      const validatedInput = vehicleInputSchema.safeParse(state);
      if (validatedInput.success) {
        const serializedState = encodeURIComponent(JSON.stringify(validatedInput.data));
        const newURL = `${window.location.pathname}?state=${serializedState}`;
        window.history.pushState(null, '', newURL);
      }
    } catch (error) {
      logger.warn('Error saving state to URL:', { error: String(error) });
    }
  }, []);

  // Clear URL state
  const clearURLState = useCallback(() => {
    window.history.replaceState(null, '', window.location.pathname);
    setUrlState(null);
  }, []);

  return {
    urlState,
    saveToURL,
    clearURLState,
    isLoading
  };
}
