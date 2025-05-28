import type { Metadata } from 'next'
import {
  TrendingUp,
  CheckCircle,
  Building2,
  DollarSign,
  Users,
  Zap,
} from 'lucide-react'
import { AnimatedSection } from '@/components/sections/section'
import {
  AnimatedText,
  AnimatedHeading,
} from '@/components/animated/animated-text'
import { AnimatedCard } from '@/components/animated/animated-card'
import { LeadMagnetSection } from '@/components/sections/lead-magnet-section'
import { TestimonialsSection } from '@/components/sections/testimonials-section'

export const metadata: Metadata = {
  title: 'Revenue Operations & Automation | Hudson Digital Solutions',
  description:
    'Transform your sales process with RevOps automation. 10 years of Thryv experience helping Dallas-Fort Worth businesses increase revenue and efficiency.',
  keywords:
    'revenue operations, RevOps, sales automation, CRM optimization, Dallas Fort Worth, revenue growth',
  openGraph: {
    title: 'Revenue Operations & Automation - Hudson Digital Solutions',
    description:
      'Automate your sales process and grow revenue predictably with proven RevOps strategies.',
    url: 'https://hudsondigitalsolutions.com/services/revenue-operations',
    images: [
      {
        url: 'https://hudsondigitalsolutions.com/revops-og.png',
        width: 1200,
        height: 630,
        alt: 'Revenue Operations Services',
      },
    ],
  },
}

const features = [
  {
    icon: Zap,
    title: 'Sales Process Automation',
    description:
      'Eliminate manual tasks and let your team focus on selling, not data entry.',
  },
  {
    icon: Users,
    title: 'CRM Implementation',
    description:
      'Set up HubSpot, Pipedrive, or your preferred CRM the right way from day one.',
  },
  {
    icon: TrendingUp,
    title: 'Pipeline Optimization',
    description:
      'Identify bottlenecks and optimize your sales funnel for maximum conversion.',
  },
  {
    icon: DollarSign,
    title: 'Revenue Analytics',
    description:
      'Get real-time insights into your revenue performance and forecast accurately.',
  },
]

const results = [
  { metric: '40%', description: 'Average increase in sales productivity' },
  { metric: '2x', description: 'Lead conversion improvement' },
  { metric: '60%', description: 'Less time on administrative tasks' },
  { metric: '94%', description: 'Data accuracy improvement' },
]

const process = [
  {
    step: 1,
    title: 'Discovery & Audit',
    description:
      'We analyze your current sales process and identify opportunities for automation and improvement.',
  },
  {
    step: 2,
    title: 'Strategy Development',
    description:
      'Create a customized RevOps strategy based on your business goals and challenges.',
  },
  {
    step: 3,
    title: 'Implementation',
    description:
      'Set up and configure your tools, automate workflows, and integrate systems.',
  },
  {
    step: 4,
    title: 'Training & Support',
    description:
      'Train your team and provide ongoing support to ensure successful adoption.',
  },
]

export default function RevenueOperationsPage() {
  return (
    <main className='py-12'>
      {/* Hero Section */}
      <AnimatedSection className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-4xl font-bold tracking-tight text-white sm:text-6xl'>
            Revenue Operations That Actually Works
          </AnimatedHeading>
          <AnimatedText
            className='mt-6 text-lg leading-8 text-gray-300'
            delay={0.1}
          >
            Stop losing deals to inefficient processes. I&apos;ll help you build
            a revenue engine that scales, using the same strategies I
            implemented for 200+ businesses at Thryv.
          </AnimatedText>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <a
              href='/contact?service=revenue-ops'
              className='rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700'
            >
              Get Your Free RevOps Audit
            </a>
            <a
              href='#case-study'
              className='text-base font-semibold leading-6 text-gray-300 hover:text-white'
            >
              See Results <span aria-hidden='true'>→</span>
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* Problem Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <AnimatedCard className='bg-red-900/20 border-red-900/50'>
            <h2 className='text-2xl font-bold text-white'>
              Is This Your Sales Team?
            </h2>
            <ul className='mt-6 space-y-3 text-gray-300'>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Leads falling through the cracks because follow-ups are manual
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Sales reps spending hours on data entry instead of selling
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                No visibility into pipeline health or accurate forecasting
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Different tools that don&apos;t talk to each other
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Inconsistent sales process across the team
              </li>
            </ul>
            <p className='mt-6 text-lg font-semibold text-white'>
              You&apos;re not alone. I&apos;ve helped hundreds of businesses
              solve these exact problems.
            </p>
          </AnimatedCard>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            What Revenue Operations Includes
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

      {/* Results Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Real Results for Real Businesses
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4'>
          {results.map((result, index) => (
            <AnimatedCard
              key={result.metric}
              delay={index * 0.1}
              className='text-center'
            >
              <div className='text-3xl font-bold text-blue-400'>
                {result.metric}
              </div>
              <p className='mt-2 text-sm text-gray-300'>{result.description}</p>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedSection>

      {/* Case Study Section */}
      <AnimatedSection
        id='case-study'
        className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'
      >
        <div className='mx-auto max-w-3xl'>
          <AnimatedCard className='bg-gray-800/50'>
            <div className='flex items-center gap-4 mb-6'>
              <Building2 className='h-10 w-10 text-blue-400' />
              <div>
                <h3 className='text-xl font-bold text-white'>
                  Case Study: Local Service Business
                </h3>
                <p className='text-gray-400'>Dallas Home Services Company</p>
              </div>
            </div>

            <div className='space-y-6'>
              <div>
                <h4 className='font-semibold text-blue-400'>The Challenge:</h4>
                <p className='text-gray-300'>
                  Manual lead tracking in spreadsheets, no follow-up system, and
                  sales team spending 60% of time on admin work.
                </p>
              </div>

              <div>
                <h4 className='font-semibold text-blue-400'>Our Solution:</h4>
                <ul className='mt-2 space-y-2 text-gray-300'>
                  <li>• Implemented HubSpot CRM with automated workflows</li>
                  <li>• Created lead scoring and nurturing sequences</li>
                  <li>• Built custom dashboard for pipeline visibility</li>
                  <li>• Integrated with existing tools via Zapier</li>
                </ul>
              </div>

              <div>
                <h4 className='font-semibold text-blue-400'>The Results:</h4>
                <div className='mt-2 grid grid-cols-2 gap-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-white'>2x</div>
                    <div className='text-sm text-gray-400'>Lead Conversion</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-white'>60%</div>
                    <div className='text-sm text-gray-400'>Time Saved</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-white'>40%</div>
                    <div className='text-sm text-gray-400'>Revenue Growth</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-white'>
                      3 months
                    </div>
                    <div className='text-sm text-gray-400'>ROI Timeline</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </AnimatedSection>

      {/* Process Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Our Proven Process
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-12 max-w-3xl'>
          {process.map((item, index) => (
            <AnimatedCard
              key={item.step}
              delay={index * 0.1}
              className='mt-6 flex items-start'
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
      </AnimatedSection>

      {/* Technologies Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Technologies We Work With
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-8 max-w-3xl'>
          <div className='flex flex-wrap justify-center gap-4'>
            {[
              'HubSpot',
              'Salesforce',
              'Pipedrive',
              'Zapier',
              'Workato',
              'Tray.io',
              'Monday.com',
              'Airtable',
            ].map((tech, index) => (
              <span
                key={tech}
                className='px-4 py-2 bg-gray-800 text-gray-300 rounded-full text-sm'
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Lead Magnet Section */}
      <LeadMagnetSection />

      {/* CTA Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Ready to Transform Your Revenue Operations?
          </AnimatedHeading>
          <AnimatedText className='mt-6 text-lg text-gray-300'>
            Get a free RevOps audit and see exactly how we can help you increase
            revenue and efficiency. No obligations, just valuable insights.
          </AnimatedText>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <a
              href='/contact?service=revenue-ops'
              className='rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700'
            >
              Get My Free Audit
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

      {/* Client Testimonials - Using Real Data */}
      <TestimonialsSection 
        useRealData={true}
        title="What Our Clients Say"
        subtitle="See how RevOps transformed their businesses"
        bgColor="bg-gray-900"
        cardStyle="accent"
      />

      {/* FAQ Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <AnimatedHeading className='text-3xl font-bold text-white text-center mb-8'>
            Frequently Asked Questions
          </AnimatedHeading>
          <div className='space-y-8'>
            <AnimatedCard>
              <h3 className='text-lg font-semibold text-white'>
                How long does implementation take?
              </h3>
              <p className='mt-2 text-gray-300'>
                Most RevOps implementations take 2-4 weeks, depending on
                complexity. Simple CRM setups can be done in a week, while
                complex multi-system integrations may take up to 6 weeks.
              </p>
            </AnimatedCard>
            <AnimatedCard>
              <h3 className='text-lg font-semibold text-white'>
                Do you work with our existing tools?
              </h3>
              <p className='mt-2 text-gray-300'>
                Yes! I work with all major CRMs and can integrate with your
                existing tech stack. If your current tools aren&apos;t serving
                you well, I&apos;ll recommend alternatives.
              </p>
            </AnimatedCard>
            <AnimatedCard>
              <h3 className='text-lg font-semibold text-white'>
                What&apos;s included in the monthly support?
              </h3>
              <p className='mt-2 text-gray-300'>
                Monthly support includes workflow adjustments, report updates,
                user training, and troubleshooting. It ensures your RevOps
                system evolves with your business.
              </p>
            </AnimatedCard>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
