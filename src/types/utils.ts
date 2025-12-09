/**
 * Utility Type Definitions
 * Types for scheduled emails and email processing
 */

// Scheduled Email Types
export interface InternalScheduledEmail {
  id: string;
  recipientEmail: string;
  recipientName: string;
  sequenceId: string;
  stepId: string;
  scheduledFor: Date;
  variables: Record<string, string>;
  status: "pending" | "sent" | "failed";
  createdAt: Date;
  sentAt?: Date;
  error?: string;
}

export interface EmailQueueStats {
  pending: number;
  sent: number;
  failed: number;
  total: number;
}

export interface EmailProcessResult {
  success: boolean;
  processed: number;
  errors: number;
}