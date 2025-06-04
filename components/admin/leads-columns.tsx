/**
 * Lead Management Table Columns
 * 
 * Column definitions for the lead management data table
 * using React Table with shadcn/ui components
 */

'use client'

import { type ColumnDef } from '@tanstack/react-table'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowUpDown, MoreHorizontal, Mail, Phone, ExternalLink } from 'lucide-react'

import type { Lead } from '@/types/admin-types'
import { LeadStatus, LeadSource } from '@/types/enum-types'

// Using Lead type from admin-types.ts

// Status badge component
function StatusBadge({ status }: { status: Lead['status'] }) {
  const statusConfig = {
    [LeadStatus.NEW]: { label: 'New', variant: 'secondary' as const },
    [LeadStatus.CONTACTED]: { label: 'Contacted', variant: 'outline' as const },
    [LeadStatus.QUALIFIED]: { label: 'Qualified', variant: 'default' as const },
    [LeadStatus.PROPOSAL_SENT]: { label: 'Proposal', variant: 'destructive' as const },
    [LeadStatus.NEGOTIATING]: { label: 'Negotiating', variant: 'default' as const },
    [LeadStatus.CLOSED_WON]: { label: 'Won', variant: 'default' as const },
    [LeadStatus.CLOSED_LOST]: { label: 'Lost', variant: 'secondary' as const },
    [LeadStatus.UNQUALIFIED]: { label: 'Unqualified', variant: 'secondary' as const },
  }
  
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

// Source badge component
function SourceBadge({ source }: { source: Lead['source'] }) {
  const sourceConfig = {
    [LeadSource.ORGANIC_SEARCH]: { label: 'Organic Search', variant: 'default' as const },
    [LeadSource.PAID_SEARCH]: { label: 'Paid Search', variant: 'default' as const },
    [LeadSource.SOCIAL_MEDIA]: { label: 'Social Media', variant: 'outline' as const },
    [LeadSource.REFERRAL]: { label: 'Referral', variant: 'secondary' as const },
    [LeadSource.DIRECT]: { label: 'Direct', variant: 'default' as const },
    [LeadSource.EMAIL]: { label: 'Email', variant: 'destructive' as const },
    [LeadSource.PARTNERSHIP]: { label: 'Partnership', variant: 'secondary' as const },
    [LeadSource.OTHER]: { label: 'Other', variant: 'secondary' as const },
  }
  
  const config = sourceConfig[source]
  return <Badge variant={config.variant}>{config.label}</Badge>
}

// Column definitions
export const columns: ColumnDef<Lead>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{row.getValue('email')}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`mailto:${row.getValue('email')}`, '_blank')}
        >
          <Mail className="h-3 w-3" />
        </Button>
      </div>
    ),
  },
  {
    accessorKey: 'company',
    header: 'Company',
    cell: ({ row }) => {
      const company = row.getValue('company') as string
      return company ? (
        <div className="text-sm">{company}</div>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <SourceBadge source={row.getValue('source')} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'service',
    header: 'Service',
    cell: ({ row }) => {
      const service = row.getValue('service') as string
      return service ? (
        <div className="text-sm">{service}</div>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      )
    },
  },
  {
    accessorKey: 'value',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Value
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const value = row.getValue('value') as number
      return (
        <div className="text-right font-medium">
          ${value.toLocaleString()}
        </div>
      )
    },
  },
  {
    accessorKey: 'lastContact',
    header: 'Last Contact',
    cell: ({ row }) => {
      const date = new Date(row.getValue('lastContact'))
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const lead = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(lead.email)}
            >
              Copy email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(`tel:${lead.email}`, '_blank')}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call lead
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ExternalLink className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]