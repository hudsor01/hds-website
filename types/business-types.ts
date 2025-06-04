/**
 * Business Domain Types
 * 
 * Types related to business logic, services, and core business concepts.
 */

import type { ReactNode } from 'react'
import { ServiceType, BudgetRange, LeadSource, ContentType, FileType } from './enum-types'

// ============= Service Types =============

/**
 * Service offering definition
 */
export interface Service {
  id: string
  type: ServiceType
  name: string
  description: string
  shortDescription?: string
  icon: ReactNode | string
  href: string
  price?: {
    starting: number
    currency: 'USD'
    unit: 'project' | 'month' | 'hour'
  }
  features: string[]
  featured?: boolean
  gradient?: string
  estimatedTimeline?: string
  deliverables?: string[]
}

/**
 * Service card display properties
 */
export interface ServiceCard {
  title: string
  description: string
  icon: ReactNode | string
  href: string
  className?: string
  featured?: boolean
  variant?: 'default' | 'animated' | 'gradient' | 'minimal'
  price?: string
  gradient?: string
  delay?: number
  onClick?: () => void
}

/**
 * Service section configuration
 */
export interface ServicesSection {
  variant?: 'default' | 'gradient' | 'simple' | 'minimal'
  title?: string
  subtitle?: string
  services?: Service[]
  className?: string
  showContactCta?: boolean
  ctaText?: string
  ctaLink?: string
  ctaButtonText?: string
  bgColor?: string
}

// ============= Client & Lead Types =============

/**
 * Client/prospect information
 */
export interface Client {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  website?: string
  industry?: string
  companySize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  leadSource: LeadSource
  tags: string[]
  createdAt: Date
  updatedAt: Date
  notes?: string
}

/**
 * Lead information from forms
 */
export interface Lead {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  message: string
  service?: ServiceType
  budget?: BudgetRange
  source: LeadSource
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  createdAt: Date
  assignedTo?: string
  nextFollowUp?: Date
  customFields?: Record<string, unknown>
}

/**
 * Lead qualification scoring
 */
export interface LeadScore {
  leadId: string
  total: number
  breakdown: {
    budget: number
    timeline: number
    authority: number
    need: number
    fit: number
  }
  lastUpdated: Date
}

// ============= Project Types =============

/**
 * Project information
 */
export interface Project {
  id: string
  name: string
  client: Client
  service: ServiceType
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'
  startDate: Date
  estimatedEndDate?: Date
  actualEndDate?: Date
  budget: {
    estimated: number
    actual?: number
    currency: 'USD'
  }
  description: string
  objectives: string[]
  deliverables: Deliverable[]
  team: TeamMember[]
  phases: ProjectPhase[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Project deliverable
 */
export interface Deliverable {
  id: string
  name: string
  description: string
  type: ContentType
  status: 'pending' | 'in-progress' | 'review' | 'completed'
  dueDate?: Date
  completedDate?: Date
  assignedTo?: string
  files?: ProjectFile[]
  notes?: string
}

/**
 * Project team member
 */
export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  joinedAt: Date
}

/**
 * Project phase
 */
export interface ProjectPhase {
  id: string
  name: string
  description: string
  order: number
  status: 'not-started' | 'active' | 'completed'
  startDate?: Date
  endDate?: Date
  deliverables: string[] // Deliverable IDs
  milestones: Milestone[]
}

/**
 * Project milestone
 */
export interface Milestone {
  id: string
  name: string
  description: string
  dueDate: Date
  completed: boolean
  completedDate?: Date
}

/**
 * Project file attachment
 */
export interface ProjectFile {
  id: string
  name: string
  originalName: string
  type: FileType
  size: number
  url: string
  uploadedBy: string
  uploadedAt: Date
  description?: string
}

// ============= Content & Resources =============

/**
 * Lead magnet resource
 */
export interface LeadMagnet {
  id: string
  title: string
  description: string
  type: ContentType
  fileType: FileType
  filePath: string
  thumbnailPath?: string
  downloadCount: number
  isActive: boolean
  targetAudience?: string[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
  metadata?: {
    author?: string
    pages?: number
    fileSize?: number
    lastModified?: Date
  }
}

/**
 * Blog post or article content
 */
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: {
    name: string
    email: string
    avatar?: string
  }
  featuredImage?: string
  tags: string[]
  categories: string[]
  status: 'draft' | 'published' | 'archived'
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
  seo: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    canonicalUrl?: string
  }
  stats: {
    views: number
    shares: number
    comments: number
  }
}

/**
 * Case study content
 */
export interface CaseStudy {
  id: string
  title: string
  slug: string
  client: {
    name: string
    industry: string
    size: string
    website?: string
    logo?: string
  }
  challenge: string
  solution: string
  results: CaseStudyResult[]
  services: ServiceType[]
  duration: string
  featuredImage?: string
  gallery?: string[]
  testimonial?: {
    quote: string
    author: string
    position: string
    avatar?: string
  }
  tags: string[]
  isPublic: boolean
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Case study measurable result
 */
export interface CaseStudyResult {
  metric: string
  before: string | number
  after: string | number
  improvement: string
  description?: string
}

// ============= Business Analytics =============

/**
 * Business metrics and KPIs
 */
export interface BusinessMetrics {
  period: {
    start: Date
    end: Date
  }
  revenue: {
    total: number
    recurring: number
    oneTime: number
    growth: number
  }
  leads: {
    total: number
    qualified: number
    converted: number
    conversionRate: number
  }
  projects: {
    active: number
    completed: number
    onTime: number
    onBudget: number
  }
  clients: {
    total: number
    new: number
    retained: number
    churnRate: number
  }
}

/**
 * ROI calculation input
 */
export interface ROIInput {
  currentRevenue: number
  monthlyLeads: number
  conversionRate: number
  averageProjectValue: number
  customerLifetimeValue?: number
  marketingSpend?: number
}

/**
 * ROI calculation result
 */
export interface ROIResult {
  input: ROIInput
  projectedRevenue: number
  revenueIncrease: number
  percentageIncrease: number
  additionalLeads: number
  projectedProjects: number
  timeframe: 'monthly' | 'annually'
  assumptions: string[]
  breakdown: {
    currentMetrics: Record<string, number>
    projectedMetrics: Record<string, number>
    improvements: Record<string, number>
  }
}