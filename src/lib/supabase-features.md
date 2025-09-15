# Supabase Full-Stack Integration

## 🗄️ Database Schema
- **leads** - Contact form submissions with lead scoring
- **lead_interactions** - Email sequences and follow-ups
- **page_analytics** - Page views and session tracking
- **web_vitals** - Core Web Vitals performance data
- **custom_events** - User interactions and behavior
- **conversion_funnel** - Conversion tracking and optimization
- **ab_test_results** - A/B testing data
- **api_logs** - Comprehensive API and application logging

## 🔄 Realtime Features
- Live analytics dashboard updates
- Real-time log monitoring
- Instant lead notifications
- Performance alert system

## 🕒 Cron Jobs
- **Analytics Processing** (`/api/cron/analytics-processing`)
  - Hourly data aggregation
  - Lead scoring updates
  - Performance monitoring
  - Conversion funnel analysis

## 🪝 Webhooks
- **Database Events** (`/api/webhooks/supabase`)
  - New lead notifications
  - Status change triggers
  - Error monitoring alerts
  - Automated email sequences

## 📊 GraphQL Analytics
- **Custom Queries** (`/api/graphql/analytics`)
  - Page view analytics
  - Web Vitals aggregation
  - Lead statistics
  - Event tracking data
  - Funnel conversion rates

## 📐 Queue System
- Background log processing
- Email sequence automation
- Performance data analysis
- Lead nurturing workflows

## 🔗 Integration Points

### Logger Integration
```typescript
import { logToDatabase, logCustomEvent } from '@/lib/supabase'

// Automatic database logging
logger.info('User action', { userId, action })
// → Logs to PostHog + Vercel + Supabase database

// Custom event tracking
await logCustomEvent('form_submission', {
  form: 'contact',
  source: 'homepage'
})
```

### Realtime Subscriptions
```typescript
import { subscribeToLogs, subscribeToEvents } from '@/lib/supabase'

// Live log monitoring
const logSubscription = subscribeToLogs((payload) => {
  console.log('New log:', payload.new)
})

// Live event tracking
const eventSubscription = subscribeToEvents((payload) => {
  updateDashboard(payload.new)
})
```

### Analytics Queries
```typescript
// GraphQL analytics queries
const pageViews = await fetch('/api/graphql/analytics', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer your-token' },
  body: JSON.stringify({
    query: 'getPageViews',
    variables: { timeRange: '7d', limit: 100 }
  })
})
```

### Funnel Tracking
```typescript
import { trackFunnelStep } from '@/lib/supabase'

// Track conversion steps
await trackFunnelStep(
  sessionId,
  'contact_form',
  'form_view',
  1,
  false
)

await trackFunnelStep(
  sessionId,
  'contact_form',
  'form_submit',
  2,
  true
)
```

## 🚀 Production Setup

### Webhook Configuration
1. Configure webhook URL in Supabase Dashboard
2. Set webhook secret in environment variables
3. Enable database event triggers

### Cron Job Setup
1. Add Vercel cron configuration
2. Set cron secret for authentication
3. Configure hourly analytics processing

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://bholhbfdqbdpfhmrzhbv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_Kd_o-4ooDE3tvdljwxlNZQ_uWH5yiv8
CRON_SECRET=your-secure-cron-secret
WEBHOOK_SECRET=your-secure-webhook-secret
```

## 📈 Analytics Dashboard Queries

### Popular Pages
```graphql
query GetPageViews($timeRange: String!) {
  getPageViews(timeRange: $timeRange) {
    total
    bounceRate
    pages {
      path
      views
      avgDuration
    }
  }
}
```

### Lead Performance
```graphql
query GetLeadStats($timeRange: String!) {
  getLeadStats(timeRange: $timeRange) {
    total
    averageScore
    bySource {
      source
      count
      percentage
    }
  }
}
```

### Web Vitals
```graphql
query GetWebVitals($timeRange: String!, $metric: String) {
  getWebVitals(timeRange: $timeRange, metric: $metric) {
    metrics {
      metric
      averageValue
      goodCount
      poorCount
    }
  }
}
```

This integration provides a complete observability and analytics platform using Supabase's advanced features for webhooks, cron jobs, queues, and GraphQL.