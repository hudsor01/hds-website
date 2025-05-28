import type { Metadata } from 'next'
import {
  Code,
  Rocket,
  Shield,
  Smartphone,
  CheckCircle,
  Zap,
  Search,
} from 'lucide-react'
import Image from 'next/image'
import { AnimatedSection } from '@/components/sections/section'
import { SectionErrorBoundary } from '@/components/error/route-error-boundaries'
import {
  AnimatedText,
  AnimatedHeading,
} from '@/components/animated/animated-text'
import { AnimatedCard } from '@/components/animated/animated-card'
import { LeadMagnetSection } from '@/components/sections/lead-magnet-section'
import { generateServiceMetadata } from '@/lib/metadata/metadata-utils'

export const metadata: Metadata = generateServiceMetadata({
  name: 'Web Development',
  description: 'Custom Next.js websites for small businesses. Fast, modern, SEO-optimized websites built with React and TypeScript.',
  benefits: [
    'Lightning fast loading',
    'Mobile-first design',
    'SEO optimized',
    'Secure and reliable',
    'Custom development',
    'Modern technology stack',
  ],
  slug: 'web-development',
})

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Built with Next.js 14 for blazing fast load times and better SEO rankings.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description:
      'Looks perfect on all devices. Over 60% of your visitors are on mobile.',
  },
  {
    icon: Search,
    title: 'SEO Optimized',
    description:
      'Built-in SEO best practices to help you rank higher on Google.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description:
      'SSL certificates, secure hosting, and regular backups included.',
  },
]

const process = [
  {
    step: 1,
    title: 'Discovery Call',
    description: 'We discuss your business goals and website needs.',
    timeline: '30 minutes',
  },
  {
    step: 2,
    title: 'Design & Development',
    description: 'I create your custom website with your feedback.',
    timeline: '5-7 days',
  },
  {
    step: 3,
    title: 'Review & Launch',
    description: 'You review, we make final tweaks, and launch.',
    timeline: '2-3 days',
  },
  {
    step: 4,
    title: 'Training & Handoff',
    description: 'I show you how to update content and manage your site.',
    timeline: '1 hour',
  },
]

const packages = [
  {
    name: 'Starter Site',
    price: '$799',
    description: 'Perfect for small businesses just getting started online',
    features: [
      '3-5 page custom website',
      'Mobile responsive design',
      'Contact form with email alerts',
      'Basic SEO optimization',
      '1 year hosting included',
      '2 rounds of revisions',
      '1-week turnaround',
    ],
    ideal: 'Service businesses, consultants, local shops',
  },
  {
    name: 'Professional Site',
    price: '$1,499',
    description: 'Everything you need for a strong online presence',
    features: [
      '5-10 page custom website',
      'Advanced animations & interactions',
      'Blog/news section',
      'Google Analytics integration',
      'Advanced SEO setup',
      '1 year hosting included',
      '3 rounds of revisions',
      '2-week turnaround',
    ],
    ideal: 'Growing businesses, professional services',
    popular: true,
  },
  {
    name: 'E-commerce Starter',
    price: '$2,499',
    description: 'Start selling online with a custom store',
    features: [
      'Custom online store',
      'Up to 50 products',
      'Secure payment processing',
      'Inventory management',
      'Order notifications',
      '1 year hosting included',
      'Unlimited revisions',
      '3-week turnaround',
    ],
    ideal: 'Retail businesses, product sellers',
  },
]

export default function WebDevelopmentPage() {
  return (
    <main className='py-12'>
      {/* Hero Section */}
      <AnimatedSection className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-4xl font-bold tracking-tight text-white sm:text-6xl'>
            Modern Websites That Actually Get Results
          </AnimatedHeading>
          <AnimatedText
            className='mt-6 text-lg leading-8 text-gray-300'
            delay={0.1}
          >
            No templates. No page builders. Just clean, custom code built with
            Next.js and React. Get a website that&apos;s fast, beautiful, and
            built to convert visitors into customers.
          </AnimatedText>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <a
              href='/contact?service=web-dev'
              className='rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700'
            >
              Get Started Today
            </a>
            <a
              href='#portfolio'
              className='text-base font-semibold leading-6 text-gray-300 hover:text-white'
            >
              View Portfolio <span aria-hidden='true'>→</span>
            </a>
          </div>
        </div>
      </AnimatedSection>

      {/* Problem Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <AnimatedCard className='bg-red-900/20 border-red-900/50'>
            <h2 className='text-2xl font-bold text-white'>
              Is Your Website Holding You Back?
            </h2>
            <ul className='mt-6 space-y-3 text-gray-300'>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Slow loading times frustrating visitors
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Doesn&apos;t look good on mobile devices
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Can&apos;t be found on Google
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                Outdated design that doesn&apos;t reflect your business
              </li>
              <li className='flex items-start'>
                <span className='mr-2'>❌</span>
                No clear call-to-action or conversion path
              </li>
            </ul>
            <p className='mt-6 text-lg font-semibold text-white'>
              Time for a website that works as hard as you do.
            </p>
          </AnimatedCard>
        </div>
      </AnimatedSection>

      {/* Features Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Every Website Includes
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

      {/* Portfolio Section */}
      <AnimatedSection
        id='portfolio'
        className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'
      >
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Recent Projects
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {[
            'portfolio-analytics',
            'portfolio-ecommerce',
            'portfolio-healthcare',
          ].map((img, index) => (
            <AnimatedCard key={img} delay={index * 0.1}>
              <div className='aspect-video relative bg-gray-800 rounded-lg overflow-hidden'>
                <Image
                  src={`/images/${img}.jpg`}
                  alt='Portfolio project'
                  fill
                  className='object-cover'
                />
              </div>
              <h3 className='mt-4 text-lg font-semibold text-white'>
                {img === 'portfolio-analytics' && 'Analytics Dashboard'}
                {img === 'portfolio-ecommerce' && 'E-commerce Platform'}
                {img === 'portfolio-healthcare' && 'Healthcare Portal'}
              </h3>
              <p className='mt-2 text-sm text-gray-300'>
                Custom Next.js application with real-time data visualization and
                modern UI.
              </p>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedSection>

      {/* Packages Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Choose Your Package
          </AnimatedHeading>
          <AnimatedText className='mt-4 text-lg text-gray-300'>
            All packages include hosting, SSL, and ongoing support
          </AnimatedText>
        </div>
        <div className='mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3'>
          {packages.map((pkg, index) => (
            <AnimatedCard
              key={pkg.name}
              delay={index * 0.1}
              className={pkg.popular ? 'ring-2 ring-blue-600' : ''}
            >
              {pkg.popular && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium'>
                    Most Popular
                  </span>
                </div>
              )}
              <div className='pt-6'>
                <h3 className='text-xl font-semibold text-white'>{pkg.name}</h3>
                <p className='mt-2 text-gray-300'>{pkg.description}</p>
                <p className='mt-4 text-3xl font-bold text-white'>
                  {pkg.price}
                </p>
                <ul className='mt-6 space-y-3'>
                  {pkg.features.map(feature => (
                    <li key={feature} className='flex items-start'>
                      <CheckCircle className='h-5 w-5 text-blue-400 flex-shrink-0' />
                      <span className='ml-2 text-sm text-gray-300'>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className='mt-6 text-sm text-gray-400 italic'>
                  Ideal for: {pkg.ideal}
                </p>
                <a
                  href={`/contact?service=web-dev&package=${pkg.name.toLowerCase().replace(' ', '-')}`}
                  className='mt-6 block w-full rounded-md bg-blue-600 py-2 px-4 text-center text-sm font-medium text-white hover:bg-blue-700'
                >
                  Get Started
                </a>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </AnimatedSection>

      {/* Process Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Our Simple Process
          </AnimatedHeading>
          <AnimatedText className='mt-4 text-lg text-gray-300'>
            From idea to launch in 1-2 weeks
          </AnimatedText>
        </div>
        <div className='mx-auto mt-12 max-w-3xl'>
          <div className='space-y-8'>
            {process.map((item, index) => (
              <AnimatedCard
                key={item.step}
                delay={index * 0.1}
                className='flex items-start'
              >
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 flex-shrink-0'>
                  <span className='text-white font-bold'>{item.step}</span>
                </div>
                <div className='ml-4 flex-1'>
                  <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-semibold text-white'>
                      {item.title}
                    </h3>
                    <span className='text-sm text-gray-400'>
                      {item.timeline}
                    </span>
                  </div>
                  <p className='mt-2 text-gray-300'>{item.description}</p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Technology Stack */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedHeading className='text-3xl font-bold text-white'>
            Built With Modern Technology
          </AnimatedHeading>
        </div>
        <div className='mx-auto mt-8 max-w-3xl'>
          <div className='flex flex-wrap justify-center gap-4'>
            {[
              'Next.js 14',
              'React 19',
              'TypeScript',
              'Tailwind CSS',
              'Vercel',
              'Supabase',
              'Stripe',
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
            Ready for a Website That Works?
          </AnimatedHeading>
          <AnimatedText className='mt-6 text-lg text-gray-300'>
            Let&apos;s build something amazing together. Get a free consultation
            and see how a custom Next.js website can transform your business.
          </AnimatedText>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <a
              href='/contact?service=web-dev'
              className='rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700'
            >
              Start Your Project
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

      {/* Guarantee Section */}
      <AnimatedSection className='mx-auto mt-16 max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-3xl'>
          <AnimatedCard className='bg-green-900/20 border-green-900/50 text-center'>
            <Shield className='h-12 w-12 text-green-400 mx-auto' />
            <h3 className='mt-4 text-2xl font-bold text-white'>
              30-Day Money-Back Guarantee
            </h3>
            <p className='mt-4 text-gray-300'>
              If you&apos;re not completely satisfied with your new website
              within 30 days of launch, I&apos;ll refund your money. No
              questions asked.
            </p>
          </AnimatedCard>
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
                How long does it take to build a website?
              </h3>
              <p className='mt-2 text-gray-300'>
                Most websites are completed in 1-2 weeks. Simple sites can be
                done in as little as 5 days, while complex e-commerce sites may
                take up to 3 weeks.
              </p>
            </AnimatedCard>
            <AnimatedCard>
              <h3 className='text-lg font-semibold text-white'>
                Do I need to provide content?
              </h3>
              <p className='mt-2 text-gray-300'>
                Yes, you&apos;ll need to provide your business information,
                images, and any specific content you want. I can help with
                copywriting and use stock images if needed.
              </p>
            </AnimatedCard>
            <AnimatedCard>
              <h3 className='text-lg font-semibold text-white'>
                Can I update the website myself?
              </h3>
              <p className='mt-2 text-gray-300'>
                Absolutely! I provide training on how to update content, and the
                site is built to be easy to maintain. Monthly support is also
                available if you prefer hands-off maintenance.
              </p>
            </AnimatedCard>
            <AnimatedCard>
              <h3 className='text-lg font-semibold text-white'>
                What about hosting and domains?
              </h3>
              <p className='mt-2 text-gray-300'>
                First year of hosting is included. After that, hosting is
                typically $10-20/month. Domain registration is separate (about
                $15/year) but I can help you set it up.
              </p>
            </AnimatedCard>
          </div>
        </div>
      </AnimatedSection>
    </main>
  )
}
