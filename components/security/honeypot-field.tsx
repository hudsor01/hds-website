/**
 * Honeypot Field Component
 * 
 * A hidden field that bots typically fill out but humans don't see.
 * This is a simple but effective spam prevention technique.
 */

import React from 'react'

interface HoneypotFieldProps {
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

export default HoneypotField