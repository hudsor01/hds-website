/**
 * Admin Layout
 * 
 * Minimal layout for dashboard-01 block implementation
 * The dashboard-01 block provides its own complete layout structure
 */

import React from 'react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='h-screen'>
      {children}
    </div>
  )
}