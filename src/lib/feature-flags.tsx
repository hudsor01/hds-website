// Feature flags management with static configuration
import React, { useState } from 'react';
// import { getFeatureFlag, isFeatureEnabled } from './unified-analytics';
import { FEATURE_FLAGS, type FeatureFlagKey, type FeatureFlagConfig } from '@/types/utils';
import { logger } from './logger';
import analytics from './analytics';

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
      logger.warn('Feature flag check failed', {
        operation: 'check_flag',
        flagKey,
        error: error instanceof Error ? error.message : String(error),
        defaultValue: Boolean(FEATURE_FLAG_CONFIG[flagKey]?.defaultValue),
        config: FEATURE_FLAG_CONFIG[flagKey],
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      });

      // Track feature flag errors for analytics
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackEvent('feature_flag_error', {
          flag_key: flagKey,
          operation: 'check',
          error_message: error instanceof Error ? error.message : String(error),
          fallback_value: Boolean(FEATURE_FLAG_CONFIG[flagKey]?.defaultValue)
        });
      }

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
      logger.warn('Feature flag value retrieval failed', {
        operation: 'get_value',
        flagKey,
        error: error instanceof Error ? error.message : String(error),
        defaultValue: FEATURE_FLAG_CONFIG[flagKey]?.defaultValue,
        config: FEATURE_FLAG_CONFIG[flagKey],
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      });

      // Track feature flag errors for analytics
      if (typeof window !== 'undefined' && analytics) {
        analytics.trackEvent('feature_flag_error', {
          flag_key: flagKey,
          operation: 'get_value',
          error_message: error instanceof Error ? error.message : String(error),
          fallback_value: FEATURE_FLAG_CONFIG[flagKey]?.defaultValue
        });
      }

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
   * Log all feature flag states for debugging and analytics
   */
  static logAllFlags(): void {
    const flags = this.getAllFlags();

    logger.info('Feature flags state snapshot', {
      operation: 'log_all_flags',
      flags,
      flagCount: Object.keys(flags).length,
      enabledFlags: Object.entries(flags).filter(([, value]) => Boolean(value)).map(([key]) => key),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      timestamp: Date.now()
    });

    // Track feature flag usage patterns for analytics
    if (typeof window !== 'undefined' && analytics) {
      analytics.trackEvent('feature_flags_snapshot', {
        total_flags: Object.keys(flags).length,
        enabled_flags: Object.entries(flags).filter(([, value]) => Boolean(value)).length,
        flag_states: JSON.stringify(flags),
        page_url: window.location.href
      });
    }
  }
}

// Hook for React components to use feature flags

export function useFeatureFlag(flagKey: FeatureFlagKey): boolean {
  // Since we're using static configuration, we can just return the enabled state directly
  // No need for polling or dynamic updates
  const [isEnabled] = useState(() =>
    FeatureFlags.isEnabled(flagKey)
  );

  // No useEffect needed - flags are static and don't change at runtime
  // This eliminates the memory leak from the 30-second polling interval

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
