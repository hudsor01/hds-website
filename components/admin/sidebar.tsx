'use client'

import * as React from 'react'
import {
  ChartColumnIncreasingIcon,
  ChartPieIcon,
  CogIcon,
  FolderIcon,
  CircleHelpIcon,
  SearchIcon,
  UsersIcon,
  HouseIcon,
  FileIcon,
  FileTextIcon,
} from 'lucide-react'

import { NavDocuments } from '@/components/admin/nav-documents'
import { NavMain } from '@/components/admin/nav-main'
import { NavSecondary } from '@/components/admin/nav-secondary'
import { NavUser } from '@/components/admin/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data = {
  user: {
    name: 'Admin',
    email: 'admin@hudsondigitalsolutions.com',
    avatar: '/logo.png',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: HouseIcon,
    },
    {
      title: 'Lifecycle',
      url: '/admin/analytics',
      icon: ChartColumnIncreasingIcon,
    },
    {
      title: 'Analytics',
      url: '/admin/performance',
      icon: ChartPieIcon,
    },
    {
      title: 'Projects',
      url: '/admin/contacts',
      icon: FolderIcon,
    },
    {
      title: 'Team',
      url: '/admin/leads',
      icon: UsersIcon,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: CogIcon,
    },
    {
      title: 'Get Help',
      url: '/admin/help',
      icon: CircleHelpIcon,
    },
    {
      title: 'Search',
      url: '/admin/search',
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: 'Data Library',
      url: '/admin/data-library',
      icon: FileIcon,
    },
    {
      name: 'Reports',
      url: '/admin/reports',
      icon: ChartPieIcon,
    },
    {
      name: 'Documents',
      url: '/admin/documents',
      icon: FileTextIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='offcanvas' {...props} className="fade-in">
      <SidebarHeader className="logical-padding">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-1.5 card-lift focus-ring'
            >
              <a href='/admin'>
                <div className='flex items-center gap-2'>
                  <div className='size-5 rounded bg-gradient-to-br from-brand-500 to-brand-600 shadow-sm'></div>
                  <span className='text-base font-semibold text-gray-900'>Hudson Digital</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}