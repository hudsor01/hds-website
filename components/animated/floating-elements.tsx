'use client'

import { m } from 'framer-motion'
import { floatingAnimations } from '@/lib/design-system'
import { useState, useEffect } from 'react'

interface FloatingElementsProps {
  count?: number
  lineCount?: number
  color?: 'blue' | 'purple' | 'teal' | 'pink' | 'gray'
  density?: 'sparse' | 'normal' | 'dense'
}

/**
 * Floating background elements for visual interest
 *
 * This component creates animated floating elements as a background effect.
 * It dynamically positions elements and animates them with different speeds and patterns.
 */
export function FloatingElements({
  count = 5,
  lineCount = 3,
  color = 'blue',
  density = 'normal',
}: FloatingElementsProps) {
  // Generate random but stable positions for elements
  const [elements, setElements] = useState<
    Array<{
      x: number
      y: number
      size: number
      speed: 'gentle' | 'medium' | 'active'
      delay: number
      offsetX: number
    }>
  >([])

  const [lines, setLines] = useState<
    Array<{
      x: number
      y: number
      rotation: number
      width: number
      delay: number
    }>
  >([])

  useEffect(() => {
    // Configure elements based on density
    const elementCount =
      density === 'sparse' ? count / 2 : density === 'dense' ? count * 2 : count

    // Generate elements
    const newElements = Array.from({ length: elementCount }, () => {
      const speeds = ['gentle', 'medium', 'active'] as const
      const speedIndex = Math.floor(Math.random() * speeds.length)
      return {
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 8,
        speed: speeds[speedIndex] || 'medium',
        delay: Math.random() * 5,
        offsetX: Math.random() * 20 - 10,
      }
    })

    // Generate lines
    const newLines = Array.from({ length: lineCount }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      rotation: Math.random() * 360,
      width: 150 + Math.random() * 100,
      delay: i * 2,
    }))

    setElements(newElements)
    setLines(newLines)
  }, [count, lineCount, density])

  // Color configuration
  const colorStyles = {
    blue: {
      dot: 'bg-blue-500/20',
      line: 'from-transparent via-blue-500/30 to-transparent',
    },
    purple: {
      dot: 'bg-purple-500/20',
      line: 'from-transparent via-purple-500/30 to-transparent',
    },
    teal: {
      dot: 'bg-teal-500/20',
      line: 'from-transparent via-teal-500/30 to-transparent',
    },
    pink: {
      dot: 'bg-pink-500/20',
      line: 'from-transparent via-pink-500/30 to-transparent',
    },
    gray: {
      dot: 'bg-gray-500/20',
      line: 'from-transparent via-gray-500/30 to-transparent',
    },
  }

  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      {/* Floating shapes */}
      {elements.map((element, i) => (
        <m.div
          key={i}
          className={`absolute rounded-full ${colorStyles[color].dot}`}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, element.offsetX, 0],
          }}
          transition={{
            ...floatingAnimations[element.speed].transition,
            delay: element.delay,
          }}
        />
      ))}

      {/* Glowing lines */}
      {lines.map((line, i) => (
        <m.div
          key={`line-${i}`}
          className={`absolute h-px bg-gradient-to-r ${colorStyles[color].line}`}
          style={{
            width: `${line.width}px`,
            left: `${line.x}%`,
            top: `${line.y}%`,
            transform: `rotate(${line.rotation}deg)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: line.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
