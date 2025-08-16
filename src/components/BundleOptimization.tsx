"use client";

import { lazy, Suspense, ReactNode } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/LoadingSkeletons";

// Lazy loading utilities
export function createLazyComponent(
  importFunc: () => Promise<{ default: React.ComponentType }>,
  fallback?: ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: Record<string, unknown>) {
    return (
      <Suspense fallback={fallback || <Skeleton className="w-full h-32" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Dynamic imports with Next.js
export function createDynamicComponent(
  importFunc: () => Promise<{ default: React.ComponentType }>,
  options?: {
    loading?: () => ReactNode;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || (() => <Skeleton className="w-full h-32" />),
    ssr: options?.ssr ?? true,
  });
}

// Preload utilities for critical resources
export function preloadComponent(importFunc: () => Promise<{ default: React.ComponentType }>) {
  if (typeof window !== 'undefined') {
    // Preload on idle or interaction
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => importFunc());
    } else {
      setTimeout(() => importFunc(), 1);
    }
  }
}

// Critical CSS inlining helper
export function inlineCriticalCSS(cssString: string) {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = cssString;
    document.head.appendChild(style);
  }
}

// Bundle analysis utilities
export const bundleAnalytics = {
  // Track component render times
  measureRender: <T extends unknown[]>(
    componentName: string,
    renderFunc: (...args: T) => ReactNode
  ) => {
    return (...args: T) => {
      if (process.env.NODE_ENV === 'development') {
        const start = performance.now();
        const result = renderFunc(...args);
        const end = performance.now();
        console.log(`${componentName} render time: ${end - start}ms`);
        return result;
      }
      return renderFunc(...args);
    };
  },

  // Track bundle size impact
  logBundleImpact: (componentName: string, sizeKB: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} bundle impact: ${sizeKB}KB`);
    }
  },

  // Memory usage tracking
  trackMemoryUsage: (componentName: string) => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      console.log(`${componentName} memory usage:`, {
        used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
      });
    }
  },
};

// Resource hints for better loading
export function addResourceHints() {
  if (typeof document !== 'undefined') {
    // Preconnect to external domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for likely next pages
    const dnsPrefetchDomains = [
      'https://api.github.com',
      'https://vercel.com',
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });
  }
}

// Code splitting by route - Simplified for production readiness
export const RouteComponents = {
  // Contact page components
  ContactForm: createDynamicComponent(
    () => import('@/components/ContactFormLight'),
    { loading: () => <Skeleton className="w-full h-96" /> }
  ),
  
  // Portfolio showcase
  PortfolioShowcase: createDynamicComponent(
    () => import('@/components/portfolio/PortfolioShowcase'),
    { loading: () => <Skeleton className="w-full h-64 mb-4" /> }
  ),
  
  // Navigation components
  NavbarLight: createDynamicComponent(
    () => import('@/components/layout/NavbarLight'),
    { loading: () => <Skeleton className="w-full h-16" /> }
  ),
};

// Progressive enhancement utilities
export const ProgressiveEnhancement = {
  // Enhanced interactions for capable browsers
  withEnhancedInteractions: (
    Component: React.ComponentType,
    enhancedProps: Record<string, unknown> = {}
  ) => {
    return function EnhancedComponent(props: Record<string, unknown>) {
      // Check for advanced features
      const supportsIntersectionObserver = typeof IntersectionObserver !== 'undefined';
      const supportsWebGL = (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
          return false;
        }
      })();

      const finalProps = {
        ...props,
        ...(supportsIntersectionObserver && supportsWebGL ? enhancedProps : {}),
      };

      return <Component {...finalProps} />;
    };
  },

  // Graceful degradation for animations
  withFallbackAnimations: (enableAnimations: boolean) => ({
    animate: enableAnimations ? undefined : false,
    transition: enableAnimations ? undefined : { duration: 0 },
  }),
};

// Tree shaking utilities
export const TreeShakingHelpers = {
  // Import only specific icons
  importIcon: (iconName: string) => {
    switch (iconName) {
      case 'arrow-right':
        return import('@heroicons/react/24/outline').then(mod => mod.ArrowRightIcon);
      case 'chevron-left':
        return import('@heroicons/react/24/outline').then(mod => mod.ChevronLeftIcon);
      case 'chevron-right':
        return import('@heroicons/react/24/outline').then(mod => mod.ChevronRightIcon);
      case 'star':
        return import('@heroicons/react/24/solid').then(mod => mod.StarIcon);
      case 'sparkles':
        return import('@heroicons/react/24/outline').then(mod => mod.SparklesIcon);
      default:
        return Promise.reject(new Error(`Icon ${iconName} not found`));
    }
  },

  // Import only needed utility functions
  importUtils: async (utilities: string[]) => {
    const utils: Record<string, unknown> = {};
    
    for (const util of utilities) {
      switch (util) {
        case 'cn':
          utils.cn = (await import('@/lib/utils')).cn;
          break;
        case 'formatDate':
          utils.formatDate = (await import('@/lib/utils')).formatDate;
          break;
      }
    }
    
    return utils;
  },
};

// Simple performance utilities
export const PerformanceMonitor = {
  // Simple bundle load timing
  measureBundleLoad: (bundleName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      if (process.env.NODE_ENV === 'development') {
        console.log(`${bundleName} loaded in ${end - start}ms`);
      }
    };
  },
};

// Bundle size optimization utilities
export const BundleOptimizer = {
  // Webpack chunk optimization helper
  optimizeChunks: {
    vendor: ['react', 'react-dom', 'next'],
    common: ['@/lib/utils', '@/lib/analytics'],
    ui: ['framer-motion', '@heroicons/react'],
  },

  // Module federation preparation
  federatedModules: {
    shared: {
      react: { singleton: true, eager: true },
      'react-dom': { singleton: true, eager: true },
      'framer-motion': { singleton: false },
    },
  },

  // Critical path optimization
  criticalResources: [
    '/fonts/geist-sans.woff2',
    '/fonts/geist-mono.woff2',
    '/images/logo.svg',
  ],
};

const BundleOptimizationExports = {
  createLazyComponent,
  createDynamicComponent,
  preloadComponent,
  bundleAnalytics,
  addResourceHints,
  RouteComponents,
  ProgressiveEnhancement,
  TreeShakingHelpers,
  PerformanceMonitor,
  BundleOptimizer,
};

export default BundleOptimizationExports;