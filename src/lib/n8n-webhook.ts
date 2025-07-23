import { EmailQueueItem, N8nWebhookPayload, N8nWebhookResponse, SequenceData } from '@/types/email-queue';

export class N8nWebhookClient {
  private webhookUrl: string;
  private apiKey?: string;

  constructor(webhookUrl: string, apiKey?: string) {
    this.webhookUrl = webhookUrl;
    this.apiKey = apiKey;
  }

  // Validate n8n webhook response to prevent type confusion attacks
  private validateN8nResponse(data: Record<string, unknown>): N8nWebhookResponse {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }
    
    const response = data as Record<string, unknown>;
    
    if (typeof response.success !== 'boolean') {
      throw new Error('Invalid success field');
    }
    
    // Ensure error is a string if present
    let error: string | undefined;
    if (response.error !== undefined) {
      error = typeof response.error === 'string' ? response.error : 'Invalid error format received';
    }
    
    // Ensure message is a string if present  
    let message: string | undefined;
    if (response.message !== undefined && typeof response.message === 'string') {
      message = response.message;
    }
    
    // Ensure queueId is a string if present
    let queueId: string | undefined;
    if (response.queueId !== undefined && typeof response.queueId === 'string') {
      queueId = response.queueId;
    }
    
    return {
      success: response.success,
      message,
      queueId,
      error
    };
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
      return this.validateN8nResponse(data);
    } catch (error) {
      console.error('Failed to send to n8n webhook:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: 'External email service temporarily unavailable. Please try again.'
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
      return this.validateN8nResponse(data);
    } catch (error) {
      console.error('Failed to schedule email via n8n:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: 'Email scheduling service temporarily unavailable. Please try again.'
      };
    }
  }

  async triggerSequence(
    sequenceName: string, 
    recipientEmail: string, 
    sequenceData: SequenceData
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
      return this.validateN8nResponse(data);
    } catch (error) {
      console.error('Failed to trigger email sequence via n8n:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: 'Email sequence service temporarily unavailable. Please try again.'
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