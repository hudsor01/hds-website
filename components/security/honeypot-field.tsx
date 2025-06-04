/**
 * Honeypot Field Component
 * 
 * A hidden field that bots typically fill out but humans don't see.
 * This is a simple but effective spam prevention technique.
 */

import React, { useState, useEffect } from 'react'
import type { BaseComponentProps } from '@/types/ui-types'

export interface HoneypotFieldProps extends BaseComponentProps {
  name?: string
  tabIndex?: number
  autoComplete?: string
}

/**
 * Honeypot field that's invisible to users but visible to bots
 */
export function HoneypotField({ 
  name = 'website',
  tabIndex = -1,
  autoComplete = 'off',
}: HoneypotFieldProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
        tabIndex: -1,
      }}
      aria-hidden="true"
    >
      <input
        type="text"
        name={name}
        tabIndex={tabIndex}
        autoComplete={autoComplete}
        value=""
        onChange={() => {}} // No-op to prevent React warnings
        style={{ 
          position: 'absolute',
          left: '-9999px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

/**
 * Timing-based honeypot that tracks form fill time
 * Bots typically fill forms very quickly
 */
export interface TimingHoneypotProps {
  minTime?: number // Minimum time in milliseconds before form can be submitted
  onValidationChange?: (isValid: boolean) => void
}

export function TimingHoneypot({ 
  minTime = 3000, // 3 seconds minimum
  onValidationChange, 
}: TimingHoneypotProps) {
  const [startTime] = useState(Date.now())
  const [_isValid, setIsValid] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsValid(true)
      onValidationChange?.(true)
    }, minTime)

    return () => clearTimeout(timer)
  }, [minTime, onValidationChange])

  // Hidden field to track timing
  return (
    <input
      type="hidden"
      name="form_start_time"
      value={startTime.toString()}
      readOnly
    />
  )
}

export default HoneypotField