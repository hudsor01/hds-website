/**
 * Admin Leads Page
 * 
 * Displays all leads with filtering, sorting, and management capabilities
 * Following shadcn/ui data table patterns with real tRPC integration
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { 
  Plus, 
  Download, 
  Filter, 
  Search,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { api } from '@/lib/trpc/client'

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'UNRESPONSIVE'

const statusColors: Record<LeadStatus, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800', 
  QUALIFIED: 'bg-green-100 text-green-800',
  PROPOSAL_SENT: 'bg-purple-100 text-purple-800',
  WON: 'bg-emerald-100 text-emerald-800',
  LOST: 'bg-red-100 text-red-800',
  UNRESPONSIVE: 'bg-gray-100 text-gray-800',
}

const serviceOptions = [
  { value: 'web', label: 'Web Development' },
  { value: 'revops', label: 'Revenue Operations' },
  { value: 'analytics', label: 'Data Analytics' },
  { value: 'consulting', label: 'Consulting' },
]

export default function LeadsPage() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    status: '' as LeadStatus | '',
    service: '',
    search: '',
  })

  // Fetch leads data
  const { data: leadsData, isLoading: leadsLoading, refetch: refetchLeads } = api.admin.getLeads.useQuery({
    page,
    limit: 10,
    ...(filters.status && { status: filters.status }),
    ...(filters.service && { service: filters.service }),
    ...(filters.search && { search: filters.search }),
  })

  // Fetch lead analytics
  const { data: analytics, isLoading: analyticsLoading } = api.admin.getLeadAnalytics.useQuery({})

  // Update lead status mutation
  const updateStatusMutation = api.admin.updateLeadStatus.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Lead status updated successfully' })
      refetchLeads()
    },
    onError: (error) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update lead status',
        variant: 'destructive',
      })
    },
  })

  const handleStatusUpdate = (leadId: string, newStatus: LeadStatus) => {
    updateStatusMutation.mutate({ id: leadId, status: newStatus })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1) // Reset to first page when filtering
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const formatCurrency = (value: string) => {
    if (value.startsWith('$')) return value
    return `$${value}`
  }

  const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  const exportLeads = async () => {
    try {
      // Get all leads for export (without pagination)
      const exportData = await api.admin.getLeads.query({
        page: 1,
        limit: 1000, // Large limit to get all leads
        ...(filters.status && { status: filters.status }),
        ...(filters.service && { service: filters.service }),
        ...(filters.search && { search: filters.search }),
      })

      if (!exportData?.leads.length) {
        toast({
          title: 'No Data to Export',
          description: 'No leads found matching current filters.',
          variant: 'destructive',
        })
        return
      }

      // Prepare CSV data
      const headers = ['Name', 'Email', 'Company', 'Phone', 'Service', 'Budget', 'Status', 'Message', 'Source', 'Created Date']
      const csvData = exportData.leads.map(lead => [
        lead.name,
        lead.email,
        lead.company || '',
        lead.phone || '',
        lead.service || '',
        lead.budget || '',
        lead.status.replace('_', ' '),
        lead.message.replace(/[\r\n]+/g, ' '), // Remove line breaks for CSV
        lead.source || '',
        formatDate(lead.createdAt),
      ])

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `'${field.replace(/'/g, '\'\'')}'` 
            : field,
        ).join(',')),
      ].join('\n')

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Export Complete',
        description: `Successfully exported ${exportData.leads.length} leads.`,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export leads. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Leads</h1>
          <p className='text-muted-foreground'>
            Manage and track your sales leads
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm' onClick={exportLeads}>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
          <Button size='sm'>
            <Plus className='mr-2 h-4 w-4' />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Leads</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <>
                <div className='text-2xl font-bold'>{analytics?.overview.totalLeads || 0}</div>
                <p className='text-xs text-muted-foreground'>
                  {analytics?.overview.newLeads || 0} new this month
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Qualified</CardTitle>
            <Target className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <>
                <div className='text-2xl font-bold'>{analytics?.overview.qualifiedLeads || 0}</div>
                <p className='text-xs text-muted-foreground'>
                  Ready for proposal
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Conversion Rate</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <>
                <div className='text-2xl font-bold'>{analytics?.overview.conversionRate || 0}%</div>
                <p className='text-xs text-muted-foreground'>
                  Leads to customers
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Pipeline Value</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className='h-8 w-20' />
            ) : (
              <>
                <div className='text-2xl font-bold'>${analytics?.overview.pipelineValue?.toLocaleString() || 0}</div>
                <p className='text-xs text-muted-foreground'>
                  Qualified + Proposal Sent
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='flex items-center gap-2'>
              <Search className='h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search leads...'
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className='w-64'
              />
            </div>
            
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Filter by status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>All Statuses</SelectItem>
                <SelectItem value='NEW'>New</SelectItem>
                <SelectItem value='CONTACTED'>Contacted</SelectItem>
                <SelectItem value='QUALIFIED'>Qualified</SelectItem>
                <SelectItem value='PROPOSAL_SENT'>Proposal Sent</SelectItem>
                <SelectItem value='WON'>Won</SelectItem>
                <SelectItem value='LOST'>Lost</SelectItem>
                <SelectItem value='UNRESPONSIVE'>Unresponsive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.service}
              onValueChange={(value) => handleFilterChange('service', value)}
            >
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Filter by service' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>All Services</SelectItem>
                {serviceOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filters.status || filters.service || filters.search) && (
              <Button
                variant='outline'
                onClick={() => {
                  setFilters({ status: '', service: '', search: '' })
                  setPage(1)
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            A list of all leads with their current status and details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leadsLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsData?.leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <div className='font-medium'>{lead.name}</div>
                          <div className='text-sm text-muted-foreground'>{lead.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{lead.company || 'N/A'}</TableCell>
                      <TableCell>
                        {lead.service ? serviceOptions.find(s => s.value === lead.service)?.label || lead.service : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[lead.status as LeadStatus]}>
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(lead.value)}</TableCell>
                      <TableCell>{lead.source}</TableCell>
                      <TableCell>{formatDate(lead.createdAt)}</TableCell>
                      <TableCell className='text-right'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(lead.id, 'CONTACTED')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Mark as Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(lead.id, 'QUALIFIED')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Mark as Qualified
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(lead.id, 'PROPOSAL_SENT')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Mark as Proposal Sent
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(lead.id, 'WON')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Mark as Won
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(lead.id, 'LOST')}
                              disabled={updateStatusMutation.isPending}
                            >
                              Mark as Lost
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {leadsData?.pagination && leadsData.pagination.pages > 1 && (
                <div className='flex items-center justify-between py-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing {((leadsData.pagination.page - 1) * leadsData.pagination.limit) + 1} to{' '}
                    {Math.min(leadsData.pagination.page * leadsData.pagination.limit, leadsData.pagination.total)} of{' '}
                    {leadsData.pagination.total} results
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className='h-4 w-4' />
                      Previous
                    </Button>
                    <span className='text-sm'>
                      Page {leadsData.pagination.page} of {leadsData.pagination.pages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === leadsData.pagination.pages}
                    >
                      Next
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}