// Feature flags management for PostHog
import React, { useEffect, useState } from 'react';
// import { getFeatureFlag, isFeatureEnabled } from './unified-analytics';
import { FEATURE_FLAGS, type FeatureFlagKey, type FeatureFlagConfig } from '@/types/utils';

// Feature flag configuration for documentation and validation
export const FEATURE_FLAG_CONFIG: Record<FeatureFlagKey, FeatureFlagConfig> = {
  [FEATURE_FLAGS.CONTACT_FORM_V2]: {
    description: 'A/B test new contact form with improved UX and validation',
    type: 'boolean' as const,
    defaultValue: false,
    rolloutPercentage: 0,
  },
  [FEATURE_FLAGS.WEB_VITALS_TRACKING]: {
    description: 'Track Core Web Vitals metrics for performance monitoring',
    type: 'boolean' as const,
    defaultValue: true,
    rolloutPercentage: 100,
  },
  [FEATURE_FLAGS.ENHANCED_LEAD_SCORING]: {
    description: 'Test improved lead scoring model for better qualification',
    type: 'boolean' as const,
    defaultValue: false,
    rolloutPercentage: 50,
  },
  [FEATURE_FLAGS.SESSION_RECORDING_ENABLED]: {
    description: 'Enable session recording for user behavior analysis',
    type: 'boolean' as const,
    defaultValue: false,
    rolloutPercentage: 10,
  },
  [FEATURE_FLAGS.PRICING_DISPLAY]: {
    description: 'Test showing pricing vs contact-for-quote approach',
    type: 'boolean' as const,
    defaultValue: false,
    rolloutPercentage: 0,
  },
} as const;

// Utility functions for feature flag checks
export class FeatureFlags {
  /**
   * Check if a feature flag is enabled
   */
  static isEnabled(flagKey: FeatureFlagKey): boolean {
    try {
      // const isEnabled = isFeatureEnabled(flagKey);
      const isEnabled = Boolean(FEATURE_FLAG_CONFIG[flagKey]?.defaultValue) || false;
      return isEnabled;
    } catch (error) {
      console.warn(`Error checking feature flag ${flagKey}`, error);
      return Boolean(FEATURE_FLAG_CONFIG[flagKey]?.defaultValue) || false;
    }
  }

  /**
   * Get feature flag value (can be boolean, string, or number)
   */
  static getValue(flagKey: FeatureFlagKey): boolean | string | number {
    try {
      // const value = getFeatureFlag(flagKey);
      const value = FEATURE_FLAG_CONFIG[flagKey]?.defaultValue || false;
      return value;
    } catch (error) {
      console.warn(`Error getting feature flag ${flagKey} value`, error);
      return FEATURE_FLAG_CONFIG[flagKey]?.defaultValue || false;
    }
  }

  /**
   * Check if the new contact form should be used
   */
  static useContactFormV2(): boolean {
    return this.isEnabled(FEATURE_FLAGS.CONTACT_FORM_V2);
  }

  /**
   * Check if web vitals tracking is enabled
   */
  static isWebVitalsTrackingEnabled(): boolean {
    return this.isEnabled(FEATURE_FLAGS.WEB_VITALS_TRACKING);
  }

  /**
   * Check if enhanced lead scoring should be used
   */
  static useEnhancedLeadScoring(): boolean {
    return this.isEnabled(FEATURE_FLAGS.ENHANCED_LEAD_SCORING);
  }

  /**
   * Check if session recording is enabled for this user
   */
  static isSessionRecordingEnabled(): boolean {
    return this.isEnabled(FEATURE_FLAGS.SESSION_RECORDING_ENABLED);
  }

  /**
   * Check if pricing should be displayed on service pages
   */
  static shouldShowPricing(): boolean {
    return this.isEnabled(FEATURE_FLAGS.PRICING_DISPLAY);
  }

  /**
   * Get all current feature flag values for debugging
   */
  static getAllFlags(): Record<string, boolean | string | number> {
    const flags: Record<string, boolean | string | number> = {};
    
    Object.values(FEATURE_FLAGS).forEach(flagKey => {
      flags[flagKey] = this.getValue(flagKey);
    });

    return flags;
  }

  /**
   * Log all feature flag states for debugging
   */
  static logAllFlags(): void {
    const flags = this.getAllFlags();
    console.warn('Current feature flag states:', flags);
  }
}

// Hook for React components to use feature flags

export function useFeatureFlag(flagKey: FeatureFlagKey): boolean {
  const [isEnabled, setIsEnabled] = useState(() => 
    FeatureFlags.isEnabled(flagKey)
  );

  useEffect(() => {
    // Update flag state when PostHog loads or updates
    const checkFlag = () => {
      const enabled = FeatureFlags.isEnabled(flagKey);
      setIsEnabled(enabled);
    };

    // Check immediately
    checkFlag();

    // Set up a small interval to check for flag updates
    // PostHog typically updates flags every 30 seconds
    const interval = setInterval(checkFlag, 30000);

    return () => clearInterval(interval);
  }, [flagKey]);

  return isEnabled;
}

// Higher-order component for conditional rendering based on feature flags

export function FeatureFlagWrapper({ flag, fallback = null, children }: {
  flag: FeatureFlagKey;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const isEnabled = useFeatureFlag(flag);
  
  return <>{isEnabled ? children : fallback}</>;
}

// Export default instance
export default FeatureFlags;
