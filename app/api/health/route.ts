import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  responseTime?: number
  error?: string
  details?: Record<string, unknown>
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  uptime: number
  checks: HealthCheck[]
}

const startTime = Date.now()

export async function GET(_request: NextRequest) {
  const headersList = await headers()
  const host = headersList.get('host')

  const checks: HealthCheck[] = []

  // Check application health
  checks.push({
    name: 'application',
    status: 'healthy',
    details: {
      host,
      nodeVersion: process.version,
      nextVersion: process.env.NEXT_RUNTIME,
    },
  })

  // Check environment variables
  const envCheck = checkEnvironmentVariables()
  checks.push(envCheck)

  // Check email service
  const emailCheck = await checkEmailService()
  checks.push(emailCheck)

  // Check external APIs
  const apiCheck = await checkExternalAPIs()
  checks.push(apiCheck)

  // Check memory usage
  const memoryCheck = checkMemoryUsage()
  checks.push(memoryCheck)

  // Determine overall health status
  const statuses = checks.map(check => check.status)
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  if (statuses.includes('unhealthy')) {
    overallStatus = 'unhealthy'
  } else if (statuses.includes('degraded')) {
    overallStatus = 'degraded'
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Date.now() - startTime,
    checks,
  }

  return NextResponse.json(response, {
    status: overallStatus === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': overallStatus,
    },
  })
}

function checkEnvironmentVariables(): HealthCheck {
  const requiredEnvVars = ['RESEND_API_KEY']

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    return {
      name: 'environment',
      status: 'unhealthy',
      error: `Missing required environment variables: ${missingVars.join(', ')}`,
    }
  }

  return {
    name: 'environment',
    status: 'healthy',
    details: {
      requiredVarsPresent: true,
    },
  }
}

async function checkEmailService(): Promise<HealthCheck> {
  const start = Date.now()

  try {
    // Check if Resend API key is valid by making a simple API call
    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const responseTime = Date.now() - start

    if (response.ok) {
      return {
        name: 'email_service',
        status: 'healthy',
        responseTime,
        details: {
          provider: 'Resend',
          apiStatus: response.status,
        },
      }
    } else {
      return {
        name: 'email_service',
        status: 'degraded',
        responseTime,
        error: `API returned status ${response.status}`,
        details: {
          provider: 'Resend',
          apiStatus: response.status,
        },
      }
    }
  } catch (error) {
    return {
      name: 'email_service',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function checkExternalAPIs(): Promise<HealthCheck> {
  const start = Date.now()

  try {
    // Check if Resend is reachable (our primary email service)
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    const responseTime = Date.now() - start

    if (response.status === 200 || response.status === 401) {
      // 401 means API key issue but service is reachable
      return {
        name: 'external_apis',
        status: 'healthy',
        responseTime,
        details: {
          resend: 'reachable',
        },
      }
    } else {
      return {
        name: 'external_apis',
        status: 'degraded',
        responseTime,
        details: {
          resend: `unexpected status ${response.status}`,
        },
      }
    }
  } catch (error) {
    return {
      name: 'external_apis',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

function checkMemoryUsage(): HealthCheck {
  const used = process.memoryUsage()
  const totalHeap = used.heapTotal
  const usedHeap = used.heapUsed
  const externalMemory = used.external
  const rss = used.rss

  const heapUsagePercent = (usedHeap / totalHeap) * 100

  // Set thresholds
  const warningThreshold = 80
  const criticalThreshold = 95

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  if (heapUsagePercent >= criticalThreshold) {
    status = 'unhealthy'
  } else if (heapUsagePercent >= warningThreshold) {
    status = 'degraded'
  }

  return {
    name: 'memory',
    status,
    details: {
      heapUsagePercent: Math.round(heapUsagePercent),
      heapUsed: `${Math.round(usedHeap / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(totalHeap / 1024 / 1024)}MB`,
      external: `${Math.round(externalMemory / 1024 / 1024)}MB`,
      rss: `${Math.round(rss / 1024 / 1024)}MB`,
    },
  }
}
