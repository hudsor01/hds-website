import { useEffect, useRef, useState, useCallback } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  onIntersect?: (entry: IntersectionObserverEntry) => void
  onLeave?: (entry: IntersectionObserverEntry) => void
}

/**
 * React 19 optimized Intersection Observer hook
 * 
 * Provides performance-optimized intersection observing with callback support
 */
export function useIntersectionObserver<T extends Element>({
  threshold = 0.1,
  root = null,
  rootMargin = '0px',
  onIntersect,
  onLeave,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const elementRef = useRef<T>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      const isCurrentlyIntersecting = entry.isIntersecting

      setIsIntersecting(isCurrentlyIntersecting)

      if (isCurrentlyIntersecting) {
        setHasIntersected(true)
        onIntersect?.(entry)
      } else if (hasIntersected) {
        onLeave?.(entry)
      }
    },
    [onIntersect, onLeave, hasIntersected],
  )

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      root,
      rootMargin,
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [handleIntersection, threshold, root, rootMargin])

  return {
    elementRef,
    isIntersecting,
    hasIntersected,
  }
}