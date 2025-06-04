/**
 * CSS Configuration and Organization System
 * Following Next.js 15 CSS best practices for scalability and performance
 */

// CSS Module naming conventions
export const cssNaming = {
  // Component-specific modules
  component: (name: string) => `${name}.module.css`,
  
  // Page-specific modules  
  page: (pageName: string) => `${pageName}.module.css`,
  
  // Layout-specific modules
  layout: (layoutName: string) => `${layoutName}.module.css`,
  
  // Feature-specific modules
  feature: (featureName: string) => `${featureName}.module.css`,
} as const

// CSS import order configuration (for predictable CSS ordering)
export const cssImportOrder = {
  // 1. External stylesheets (third-party)
  external: [
    'normalize.css',
    'bootstrap/dist/css/bootstrap.css',
    'swiper/css',
  ],
  
  // 2. Global styles
  global: [
    './globals.css',
    './typography.css',
    './animations.css',
  ],
  
  // 3. Layout modules
  layouts: [
    './layout.module.css',
    './header.module.css',
    './footer.module.css',
  ],
  
  // 4. Component modules (in dependency order)
  components: [
    './base-components.module.css',
    './form-components.module.css',
    './ui-components.module.css',
  ],
  
  // 5. Page-specific modules
  pages: [
    './page.module.css',
    './section.module.css',
  ],
} as const

// CSS optimization configuration
export const cssOptimization = {
  // Development settings
  development: {
    sourceMap: true,
    optimization: false,
    fastRefresh: true,
    cssChunking: false,
  },
  
  // Production settings
  production: {
    sourceMap: false,
    optimization: true,
    minification: true,
    cssChunking: true,
    autoprefixer: true,
    purgeCSS: true,
  },
} as const

// CSS chunking strategy
export const cssChunking = {
  // Critical CSS (above-the-fold)
  critical: [
    'layout',
    'header',
    'hero',
    'navigation',
  ],
  
  // Defer loading (below-the-fold)
  deferred: [
    'footer',
    'forms',
    'animations',
    'utilities',
  ],
  
  // Route-specific chunks
  routes: {
    home: ['hero', 'services-preview', 'testimonials'],
    services: ['service-cards', 'pricing', 'comparison'],
    contact: ['forms', 'validation', 'maps'],
    blog: ['typography', 'syntax-highlighting', 'comments'],
  },
} as const

// CSS Module composition patterns
export const cssComposition = {
  // Base component composition
  baseButton: {
    compose: ['reset', 'typography', 'transitions'],
    variants: ['primary', 'secondary', 'outline', 'ghost'],
  },
  
  // Card component composition
  baseCard: {
    compose: ['surface', 'shadow', 'border'],
    variants: ['elevated', 'outlined', 'filled'],
  },
  
  // Input component composition
  baseInput: {
    compose: ['reset', 'typography', 'focus'],
    variants: ['default', 'error', 'success'],
  },
} as const

// Responsive design breakpoints (matching Tailwind CSS v4)
export const breakpoints = {
  xs: '30rem',    // 480px
  sm: '40rem',    // 640px
  md: '48rem',    // 768px
  lg: '64rem',    // 1024px
  xl: '80rem',    // 1280px
  '2xl': '96rem', // 1536px
} as const

// CSS custom properties organization
export const customProperties = {
  // Color system
  colors: {
    primary: '--color-primary',
    secondary: '--color-secondary',
    accent: '--color-accent',
    neutral: '--color-neutral',
    success: '--color-success',
    warning: '--color-warning',
    error: '--color-error',
  },
  
  // Typography system
  typography: {
    fontFamily: '--font-family',
    fontSize: '--font-size',
    fontWeight: '--font-weight',
    lineHeight: '--line-height',
    letterSpacing: '--letter-spacing',
  },
  
  // Spacing system
  spacing: {
    xs: '--spacing-xs',
    sm: '--spacing-sm',
    md: '--spacing-md',
    lg: '--spacing-lg',
    xl: '--spacing-xl',
  },
  
  // Border radius
  radius: {
    xs: '--radius-xs',
    sm: '--radius-sm',
    md: '--radius-md',
    lg: '--radius-lg',
    full: '--radius-full',
  },
  
  // Shadows
  shadows: {
    sm: '--shadow-sm',
    md: '--shadow-md',
    lg: '--shadow-lg',
    xl: '--shadow-xl',
  },
  
  // Animation
  animation: {
    duration: '--duration',
    easing: '--easing',
    delay: '--delay',
  },
} as const

// Performance optimization strategies
export const performanceStrategies = {
  // Critical CSS inlining
  inlineCSS: {
    threshold: '4KB',
    includes: ['layout', 'typography', 'utilities'],
    excludes: ['animations', 'decorative', 'print'],
  },
  
  // CSS loading strategies
  loading: {
    preload: ['critical.css', 'fonts.css'],
    defer: ['animations.css', 'print.css'],
    lazy: ['third-party.css', 'optional.css'],
  },
  
  // Caching strategies
  caching: {
    longTerm: ['vendor.css', 'base.css'],
    shortTerm: ['page.css', 'component.css'],
    noCache: ['development.css', 'debug.css'],
  },
} as const

// CSS organization best practices
export const bestPractices = {
  // File organization
  structure: {
    global: 'app/globals.css',
    components: 'components/**/*.module.css',
    layouts: 'app/**/layout.module.css',
    pages: 'app/**/page.module.css',
    utilities: 'lib/styles/utilities.css',
  },
  
  // Naming conventions
  naming: {
    blocks: 'kebab-case',
    elements: 'kebab-case',
    modifiers: 'kebab-case',
    states: 'is-state',
    utilities: 'u-utility',
  },
  
  // Import patterns
  imports: {
    order: 'external -> global -> layout -> component -> page',
    grouping: 'by functionality, not alphabetically',
    consistency: 'same order across all files',
  },
  
  // Performance guidelines
  performance: [
    'Keep CSS modules focused and small',
    'Avoid deep nesting (max 3 levels)',
    'Use CSS custom properties for theming',
    'Minimize specificity conflicts',
    'Group media queries at component level',
    'Use CSS-in-JS for dynamic styles only',
  ],
} as const

// Debugging and development helpers
export const developmentHelpers = {
  // CSS debugging utilities
  debug: {
    outline: 'outline: 1px solid red',
    grid: 'background: linear-gradient(...)',
    typography: 'background: rgba(255, 0, 0, 0.1)',
  },
  
  // Linting rules
  linting: {
    'no-important': true,
    'max-nesting-depth': 3,
    'selector-max-specificity': '0,3,0',
    'declaration-property-unit-allowed-list': {
      'font-size': ['rem', 'em'],
      'margin': ['rem', 'px'],
      'padding': ['rem', 'px'],
    },
  },
  
  // Fast Refresh optimization
  fastRefresh: {
    watchFiles: ['**/*.module.css', 'globals.css'],
    excludeFiles: ['node_modules/**/*.css'],
    hmr: true,
  },
} as const

// Type definitions for better TypeScript support
export type CSSModuleName = keyof typeof cssNaming
export type BreakpointKey = keyof typeof breakpoints
export type CustomPropertyKey = keyof typeof customProperties
export type ChunkingStrategy = keyof typeof cssChunking

// Helper functions for CSS organization
export const cssHelpers = {
  // Generate CSS module import path
  getModulePath: (componentName: string, type: CSSModuleName = 'component') => cssNaming[type](componentName),
  
  // Generate responsive CSS
  responsive: (styles: Record<BreakpointKey, string>) => Object.entries(styles).map(([breakpoint, style]) => {
      const minWidth = breakpoints[breakpoint as BreakpointKey]
      return `@media (min-width: ${minWidth}) { ${style} }`
    }).join('\n'),
  
  // Generate CSS custom property
  customProperty: (category: keyof typeof customProperties) => `var(${customProperties[category]})`,
}