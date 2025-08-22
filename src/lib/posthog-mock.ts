/**
 * PostHog Mock for Development
 * Provides stub implementation when PostHog is not configured
 */

export interface PostHogMock {
  init: (apiKey: string, config?: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
  isFeatureEnabled: (flag: string) => boolean;
}

const postHogMock: PostHogMock = {
  init: (apiKey: string, config?: Record<string, unknown>) => {
    console.log('PostHog mock initialized with key:', apiKey, config);
  },
  capture: (event: string, properties?: Record<string, unknown>) => {
    console.log('PostHog event:', event, properties);
  },
  identify: (userId: string, properties?: Record<string, unknown>) => {
    console.log('PostHog identify:', userId, properties);
  },
  reset: () => {
    console.log('PostHog reset');
  },
  isFeatureEnabled: (flag: string) => {
    console.log('PostHog feature flag check:', flag);
    return false;
  }
};

export default postHogMock;