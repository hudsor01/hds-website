/**
 * Next.js 15 Third-Party Libraries Configuration
 * Production-ready third-party integration with performance optimization
 */

// Third-party library categories and integration patterns
export const thirdPartyCategories = {
  analytics: {
    description: 'Analytics and tracking services',
    performance: 'High impact on Core Web Vitals',
    examples: ['Google Analytics', 'Google Tag Manager', 'PostHog', 'Mixpanel'],
  },
  
  social: {
    description: 'Social media embeds and widgets',
    performance: 'Medium impact, lazy load recommended',
    examples: ['YouTube', 'Twitter', 'Instagram', 'Facebook'],
  },
  
  maps: {
    description: 'Map and location services',
    performance: 'Heavy, always lazy load',
    examples: ['Google Maps', 'Mapbox', 'OpenStreetMap'],
  },
  
  payments: {
    description: 'Payment processing widgets',
    performance: 'Critical for functionality, optimize loading',
    examples: ['Stripe', 'PayPal', 'Square'],
  },
  
  communication: {
    description: 'Chat and communication widgets',
    performance: 'Load based on user interaction',
    examples: ['Intercom', 'Zendesk', 'Crisp'],
  },
  
  advertising: {
    description: 'Ad networks and monetization',
    performance: 'High impact, careful optimization needed',
    examples: ['Google AdSense', 'Amazon Associates'],
  },
} as const;

// Google third-party integrations (using @next/third-parties)
export const googleIntegrations = {
  /**
   * Google Tag Manager configuration
   */
  tagManager: {
    component: '@next/third-parties/google GoogleTagManager',
    usage: 'Analytics and marketing tag management',
    performance: {
      loadingStrategy: 'after-hydration',
      impact: 'medium',
      optimization: 'Bundles multiple tracking scripts',
    },
    config: {
      gtmId: 'GTM-XXXXXXX',
      gtmScriptUrl: 'https://www.googletagmanager.com/gtm.js', // Default
      dataLayer: {},
      dataLayerName: 'dataLayer',
      auth: undefined, // For environment snippets
      preview: undefined, // For environment snippets
    },
  },

  /**
   * Google Analytics 4 configuration
   */
  analytics: {
    component: '@next/third-parties/google GoogleAnalytics',
    usage: 'Web analytics and user behavior tracking',
    performance: {
      loadingStrategy: 'after-hydration',
      impact: 'medium',
      optimization: 'Automatic pageview tracking',
    },
    config: {
      gaId: 'G-XXXXXXXXXX',
      dataLayerName: 'dataLayer',
      nonce: undefined, // CSP nonce if needed
    },
  },

  /**
   * Google Maps Embed configuration
   */
  mapsEmbed: {
    component: '@next/third-parties/google GoogleMapsEmbed',
    usage: 'Embedded maps without full API',
    performance: {
      loadingStrategy: 'lazy',
      impact: 'high',
      optimization: 'Use loading="lazy" by default',
    },
    config: {
      apiKey: 'YOUR_API_KEY',
      height: 400,
      width: '100%',
      mode: 'place',
      loading: 'lazy',
      allowfullscreen: false,
    },
  },

  /**
   * YouTube Embed configuration
   */
  youtubeEmbed: {
    component: '@next/third-parties/google YouTubeEmbed',
    usage: 'Optimized YouTube video embeds',
    performance: {
      loadingStrategy: 'interaction',
      impact: 'high',
      optimization: 'Uses lite-youtube-embed for better performance',
    },
    config: {
      videoid: 'VIDEO_ID',
      height: 400,
      width: 'auto',
      playlabel: 'Play video',
      params: 'controls=1&start=0',
      style: {},
    },
  },
} as const;

// Third-party loading strategies
export const loadingStrategies = {
  /**
   * Immediate loading (critical third-parties)
   */
  immediate: {
    description: 'Load immediately with the page',
    useCase: 'Critical functionality (payments, auth)',
    implementation: 'Include in root layout or page component',
    performance: 'High impact on initial load',
  },

  /**
   * After hydration (analytics, tracking)
   */
  afterHydration: {
    description: 'Load after React hydration completes',
    useCase: 'Analytics, tracking, non-critical features',
    implementation: 'Default for @next/third-parties components',
    performance: 'Minimal impact on Core Web Vitals',
  },

  /**
   * Lazy loading (below-the-fold content)
   */
  lazy: {
    description: 'Load when element enters viewport',
    useCase: 'Maps, videos, social embeds',
    implementation: 'Use Intersection Observer or loading="lazy"',
    performance: 'Best for large embeds',
  },

  /**
   * User interaction (on-demand loading)
   */
  interaction: {
    description: 'Load only when user interacts',
    useCase: 'Chat widgets, complex embeds',
    implementation: 'Load on click, hover, or focus',
    performance: 'Optimal for non-essential features',
  },

  /**
   * Conditional loading (feature flags)
   */
  conditional: {
    description: 'Load based on conditions or feature flags',
    useCase: 'A/B testing, user preferences',
    implementation: 'Environment variables or user state',
    performance: 'Selective loading reduces bundle size',
  },
} as const;

// Performance optimization techniques
export const performanceOptimizations = {
  /**
   * Script loading optimizations
   */
  scriptLoading: {
    preconnect: {
      description: 'Establish early connections to third-party domains',
      implementation: '<link rel="preconnect" href="https://www.googletagmanager.com">',
      benefit: 'Reduces connection setup time',
    },
    
    preload: {
      description: 'Preload critical third-party resources',
      implementation: '<link rel="preload" href="..." as="script">',
      benefit: 'Faster script execution',
    },
    
    defer: {
      description: 'Defer non-critical script execution',
      implementation: 'Use defer or async attributes',
      benefit: 'Prevents render blocking',
    },
  },

  /**
   * Rendering optimizations
   */
  rendering: {
    hydrationDelay: {
      description: 'Delay third-party loading until after hydration',
      implementation: '@next/third-parties default behavior',
      benefit: 'Better Time to Interactive (TTI)',
    },
    
    lazyHydration: {
      description: 'Hydrate components only when needed',
      implementation: 'Intersection Observer + dynamic imports',
      benefit: 'Reduced JavaScript execution time',
    },
    
    codesplitting: {
      description: 'Split third-party code into separate chunks',
      implementation: 'Dynamic imports with next/dynamic',
      benefit: 'Smaller initial bundle size',
    },
  },

  /**
   * Resource optimization
   */
  resources: {
    imageOptimization: {
      description: 'Optimize third-party images and assets',
      implementation: 'Use Next.js Image component for third-party images',
      benefit: 'Better Largest Contentful Paint (LCP)',
    },
    
    fontOptimization: {
      description: 'Optimize third-party fonts',
      implementation: 'Use next/font or font-display: swap',
      benefit: 'Prevents layout shift',
    },
    
    caching: {
      description: 'Cache third-party resources',
      implementation: 'Service worker or CDN caching',
      benefit: 'Faster subsequent loads',
    },
  },
} as const;

// Common third-party integrations configuration
export const commonIntegrations = {
  /**
   * Analytics platforms
   */
  analytics: {
    googleAnalytics: {
      library: '@next/third-parties/google',
      component: 'GoogleAnalytics',
      loadingStrategy: 'afterHydration',
      configRequired: ['gaId'],
      coreWebVitalsImpact: 'medium',
    },
    
    posthog: {
      library: 'posthog-js',
      loadingStrategy: 'conditional',
      configRequired: ['apiKey', 'apiHost'],
      coreWebVitalsImpact: 'low',
    },
  },

  /**
   * Social media embeds
   */
  social: {
    youtube: {
      library: '@next/third-parties/google',
      component: 'YouTubeEmbed',
      loadingStrategy: 'lazy',
      configRequired: ['videoid'],
      coreWebVitalsImpact: 'high',
    },
    
    twitter: {
      library: 'react-twitter-embed',
      loadingStrategy: 'interaction',
      configRequired: ['tweetId'],
      coreWebVitalsImpact: 'medium',
    },
  },

  /**
   * Payment processors
   */
  payments: {
    stripe: {
      library: '@stripe/stripe-js',
      loadingStrategy: 'conditional',
      configRequired: ['publishableKey'],
      coreWebVitalsImpact: 'medium',
    },
  },

  /**
   * Maps and location
   */
  maps: {
    googleMaps: {
      library: '@next/third-parties/google',
      component: 'GoogleMapsEmbed',
      loadingStrategy: 'lazy',
      configRequired: ['apiKey'],
      coreWebVitalsImpact: 'high',
    },
  },
} as const;

// Security considerations for third-party libraries
export const securityConsiderations = {
  /**
   * Content Security Policy (CSP)
   */
  csp: {
    scriptSrc: {
      description: 'Whitelist trusted third-party script sources',
      examples: [
        "'self'",
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
      ],
    },
    
    connectSrc: {
      description: 'Allow connections to third-party APIs',
      examples: [
        "'self'",
        'https://analytics.google.com',
        'https://api.stripe.com',
      ],
    },
  },

  /**
   * Data privacy
   */
  privacy: {
    gdprCompliance: {
      description: 'Ensure GDPR compliance for EU users',
      implementation: 'Conditional loading based on consent',
      considerations: ['Cookie consent', 'Data processing agreements'],
    },
    
    dataMinimization: {
      description: 'Collect only necessary data',
      implementation: 'Configure analytics to respect privacy',
      considerations: ['IP anonymization', 'User ID hashing'],
    },
  },

  /**
   * Performance monitoring
   */
  monitoring: {
    impactAssessment: {
      description: 'Monitor third-party impact on performance',
      metrics: ['First Contentful Paint', 'Largest Contentful Paint', 'Cumulative Layout Shift'],
      tools: ['Lighthouse', 'Web Vitals', 'Chrome DevTools'],
    },
  },
} as const;

// Best practices for third-party integration
export const bestPractices = {
  /**
   * Loading optimization
   */
  loading: [
    'Use @next/third-parties for Google services when available',
    'Lazy load non-critical third-party components',
    'Implement user interaction triggers for heavy embeds',
    'Use preconnect for critical third-party domains',
    'Bundle multiple tracking scripts through Tag Manager',
  ],

  /**
   * Performance monitoring
   */
  performance: [
    'Monitor Core Web Vitals impact of third-party scripts',
    'Use performance budgets for third-party resources',
    'Test third-party loading on slow connections',
    'Implement fallbacks for failed third-party loads',
    'Regular audit of unused third-party integrations',
  ],

  /**
   * Security best practices
   */
  security: [
    'Implement proper Content Security Policy',
    'Regularly update third-party dependencies',
    'Use Subresource Integrity (SRI) when possible',
    'Monitor third-party vulnerabilities',
    'Implement privacy controls for data collection',
  ],

  /**
   * Development workflow
   */
  development: [
    'Use feature flags for third-party integrations',
    'Test third-party integrations in staging environment',
    'Document third-party configuration and API keys',
    'Implement error boundaries for third-party components',
    'Use environment-specific configurations',
  ],
} as const;