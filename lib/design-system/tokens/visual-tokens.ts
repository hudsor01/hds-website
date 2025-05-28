/**
 * Visual Design Tokens
 *
 * Design tokens related to visual styling elements such as
 * shadows, gradients, border radius, and responsive breakpoints.
 */

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(59, 130, 246, 0.5)',
}

export const gradients = {
  primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  secondary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
  mesh: `
    radial-gradient(at 40% 20%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
    radial-gradient(at 0% 50%, rgba(20, 184, 166, 0.1) 0px, transparent 50%),
    radial-gradient(at 80% 50%, rgba(236, 72, 153, 0.1) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.1) 0px, transparent 50%)
  `,
}

export const borderRadius = {
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
}

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}
