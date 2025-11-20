'use client'

import { useEffect, useState } from 'react'

/**
 * Scroll Progress Indicator Component
 *
 * Displays a horizontal progress bar at the top of the page that fills as the user scrolls.
 * Perfect for blog posts and long-form content to give readers a sense of reading progress.
 *
 * Features:
 * - Smooth animation with CSS transitions
 * - Lightweight and performant (uses requestAnimationFrame)
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
export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let rafId: number

    const updateProgress = () => {
      // Calculate scroll progress
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0

      setProgress(scrollProgress)
    }

    const handleScroll = () => {
      // Use requestAnimationFrame for smooth performance
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      rafId = requestAnimationFrame(updateProgress)
    }

    // Set initial progress
    updateProgress()

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-800/50 backdrop-blur-sm"
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
