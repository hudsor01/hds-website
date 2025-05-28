/**
 * Admin Template
 * 
 * Template wrapper for admin pages following shadcn/ui patterns
 * Includes theme provider and provider setup
 */

'use client'

import React, { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ThemeProvider } from 'next-themes'

interface AdminTemplateProps {
  children: React.ReactNode
}

export default function AdminTemplate({ children }: AdminTemplateProps) {
  const pathname = usePathname()

  useEffect(() => {
    // This effect runs on every route change within the admin section
    if (typeof window !== 'undefined') {
      console.log(`Admin page view: ${pathname}`)
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <div className='admin-template'>
        {children}
      </div>
    </ThemeProvider>
  )
}