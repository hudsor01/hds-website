// Email sequence execution engine
import type { EmailSequence, EmailStep, SequenceSubscriber } from './types'
import { sendEmail } from '../resend'
import { getAllSequences, getSequencesByTrigger } from './templates'

/**
 * Replace dynamic fields in email template with subscriber data
 */
function replaceDynamicFields(
  template: string,
  data: Record<string, unknown>,
): string {
  let result = template

  // Replace {fieldName} with actual values
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(regex, data[key] || '')
  })

  return result
}

/**
 * Check if email step should be skipped based on conditions
 */
function shouldSkipEmail(
  step: EmailStep,
  subscriber: SequenceSubscriber,
): boolean {
  if (!step.skipIf || step.skipIf.length === 0) return false

  return step.skipIf.some(condition => {
    switch (condition.type) {
      case 'has_responded':
        // Check if subscriber has responded (would need integration with email tracking)
        return subscriber.userData.hasResponded === true
      case 'has_purchased':
        // Check if subscriber has made a purchase
        return subscriber.userData.hasPurchased === true
      case 'has_scheduled_call':
        // Check if subscriber has scheduled a call
        return subscriber.userData.hasScheduledCall === true
      default:
        return false
    }
  })
}

/**
 * Get the next email step for a subscriber
 */
export function getNextEmailStep(
  sequence: EmailSequence,
  subscriber: SequenceSubscriber,
): EmailStep | null {
  const triggeredDate = new Date(subscriber.triggeredAt)
  const currentDate = new Date()
  const daysSinceTrigger = Math.floor(
    (currentDate.getTime() - triggeredDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  // Find the next email that hasn't been sent yet
  for (const step of sequence.emails) {
    // Skip if already sent
    if (subscriber.completedSteps.includes(step.id)) continue

    // Skip if not enough days have passed
    if (daysSinceTrigger < step.delayDays) continue

    // Skip if conditions are met
    if (shouldSkipEmail(step, subscriber)) continue

    return step
  }

  return null
}

/**
 * Send an email step to a subscriber
 */
export async function sendSequenceEmail(
  step: EmailStep,
  subscriber: SequenceSubscriber,
): Promise<boolean> {
  try {
    // Replace dynamic fields in the email
    const html = replaceDynamicFields(step.template.html, subscriber.userData)

    const text = step.template.text
      ? replaceDynamicFields(step.template.text, subscriber.userData)
      : undefined

    // Send the email
    const result = await sendEmail({
      to: subscriber.email,
      from: process.env.RESEND_FROM_EMAIL || 'hello@hudsondigitalsolutions.com',
      subject: step.subject,
      html,
      text,
    })

    return result.success
  } catch (error) {
    console.error('Error sending sequence email:', error)
    return false
  }
}

/**
 * Trigger an email sequence for a subscriber
 */
export async function triggerSequence(
  triggerType: string,
  userData: Record<string, unknown>,
  resourceId?: string,
): Promise<void> {
  // Find matching sequences
  const sequences = getSequencesByTrigger(triggerType, resourceId)

  if (sequences.length === 0) {
    console.log(`No sequences found for trigger: ${triggerType}`)
    return
  }

  // Create subscriber records for each sequence
  for (const sequence of sequences) {
    const subscriber: SequenceSubscriber = {
      email: userData.email,
      sequenceId: sequence.id,
      triggeredAt: new Date(),
      completedSteps: [],
      status: 'active',
      userData: {
        firstName:
          userData.firstName || userData.name?.split(' ')[0] || 'there',
        ...userData,
      },
    }

    // Send the first email if it has 0 delay
    const firstStep = sequence.emails.find(e => e.delayDays === 0)
    if (firstStep) {
      const sent = await sendSequenceEmail(firstStep, subscriber)
      if (sent) {
        subscriber.completedSteps.push(firstStep.id)
      }
    }

    // TODO: Store subscriber in database for future processing
    console.log(`Triggered sequence: ${sequence.id} for ${subscriber.email}`)
  }
}

/**
 * Process all active email sequences
 * This should be run periodically (e.g., daily) via a cron job
 */
export async function processEmailSequences(): Promise<void> {
  // TODO: Fetch all active subscribers from database
  const subscribers: SequenceSubscriber[] = [] // This would come from DB

  for (const subscriber of subscribers) {
    if (subscriber.status !== 'active') continue

    // Get the sequence
    const sequence = getAllSequences().find(s => s.id === subscriber.sequenceId)
    if (!sequence) continue

    // Get the next email to send
    const nextStep = getNextEmailStep(sequence, subscriber)
    if (!nextStep) {
      // No more emails to send, mark as completed
      subscriber.status = 'completed'
      // TODO: Update in database
      continue
    }

    // Send the email
    const sent = await sendSequenceEmail(nextStep, subscriber)

    if (sent) {
      subscriber.completedSteps.push(nextStep.id)
      // TODO: Update in database
      console.log(`Sent email ${nextStep.id} to ${subscriber.email}`)
    }
  }
}
