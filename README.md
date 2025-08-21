# Hudson Digital Solutions Website

A modern, high-performance business website built with Next.js 15, React, and TypeScript.

## Features

- 🚀 **Next.js 15** with App Router
- 🎨 **Tailwind CSS** for styling
- 🌓 **Dark Mode** with system preference detection
- 📧 **Contact Form** with Resend email integration
- 📝 **Ghost CMS** blog integration
- 📅 **Cal.com** scheduling widget
- 📈 **SEO Optimized** with dynamic sitemaps and schema markup
- 📊 **Google Analytics 4** with conversion tracking
- 🔄 **Lead Nurturing** automated email sequences
- ⚡ **Performance Optimized** for Core Web Vitals

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   RESEND_API_KEY=your_resend_api_key
   GHOST_URL=https://your-ghost-site.com
   GHOST_CONTENT_API_KEY=your_content_api_key
   NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
   GOOGLE_SITE_VERIFICATION=your_verification_code
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Testing the Contact Form

The contact form sends emails to: **hello@hudsondigitalsolutions.com**

### Method 1: Using the Live Site
1. Go to `https://hudsondigitalsolutions.com/contact`
2. Fill out the form with real information
3. Submit and check for confirmation
4. Check your email at hello@hudsondigitalsolutions.com

### Method 2: Using the Test Script
```bash
npx tsx test-contact-form.ts
```

### Method 3: Using Local Development
1. Start the development server: `npm run dev`
2. Open `http://localhost:3000/contact` in your browser
3. Fill out and submit the form

## Email Features

- **Admin Notification**: Sent to hello@hudsondigitalsolutions.com with form details
- **Client Welcome Email**: Sent to the form submitter
- **Lead Nurturing**: Automated email sequence scheduled for new leads
- **High-Intent Detection**: Special sequences for consultation requests

## Deployment

Deploy to Vercel:
```bash
vercel
```

The `vercel.json` file includes:
- Performance optimizations
- Security headers
- Image optimization
- Caching strategies
- Regional deployment (US East)

## Performance Optimizations

- Image optimization with Next.js Image component
- Static generation for blog posts
- Edge caching for assets
- Bundle size optimization
- Lazy loading components
- Web font optimization

## SEO Features

- Dynamic sitemap generation
- Robots.txt configuration
- Schema.org structured data
- Open Graph meta tags
- Twitter Cards
- Dynamic keyword generation
- Google Analytics integration

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
├── contexts/         # React contexts (Theme)
├── lib/              # Utility functions
├── types/            # TypeScript types
└── utils/            # Helper utilities
```

## Lead Nurturing Sequences

The website includes automated email sequences:

1. **Welcome Series** (4 emails over 14 days)
   - Immediate welcome email
   - Value proposition (Day 3)
   - Case studies (Day 7)
   - Free audit offer (Day 14)

2. **Consultation Follow-up** (3 emails over 5 days)
   - Thank you email
   - Custom proposal (Day 2)
   - Limited time offer (Day 5)

3. **Long-term Nurturing** (3 emails over 60 days)
   - Educational content
   - Framework comparisons
   - ROI measurement guide

## Environment Variables

```bash
# Email
RESEND_API_KEY=             # Resend API key for email sending

# Ghost CMS
GHOST_URL=                  # Your Ghost instance URL
GHOST_CONTENT_API_KEY=      # Ghost Content API key

# Analytics & Monitoring
NEXT_PUBLIC_GA_MEASUREMENT_ID=  # Google Analytics 4 ID
GA4_API_SECRET=             # GA4 Measurement Protocol API secret
NEXT_PUBLIC_POSTHOG_KEY=    # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST=   # PostHog host (default: https://app.posthog.com)

# SEO
GOOGLE_SITE_VERIFICATION=   # Google Search Console verification
```

## Analytics & Monitoring

The website includes comprehensive analytics and performance monitoring:

### Analytics Platforms
- **Google Analytics 4**: Page views, conversions, user behavior
- **PostHog**: Product analytics, feature flags, session recordings
- **Vercel Analytics**: Core Web Vitals, speed insights, performance metrics

### Tracked Events
- Page views and navigation
- Form submissions and conversions
- Button clicks and user interactions
- Scroll depth and time on page
- Web Vitals (CLS, LCP, FID)
- Error tracking and debugging
- Lead attribution and marketing campaigns

### Performance Monitoring
- Core Web Vitals reporting
- Page load times and performance metrics
- Mobile vs desktop performance
- Real user monitoring (RUM)
- Error tracking and alerts

### Privacy & Compliance
- GDPR compliant data collection
- User consent management
- Anonymous IP tracking
- Opt-out capabilities

## License

All rights reserved - Hudson Digital Solutions