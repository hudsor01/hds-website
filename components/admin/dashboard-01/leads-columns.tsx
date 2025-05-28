/**
 * Leads Data Table Columns
 * 
 * Column definitions for the leads data table
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'

// Lead data type (should match our admin types)
export type Lead = {
  id: string
  name: string
  email: string
  company?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal-sent' | 'negotiating' | 'won' | 'lost'
  source: 'website' | 'organic-search' | 'paid-search' | 'social-media' | 'referral' | 'email' | 'partnership'
  service?: string
  value: number
  lastContact: string
}

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800', 
  qualified: 'bg-green-100 text-green-800',
  'proposal-sent': 'bg-purple-100 text-purple-800',
  negotiating: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
}

const sourceColors = {
  website: 'bg-blue-100 text-blue-800',
  'organic-search': 'bg-green-100 text-green-800',
  'paid-search': 'bg-yellow-100 text-yellow-800',
  'social-media': 'bg-purple-100 text-purple-800',
  referral: 'bg-orange-100 text-orange-800',
  email: 'bg-gray-100 text-gray-800',
  partnership: 'bg-indigo-100 text-indigo-800',
}

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div>
          <div className='font-medium'>{lead.name}</div>
          <div className='text-sm text-muted-foreground'>{lead.email}</div>
        </div>
      )
    },
  },
  {
    accessorKey: 'company',
    header: 'Company',
    cell: ({ row }) => <div className='font-medium'>{row.getValue('company') || 'N/A'}</div>,
  },
  {
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge 
          variant='secondary'
          className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
        >
          {status.replace('-', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'source',
    header: 'Source', 
    cell: ({ row }) => {
      const source = row.getValue('source') as string
      return (
        <Badge 
          variant='outline'
          className={sourceColors[source as keyof typeof sourceColors] || 'bg-gray-100 text-gray-800'}
        >
          {source.replace('-', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'service',
    header: 'Service',
    cell: ({ row }) => {
      const service = row.getValue('service') as string | undefined
      return <div className='capitalize'>{service ? service.replace('-', ' ') : 'N/A'}</div>
    },
  },
  {
    accessorKey: 'value',
    header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='justify-end'
        >
          Value
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
    cell: ({ row }) => {
      const value = parseFloat(row.getValue('value'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value)
      return <div className='text-right font-medium'>{formatted}</div>
    },
  },
  {
    accessorKey: 'lastContact',
    header: 'Last Contact',
    cell: ({ row }) => {
      const date = new Date(row.getValue('lastContact'))
      return <div className='text-sm'>{date.toLocaleDateString()}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const lead = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(lead.id)}
            >
              Copy lead ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem>
            <DropdownMenuItem>Edit lead</DropdownMenuItem>
            <DropdownMenuItem>Send email</DropdownMenuItem>
            <DropdownMenuItem>Mark as qualified</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]