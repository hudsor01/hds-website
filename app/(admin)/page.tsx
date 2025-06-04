/**
 * Admin Dashboard Page
 * 
 * Implementing the Shadcn/UI admin dashboard pattern
 * extracted from the official GitHub repository
 */

import React from 'react'
import { AppSidebar } from '@/components/admin/sidebar'
import { ChartAreaInteractive } from '@/components/admin/charts/chart-area-interactive'
import { ChartBarInteractive } from '@/components/admin/charts/chart-bar-interactive'
import { ChartPieInteractive } from '@/components/admin/charts/chart-pie-interactive'
import { ChartLineInteractive } from '@/components/admin/charts/chart-line-interactive'
import { ChartRadialSimple } from '@/components/admin/charts/chart-radial-simple'
import { DataTable } from '@/components/admin/data-table'
import { SectionCards } from '@/components/admin/cards'
import { SiteHeader } from '@/components/admin/header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

import data from '@/components/admin/data.json'

export default function AdminDashboard() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant='inset' />
      <SidebarInset className="fade-in">
        <SiteHeader />
        <div className='flex flex-1 flex-col logical-padding'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
              <SectionCards />
              
              {/* Analytics Dashboard with Comprehensive Charts */}
              <div className='px-4 lg:px-6'>
                <div className='grid gap-4 md:gap-6'>
                  {/* Primary Website Traffic Chart */}
                  <ChartAreaInteractive />
                  
                  {/* Revenue and Performance Charts */}
                  <div className='grid gap-4 md:grid-cols-2 lg:gap-6'>
                    <ChartLineInteractive />
                    <ChartRadialSimple />
                  </div>
                  
                  {/* Client Acquisition Analytics */}
                  <div className='grid gap-4 md:grid-cols-2 lg:gap-6'>
                    <ChartBarInteractive />
                    <ChartPieInteractive />
                  </div>
                </div>
              </div>
              
              {/* Data Table */}
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}