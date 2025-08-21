/**
 * PostHog Mock for Development
 * Provides stub implementation when PostHog is not configured
 */

export interface PostHogMock {
  init: (apiKey: string, config?: any) => void;
  capture: (event: string, properties?: any) => void;
  identify: (userId: string, properties?: any) => void;
  reset: () => void;
  isFeatureEnabled: (flag: string) => boolean;
}

const postHogMock: PostHogMock = {
  init: (apiKey: string, config?: any) => {
    console.log('PostHog mock initialized with key:', apiKey);
  },
  capture: (event: string, properties?: any) => {
    console.log('PostHog event:', event, properties);
  },
  identify: (userId: string, properties?: any) => {
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