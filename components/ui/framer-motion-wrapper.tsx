'use client'

/**
 * Framer Motion Wrapper Components
 * Client-only wrappers for third-party animation library
 */

import { m, LazyMotion, domAnimation } from 'framer-motion'

// Re-export motion components as client components
export const Motion = {
  div: m.div,
  section: m.section,
  article: m.article,
  header: m.header,
  main: m.main,
  aside: m.aside,
  footer: m.footer,
  nav: m.nav,
  ul: m.ul,
  li: m.li,
  button: m.button,
  a: m.a,
  span: m.span,
  p: m.p,
  h1: m.h1,
  h2: m.h2,
  h3: m.h3,
  h4: m.h4,
  h5: m.h5,
  h6: m.h6,
}

// Lazy motion provider for reduced bundle size
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}

// Common animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}