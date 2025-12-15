/**
 * Notification System
 * Sends real-time alerts to Slack and Discord for high-value leads
 */

import { createServerLogger } from '@/lib/logger';
import {
  NOTIFICATION_PRIORITY_THRESHOLDS,
  NOTIFICATION_MINIMUM_THRESHOLD,
} from '@/lib/constants/lead-scoring';

const logger = createServerLogger();
logger.setContext({ component: 'notifications', service: 'lead-alerts' });

interface LeadNotification {
  leadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  service?: string;
  budget?: string;
  timeline?: string;
  leadScore: number;
  leadQuality: string;
  source: string;
  calculatorType?: string;
}

/**
 * Send notification to Slack
 */
async function sendSlackNotification(lead: LeadNotification): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.warn('Slack webhook URL not configured', {
      leadId: lead.leadId,
      environment: process.env.NODE_ENV
    });
    return false;
  }

  try {
    const priorityPrefix = lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.URGENT ? '[URGENT]' : lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.HIGH_PRIORITY ? '[HIGH PRIORITY]' : '[QUALIFIED]';
    const priorityText = lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.URGENT ? 'URGENT' : lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.HIGH_PRIORITY ? 'HIGH PRIORITY' : 'QUALIFIED';

    const message = {
      text: `${priorityPrefix} New ${priorityText} Lead Alert!`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${priorityPrefix} New ${priorityText} Lead Alert!`,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Name:*\n${lead.firstName} ${lead.lastName}`,
            },
            {
              type: 'mrkdwn',
              text: `*Lead Score:*\n${lead.leadScore}/100 (${lead.leadQuality})`,
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n<mailto:${lead.email}|${lead.email}>`,
            },
            {
              type: 'mrkdwn',
              text: `*Phone:*\n${lead.phone || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Company:*\n${lead.company || 'Not provided'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Source:*\n${lead.source}`,
            },
          ],
        },
        lead.service && {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Service Interest:*\n${lead.service}`,
            },
            {
              type: 'mrkdwn',
              text: `*Budget:*\n${lead.budget || 'Not specified'}`,
            },
            {
              type: 'mrkdwn',
              text: `*Timeline:*\n${lead.timeline || 'Not specified'}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.URGENT
              ? '*Action Required:* Contact within 24 hours for best conversion rate!'
              : lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.HIGH_PRIORITY
              ? '*Recommended:* Follow up within 48 hours'
              : '*Follow-up:* Add to nurture sequence',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View in Dashboard',
              },
              url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hudsondigitalsolutions.com'}/analytics?leadId=${lead.leadId}`,
              style: 'primary',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Send Email',
              },
              url: `mailto:${lead.email}`,
            },
          ],
        },
      ].filter(Boolean),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      logger.error('Slack notification failed', {
        leadId: lead.leadId,
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    logger.info('Slack notification sent successfully', {
      leadId: lead.leadId,
      leadScore: lead.leadScore,
      email: lead.email,
    });

    return true;
  } catch (error) {
    logger.error('Slack notification exception', {
      leadId: lead.leadId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

/**
 * Send notification to Discord
 */
async function sendDiscordNotification(lead: LeadNotification): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    logger.warn('Discord webhook URL not configured', {
      leadId: lead.leadId,
      environment: process.env.NODE_ENV
    });
    return false;
  }

  try {
    const priorityPrefix = lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.URGENT ? '[URGENT]' : lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.HIGH_PRIORITY ? '[HIGH PRIORITY]' : '[QUALIFIED]';
    const priorityText = lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.URGENT ? 'URGENT' : lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.HIGH_PRIORITY ? 'HIGH PRIORITY' : 'QUALIFIED';
    const color = lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.URGENT ? 0xff0000 : lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.HIGH_PRIORITY ? 0xff8800 : 0x0891b2;

    const embed = {
      title: `${priorityPrefix} New ${priorityText} Lead Alert!`,
      color: color,
      fields: [
        {
          name: 'Name',
          value: `${lead.firstName} ${lead.lastName}`,
          inline: true,
        },
        {
          name: 'Lead Score',
          value: `${lead.leadScore}/100 (${lead.leadQuality})`,
          inline: true,
        },
        {
          name: 'Email',
          value: lead.email,
          inline: true,
        },
        {
          name: 'Phone',
          value: lead.phone || 'Not provided',
          inline: true,
        },
        {
          name: 'Company',
          value: lead.company || 'Not provided',
          inline: true,
        },
        {
          name: 'Source',
          value: lead.source,
          inline: true,
        },
      ],
      footer: {
        text: `Lead ID: ${lead.leadId} | ${new Date().toLocaleString()}`,
      },
    };

    // Add service details if available
    if (lead.service) {
      embed.fields.push(
        {
          name: 'Service Interest',
          value: lead.service,
          inline: true,
        },
        {
          name: 'Budget',
          value: lead.budget || 'Not specified',
          inline: true,
        },
        {
          name: 'Timeline',
          value: lead.timeline || 'Not specified',
          inline: true,
        }
      );
    }

    // Add action recommendation
    const actionText =
      lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.URGENT
        ? '**Action Required:** Contact within 24 hours for best conversion rate!'
        : lead.leadScore >= NOTIFICATION_PRIORITY_THRESHOLDS.HIGH_PRIORITY
        ? '**Recommended:** Follow up within 48 hours'
        : '**Follow-up:** Add to nurture sequence';

    embed.fields.push({
      name: 'Recommended Action',
      value: actionText,
      inline: false,
    });

    const message = {
      content: `${priorityPrefix} New ${priorityText} Lead Alert!`,
      embeds: [embed],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      logger.error('Discord notification failed', {
        leadId: lead.leadId,
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    logger.info('Discord notification sent successfully', {
      leadId: lead.leadId,
      leadScore: lead.leadScore,
      email: lead.email,
    });

    return true;
  } catch (error) {
    logger.error('Discord notification exception', {
      leadId: lead.leadId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

/**
 * Send notifications to all configured channels
 * Only sends for high-value leads (score >= NOTIFICATION_MINIMUM_THRESHOLD)
 */
export async function notifyHighValueLead(lead: LeadNotification): Promise<void> {
  // Only send notifications for high-value leads
  if (lead.leadScore < NOTIFICATION_MINIMUM_THRESHOLD) {
    logger.debug('Skipping notification for low-score lead', {
      leadId: lead.leadId,
      leadScore: lead.leadScore,
    });
    return;
  }

  logger.info('Sending high-value lead notifications', {
    leadId: lead.leadId,
    leadScore: lead.leadScore,
    email: lead.email,
    channels: {
      slack: !!process.env.SLACK_WEBHOOK_URL,
      discord: !!process.env.DISCORD_WEBHOOK_URL,
    },
  });

  // Send notifications in parallel
  const results = await Promise.allSettled([
    sendSlackNotification(lead),
    sendDiscordNotification(lead),
  ]);

  // Log results
  const [slackResult, discordResult] = results;

  if (slackResult.status === 'fulfilled' && slackResult.value) {
    logger.info('Slack notification successful', { leadId: lead.leadId });
  } else if (slackResult.status === 'rejected') {
    logger.error('Slack notification failed', {
      leadId: lead.leadId,
      error: slackResult.reason,
    });
  }

  if (discordResult.status === 'fulfilled' && discordResult.value) {
    logger.info('Discord notification successful', { leadId: lead.leadId });
  } else if (discordResult.status === 'rejected') {
    logger.error('Discord notification failed', {
      leadId: lead.leadId,
      error: discordResult.reason,
    });
  }
}

/**
 * Test notification endpoints
 */
export async function testNotifications(): Promise<{
  slack: boolean;
  discord: boolean;
}> {
  const testLead: LeadNotification = {
    leadId: 'test-' + Date.now(),
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    phone: '555-123-4567',
    company: 'Test Company',
    service: 'Web Development',
    budget: '$10,000 - $25,000',
    timeline: 'Within 3 months',
    leadScore: 85,
    leadQuality: 'hot',
    source: 'Test Notification System',
  };

  const [slackResult, discordResult] = await Promise.allSettled([
    sendSlackNotification(testLead),
    sendDiscordNotification(testLead),
  ]);

  return {
    slack: slackResult.status === 'fulfilled' && slackResult.value,
    discord: discordResult.status === 'fulfilled' && discordResult.value,
  };
}
