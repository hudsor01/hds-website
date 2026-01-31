'use client';

import {
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import { FILING_STATUSES, type FilingStatus } from '@/types/paystub';

/**
 * URL state configuration for the paystub generator.
 * Enables shareable URLs with pre-filled form data.
 *
 * Example URL: /paystub-generator?name=John&rate=25&hours=40&status=single&state=TX
 */
const paystubParsers = {
  // Employee info
  name: parseAsString,
  id: parseAsString,
  employer: parseAsString,

  // Pay info
  rate: parseAsFloat,
  hours: parseAsFloat,

  // Tax info
  status: parseAsStringLiteral(FILING_STATUSES),
  year: parseAsInteger,
  state: parseAsString,
};

export interface PaystubUrlState {
  name: string | null;
  id: string | null;
  employer: string | null;
  rate: number | null;
  hours: number | null;
  status: FilingStatus | null;
  year: number | null;
  state: string | null;
}

export interface UsePaystubUrlStateReturn {
  urlState: PaystubUrlState;
  setUrlState: (state: Partial<PaystubUrlState>) => void;
  clearUrlState: () => void;
  hasUrlParams: boolean;
  generateShareableUrl: () => string;
}

/**
 * Hook for managing paystub form state in the URL.
 * Enables users to share pre-filled calculator links.
 *
 * @example
 * const { urlState, setUrlState, generateShareableUrl } = usePaystubUrlState();
 *
 * // Update URL when form changes
 * setUrlState({ name: 'John Doe', rate: 25 });
 *
 * // Get shareable link
 * const shareUrl = generateShareableUrl();
 */
export function usePaystubUrlState(): UsePaystubUrlStateReturn {
  const [urlState, setQueryStates] = useQueryStates(paystubParsers, {
    // Use 'replace' to avoid creating browser history entries for each keystroke
    history: 'replace',
    // Shallow routing - don't trigger server-side navigation
    shallow: true,
  });

  const setUrlState = (newState: Partial<PaystubUrlState>) => {
    setQueryStates(newState);
  };

  const clearUrlState = () => {
    setQueryStates({
      name: null,
      id: null,
      employer: null,
      rate: null,
      hours: null,
      status: null,
      year: null,
      state: null,
    });
  };

  const hasUrlParams = Object.values(urlState).some(value => value !== null);

  const generateShareableUrl = (): string => {
    if (typeof window === 'undefined') {return '';}

    const url = new URL(window.location.href);
    // The URL already contains the query params from nuqs
    return url.toString();
  };

  return {
    urlState,
    setUrlState,
    clearUrlState,
    hasUrlParams,
    generateShareableUrl,
  };
}
