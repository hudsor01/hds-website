import 'server-only'

/**
 * Server-only utilities
 * This file contains functions that should only run on the server
 */

// Database utilities that require server-side secrets
export async function getSecureData(id: string) {
  // This function uses API keys that should never be exposed to the client
  const response = await fetch(`${process.env.API_BASE_URL}/data/${id}`, {
    headers: {
      'Authorization': `Bearer ${process.env.API_SECRET}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch secure data')
  }
  
  return response.json()
}

// Server-side analytics tracking
export function trackServerEvent(event: string, data: Record<string, unknown>) {
  // This could send to server-side analytics services
  if (process.env.NODE_ENV === 'production') {
    console.log(`Server event: ${event}`, data)
    // Example: Send to server-side analytics
    // analytics.track(event, data)
  }
}

// Email processing utilities
export async function processEmailQueue() {
  // Server-only email processing logic
  return {
    processed: 0,
    errors: 0,
  }
}

// Admin utilities that require server-side validation
export function validateAdminAccess(token: string): boolean {
  // Server-only admin validation
  return process.env.ADMIN_SECRET === token
}

// Database connection utilities
export function getDatabaseConfig() {
  return {
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
  }
}