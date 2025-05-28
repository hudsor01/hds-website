'use client'

/**
 * Unified Animation Hooks
 *
 * This file consolidates all animation hooks used throughout the application
 * to ensure consistency and prevent duplication. These hooks provide declarative
 * ways to add animations to components.
 */

import { useInView as useFramerInView, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useRef, useEffect, useState } from 'react'

/**
 * Hook for scroll-triggered animations using Intersection Observer
 *
 * @param options Configuration options
 * @param options.threshold Fraction of element that must be visible to trigger
 * @param options.once Only trigger animation once
 * @param options.rootMargin Margin around the root element
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
 * Hook for scroll-triggered animations using Framer Motion's useInView
 *
 * @param options Configuration options
 * @param options.threshold Fraction of element that must be visible to trigger
 * @param options.once Only trigger animation once
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
