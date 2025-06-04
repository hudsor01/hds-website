/**
 * Admin Contact Submissions Page
 * 
 * Next.js 15 + React 19 implementation with Server Components and Server Actions
 * Replaces tRPC with native Next.js functionality
 */

import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Search, Mail, Phone, MoreHorizontal } from 'lucide-react';
import { getContacts, getContactAnalytics } from '@/lib/data/contacts';
import { updateContactStatus } from '@/app/actions/contact-actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Types
type ContactStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST' | 'UNRESPONSIVE';

const getStatusBadge = (status: ContactStatus) => {
  const variants = {
    NEW: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    CONTACTED: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    QUALIFIED: 'bg-green-100 text-green-800 hover:bg-green-100',
    PROPOSAL_SENT: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
    WON: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    LOST: 'bg-red-100 text-red-800 hover:bg-red-100',
    UNRESPONSIVE: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  };

  return (
    <Badge className={variants[status]}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

// Server Component for Analytics Cards
async function ContactAnalytics() {
  const analytics = await getContactAnalytics();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.summary.total}</div>
          <p className="text-xs text-muted-foreground">
            +{analytics.summary.new} new this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Qualified</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.summary.qualified}</div>
          <p className="text-xs text-muted-foreground">
            Ready for follow-up
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Won</CardTitle>
          <Badge className="h-4 w-4 text-muted-foreground bg-green-100" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.summary.won}</div>
          <p className="text-xs text-muted-foreground">
            Converted to clients
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.summary.conversionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Contact to client rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Server Component for Contacts Table
async function ContactsTable({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const status = typeof searchParams.status === 'string' ? searchParams.status : '';
  const service = typeof searchParams.service === 'string' ? searchParams.service : '';

  const contacts = await getContacts(
    { search, status, service },
    { page, limit: 10 }
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>
              Manage all contact form submissions
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-8"
              defaultValue={search}
              name="search"
            />
          </div>
          
          <Select defaultValue={status}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="QUALIFIED">Qualified</SelectItem>
              <SelectItem value="PROPOSAL_SENT">Proposal Sent</SelectItem>
              <SelectItem value="WON">Won</SelectItem>
              <SelectItem value="LOST">Lost</SelectItem>
              <SelectItem value="UNRESPONSIVE">Unresponsive</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue={service}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Services</SelectItem>
              <SelectItem value="web">Web Development</SelectItem>
              <SelectItem value="revops">Revenue Operations</SelectItem>
              <SelectItem value="analytics">Data Analytics</SelectItem>
              <SelectItem value="consulting">Consulting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contacts Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">{contact.email}</div>
                  {contact.phone && (
                    <div className="text-sm text-muted-foreground">{contact.phone}</div>
                  )}
                </TableCell>
                <TableCell>{contact.company || '-'}</TableCell>
                <TableCell>
                  {contact.service ? (
                    <Badge variant="outline">
                      {contact.service === 'web' ? 'Web Development' :
                       contact.service === 'revops' ? 'Revenue Operations' :
                       contact.service === 'analytics' ? 'Data Analytics' :
                       contact.service === 'consulting' ? 'Consulting' :
                       contact.service}
                    </Badge>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(contact.status as ContactStatus)}
                </TableCell>
                <TableCell>
                  {new Date(contact.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        View Details
                      </DropdownMenuItem>
                      <form action={updateContactStatus}>
                        <input type="hidden" name="id" value={contact.id} />
                        <input type="hidden" name="status" value="QUALIFIED" />
                        <DropdownMenuItem>
                          Mark as Qualified
                        </DropdownMenuItem>
                      </form>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {((contacts.page - 1) * contacts.limit) + 1} to{' '}
            {Math.min(contacts.page * contacts.limit, contacts.total)} of{' '}
            {contacts.total} contacts
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={contacts.page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={contacts.page >= contacts.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Components
function AnalyticsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Page Component
export default async function ContactsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contact Submissions</h1>
          <p className="text-muted-foreground">
            Manage and track all contact form submissions
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <Suspense fallback={<AnalyticsLoading />}>
        <ContactAnalytics />
      </Suspense>

      {/* Contacts Table */}
      <Suspense fallback={<TableLoading />}>
        <ContactsTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}