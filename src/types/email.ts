// Email template data types
export interface EmailTemplateData {
  name: string;
  email: string;
  [key: string]: string | number | boolean | undefined;
}

// Email sequence types
export interface ScheduledEmail {
  to: string;
  sequenceId: string;
  emailId: string;
  sendAt: Date;
  data: EmailTemplateData;
}

// Email template function type
export type EmailTemplateFunction = (data: EmailTemplateData) => string;

// Email templates record type
export type EmailTemplatesRecord = Record<string, EmailTemplateFunction>;