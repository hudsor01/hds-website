'use client'

import { useEffect, useState, useRef } from 'react'

/**
 * Scroll Progress Indicator Component
 *
 * Displays a horizontal progress bar at the top of the page that fills as the user scrolls.
 * Perfect for blog posts and long-form content to give readers a sense of reading progress.
 *
 * Features:
 * - Smooth animation with CSS transitions
 * - Lightweight and performant (uses requestAnimationFrame)
 * - Optimized to only update on significant progress changes (>1%)
 * - Accessible (doesn't interfere with screen readers)
 * - Gradient styling matching brand colors
 *
 * @example
 * ```tsx
 * import ScrollProgress from '@/components/ScrollProgress'
 *
 * export default function BlogPost() {
 *   return (
 *     <>
 *       <ScrollProgress />
 *       <article>...</article>
 *     </>
 *   )
 * }
 * ```
 */

const PROGRESS_UPDATE_THRESHOLD = 1 // Only update if progress changes by more than 1%
const PROGRESS_BAR_Z_INDEX = 50 // Z-index for progress bar (above content, below modals)

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const rafIdRef = useRef<number | null>(null)
  const lastProgressRef = useRef(0)

  useEffect(() => {
    const updateProgress = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

      // Only update state if progress changed significantly (performance optimization)
      if (Math.abs(scrollProgress - lastProgressRef.current) > PROGRESS_UPDATE_THRESHOLD) {
        setProgress(scrollProgress)
        lastProgressRef.current = scrollProgress
      }
    }

    const handleScroll = () => {
      // Cancel previous frame if still pending
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
      // Schedule update on next frame
      rafIdRef.current = requestAnimationFrame(updateProgress)
    }

    // Set initial progress
    updateProgress()

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 bg-muted/50 backdrop-blur-sm"
      style={{ zIndex: PROGRESS_BAR_Z_INDEX }}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
