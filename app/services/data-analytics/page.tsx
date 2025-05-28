import type { Metadata } from 'next'
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Eye,
  Target,
} from 'lucide-react'
import { AnimatedSection } from '@/components/sections/section'
import {
  AnimatedText,
  AnimatedHeading,
} from '@/components/animated/animated-text'
import { AnimatedCard } from '@/components/animated/animated-card'
import { LeadMagnetSection } from '@/components/sections/lead-magnet-section'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Data Analytics & Visualization | Hudson Digital Solutions',
  description:
    'Transform your business data into actionable insights. Custom dashboards and analytics for Dallas-Fort Worth small businesses.',
  keywords:
    'data analytics, business intelligence, dashboard development, data visualization, Dallas analytics',
  openGraph: {
    title: 'Data Analytics & Visualization - Hudson Digital Solutions',
    description:
      'Turn your data into insights that drive growth. Custom analytics solutions for small businesses.',
    url: 'https://hudsondigitalsolutions.com/services/data-analytics',
    images: [
      {
        url: 'https://hudsondigitalsolutions.com/analytics-og.png',
        width: 1200,
        height: 630,
        alt: 'Data Analytics Services',
      },
    ],
  },
}

const features = [
  {
    icon: BarChart3,
    title: 'Custom Dashboards',
    description:
      'Real-time dashboards that show exactly what matters to your business.',
  },
  {
    icon: TrendingUp,
    title: 'Revenue Analytics',
    description:
      'Track revenue trends, forecast growth, and identify opportunities.',
  },
  {
    icon: Eye,
    title: 'Customer Insights',
    description: 'Understand customer behavior and improve retention rates.',
  },
  {
    icon: Target,
    title: 'KPI Tracking',
    description: 'Monitor key performance indicators with automated alerts.',
  },
]

const benefits = [
  {
    title: 'Make Better Decisions',
    description:
      'Stop guessing. Use data to make confident business decisions.',
    icon: '🎯',
  },
  {
    title: 'Save Time',
    description: 'Automated reports mean no more manual spreadsheet work.',
    icon: '⏰',
  },
  {
    title: 'Spot Trends Early',
    description:
      'Identify opportunities and problems before they impact your bottom line.',
    icon: '📈',
  },
  {
    title: 'Increase Revenue',
    description:
      'Data-driven businesses grow 23% faster than their competitors.',
    icon: '💰',
  },
]

const dashboardTypes = [
  {
    name: 'Sales Dashboard',
    description: 'Track sales performance, pipeline health, and team metrics',
    metrics: [
      'Revenue by period',
      'Conversion rates',
      'Lead sources',
      'Sales velocity',
    ],
  },
  {
    name: 'Marketing Dashboard',
    description: 'Monitor campaign performance and ROI across channels',
    metrics: [
      'Traffic sources',
      'Campaign ROI',
      'Lead generation',
      'Cost per acquisition',
    ],
  },
  {
    name: 'Operations Dashboard',
    description: 'Optimize workflows and track operational efficiency',
    metrics: [
      'Process efficiency',
      'Resource utilization',
      'Quality metrics',
      'Time tracking',
    ],
  },
  {
    name: 'Executive Dashboard',
    description: 'High-level KPIs for business owners and leaders',
    metrics: [
      'Revenue trends',
      'Profit margins',
      'Growth metrics',
      'Strategic goals',
    ],
  },
]

export default function DataAnalyticsPage() {
  return (
    <main className='py-12'>
      {/* Hero Section */}
      <AnimatedSection className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-4xl font-bold tracking-tight text-white sm:text-6xl'>
            Your Data Has a Story. Let&apos;s Tell It.
          </AnimatedHeading>
          <AnimatedText
            className='mt-6 text-lg leading-8 text-gray-300'
            delay={0.1}
          >
            Transform scattered data into clear insights. Get custom dashboards
            that show exactly what&apos;s working in your business and what
            needs attention.
          </AnimatedText>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <a
              href='/contact?service=analytics'
              className='rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700'
            >
              Get Your Data Audit
            </a>
            <a
              href='#examples'
              className='text-base font-semibold leading-6 text-gray-300 hover:text-white'
            >
              See Examples <span aria-hidden='true'>→</span>
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* Problem Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <AnimatedCard className='bg-red-900/20 border-red-900/50'>
            <h2 className='text-2xl font-bold text-white'>Sound Familiar?</h2>
            <ul className='mt-6 space-y-3 text-gray-300'>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Data scattered across multiple spreadsheets and systems
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Hours wasted creating manual reports every week
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                No real-time visibility into business performance
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Making decisions based on gut feeling, not data
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Missing opportunities because you can&apos;t see trends
              </li>
            </ul>
            <p className='mt-6 text-lg font-semibold text-white'>
              It&apos;s time to turn your data into your competitive advantage.
            </p>
          </AnimatedCard>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            What We Build For You
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2'>
          {features.map((feature, index) => (
            <AnimatedCard key={feature.title} delay={index * 0.1}>
              <div className='flex items-start'>
                <feature.icon className='h-8 w-8 text-blue-400 flex-shrink-0' />
                <div className='ml-4'>
                  <h3 className='text-lg font-semibold text-white'>
                    {feature.title}
                  </h3>
                  <p className='mt-2 text-gray-300'>{feature.description}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedSection>

      {/* Dashboard Examples */}
      <AnimatedSection
        id='examples'
        className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'
      >
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Dashboard Examples
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8'>
          {dashboardTypes.map((dashboard, index) => (
            <AnimatedCard key={dashboard.name} delay={index * 0.1}>
              <div className='grid md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='text-xl font-semibold text-white'>
                    {dashboard.name}
                  </h3>
                  <p className='mt-2 text-gray-300'>{dashboard.description}</p>
                  <div className='mt-4'>
                    <h4 className='text-sm font-semibold text-blue-400'>
                      Key Metrics:
                    </h4>
                    <ul className='mt-2 space-y-1'>
                      {dashboard.metrics.map(metric => (
                        <li key={metric} className='text-sm text-gray-300'>
                          • {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className='bg-gray-800 rounded-lg p-4'>
                  <div className='aspect-video bg-gray-900 rounded flex items-center justify-center'>
                    <BarChart3 className='h-16 w-16 text-gray-700' />
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedSection>

      {/* Benefits Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Why Data Analytics Matters
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2'>
          {benefits.map((benefit, index) => (
            <AnimatedCard key={benefit.title} delay={index * 0.1}>
              <div className='flex items-start'>
                <span className='text-3xl mr-4'>{benefit.icon}</span>
                <div>
                  <h3 className='text-lg font-semibold text-white'>
                    {benefit.title}
                  </h3>
                  <p className='mt-2 text-gray-300'>{benefit.description}</p>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedSection>

      {/* Process Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Our Analytics Process
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-12 max-w-3xl'>
          <div className='space-y-8'>
            {[
              {
                step: 1,
                title: 'Data Audit',
                description:
                  'We analyze your current data sources and identify what&apos;s important.',
              },
              {
                step: 2,
                title: 'Dashboard Design',
                description:
                  'Create mockups of your custom dashboards based on your needs.',
              },
              {
                step: 3,
                title: 'Data Integration',
                description:
                  'Connect all your data sources into a unified analytics platform.',
              },
              {
                step: 4,
                title: 'Build & Test',
                description:
                  'Develop your dashboards with real data and test accuracy.',
              },
              {
                step: 5,
                title: 'Training & Launch',
                description: 'Train your team and launch with ongoing support.',
              },
            ].map((item, index) => (
              <AnimatedCard
                key={item.step}
                delay={index * 0.1}
                className='flex items-start'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 flex-shrink-0'>
                  <span className='text-white font-bold'>{item.step}</span>
                </div>
                <div className='ml-4'>
                  <h3 className='text-lg font-semibold text-white'>
                    {item.title}
                  </h3>
                  <p className='mt-2 text-gray-300'>{item.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Tools Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Tools We Work With
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-8 max-w-3xl'>
          <div className='flex flex-wrap justify-center gap-4'>
            {[
              'Google Analytics',
              'Google Data Studio',
              'Tableau',
              'Power BI',
              'Looker',
              'Custom Dashboards',
            ].map((tool, index) => (
              <span
                key={tool}
                className='px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm'
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Pricing Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Simple, Transparent Pricing
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-12 max-w-3xl'>
          <AnimatedCard>
            <div className='text-center'>
              <h3 className='text-2xl font-bold text-white'>
                Analytics Dashboard Package
              </h3>
              <p className='mt-4 text-4xl font-bold text-white'>$999</p>
              <p className='text-gray-300'>one-time setup</p>
              <p className='mt-2 text-xl text-white'>+ $99/month</p>
              <p className='text-gray-300'>for maintenance & updates</p>
            </div>
            <div className='mt-8 space-y-4'>
              <div className='flex items-center'>
                <PieChart className='h-5 w-5 text-blue-400 mr-3' />
                <span className='text-gray-300'>Custom dashboard design</span>
              </div>
              <div className='flex items-center'>
                <Activity className='h-5 w-5 text-blue-400 mr-3' />
                <span className='text-gray-300'>Real-time data updates</span>
              </div>
              <div className='flex items-center'>
                <Target className='h-5 w-5 text-blue-400 mr-3' />
                <span className='text-gray-300'>KPI tracking & alerts</span>
              </div>
              <div className='flex items-center'>
                <BarChart3 className='h-5 w-5 text-blue-400 mr-3' />
                <span className='text-gray-300'>Automated reporting</span>
              </div>
            </div>
            <a
              href='/contact?service=analytics'
              className='mt-8 block w-full rounded-md bg-blue-600 py-3 px-4 text-center text-base font-medium text-white hover:bg-blue-700'
            >
              Start Your Data Journey
            </a>
          </AnimatedCard>
        </div>
      </AnimatedSection>

      {/* Lead Magnet Section */}
      <LeadMagnetSection />

      {/* CTA Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Ready to Unlock Your Data&apos;s Potential?
          </AnimatedHeading>
          <AnimatedText className='mt-6 text-lg text-gray-300'>
            Get a free data audit and see exactly how analytics can help your
            business grow. No obligations, just insights.
          </AnimatedText>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <a
              href='/contact?service=analytics'
              className='rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700'
            >
              Get Your Free Data Audit
            </a>
            <a
              href='tel:+12145550143'
              className='text-base font-semibold leading-6 text-gray-300 hover:text-white'
            >
              Call (214) 555-0143 <span aria-hidden='true'>→</span>
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <AnimatedHeading className='text-3xl font-bold text-white text-center mb-8'>
            Frequently Asked Questions
          </AnimatedHeading>
          <div className='space-y-8'>
            <AnimatedCard>
              <h3 className='text-lg font-semibold text-white'>
                What data sources can you connect?
              </h3>
              <p className='mt-2 text-gray-300'>
                We can connect virtually any data source including Google
                Analytics, CRM systems, spreadsheets, databases, payment
                processors, and more. If it has data, we can likely connect it.
              </p>
            </AnimatedCard>
            <AnimatedCard>
              <h3 className='text-lg font-semibold text-white'>
                How long does implementation take?
              </h3>
              <p className='mt-2 text-gray-300'>
                Most analytics dashboards are completed in 2-3 weeks. Simple
                dashboards can be done in a week, while complex multi-source
                integrations may take up to 4 weeks.
              </p>
            </AnimatedCard>
            <AnimatedCard>
              <h3 className='text-lg font-semibold text-white'>
                Do I need technical knowledge to use the dashboards?
              </h3>
              <p className='mt-2 text-gray-300'>
                Not at all! We design dashboards to be intuitive and easy to
                use. We also provide training and documentation so anyone on
                your team can understand the data.
              </p>
            </AnimatedCard>
            <AnimatedCard>
              <h3 className='text-lg font-semibold text-white'>
                What&apos;s included in monthly maintenance?
              </h3>
              <p className='mt-2 text-gray-300'>
                Monthly maintenance includes data source monitoring, dashboard
                updates, new metric additions, troubleshooting, and ongoing
                support. We keep your analytics running smoothly.
              </p>
            </AnimatedCard>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
