/**
 * Admin Contact Submissions Page
 * 
 * Production-ready contact management with real tRPC API integration
 * Features filtering, sorting, status management, and analytics
 */

'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MoreHorizontal, Reply, Star, Download, Search, RefreshCw, Mail, Phone } from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { ContactStatus } from '@prisma/client'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'

type ContactFilters = {
  status?: ContactStatus
  service?: string
  search?: string
  startDate?: string
  endDate?: string
}

const getStatusBadge = (status: ContactStatus) => {
  const variants = {
    NEW: { variant: 'default' as const, color: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
    CONTACTED: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    QUALIFIED: { variant: 'default' as const, color: 'bg-green-100 text-green-800 hover:bg-green-100' },
    PROPOSAL_SENT: { variant: 'secondary' as const, color: 'bg-purple-100 text-purple-800 hover:bg-purple-100' },
    WON: { variant: 'default' as const, color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' },
    LOST: { variant: 'secondary' as const, color: 'bg-red-100 text-red-800 hover:bg-red-100' },
    UNRESPONSIVE: { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
  }

  const config = variants[status]
  return (
    <Badge className={config.color}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

const getServiceBadge = (service?: string) => {
  if (!service) return null
  
  const serviceLabels = {
    'web': 'Web Development',
    'revops': 'Revenue Operations', 
    'analytics': 'Data Analytics',
    'seo': 'SEO Services',
    'consulting': 'Consulting',
  }
  
  return (
    <Badge variant='outline'>
      {serviceLabels[service as keyof typeof serviceLabels] || service}
    </Badge>
  )
}

export default function ContactsPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ContactFilters>({})
  const [_selectedContact, setSelectedContact] = useState<string | null>(null)

  // Fetch contacts with real-time updates
  const {
    data: contactsData,
    isLoading: contactsLoading,
    refetch: refetchContacts,
  } = api.admin.getContacts.useQuery({
    page,
    limit: 10,
    ...filters,
  })

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = api.admin.getContactAnalytics.useQuery({
    startDate: filters.startDate,
    endDate: filters.endDate,
  })

  // Update contact status mutation
  const updateStatusMutation = api.admin.updateContactStatus.useMutation({
    onSuccess: () => {
      toast({
        title: 'Status Updated',
        description: 'Contact status has been updated successfully.',
      })
      refetchContacts()
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleStatusUpdate = async (contactId: string, newStatus: ContactStatus) => {
    await updateStatusMutation.mutateAsync({
      id: contactId,
      status: newStatus,
    })
  }

  const handleFilterChange = (key: keyof ContactFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }))
    setPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setFilters({})
    setPage(1)
  }

  const exportContacts = async () => {
    try {
      // Get all contacts for export (without pagination)
      const exportData = await api.admin.getContacts.query({
        page: 1,
        limit: 1000, // Large limit to get all contacts
        ...filters,
      })

      if (!exportData?.contacts.length) {
        toast({
          title: 'No Data to Export',
          description: 'No contacts found matching current filters.',
          variant: 'destructive',
        })
        return
      }

      // Prepare CSV data
      const headers = ['Name', 'Email', 'Company', 'Phone', 'Subject', 'Service', 'Status', 'Message', 'Created Date']
      const csvData = exportData.contacts.map(contact => [
        contact.name,
        contact.email,
        contact.company || '',
        contact.phone || '',
        contact.subject || 'General Inquiry',
        contact.service || '',
        contact.status.replace('_', ' '),
        contact.message.replace(/[\r\n]+/g, ' '), // Remove line breaks for CSV
        new Date(contact.createdAt).toLocaleDateString(),
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
      link.setAttribute('download', `contacts-export-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Export Complete',
        description: `Successfully exported ${exportData.contacts.length} contacts.`,
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export contacts. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Contact Submissions</h1>
          <p className='text-muted-foreground'>
            Manage and track all contact form submissions
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button 
            variant='outline' 
            size='sm' 
            onClick={() => refetchContacts()}
            disabled={contactsLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${contactsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant='outline' size='sm' onClick={exportContacts}>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className='grid gap-4 md:grid-cols-4'>
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <Skeleton className='h-8 w-16 mb-2' />
                <Skeleton className='h-4 w-24' />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Total Submissions</CardTitle>
                <Mail className='h-4 w-4 text-muted-foreground' />
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>{analyticsData?.summary.total || 0}</div>
                <p className='text-xs text-muted-foreground'>
                  All time submissions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>New</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-blue-600'>{analyticsData?.summary.new || 0}</div>
                <p className='text-xs text-muted-foreground'>
                  Pending review
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Qualified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-green-600'>{analyticsData?.summary.qualified || 0}</div>
                <p className='text-xs text-muted-foreground'>
                  Sales qualified leads
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold text-emerald-600'>
                  {analyticsData?.summary.conversionRate || 0}%
                </div>
                <p className='text-xs text-muted-foreground'>
                  Contact to won
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-4'>
            <div className='flex items-center gap-2'>
              <Search className='h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search contacts...'
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className='w-64'
              />
            </div>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>All Status</SelectItem>
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
              value={filters.service || ''}
              onValueChange={(value) => handleFilterChange('service', value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Service' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>All Services</SelectItem>
                <SelectItem value='web'>Web Development</SelectItem>
                <SelectItem value='revops'>Revenue Operations</SelectItem>
                <SelectItem value='analytics'>Data Analytics</SelectItem>
                <SelectItem value='seo'>SEO Services</SelectItem>
                <SelectItem value='consulting'>Consulting</SelectItem>
              </SelectContent>
            </Select>
            {Object.keys(filters).length > 0 && (
              <Button variant='outline' size='sm' onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Submissions</CardTitle>
          <CardDescription>
            {contactsData?.pagination.total || 0} total submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contactsLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-16 w-full' />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className='w-[100px]'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactsData?.contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className='flex flex-col'>
                          <span className='font-medium'>{contact.name}</span>
                          <span className='text-sm text-muted-foreground'>{contact.email}</span>
                          {contact.company && (
                            <span className='text-xs text-muted-foreground'>{contact.company}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='max-w-[300px]'>
                          <div className='font-medium'>{contact.subject || 'General Inquiry'}</div>
                          <div className='text-sm text-muted-foreground truncate'>
                            {contact.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getServiceBadge(contact.service)}
                      </TableCell>
                      <TableCell>{getStatusBadge(contact.status)}</TableCell>
                      <TableCell>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem onClick={() => setSelectedContact(contact.id)}>
                              <Reply className='mr-2 h-4 w-4' />
                              View Details
                            </DropdownMenuItem>
                            {contact.email && (
                              <DropdownMenuItem onClick={() => window.open(`mailto:${contact.email}`)}>
                                <Mail className='mr-2 h-4 w-4' />
                                Send Email
                              </DropdownMenuItem>
                            )}
                            {contact.phone && (
                              <DropdownMenuItem onClick={() => window.open(`tel:${contact.phone}`)}>
                                <Phone className='mr-2 h-4 w-4' />
                                Call
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleStatusUpdate(contact.id, 'CONTACTED')}>
                              <Star className='mr-2 h-4 w-4' />
                              Mark Contacted
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {contactsData?.pagination && contactsData.pagination.pages > 1 && (
                <div className='flex items-center justify-between mt-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, contactsData.pagination.total)} of {contactsData.pagination.total} entries
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <span className='text-sm'>
                      Page {page} of {contactsData.pagination.pages}
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage(page + 1)}
                      disabled={page >= contactsData.pagination.pages}
                    >
                      Next
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