/**
 * Admin Layout
 * 
 * Minimal layout for admin dashboard implementation
 * The admin dashboard provides its own complete layout structure
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