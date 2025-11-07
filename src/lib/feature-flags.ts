import { FEATURE_FLAGS, type FeatureFlagKey } from '@/types/utils';

// Simple in-memory feature flag implementation
// In production, this could be connected to a feature flag service like LaunchDarkly, Firebase Remote Config, etc.
const featureFlags: Record<FeatureFlagKey, boolean> = {
  [FEATURE_FLAGS.CONTACT_FORM_V2]: false, // Default to false, can be enabled as needed
  [FEATURE_FLAGS.WEB_VITALS_TRACKING]: true,
  [FEATURE_FLAGS.ENHANCED_LEAD_SCORING]: false,
  [FEATURE_FLAGS.SESSION_RECORDING_ENABLED]: false,
  [FEATURE_FLAGS.PRICING_DISPLAY]: true,
};

export function getFeatureFlag(flag: FeatureFlagKey): boolean {
  return featureFlags[flag] ?? false;
}

export function useFeatureFlag(flag: FeatureFlagKey): boolean {
  return getFeatureFlag(flag);
}

export function setFeatureFlag(flag: FeatureFlagKey, value: boolean): void {
  featureFlags[flag] = value;
}