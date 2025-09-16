/**
 * PostHog Mock for Development
 * Provides stub implementation when PostHog is not configured
 */

import { logger } from '@/lib/logger';

// Configure logger for mock analytics context
logger.setContext({
  component: 'posthog-mock',
  environment: 'development',
  service: 'analytics'
});

export interface PostHogMock {
  init: (apiKey: string, config?: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
  isFeatureEnabled: (flag: string) => boolean;
}

const postHogMock: PostHogMock = {
  init: (apiKey: string, config?: Record<string, unknown>) => {
    logger.info('PostHog mock initialized', {
      apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'none',
      config,
      mockEnabled: true,
      developmentMode: true
    });
  },
  capture: (event: string, properties?: Record<string, unknown>) => {
    logger.info('PostHog mock event captured', {
      eventName: event,
      properties,
      timestamp: new Date().toISOString(),
      mockAnalytics: true,
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    });
  },
  identify: (userId: string, properties?: Record<string, unknown>) => {
    logger.info('PostHog mock user identified', {
      userId,
      properties,
      timestamp: new Date().toISOString(),
      mockAnalytics: true,
      identificationSource: 'development'
    });
  },
  reset: () => {
    logger.info('PostHog mock session reset', {
      action: 'reset',
      timestamp: new Date().toISOString(),
      mockAnalytics: true,
      previousSession: 'cleared'
    });
  },
  isFeatureEnabled: (flag: string) => {
    logger.info('PostHog mock feature flag checked', {
      flagName: flag,
      enabled: false,
      defaultValue: false,
      mockAnalytics: true,
      developmentOverride: true
    });
    return false;
  }
};

export default postHogMock;