export interface EmailQueueItem {
  id?: string;
  to: string;
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  templateData?: Record<string, unknown>;
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
  attempts?: number;
  maxAttempts?: number;
  status?: 'pending' | 'processing' | 'sent' | 'failed';
  error?: string;
  metadata?: {
    source?: string;
    userId?: string;
    formId?: string;
    sequenceId?: string;
    sequenceStep?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmailSequence {
  id: string;
  name: string;
  description?: string;
  triggerEvent: string;
  emails: EmailSequenceStep[];
  isActive: boolean;
}

export interface EmailSequenceStep {
  id: string;
  subject: string;
  template: string;
  delayInMinutes: number;
  conditions?: EmailCondition[];
}

export interface EmailCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: string | number | boolean;
}

export type SequenceData = Record<string, unknown>;

export interface N8nWebhookPayload {
  action: 'send' | 'schedule' | 'sequence';
  email?: EmailQueueItem;
  sequence?: {
    name: string;
    recipientEmail: string;
    data: SequenceData;
  };
}

export interface N8nWebhookResponse {
  success: boolean;
  message?: string;
  queueId?: string;
  error?: string;
}