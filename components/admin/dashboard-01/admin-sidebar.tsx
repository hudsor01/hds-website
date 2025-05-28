import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  ChevronRight,
  BarChart3,
  Users,
  UserCheck,
  MessageSquare,
  Settings,
  Menu,
  Home,
  TrendingUp,
  LogOut,
} from 'lucide-react'
import Image from 'next/image'
import type { AdminNavItem } from '../../../types/admin-types'

interface SidebarCounts {
  leads: number
  contacts: number
  unreadMessages?: number
}

interface AdminUser {
  name: string
  email: string
  avatar?: string
}

interface AdminSidebarProps {
  className?: string
  collapsed?: boolean
  onToggleCollapse?: () => void
  userPermissions?: string[]
  counts?: SidebarCounts
  adminUser?: AdminUser
  onLogout?: () => void
}

interface NavItemProps {
  item: AdminNavItem
  isActive: boolean
  collapsed?: boolean
  userPermissions?: string[]
  pathname: string
}

function getAdminNavItems(counts: SidebarCounts = { leads: 0, contacts: 0 }): AdminNavItem[] {
  return [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin',
      icon: Home,
      permissions: ['leads:view'],
    },
    {
      id: 'leads',
      label: 'Leads',
      href: '/admin/leads',
      icon: TrendingUp,
      permissions: ['leads:view'],
      badge: counts.leads > 0 ? counts.leads.toString() : undefined,
    },
    {
      id: 'customers',
      label: 'Customers',
      href: '/admin/customers',
      icon: Users,
      permissions: ['customers:view'],
    },
    {
      id: 'contacts',
      label: 'Contact Submissions',
      href: '/admin/contacts',
      icon: MessageSquare,
      permissions: ['contacts:view'],
      badge: counts.contacts > 0 ? counts.contacts.toString() : undefined,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      permissions: ['analytics:view'],
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      permissions: ['admin:settings'],
    },
  ]
}

function isChildActive(item: AdminNavItem, pathname: string): boolean {
  if (!item.children) return false
  return item.children.some(child => 
    pathname === child.href || 
    (child.children && isChildActive(child, pathname)),
  )
}

function isItemActive(item: AdminNavItem, pathname: string): boolean {
  if (pathname === item.href) return true
  if (item.children) {
    return isChildActive(item, pathname)
  }
  return false
}

function NavItem({ item, isActive, collapsed, userPermissions = [], pathname }: NavItemProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = item.children && item.children.length > 0
  const hasPermission = !item.permissions || item.permissions.some(p => userPermissions.includes(p))
  const hasActiveChild = hasChildren && isChildActive(item, pathname)

  React.useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true)
    }
  }, [hasActiveChild])

  if (!hasPermission) {
    return null
  }

  // Fix: Declare Icon before JSX
  const Icon = item.icon as React.ElementType | undefined

  const content = (
    <div className='flex items-center gap-3 w-full'>
      {Icon && (
        <Icon
          className={cn(
            'flex-shrink-0 transition-all',
            collapsed ? 'h-5 w-5' : 'h-4 w-4',
          )}
        />
      )}
      {!collapsed && (
        <>
          <span className='truncate flex-1 text-left'>{item.label}</span>
          {item.badge && (
            <span className='bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full'>
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-90',
            )} />
          )}
        </>
      )}
    </div>
  )

  if (hasChildren) {
    return (
      <div className='space-y-1'>
        <Button
          variant={isActive || hasActiveChild ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start h-9',
            collapsed && 'justify-center px-2',
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {content}
        </Button>
        {isOpen && !collapsed && (
          <div className='ml-6 space-y-1 border-l pl-4'>
            {item.children?.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                isActive={isItemActive(child, pathname)}
                collapsed={false}
                userPermissions={userPermissions}
                pathname={pathname}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start h-9',
        collapsed && 'justify-center px-2',
      )}
      asChild
    >
      <Link href={item.href}>
        {content}
      </Link>
    </Button>
  )
}

function SidebarContent({ 
  className, 
  collapsed, 
  userPermissions, 
  counts = { leads: 0, contacts: 0 },
  adminUser = { name: 'Admin User', email: 'admin@example.com' },
  onLogout, 
}: Omit<AdminSidebarProps, 'onToggleCollapse'>) {
  const pathname = usePathname()
  const navItems = getAdminNavItems(counts)

  return (
    <div className={cn('flex flex-col h-full bg-background border-r', className)}>
      {/* Header */}
      <div className={cn(
        'p-4 border-b',
        collapsed && 'p-2',
      )}>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 bg-primary rounded-lg flex items-center justify-center'>
            <span className='text-primary-foreground font-bold text-sm'>H</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className='font-semibold text-sm'>Hudson Digital Solutions</h2>
              <p className='text-xs text-muted-foreground'>Admin Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 p-4 space-y-2 overflow-y-auto'>
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={isItemActive(item, pathname)}
            collapsed={collapsed}
            userPermissions={userPermissions}
            pathname={pathname}
          />
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className={cn(
        'p-4 border-t',
        collapsed && 'p-2',
      )}>
        <Card className='p-3'>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 bg-muted rounded-full flex items-center justify-center'>
              {adminUser.avatar ? (
                <Image
                  src={adminUser.avatar}
                  alt={adminUser.name}
                  width={32}
                  height={32}
                  className='h-8 w-8 rounded-full object-cover'
                />
              ) : (
                <UserCheck className='h-4 w-4' />
              )}
            </div>
            {!collapsed && (
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium truncate'>{adminUser.name}</p>
                <p className='text-xs text-muted-foreground truncate'>{adminUser.email}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className='mt-3 flex gap-2'>
              <Button size='sm' variant='outline' className='flex-1' asChild>
                <Link href='/admin/settings'>
                  <Settings className='h-3 w-3 mr-1' />
                  Settings
                </Link>
              </Button>
              <Button 
                size='sm' 
                variant='outline'
                onClick={onLogout}
                title='Logout'
              >
                <LogOut className='h-3 w-3' />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export function AdminSidebar({ 
  className, 
  collapsed = false, 
  userPermissions, 
  counts,
  adminUser,
  onLogout, 
}: AdminSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        'hidden lg:flex transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className,
      )}>
        <SidebarContent 
          collapsed={collapsed} 
          userPermissions={userPermissions}
          counts={counts}
          adminUser={adminUser}
          onLogout={onLogout}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='lg:hidden'
          >
            <Menu className='h-4 w-4' />
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-64 p-0'>
          <SidebarContent 
            userPermissions={userPermissions}
            counts={counts}
            adminUser={adminUser}
            onLogout={onLogout}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default AdminSidebar