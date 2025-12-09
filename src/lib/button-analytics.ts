/**
 * Button Analytics Tracker
 * Centralized analytics tracking for button interactions
 * Separates analytics logic from UI components
 */

import { logger } from '@/lib/logger';

export interface ButtonAnalyticsEvent {
  label: string;
  variant: string;
  size: string;
  businessValue: 'high' | 'medium' | 'low';
  component: string;
  conversionEvent: string;
  [key: string]: unknown;
}

export interface ButtonAnalyticsOptions {
  trackConversion?: boolean;
  conversionLabel?: string;
  conversionValue?: 'high' | 'medium' | 'low';
}

export class ButtonAnalyticsTracker {
  static trackConversion(
    options: ButtonAnalyticsOptions,
    children: React.ReactNode,
    variant?: string,
    size?: string
  ): void {
    if (!options.trackConversion) {
      return;
    }

    const label =
      options.conversionLabel ||
      (typeof children === 'string' ? children : 'Button Click');
    const value =
      options.conversionValue || (variant === 'default' ? 'high' : 'medium');

    const event: ButtonAnalyticsEvent = {
      label,
      variant: variant || 'default',
      size: size || 'default',
      businessValue: value,
      component: 'Button',
      conversionEvent: 'cta_click',
    };

    logger.info('Conversion button clicked', event);
  }

  static trackButtonClick(
    label: string,
    properties?: Record<string, unknown>
  ): void {
    logger.info('Button clicked', {
      label,
      component: 'Button',
      ...properties
    });
  }
}
