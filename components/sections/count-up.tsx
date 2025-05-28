'use client'

import { useState, useEffect } from 'react'

/**
 * A simple counter animation component
 *
 * Animates counting up to a specified number with optional suffix
 */
export function CountUp({
  end,
  suffix = '',
}: {
  end: number
  suffix?: string
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let current = 0
    const increment = end / 50
    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 30)

    return () => clearInterval(timer)
  }, [end])

  return (
    <>
      {count}
      {suffix}
    </>
  )
}
