import { EmailQueueItem, N8nWebhookPayload, N8nWebhookResponse } from '@/types/email-queue';

export class N8nWebhookClient {
  private webhookUrl: string;
  private apiKey?: string;

  constructor(webhookUrl: string, apiKey?: string) {
    this.webhookUrl = webhookUrl;
    this.apiKey = apiKey;
  }

  async sendToQueue(email: EmailQueueItem): Promise<N8nWebhookResponse> {
    try {
      const payload: N8nWebhookPayload = {
        action: 'send',
        email
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as N8nWebhookResponse;
    } catch (error) {
      console.error('Failed to send to n8n webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async scheduleEmail(email: EmailQueueItem, scheduledFor: Date): Promise<N8nWebhookResponse> {
    try {
      const payload: N8nWebhookPayload = {
        action: 'schedule',
        email: {
          ...email,
          scheduledFor
        }
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as N8nWebhookResponse;
    } catch (error) {
      console.error('Failed to schedule email via n8n:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async triggerSequence(
    sequenceName: string, 
    recipientEmail: string, 
    sequenceData: Record<string, unknown>
  ): Promise<N8nWebhookResponse> {
    try {
      const payload: N8nWebhookPayload = {
        action: 'sequence',
        sequence: {
          name: sequenceName,
          recipientEmail,
          data: sequenceData
        }
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as N8nWebhookResponse;
    } catch (error) {
      console.error('Failed to trigger email sequence via n8n:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Factory function to create n8n client
export function createN8nClient(): N8nWebhookClient | null {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const apiKey = process.env.N8N_API_KEY;

  if (!webhookUrl) {
    console.warn('N8N_WEBHOOK_URL not configured - email queue disabled');
    return null;
  }

  return new N8nWebhookClient(webhookUrl, apiKey);
}