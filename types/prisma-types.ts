/**
 * Prisma Client Types
 * 
 * Re-export and extend Prisma Client types that are commonly used
 * throughout the application. This file acts as a bridge for missing
 * Prisma exports and provides custom types.
 */

// ============= Post Status Enum =============

/**
 * Blog post status enumeration
 * Used for managing the publication state of blog posts
 */
export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  SCHEDULED = 'SCHEDULED',
  PRIVATE = 'PRIVATE'
}

// ============= User Status Enum =============

/**
 * User account status enumeration
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  DELETED = 'DELETED'
}

// ============= Contact Status Enum =============

/**
 * Contact submission status enumeration
 */
export enum ContactSubmissionStatus {
  NEW = 'NEW',
  READ = 'READ',
  REPLIED = 'REPLIED',
  ARCHIVED = 'ARCHIVED',
  SPAM = 'SPAM'
}

// ============= Newsletter Status Enum =============

/**
 * Newsletter subscription status enumeration
 */
export enum NewsletterStatus {
  SUBSCRIBED = 'SUBSCRIBED',
  UNSUBSCRIBED = 'UNSUBSCRIBED',
  PENDING = 'PENDING',
  BOUNCED = 'BOUNCED'
}

// ============= Lead Status Enum =============

/**
 * Lead status enumeration
 */
export enum LeadManagementStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL = 'PROPOSAL',
  NEGOTIATION = 'NEGOTIATION',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST',
  ON_HOLD = 'ON_HOLD'
}

// ============= Database Model Types =============

/**
 * Blog post database model
 */
export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt?: string
  content: string
  authorName: string
  authorEmail?: string
  status: PostStatus
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  
  // SEO fields
  metaTitle?: string
  metaDescription?: string
  keywords: string[]
  
  // Media
  featuredImage?: string
  gallery: string[]
  
  // Organization
  categories: string[]
  tags: string[]
  
  // Analytics
  viewCount: number
  shareCount: number
  likeCount: number
  readTimeMinutes: number
}

/**
 * Contact submission database model
 */
export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  message: string
  subject?: string
  source?: string
  status: ContactSubmissionStatus
  createdAt: Date
  updatedAt: Date
  
  // Admin fields
  assignedTo?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  tags: string[]
  internalNotes?: string
  responseRequired: boolean
  responseDeadline?: Date
  
  // Tracking
  ipAddress?: string
  userAgent?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

/**
 * Newsletter subscription database model
 */
export interface NewsletterSubscription {
  id: string
  email: string
  firstName?: string
  lastName?: string
  status: NewsletterStatus
  source?: string
  interests: string[]
  frequency: 'WEEKLY' | 'MONTHLY'
  confirmedAt?: Date
  unsubscribedAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // Preferences
  preferences: {
    htmlEmails: boolean
    promotionalEmails: boolean
    productUpdates: boolean
    eventNotifications: boolean
  }
  
  // Analytics
  openRate: number
  clickRate: number
  lastOpened?: Date
  lastClicked?: Date
}

/**
 * Lead magnet download database model
 */
export interface LeadMagnetDownload {
  id: string
  resourceId: string
  name: string
  email: string
  company?: string
  source?: string
  status: LeadManagementStatus
  downloadedAt: Date
  createdAt: Date
  updatedAt: Date
  
  // Follow-up tracking
  emailsSent: number
  lastEmailSent?: Date
  opened: boolean
  clicked: boolean
  converted: boolean
  conversionValue?: number
  
  // Lead scoring
  score: number
  temperature: 'COLD' | 'WARM' | 'HOT'
  
  // CRM integration
  crmContactId?: string
  crmLeadId?: string
  assignedSalesRep?: string
  
  // Analytics
  ipAddress?: string
  userAgent?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

/**
 * Analytics event database model
 */
export interface AnalyticsEvent {
  id: string
  eventName: string
  eventData: Record<string, unknown>
  userId?: string
  sessionId: string
  timestamp: Date
  
  // Page context
  pageUrl: string
  pageTitle: string
  referrer?: string
  
  // User context
  ipAddress?: string
  userAgent?: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  os: string
  
  // Location context
  country?: string
  region?: string
  city?: string
  
  // Campaign context
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}

// ============= Query Result Types =============

/**
 * Paginated query result
 */
export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    total: number
    pages: number
    currentPage: number
    pageSize: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Database count result
 */
export interface CountResult {
  _count: {
    [key: string]: number
  }
}

/**
 * Database aggregate result
 */
export interface AggregateResult {
  _sum: Record<string, number | null>
  _avg: Record<string, number | null>
  _min: Record<string, unknown>
  _max: Record<string, unknown>
  _count: Record<string, number>
}

// ============= Database Operation Types =============

/**
 * Where clause type for filtering
 */
export type WhereClause<T> = {
  [K in keyof T]?: T[K] | {
    equals?: T[K]
    not?: T[K]
    in?: T[K][]
    notIn?: T[K][]
    contains?: string
    startsWith?: string
    endsWith?: string
    mode?: 'default' | 'insensitive'
    gt?: number | Date
    gte?: number | Date
    lt?: number | Date
    lte?: number | Date
  }
} & {
  OR?: WhereClause<T>[]
  AND?: WhereClause<T>[]
  NOT?: WhereClause<T>
}

/**
 * Order by clause type for sorting
 */
export type OrderByClause<T> = {
  [K in keyof T]?: 'asc' | 'desc'
}

/**
 * Select clause type for field selection
 */
export type SelectClause<T> = {
  [K in keyof T]?: boolean
}

/**
 * Include clause type for relations
 */
export type IncludeClause<T> = {
  [K in keyof T]?: boolean | {
    select?: Record<string, unknown>
    include?: Record<string, unknown>
    where?: Record<string, unknown>
    orderBy?: Record<string, unknown>
    take?: number
    skip?: number
  }
}

// ============= Re-exports for Type Compatibility =============

// Re-export commonly used types that might be missing from @prisma/client
export {
  PostStatus as PrismaPostStatus,
  UserStatus as PrismaUserStatus,
  ContactSubmissionStatus as PrismaContactSubmissionStatus,
  NewsletterStatus as PrismaNewsletterStatus,
  LeadManagementStatus as PrismaLeadManagementStatus,
}

// Default export for PostStatus to maintain compatibility
export default PostStatus