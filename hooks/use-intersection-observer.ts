import { useEffect, useRef, useState } from 'react'

export interface UseIntersectionObserverProps {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
  initialIsIntersecting?: boolean
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
  initialIsIntersecting = false,
}: UseIntersectionObserverProps = {}): [
  React.RefObject<Element>,
  boolean,
  IntersectionObserverEntry | undefined
] {
  const elementRef = useRef<Element>(null)
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting)

  const frozen = entry?.isIntersecting && freezeOnceVisible

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
    setIsIntersecting(entry.isIntersecting)
  }

  useEffect(() => {
    const node = elementRef?.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    observer.observe(node)

    return () => observer.disconnect()
  }, [elementRef, threshold, root, rootMargin, frozen])

  return [elementRef, isIntersecting, entry]
}

/**
 * Hook for lazy loading components when they come into view
 */
export function useLazyLoad(options?: UseIntersectionObserverProps) {
  const [ref, isIntersecting, entry] = useIntersectionObserver({
    freezeOnceVisible: true,
    threshold: 0.1,
    ...options,
  })

  return {
    ref,
    isVisible: isIntersecting,
    entry,
    shouldLoad: isIntersecting,
  }
}

/**
 * Hook for triggering animations when elements come into view
 */
export function useAnimationTrigger(options?: UseIntersectionObserverProps) {
  const [ref, isIntersecting, entry] = useIntersectionObserver({
    freezeOnceVisible: true,
    threshold: 0.2,
    rootMargin: '-10px',
    ...options,
  })

  return {
    ref,
    isVisible: isIntersecting,
    entry,
    shouldAnimate: isIntersecting,
  }
}

/**
 * Hook for preloading content before it becomes visible
 */
export function usePreload(options?: UseIntersectionObserverProps) {
  const [ref, isIntersecting, entry] = useIntersectionObserver({
    freezeOnceVisible: true,
    threshold: 0,
    rootMargin: '100px', // Preload 100px before visible
    ...options,
  })

  return {
    ref,
    isVisible: isIntersecting,
    entry,
    shouldPreload: isIntersecting,
  }
}