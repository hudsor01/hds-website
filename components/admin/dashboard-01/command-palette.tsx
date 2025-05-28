/**
 * Command Palette Component
 * 
 * Global command palette for admin dashboard following shadcn/ui patterns
 */

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Calculator,
  Calendar,
  CreditCard,
  Search,
  Settings,
  Smile,
  User,
  BarChart3,
  Users,
  MessageSquare,
  TrendingUp,
  Home,
  FileText,
  Download,
  Plus,
} from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading='Navigation'>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin'))}>
            <Home className='mr-2 h-4 w-4' />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/analytics'))}>
            <BarChart3 className='mr-2 h-4 w-4' />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/leads'))}>
            <TrendingUp className='mr-2 h-4 w-4' />
            <span>Leads</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/contacts'))}>
            <MessageSquare className='mr-2 h-4 w-4' />
            <span>Contact Submissions</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/performance'))}>
            <BarChart3 className='mr-2 h-4 w-4' />
            <span>Performance</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading='Actions'>
          <CommandItem onSelect={() => runCommand(() => console.log('Export data'))}>
            <Download className='mr-2 h-4 w-4' />
            <span>Export Data</span>
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => console.log('Create new lead'))}>
            <Plus className='mr-2 h-4 w-4' />
            <span>Create New Lead</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => console.log('Generate report'))}>
            <FileText className='mr-2 h-4 w-4' />
            <span>Generate Report</span>
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading='Settings'>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin/settings'))}>
            <Settings className='mr-2 h-4 w-4' />
            <span>Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => console.log('Profile'))}>
            <User className='mr-2 h-4 w-4' />
            <span>Profile</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}