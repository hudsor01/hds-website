import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google'

/**
 * Next.js 15 Font Optimization Configuration
 * Implements automatic self-hosting and performance optimization
 */

// Primary font - Inter for general UI
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  // Preload most common weights for better performance
  weight: ['400', '500', '600', '700'],
  // Optimize for common character sets
  preload: true,
})

// Secondary font - Playfair Display for headings
export const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  preload: true,
})

// Monospace font - JetBrains Mono for code
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  preload: true,
})

// Brand font - Using Playfair Display as brand font
// TODO: Replace with custom brand fonts when available
export const brandFont = playfairDisplay

// Font class combinations for easy usage
export const fontVariables = `${inter.variable} ${playfairDisplay.variable} ${jetbrainsMono.variable}`

// Export individual font classes
export const fontClasses = {
  sans: inter.className,
  serif: playfairDisplay.className,
  mono: jetbrainsMono.className,
  brand: brandFont.className,
}

// Font optimization utilities
export const fontOptimization = {
  // CSS font-display settings for different use cases
  critical: 'swap', // For above-the-fold content
  noncritical: 'optional', // For below-the-fold content
  
  // Preload settings
  preloadPrimary: true,
  preloadSecondary: false,
  
  // Font loading strategies
  strategies: {
    eager: 'swap', // Load immediately, swap when ready
    lazy: 'optional', // Only load if quickly available
    fallback: 'fallback', // Use fallback if font takes too long
  },
}

// Fallback font stacks (for CSS)
export const fontStacks = {
  sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
}

// Performance-optimized font loading configuration
export const fontPerformanceConfig = {
  // Resource hints for better loading
  preconnect: ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  
  // Font loading priorities
  priorities: {
    primary: 'high',
    secondary: 'low',
    decorative: 'low',
  },
  
  // Subset optimizations
  subsets: {
    default: ['latin'],
    extended: ['latin', 'latin-ext'],
    multilingual: ['latin', 'latin-ext', 'cyrillic'],
  },
}

// Type definitions for font usage
export type FontWeight = '400' | '500' | '600' | '700'
export type FontStyle = 'normal' | 'italic'
export type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional'

export interface FontConfig {
  family: string
  weight?: FontWeight | FontWeight[]
  style?: FontStyle | FontStyle[]
  display?: FontDisplay
  variable?: string
  preload?: boolean
}

// Font usage recommendations
export const fontUsageGuide = {
  // Primary font usage
  body: 'Use Inter for body text, forms, and general UI elements',
  headings: 'Use Playfair Display for headings and emphasis',
  code: 'Use JetBrains Mono for code blocks and technical content',
  
  // Performance tips
  performance: [
    'Always specify font-display: swap for better performance',
    'Preload only critical fonts used above the fold',
    'Use variable fonts when possible for flexibility',
    'Specify appropriate subsets to reduce file size',
    'Consider using system fonts for better performance',
  ],
  
  // Accessibility considerations
  accessibility: [
    'Ensure sufficient contrast ratios',
    'Use minimum 16px font size for body text',
    'Provide fallback fonts for all custom fonts',
    'Test with different zoom levels',
    'Consider dyslexia-friendly fonts for body text',
  ],
}