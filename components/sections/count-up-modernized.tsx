'use client'

import { useState, useTransition, startTransition, useDeferredValue, memo } from 'react'
import { useIntersectionObserver } from '@/hooks/use-intersection-observer-modern'

/**
 * React 19 modernized counter animation component with performance optimizations
 * 
 * Features:
 * - useTransition for non-blocking updates
 * - startTransition for performance
 * - useDeferredValue for deferred rendering
 * - Intersection Observer for performance
 * - React.memo for heavy component optimization
 */
interface CountUpModernizedProps {
  end: number
  suffix?: string
  className?: string
  duration?: number
  trigger?: boolean
}

export const CountUpModernized = memo(function CountUpModernized({
  end,
  suffix = '',
  className = '',
  duration = 1500,
  trigger = true,
}: CountUpModernizedProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isPending, startCountTransition] = useTransition()
  
  // Defer the displayed count for better performance
  const deferredCount = useDeferredValue(count)
  
  // Use intersection observer to trigger animation only when visible
  const { elementRef } = useIntersectionObserver<HTMLSpanElement>({
    threshold: 0.1,
    onIntersect: () => {
      if (!isVisible && trigger) {
        setIsVisible(true)
        animateCount()
      }
    },
  })

  const animateCount = () => {
    let current = 0
    const increment = end / (duration / 30) // 30ms intervals
    
    const timer = setInterval(() => {
      current += increment
      
      if (current >= end) {
        // Use startTransition for the final update
        startTransition(() => {
          setCount(end)
        })
        clearInterval(timer)
      } else {
        // Use startTransition for non-blocking updates
        startCountTransition(() => {
          setCount(Math.floor(current))
        })
      }
    }, 30)

    return () => clearInterval(timer)
  }

  return (
    <span 
      ref={elementRef}
      className={`font-bold transition-all duration-300 ${
        isPending ? 'opacity-75' : 'opacity-100'
      } ${className}`}
      aria-live='polite'
      aria-label={`Count: ${deferredCount}${suffix}`}
    >
      {deferredCount.toLocaleString()}
      {suffix}
    </span>
  )
})

/**
 * Stats section using modernized CountUp with React 19 patterns
 */
interface Stat {
  value: number
  suffix: string
  label: string
  description?: string
}

interface StatsGridProps {
  stats: Stat[]
  title?: string
  subtitle?: string
  className?: string
}

export const StatsGrid = memo(function StatsGrid({
  stats,
  title = 'Results That Speak',
  subtitle = 'Numbers that demonstrate our impact on business growth',
  className = '',
}: StatsGridProps) {
  return (
    <section className={`py-16 bg-gradient-to-b from-slate-50 to-white ${className}`}>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4 text-gray-900'>
            {title}
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            {subtitle}
          </p>
        </div>
        
        <div className='features-grid gap-8 max-w-6xl mx-auto container'>
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className='stats-card text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 scroll-fade-in'
            >
              <div className='text-4xl md:text-5xl font-bold text-blue-600 mb-2'>
                <CountUpModernized
                  end={stat.value}
                  suffix={stat.suffix}
                  duration={1500 + index * 200} // Stagger animations
                />
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                {stat.label}
              </h3>
              {stat.description && (
                <p className='text-sm text-gray-600'>
                  {stat.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

// Default stats for business website
export const defaultBusinessStats: Stat[] = [
  {
    value: 150,
    suffix: '+',
    label: 'Projects Completed',
    description: 'Successful deployments across industries',
  },
  {
    value: 50,
    suffix: '+',
    label: 'Happy Clients',
    description: 'Businesses transformed and growing',
  },
  {
    value: 99,
    suffix: '%',
    label: 'Uptime Achieved',
    description: 'Reliable, production-ready solutions',
  },
  {
    value: 24,
    suffix: '/7',
    label: 'Support Available',
    description: 'Round-the-clock monitoring and help',
  },
]