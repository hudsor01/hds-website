/**
 * Enumeration Types
 * 
 * Centralized location for all enum definitions used throughout the application.
 * This ensures consistency and prevents duplicate enum definitions.
 */

/**
 * Available services offered by Hudson Digital Solutions
 */
export enum ServiceType {
  REVENUE_OPS = 'revenue-ops',
  FULL_STACK = 'full-stack', 
  WEB_DEVELOPMENT = 'web-development',
  DATA_ANALYTICS = 'data-analytics',
  INFRASTRUCTURE = 'infrastructure',
  CONSULTATION = 'consultation',
  OTHER = 'other'
}

/**
 * Budget ranges for project inquiries
 */
export enum BudgetRange {
  UNDER_5K = 'under-5k',
  RANGE_5K_15K = '5k-15k',
  RANGE_15K_50K = '15k-50k',
  RANGE_50K_100K = '50k-100k',
  OVER_100K = 'over-100k',
  NOT_SURE = 'not-sure'
}

/**
 * Lead sources for tracking marketing effectiveness
 */
export enum LeadSource {
  ORGANIC_SEARCH = 'organic-search',
  PAID_SEARCH = 'paid-search',
  SOCIAL_MEDIA = 'social-media',
  REFERRAL = 'referral',
  DIRECT = 'direct',
  EMAIL = 'email',
  PARTNERSHIP = 'partnership',
  OTHER = 'other'
}

// ============= UI Enums =============

/**
 * Available color themes
 */
export enum ColorTheme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

/**
 * Component size variants
 */
export enum Size {
  XS = 'xs',
  SM = 'sm', 
  MD = 'md',
  LG = 'lg',
  XL = 'xl'
}

/**
 * Component visual variants
 */
export enum Variant {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  ACCENT = 'accent',
  GHOST = 'ghost',
  OUTLINE = 'outline',
  DESTRUCTIVE = 'destructive'
}

/**
 * Animation types for components
 */
export enum AnimationType {
  FADE_IN = 'fadeIn',
  FADE_IN_UP = 'fadeInUp',
  FADE_IN_DOWN = 'fadeInDown',
  SCALE_IN = 'scaleIn',
  SLIDE_IN_LEFT = 'slideInLeft',
  SLIDE_IN_RIGHT = 'slideInRight',
  SPRING_BOUNCE = 'springBounce',
  NONE = 'none'
}

/**
 * Layout container widths
 */
export enum ContainerWidth {
  NARROW = 'narrow',
  DEFAULT = 'default',
  WIDE = 'wide',
  FULL = 'full'
}

// ============= Status Enums =============

/**
 * Generic status for async operations
 */
export enum Status {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * Form submission status
 */
export enum FormStatus {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  SUCCESS = 'success',
  ERROR = 'error',
  VALIDATION_ERROR = 'validation-error'
}

/**
 * Email sequence status
 */
export enum SequenceStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  UNSUBSCRIBED = 'unsubscribed',
  ERROR = 'error'
}

// ============= Content Enums =============

/**
 * Content types for CMS and resource management
 */
export enum ContentType {
  BLOG_POST = 'blog-post',
  CASE_STUDY = 'case-study',
  WHITEPAPER = 'whitepaper',
  EBOOK = 'ebook',
  CHECKLIST = 'checklist',
  TEMPLATE = 'template',
  GUIDE = 'guide',
  VIDEO = 'video',
  WEBINAR = 'webinar'
}

/**
 * File types for uploads and downloads
 */
export enum FileType {
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  PPT = 'ppt',
  PPTX = 'pptx',
  ZIP = 'zip',
  IMAGE = 'image',
  VIDEO = 'video'
}

// ============= Analytics Enums =============

/**
 * Analytics event categories
 */
export enum EventCategory {
  PAGE_VIEW = 'page-view',
  USER_INTERACTION = 'user-interaction',
  FORM_SUBMISSION = 'form-submission',
  DOWNLOAD = 'download',
  NAVIGATION = 'navigation',
  ERROR = 'error',
  PERFORMANCE = 'performance'
}

/**
 * User interaction types
 */
export enum InteractionType {
  CLICK = 'click',
  SCROLL = 'scroll',
  HOVER = 'hover',
  FOCUS = 'focus',
  RESIZE = 'resize',
  NAVIGATION = 'navigation'
}

// ============= API Enums =============

/**
 * HTTP methods for API requests
 */
export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

/**
 * API response status codes
 */
export enum HTTPStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  RATE_LIMITED = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

// ============= Environment Enums =============

/**
 * Application environments
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test'
}

/**
 * Log levels for logging system
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}