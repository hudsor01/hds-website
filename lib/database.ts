import { PrismaClient, Prisma } from '@prisma/client'
import { env } from './env'

// Prevent multiple instances during development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Connection health check
export async function checkDatabaseConnection() {
  try {
    await db.$connect()
    return { connected: true, error: null }
  } catch (error) {
    console.error('Database connection failed:', error)
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
    }
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await db.$disconnect()
}

// Database utilities
export const dbUtils = {
  // Get analytics data
  async getPageViews(startDate?: Date, endDate?: Date) {
    const where: Prisma.PageViewWhereInput = startDate && endDate ? {
      viewedAt: {
        gte: startDate,
        lte: endDate,
      },
    } : {}

    return await db.pageView.findMany({
      where,
      orderBy: { viewedAt: 'desc' },
      take: 100,
    })
  },

  // Get recent contacts
  async getRecentContacts(limit = 10) {
    return await db.contact.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        responses: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
    })
  },

  // Get newsletter stats
  async getNewsletterStats() {
    const [total, active, recentSignups] = await Promise.all([
      db.newsletterSubscriber.count(),
      db.newsletterSubscriber.count({
        where: { status: 'ACTIVE', verified: true },
      }),
      db.newsletterSubscriber.count({
        where: {
          subscribedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ])

    return { total, active, recentSignups }
  },

  // Get lead magnet stats
  async getLeadMagnetStats() {
    return await db.leadMagnet.findMany({
      include: {
        _count: {
          select: { downloads: true },
        },
      },
      orderBy: { downloadCount: 'desc' },
    })
  },
}

// Type exports for convenience
export type Contact = Prisma.ContactGetPayload<{}>
export type NewsletterSubscriber = Prisma.NewsletterSubscriberGetPayload<{}>
export type LeadMagnet = Prisma.LeadMagnetGetPayload<{}>
export type LeadMagnetDownload = Prisma.LeadMagnetDownloadGetPayload<{}>
export type PageView = Prisma.PageViewGetPayload<{}>
export type Event = Prisma.EventGetPayload<{}>