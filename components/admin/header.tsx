/**
 * Site Header Component
 * 
 * Admin dashboard header with breadcrumbs and trigger following shadcn/ui patterns
 */

'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  SidebarTrigger,
} from '@/components/ui/sidebar'

interface BreadcrumbSegment {
  title: string
  href?: string
  isCurrentPage?: boolean
}

const routeTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/leads': 'Leads',
  '/admin/customers': 'Customers',
  '/admin/contacts': 'Contact Submissions',
  '/admin/analytics': 'Analytics',
  '/admin/settings': 'Settings',
}

function generateBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbSegment[] = []

  // Build the path incrementally
  let currentPath = ''
  
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`
    const isCurrentPage = i === segments.length - 1
    const title = routeTitles[currentPath] || segments[i]
    
    breadcrumbs.push({
      title,
      href: isCurrentPage ? undefined : currentPath,
      isCurrentPage,
    })
  }

  return breadcrumbs
}

function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon'>
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-white/95 backdrop-blur-md border-b border-gray-200 fade-in'>
      <div className='flex items-center gap-2 px-4 logical-padding'>
        <SidebarTrigger className='-ml-1 button-press focus-ring' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.title}>
                {index > 0 && <BreadcrumbSeparator className='hidden md:block' />}
                <BreadcrumbItem className={index === 0 ? 'hidden md:block' : ''}>
                  {breadcrumb.isCurrentPage ? (
                    <BreadcrumbPage className="text-brand-600 font-medium">{breadcrumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={breadcrumb.href} className="text-gray-600 hover:text-brand-500 transition-colors focus-ring">
                      {breadcrumb.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className='ml-auto px-4'>
        <ThemeToggle />
      </div>
    </header>
  )
}