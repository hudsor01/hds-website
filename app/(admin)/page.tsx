/**
 * Admin Dashboard Page
 * 
 * Implementing the exact Shadcn/UI dashboard-01 block pattern
 * extracted from the official GitHub repository
 */

import React from 'react'
import { AppSidebar } from '@/components/admin/dashboard-01/app-sidebar'
import { ChartAreaInteractive } from '@/components/admin/dashboard-01/chart-area-interactive'
import { ChartBarInteractive } from '@/components/admin/charts/chart-bar-interactive'
import { ChartPieInteractive } from '@/components/admin/charts/chart-pie-interactive'
import { ChartLineInteractive } from '@/components/admin/charts/chart-line-interactive'
import { ChartRadialSimple } from '@/components/admin/charts/chart-radial-simple'
import { DataTable } from '@/components/admin/dashboard-01/data-table'
import { SectionCards } from '@/components/admin/dashboard-01/section-cards'
import { SiteHeader } from '@/components/admin/dashboard-01/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

import data from '@/components/admin/dashboard-01/data.json'

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
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>
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