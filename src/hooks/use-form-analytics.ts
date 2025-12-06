/**
 * Form Analytics Hook
 * Handles form interaction tracking and analytics
 * Separates analytics logic from form components
 */

import { logger } from '@/lib/logger';
import { useCallback } from 'react';
import type { FormValue } from '../types/forms';

export interface UseFormAnalyticsReturn {
  trackFormInteraction: (formId: string, eventType: string, fieldName?: string, value?: FormValue) => void;
  trackFormSubmission: (formId: string, success: boolean, error?: string) => void;
}

export function useFormAnalytics(): UseFormAnalyticsReturn {
  const trackFormInteraction = useCallback((
    formId: string,
    eventType: string,
    fieldName?: string,
    value?: FormValue
 ) => {
    logger.info('Form interaction tracked', {
      formId,
      eventType,
      fieldName,
      value,
      component: 'Form',
      userFlow: 'form_interaction'
    });
  }, []);

  const trackFormSubmission = useCallback((
    formId: string,
    success: boolean,
    error?: string
  ) => {
    logger.info('Form submission tracked', {
      formId,
      success,
      error,
      component: 'Form',
      userFlow: 'form_submission',
      conversionEvent: success ? 'form_submitted' : 'form_failed',
      businessValue: success ? 'high' : 'low'
    });
  }, []);

  return {
    trackFormInteraction,
    trackFormSubmission
  };
}
