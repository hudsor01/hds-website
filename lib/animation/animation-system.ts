/**
 * Animation System
 *
 * A centralized animation system for maintaining consistent animations
 * throughout the application.
 */

import { useRef, useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import {
  useAnimation,
  useInView as useFramerInView,
} from 'framer-motion'

// ========== Animation Variants ===========

// Basic fade animations
export const fadeAnimations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
}

// Scale animations
export const scaleAnimations = {
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  scaleInUp: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 20 },
  },
  scaleInDown: {
    initial: { opacity: 0, scale: 0.9, y: -20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: -20 },
  },
  popIn: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
  },
}

// Slide animations
export const slideAnimations = {
  slideInRight: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },
  slideInUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
  },
  slideInDown: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
  },
}

// Rotation animations
export const rotateAnimations = {
  rotateIn: {
    initial: { opacity: 0, rotate: -10 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: -10 },
  },
  rotateInClockwise: {
    initial: { opacity: 0, rotate: -90 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: 90 },
  },
  rotateInCounterclockwise: {
    initial: { opacity: 0, rotate: 90 },
    animate: { opacity: 1, rotate: 0 },
    exit: { opacity: 0, rotate: -90 },
  },
}

// Stagger animations
export const staggerAnimations = {
  container: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  },
  containerFast: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      },
    },
  },
  containerSlow: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
  },
}

// Spring animations
export const springAnimations = {
  springBounce: {
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
    exit: {
      scale: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
      },
    },
  },
  springInUp: {
    initial: { y: 100, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
    exit: {
      y: 100,
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
      },
    },
  },
}

// Text animations
export const textAnimations = {
  typewriter: (delay = 0) => ({
    initial: { width: '0%' },
    animate: {
      width: '100%',
      transition: {
        duration: 0.5,
        delay,
        ease: 'easeInOut',
      },
    },
    exit: {
      width: '0%',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  }),
  textFadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  highlightText: {
    initial: { backgroundSize: '0% 100%' },
    animate: {
      backgroundSize: '100% 100%',
      transition: { duration: 0.5 },
    },
    exit: {
      backgroundSize: '0% 100%',
      transition: { duration: 0.3 },
    },
  },
}

// Hover animations
export const hoverAnimations = {
  scaleUp: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10,
    },
  },
  lift: {
    y: -5,
    boxShadow:
      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    },
  },
  glow: {
    boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
    transition: { duration: 0.2 },
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.5, 1],
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
  slideRight: {
    x: 5,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10,
    },
  },
}

// Tap animations
export const tapAnimations = {
  scaleDown: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
  press: {
    scale: 0.97,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: { duration: 0.1 },
  },
}

// Gesture animations
export const gestureAnimations = {
  swipe: {
    initial: { x: 0 },
    animate: (direction: number) => ({
      x: direction * 300,
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    }),
  },
  drag: {
    drag: true,
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.2,
    dragTransition: { bounceDamping: 10, bounceStiffness: 100 },
    whileDrag: { scale: 1.05 },
  },
}

// Transition presets
export const transitions = {
  default: { duration: 0.3, ease: 'easeInOut' },
  fast: { duration: 0.2, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  spring: { type: 'spring', stiffness: 260, damping: 20 },
  smooth: { type: 'tween', ease: 'easeInOut', duration: 0.4 },
  bounce: { type: 'spring', stiffness: 300, damping: 10 },
  gentle: { type: 'spring', stiffness: 120, damping: 20 },
  elastic: { type: 'spring', stiffness: 300, damping: 8 },
  stiff: { type: 'spring', stiffness: 400, damping: 30 },
  molasses: { duration: 0.8, ease: [0.33, 1, 0.68, 1] },
}

// Export all animations as a single object for easy access
export const animations = {
  fade: fadeAnimations,
  scale: scaleAnimations,
  slide: slideAnimations,
  rotate: rotateAnimations,
  stagger: staggerAnimations,
  spring: springAnimations,
  text: textAnimations,
  hover: hoverAnimations,
  tap: tapAnimations,
  gesture: gestureAnimations,
}

// ========== Animation Hooks ===========

/**
 * Hook for scroll-triggered animations
 *
 * @param threshold Fraction of element that must be visible to trigger
 * @param once Only trigger animation once
 * @param rootMargin Margin around the root element
 */
export function useScrollAnimation(
  options: {
    threshold?: number
    once?: boolean
    rootMargin?: string
  } = {},
) {
  const { threshold = 0.1, once = true, rootMargin = '-100px' } = options

  const [ref, inView] = useInView({
    threshold,
    triggerOnce: once,
    rootMargin,
  })

  return { ref, inView }
}

/**
 * Hook for framer-motion scroll-triggered animations
 */
export function useFramerScrollAnimation(
  options: {
    threshold?: number
    once?: boolean
  } = {},
) {
  const { threshold = 0.1, once = true } = options

  const ref = useRef(null)
  const isInView = useFramerInView(ref, {
    once,
    amount: threshold,
  })

  return { ref, isInView }
}

/**
 * Hook for animated counters
 *
 * @param end Final number to count to
 * @param duration Duration in seconds
 * @param start Starting number (default: 0)
 */
export function useCounter(
  end: number,
  duration: number = 2,
  start: number = 0,
) {
  const [count, setCount] = useState(start)
  const controls = useAnimation()

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * (end - start) + start))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount)
      }
    }

    controls.start({ opacity: 1 })
    animationFrame = requestAnimationFrame(updateCount)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [end, duration, start, controls])

  return { count, controls }
}

/**
 * Hook for parallax effects
 *
 * @param speed Speed of parallax effect (higher = more movement)
 */
export function useParallax(speed: number = 0.5) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Calculate transform based on scroll position
  const y = scrollY * speed

  return { y, scrollY }
}

/**
 * Hook for mouse tracking
 */
export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return mousePosition
}

/**
 * Hook for delayed animations
 *
 * @param delay Delay in milliseconds
 */
export function useDelayedAnimation(delay: number) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return isReady
}

/**
 * Hook for viewport size
 */
export function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

/**
 * Hook for staggered animations
 *
 * @param count Number of items
 * @param staggerDelay Delay between each item in seconds
 */
export function useStaggerAnimation(count: number, staggerDelay: number = 0.1) {
  return Array.from({ length: count }).map((_, i) => ({
    transition: { delay: i * staggerDelay },
  }))
}

/**
 * Hook to create a scroll-linked animation
 *
 * @param start Start value
 * @param end End value
 * @param scrollStart When to start animation (0-1)
 * @param scrollEnd When to end animation (0-1)
 */
export function useScrollLinkedAnimation(
  start: number,
  end: number,
  scrollStart: number = 0,
  scrollEnd: number = 1,
) {
  const [value, setValue] = useState(start)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.body.offsetHeight - window.innerHeight
      const scrollProgress = scrollTop / docHeight

      if (scrollProgress < scrollStart) {
        setValue(start)
      } else if (scrollProgress > scrollEnd) {
        setValue(end)
      } else {
        const normalizedProgress =
          (scrollProgress - scrollStart) / (scrollEnd - scrollStart)
        setValue(start + normalizedProgress * (end - start))
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [start, end, scrollStart, scrollEnd])

  return value
}
