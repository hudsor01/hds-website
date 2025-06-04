// Email sequence types and interfaces

export interface EmailSequence {
  id: string
  name: string
  description: string
  trigger: EmailTrigger
  emails: EmailStep[]
}

export interface EmailTrigger {
  type: 'lead_magnet' | 'contact_form' | 'newsletter_signup' | 'custom'
  resourceId?: string // For lead_magnet triggers
}

export interface EmailStep {
  id: string
  subject: string
  delayDays: number // Days after the trigger event
  template: EmailTemplate
  skipIf?: SkipCondition[]
}

export interface EmailTemplate {
  html: string
  text?: string
  dynamicFields?: string[] // Fields that will be replaced with user data
}

export interface SkipCondition {
  type: 'has_purchased' | 'has_scheduled_call' | 'has_responded'
  value?: Record<string, unknown>
}

export interface SequenceSubscriber {
  email: string
  sequenceId: string
  triggeredAt: Date
  completedSteps: string[] // IDs of completed email steps
  status: 'active' | 'completed' | 'unsubscribed' | 'paused'
  userData: Record<string, unknown> // Dynamic data for template replacement
}
