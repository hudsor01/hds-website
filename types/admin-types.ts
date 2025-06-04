/**
 * Admin Dashboard Types
 * 
 * Type definitions for admin functionality including lead management,
 * customer management, and dashboard analytics.
 */

import { z } from 'zod'
import { 
LeadSource, 
BudgetRange, 
ServiceType, 
Status, 
FormStatus,
LeadStatus,
CustomerStatus,
ContactStatus,
Priority,
AdminPermission,
} from './enum-types'
import type { ContactFormData, NewsletterFormData, LeadMagnetFormData } from './form-types'
import type { ApiResponse } from './api-types'

// ============= Core Admin Data Types =============

/**
 * Lead record with all associated data
 */
export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  message?: string
  source: LeadSource
  status: LeadStatus
  priority: Priority
  service?: ServiceType
  budget?: BudgetRange
  score: number // Lead scoring 0-100
  assignedTo?: string
  tags: string[]
  customFields: Record<string, unknown>
  
  // Interaction tracking
  lastContactDate?: Date
  nextFollowUpDate?: Date
  totalInteractions: number
  lastInteractionType?: 'email' | 'call' | 'meeting' | 'proposal'
  
  // Conversion tracking
  conversionProbability: number // 0-100
  estimatedValue?: number
  actualValue?: number
  conversionDate?: Date
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy: string
}

/**
 * Customer record for ongoing relationships
 */
export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  status: CustomerStatus
  
  // Business information
  industry?: string
  companySize?: string
  website?: string
  billingAddress?: Address
  
  // Relationship data
  accountManager?: string
  lifetimeValue: number
  totalProjects: number
  averageProjectValue: number
  lastProjectDate?: Date
  nextRenewalDate?: Date
  
  // Communication preferences
  preferredContactMethod: 'email' | 'phone' | 'slack' | 'teams'
  emailSubscribed: boolean
  marketingOptIn: boolean
  
  // Tags and custom fields
  tags: string[]
  customFields: Record<string, unknown>
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  leadSource: LeadSource
  conversionDate: Date
}

/**
 * Contact submission record
 */
export interface ContactSubmission {
  id: string
  type: 'contact' | 'newsletter' | 'lead-magnet'
  status: ContactStatus
  priority: Priority
  
  // Form data
  formData: ContactFormData | NewsletterFormData | LeadMagnetFormData
  
  // Processing information
  assignedTo?: string
  responseRequired: boolean
  responseDeadline?: Date
  tags: string[]
  
  // Tracking
  ipAddress?: string
  userAgent?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  
  // Metadata
  submittedAt: Date
  processedAt?: Date
  processedBy?: string
  notes?: string
}

/**
 * Address type for customer billing
 */
export interface Address {
  street1: string
  street2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

// ============= Admin Analytics Types =============

/**
 * Dashboard metrics summary
 */
export interface DashboardMetrics {
  leads: {
    total: number
    new: number
    qualified: number
    converted: number
    conversionRate: number
    averageScore: number
  }
  customers: {
    total: number
    active: number
    churned: number
    lifetimeValue: number
    averageValue: number
    retentionRate: number
  }
  revenue: {
    monthly: number
    quarterly: number
    annual: number
    pipeline: number
    forecastAccuracy: number
  }
  activity: {
    totalContacts: number
    pendingContacts: number
    responseRate: number
    averageResponseTime: number // in hours
  }
}

/**
 * Lead funnel analytics
 */
export interface LeadFunnelData {
  stage: LeadStatus
  count: number
  value: number
  conversionRate: number
  averageTimeInStage: number // in days
}

/**
 * Revenue analytics by time period
 */
export interface RevenueData {
  period: string // YYYY-MM format
  revenue: number
  pipeline: number
  forecast: number
  deals: number
  averageDealSize: number
}

/**
 * Lead source performance
 */
export interface LeadSourcePerformance {
  source: LeadSource
  leads: number
  conversions: number
  conversionRate: number
  revenue: number
  cost?: number
  roi?: number
}

// ============= Admin Table Types =============

/**
 * Data table column configuration
 */
export interface DataTableColumn<T> {
  id: string
  accessorKey: keyof T
  header: string
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
  cell?: (value: Record<string, unknown>, row: T) => React.ReactNode
  headerCell?: () => React.ReactNode
  className?: string
  headerClassName?: string
}

/**
 * Data table configuration
 */
export interface DataTableConfig<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  loading?: boolean
  error?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    pageCount: number
  }
  sorting?: {
    column: keyof T
    direction: 'asc' | 'desc'
  }
  filtering?: Record<string, unknown>
  selection?: {
    enabled: boolean
    selectedRows: string[]
    onSelectionChange: (selectedRows: string[]) => void
  }
  actions?: DataTableAction<T>[]
}

/**
 * Data table action definition
 */
export interface DataTableAction<T> {
  id: string
  label: string
  icon?: React.ComponentType
  variant?: 'default' | 'destructive' | 'outline'
  onClick: (row: T) => void
  disabled?: (row: T) => boolean
  visible?: (row: T) => boolean
}

// ============= Admin Form Types =============

/**
 * Lead creation/edit form schema
 */
export const leadFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  source: z.nativeEnum(LeadSource),
  status: z.nativeEnum(LeadStatus),
  priority: z.nativeEnum(Priority),
  service: z.nativeEnum(ServiceType).optional(),
  budget: z.nativeEnum(BudgetRange).optional(),
  score: z.number().min(0).max(100),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).default({}),
  nextFollowUpDate: z.date().optional(),
  estimatedValue: z.number().positive().optional(),
})

/**
 * Customer creation/edit form schema
 */
export const customerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.nativeEnum(CustomerStatus),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().url().optional(),
  accountManager: z.string().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'slack', 'teams']).default('email'),
  emailSubscribed: z.boolean().default(true),
  marketingOptIn: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).default({}),
  nextRenewalDate: z.date().optional(),
})

export type LeadFormData = z.infer<typeof leadFormSchema>
export type CustomerFormData = z.infer<typeof customerFormSchema>

// ============= Admin API Types =============

/**
 * Lead list request parameters
 */
export interface LeadListParams {
  page?: number
  pageSize?: number
  sortBy?: keyof Lead
  sortDirection?: 'asc' | 'desc'
  search?: string
  status?: LeadStatus[]
  source?: LeadSource[]
  priority?: Priority[]
  assignedTo?: string
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
}

/**
 * Customer list request parameters
 */
export interface CustomerListParams {
  page?: number
  pageSize?: number
  sortBy?: keyof Customer
  sortDirection?: 'asc' | 'desc'
  search?: string
  status?: CustomerStatus[]
  industry?: string[]
  accountManager?: string
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
}

/**
 * Contact submission list parameters
 */
export interface ContactSubmissionListParams {
  page?: number
  pageSize?: number
  sortBy?: keyof ContactSubmission
  sortDirection?: 'asc' | 'desc'
  search?: string
  status?: ContactStatus[]
  type?: Array<'contact' | 'newsletter' | 'lead-magnet'>
  priority?: Priority[]
  assignedTo?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    pageCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Bulk operation request
 */
export interface BulkOperationRequest {
  ids: string[]
  operation: 'delete' | 'update' | 'assign' | 'tag'
  data?: Record<string, unknown>
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse extends ApiResponse {
  processed: number
  failed: number
  errors?: Array<{
    id: string
    error: string
  }>
}

// ============= Admin Navigation Types =============

/**
 * Admin sidebar navigation item
 */
export interface AdminNavItem {
  id: string
  label: string
  href: string
  icon?: React.ComponentType
  badge?: string | number
  children?: AdminNavItem[]
  permissions?: string[]
  external?: boolean
}

/**
 * Admin breadcrumb item
 */
export interface AdminBreadcrumb {
  label: string
  href?: string
  active?: boolean
}

// ============= Admin Permission Types =============

/**
 * Admin user role
 */
export interface AdminRole {
  id: string
  name: string
  description: string
  permissions: AdminPermission[]
  isDefault?: boolean
}

/**
 * Admin user profile
 */
export interface AdminUser {
  id: string
  email: string
  name: string
  avatar?: string
  role: AdminRole
  permissions: AdminPermission[]
  lastLoginAt?: Date
  createdAt: Date
  isActive: boolean
}

// ============= Export Default Collections =============

/**
 * Default admin navigation structure
 */
export const DEFAULT_ADMIN_NAV: AdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    permissions: [AdminPermission.LEADS_VIEW],
  },
  {
    id: 'leads',
    label: 'Leads',
    href: '/admin/leads',
    permissions: [AdminPermission.LEADS_VIEW],
  },
  {
    id: 'customers',
    label: 'Customers',
    href: '/admin/customers',
    permissions: [AdminPermission.CUSTOMERS_VIEW],
  },
  {
    id: 'contacts',
    label: 'Contact Submissions',
    href: '/admin/contacts',
    permissions: [AdminPermission.CONTACTS_VIEW],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/admin/analytics',
    permissions: [AdminPermission.ANALYTICS_VIEW],
  },
]

/**
 * Default admin roles
 */
export const DEFAULT_ADMIN_ROLES: AdminRole[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all admin features',
    permissions: Object.values(AdminPermission),
    isDefault: false,
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage leads and customers',
    permissions: [
      AdminPermission.LEADS_VIEW,
      AdminPermission.LEADS_CREATE,
      AdminPermission.LEADS_EDIT,
      AdminPermission.LEADS_ASSIGN,
      AdminPermission.CUSTOMERS_VIEW,
      AdminPermission.CUSTOMERS_CREATE,
      AdminPermission.CUSTOMERS_EDIT,
      AdminPermission.CONTACTS_VIEW,
      AdminPermission.CONTACTS_RESPOND,
      AdminPermission.ANALYTICS_VIEW,
    ],
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to admin data',
    permissions: [
      AdminPermission.LEADS_VIEW,
      AdminPermission.CUSTOMERS_VIEW,
      AdminPermission.CONTACTS_VIEW,
      AdminPermission.ANALYTICS_VIEW,
    ],
    isDefault: true,
  },
]