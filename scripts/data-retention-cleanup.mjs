/**
 * Data Retention Cleanup Script
 * 
 * This script implements GDPR-compliant data retention policies
 * by automatically deleting old data based on retention periods.
 */

import prisma from '../lib/prisma.js'
import { gdprUtils } from '../lib/gdpr/compliance.js'
import { logger } from '../lib/logger.js'

/**
 * Clean up old data based on retention policies
 */
async function cleanupOldData() {
  console.log('🧹 Starting GDPR data retention cleanup...\n')
  
  const results = {
    contacts: 0,
    analytics: 0,
    logs: 0,
    emails: 0,
    total: 0,
  }
  
  try {
    // 1. Clean up old contact form submissions (3 years)
    const contactCutoff = new Date()
    contactCutoff.setFullYear(contactCutoff.getFullYear() - 3)
    
    const deletedContacts = await prisma.contact.deleteMany({
      where: {
        createdAt: { lt: contactCutoff },
        status: { in: ['WON', 'LOST', 'UNRESPONSIVE'] },
      },
    })
    results.contacts = deletedContacts.count
    console.log(`✅ Deleted ${deletedContacts.count} old contact records`)
    
    // 2. Clean up analytics data (2 years)
    const analyticsCutoff = new Date()
    analyticsCutoff.setFullYear(analyticsCutoff.getFullYear() - 2)
    
    const deletedPageViews = await prisma.pageView.deleteMany({
      where: { viewedAt: { lt: analyticsCutoff } },
    })
    
    const deletedEvents = await prisma.event.deleteMany({
      where: { occurredAt: { lt: analyticsCutoff } },
    })
    
    results.analytics = deletedPageViews.count + deletedEvents.count
    console.log(`✅ Deleted ${results.analytics} old analytics records`)
    
    // 3. Clean up email send logs (90 days for non-critical)
    const emailCutoff = new Date()
    emailCutoff.setDate(emailCutoff.getDate() - 90)
    
    const deletedEmails = await prisma.emailSend.deleteMany({
      where: {
        createdAt: { lt: emailCutoff },
        status: { in: ['DELIVERED', 'OPENED', 'CLICKED'] },
      },
    })
    results.emails = deletedEmails.count
    console.log(`✅ Deleted ${deletedEmails.count} old email logs`)
    
    // 4. Clean up unverified newsletter subscribers (30 days)
    const unverifiedCutoff = new Date()
    unverifiedCutoff.setDate(unverifiedCutoff.getDate() - 30)
    
    const deletedUnverified = await prisma.newsletterSubscriber.deleteMany({
      where: {
        verified: false,
        subscribedAt: { lt: unverifiedCutoff },
      },
    })
    console.log(`✅ Deleted ${deletedUnverified.count} unverified subscribers`)
    
    // 5. Anonymize old IP addresses (6 months)
    const ipCutoff = new Date()
    ipCutoff.setMonth(ipCutoff.getMonth() - 6)
    
    // Get records with IP addresses to anonymize
    const contactsToAnonymize = await prisma.contact.findMany({
      where: {
        createdAt: { lt: ipCutoff },
        ipAddress: { not: null },
      },
      select: { id: true },
    })
    
    // Anonymize IPs
    for (const contact of contactsToAnonymize) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: { ipAddress: null },
      })
    }
    console.log(`✅ Anonymized ${contactsToAnonymize.length} IP addresses`)
    
    // Calculate totals
    results.total = Object.values(results).reduce((sum, count) => sum + count, 0)
    
    // Log summary
    console.log('\n📊 Data Retention Cleanup Summary:')
    console.log('================================')
    console.log(`Contacts deleted: ${results.contacts}`)
    console.log(`Analytics deleted: ${results.analytics}`)
    console.log(`Email logs deleted: ${results.emails}`)
    console.log(`Total records cleaned: ${results.total}`)
    console.log('================================\n')
    
    logger.info('GDPR data retention cleanup completed', results)
    
  } catch (error) {
    console.error('❌ Data retention cleanup failed:', error)
    logger.error('Data retention cleanup failed', { error })
    process.exit(1)
  }
}

/**
 * Verify retention policies are being followed
 */
async function verifyRetentionCompliance() {
  console.log('\n🔍 Verifying retention compliance...\n')
  
  const issues = []
  
  // Check for old contacts
  const oldContactsCutoff = new Date()
  oldContactsCutoff.setFullYear(oldContactsCutoff.getFullYear() - 3)
  
  const oldContacts = await prisma.contact.count({
    where: { createdAt: { lt: oldContactsCutoff } },
  })
  
  if (oldContacts > 0) {
    issues.push(`Found ${oldContacts} contacts older than 3 years`)
  }
  
  // Check for old analytics
  const oldAnalyticsCutoff = new Date()
  oldAnalyticsCutoff.setFullYear(oldAnalyticsCutoff.getFullYear() - 2)
  
  const oldPageViews = await prisma.pageView.count({
    where: { viewedAt: { lt: oldAnalyticsCutoff } },
  })
  
  if (oldPageViews > 0) {
    issues.push(`Found ${oldPageViews} page views older than 2 years`)
  }
  
  // Report results
  if (issues.length === 0) {
    console.log('✅ All data retention policies are being followed')
  } else {
    console.log('⚠️  Retention policy violations found:')
    issues.forEach(issue => console.log(`   - ${issue}`))
  }
}

/**
 * Main function
 */
async function main() {
  try {
    // Show current date
    console.log(`Current date: ${new Date().toISOString()}\n`)
    
    // Run cleanup
    await cleanupOldData()
    
    // Verify compliance
    await verifyRetentionCompliance()
    
    console.log('\n✅ Data retention maintenance complete!')
    
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { cleanupOldData, verifyRetentionCompliance }
