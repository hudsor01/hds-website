/**
 * Next.js 15 CSS-in-JS Configuration
 * Production-ready setup for CSS-in-JS libraries with Server Components support
 */

// CSS-in-JS library support status for Next.js 15
export const supportedLibraries = {
  // Fully supported in Client Components
  supported: [
    'styled-jsx',
    'styled-components', 
    '@mui/material',
    '@mui/joy',
    'chakra-ui',
    '@fluentui/react-components',
    'kuma-ui',
    'pandacss',
    'stylex',
    'tamagui',
    'tss-react',
    'vanilla-extract',
    'ant-design',
  ],
  
  // Working on support for React 18+ features
  inProgress: [
    'emotion',
  ],
  
  // Recommended approach for this project
  recommended: 'vanilla-extract', // Works well with Tailwind CSS
} as const

// CSS-in-JS configuration patterns
export const cssInJsPatterns = {
  /**
   * Registry pattern for styled-jsx (built into Next.js)
   * Best for: Small projects, zero-config CSS-in-JS
   */
  styledJsx: {
    features: [
      'Built into Next.js',
      'Zero configuration',
      'Good for component-scoped styles',
      'Works with Server Components',
    ],
    limitations: [
      'Less ecosystem',
      'Limited theming capabilities',
      'No dynamic prop-based styling',
    ],
  },

  /**
   * Registry pattern for styled-components
   * Best for: Component libraries, dynamic styling
   */
  styledComponents: {
    features: [
      'Mature ecosystem',
      'Excellent TypeScript support',
      'Theme provider',
      'Dynamic prop-based styling',
    ],
    limitations: [
      'Requires registry setup',
      'Client Components only',
      'Runtime overhead',
    ],
  },

  /**
   * Build-time CSS-in-JS with vanilla-extract
   * Best for: Performance-critical applications
   */
  vanillaExtract: {
    features: [
      'Zero runtime overhead',
      'Type-safe styles',
      'Works with Server Components',
      'Great for design systems',
    ],
    limitations: [
      'Build-time only',
      'No dynamic runtime styles',
      'More complex setup',
    ],
  },
} as const

// Performance considerations for CSS-in-JS
export const performanceGuidelines = {
  serverComponents: {
    recommendation: 'Use CSS Modules or Tailwind for Server Components',
    reasoning: 'CSS-in-JS requires client-side JavaScript for styling',
    alternatives: [
      'CSS Modules',
      'Tailwind CSS',
      'Vanilla Extract',
      'SCSS/Sass',
    ],
  },
  
  clientComponents: {
    recommendation: 'Use CSS-in-JS sparingly for dynamic styles only',
    reasoning: 'CSS-in-JS adds runtime overhead and bundle size',
    bestPractices: [
      'Prefer static CSS for layout and basic styling',
      'Use CSS-in-JS for theme-dependent styles',
      'Implement proper style extraction for SSR',
      'Cache styled components when possible',
    ],
  },
} as const

// CSS-in-JS integration strategies
export const integrationStrategies = {
  /**
   * Hybrid approach: Tailwind + CSS-in-JS
   * Recommended for this project
   */
  hybrid: {
    staticStyles: 'Tailwind CSS for layout, spacing, typography',
    dynamicStyles: 'CSS-in-JS for theme-dependent or interactive styles',
    benefits: [
      'Best performance for static styles',
      'Flexibility for dynamic styles',
      'Smaller bundle size',
      'Better caching',
    ],
  },

  /**
   * Component-specific CSS-in-JS
   * Use CSS-in-JS only where needed
   */
  selective: {
    useFor: [
      'Theme-dependent colors',
      'Animation states',
      'User-generated content styling',
      'A/B testing variants',
    ],
    avoidFor: [
      'Layout grids',
      'Typography scales',
      'Static spacing',
      'Media queries',
    ],
  },
} as const

// Runtime CSS injection utilities (for Client Components only)
export const runtimeStyles = {
  /**
   * Inject theme-dependent styles at runtime
   */
  injectThemeStyles: (theme: Record<string, string>) => {
    if (typeof window === 'undefined') return

    const styleId = 'dynamic-theme-styles'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement
    
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    const css = Object.entries(theme)
      .map(([key, value]) => `--theme-${key}: ${value};`)
      .join(' ')

    styleElement.textContent = `:root { ${css} }`
  },

  /**
   * Remove runtime-injected styles
   */
  removeRuntimeStyles: (styleId: string) => {
    if (typeof window === 'undefined') return
    
    const element = document.getElementById(styleId)
    if (element) {
      element.remove()
    }
  },
}

// Type-safe style utilities for CSS-in-JS
export const styleUtils = {
  /**
   * Create responsive breakpoint styles
   */
  createBreakpoints: (styles: Record<string, Record<string, string>>) => Object.entries(styles)
      .map(([breakpoint, css]) => {
        const cssString = Object.entries(css)
          .map(([prop, value]) => `${prop}: ${value};`)
          .join(' ')
        
        if (breakpoint === 'base') {
          return cssString
        }
        
        return `@media (min-width: ${breakpoint}) { ${cssString} }`
      })
      .join(' '),

  /**
   * Generate CSS custom properties from theme object
   */
  generateCSSVars: (theme: Record<string, string | number>, prefix = '') => Object.entries(theme)
      .map(([key, value]) => `--${prefix}${key}: ${value};`)
      .join(' '),

  /**
   * Create animation keyframes
   */
  createKeyframes: (name: string, frames: Record<string, Record<string, string>>) => {
    const keyframeString = Object.entries(frames)
      .map(([percentage, styles]) => {
        const cssString = Object.entries(styles)
          .map(([prop, value]) => `${prop}: ${value};`)
          .join(' ')
        return `${percentage} { ${cssString} }`
      })
      .join(' ')

    return `@keyframes ${name} { ${keyframeString} }`
  },
}

// Development utilities for CSS-in-JS debugging
export const devUtils = {
  /**
   * Log CSS-in-JS performance metrics
   */
  logPerformanceMetrics: () => {
    if (process.env.NODE_ENV !== 'development') return

    // Measure style injection time
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('style')) {
          console.log(`CSS-in-JS metric: ${entry.name} - ${entry.duration}ms`)
        }
      }
    })

    observer.observe({ entryTypes: ['measure'] })
  },

  /**
   * Analyze CSS-in-JS bundle impact
   */
  analyzeBundleImpact: () => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

    const stylesheets = Array.from(document.styleSheets)
    const totalRules = stylesheets.reduce((acc, sheet) => {
      try {
        return acc + (sheet.cssRules?.length || 0)
      } catch {
        return acc
      }
    }, 0)

    console.log(`Total CSS rules: ${totalRules}`)
    console.log(`Stylesheets: ${stylesheets.length}`)
  },
}