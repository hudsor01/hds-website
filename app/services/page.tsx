import type { Metadata } from 'next'
import { TrendingUp, Code, BarChart3, DollarSign } from 'lucide-react'
import { AnimatedCard } from '@/components/animated/animated-card'
import { AnimatedText } from '@/components/animated/animated-text'
import { getServices } from '@/lib/data-fetchers'

export const metadata: Metadata = {
  title: 'Services | Hudson Digital Solutions - Revenue Operations & Web Development',
  description:
    'Revenue operations, web development, data analytics, and monthly support services for small businesses in Dallas-Fort Worth.',
  keywords:
    'revenue operations, web development, data analytics, small business services, Dallas Fort Worth',
  openGraph: {
    title: 'Services - Hudson Digital Solutions',
    description:
      'Revenue operations and web development services for small businesses.',
    url: 'https://hudsondigitalsolutions.com/services',
    images: [
      {
        url: 'https://hudsondigitalsolutions.com/services-og.png',
        width: 1200,
        height: 630,
        alt: 'Hudson Digital Solutions Services',
      },
    ],
  },
}

// Icon mapping for services
const iconMap = {
  'revenue-operations': TrendingUp,
  'web-development': Code,
  'data-analytics': BarChart3,
  'monthly-support': DollarSign,
}

// Fallback services for when database is not available
const fallbackServices = [
  {
    id: 'revenue-operations',
    title: 'Revenue Operations & Automation',
    description: 'Leverage my 10 years at Thryv to optimize your sales processes and drive predictable revenue growth.',
    price: '$1,499',
    featured: true,
    href: '/services/revenue-operations',
    features: [
      'Sales process automation & workflows',
      'CRM setup and optimization',
      'Lead tracking and nurturing systems',
      'Sales enablement tool integration',
      'Revenue analytics dashboards',
      'Email automation and sequences',
    ],
  },
  {
    id: 'web-development',
    title: 'Next.js Website Development',
    description: 'Modern, fast websites built from scratch with React and Next.js - no templates, just custom solutions.',
    price: '$799',
    featured: false,
    href: '/services/web-development',
    features: [
      'Custom Next.js/React websites',
      'Mobile-responsive design',
      'Basic e-commerce functionality',
      'Contact forms and lead capture',
      'SEO optimization included',
      '1-year hosting included',
    ],
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics & Visualization',
    description: 'Turn your business data into actionable insights with custom dashboards and reporting.',
    price: '$999',
    featured: false,
    href: '/services/data-analytics',
    features: [
      'Custom analytics dashboards',
      'Sales performance tracking',
      'Customer behavior analysis',
      'Revenue reporting',
      'KPI visualization',
      'Automated reporting systems',
    ],
  },
]

// Server Component - Fetch data from database
export default async function ServicesPage() {
  // Fetch services from database
  const dbServices = await getServices()
  
  // Use database services if available, otherwise use fallback
  const services = dbServices.length > 0 ? dbServices : fallbackServices
  return (
    <main className='py-12'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <AnimatedText
            as='h1'
            text='Services for Small Businesses'
            className='text-4xl font-bold tracking-tight text-white sm:text-6xl'
            delay={0}
          />
          <AnimatedText
            as='p'
            text='Leveraging 10 years of revenue operations experience to help small
            businesses automate, grow, and succeed with modern technology.'
            className='mt-6 text-lg leading-8 text-gray-300'
            delay={0.2}
          />
          <AnimatedText
            as='p'
            text='Serving Dallas-Fort Worth and remotely nationwide'
            className='mt-4 text-sm text-blue-400'
            delay={0.4}
          />
        </div>

        <div className='mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24'>
          <div className='grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2'>
            {services.map((service, index) => {
              const Icon = iconMap[service.id as keyof typeof iconMap] || Code
              return (
                <AnimatedCard
                  key={service.id}
                  delay={0.6 + index * 0.1}
                  className='relative rounded-2xl bg-gray-800/50 p-8 backdrop-blur-lg'
                >
                  <div className='flex items-center gap-x-4'>
                    <Icon
                      className='h-10 w-10 text-blue-400'
                      aria-hidden='true'
                    />
                    <h2 className='text-xl font-semibold leading-7 text-white'>
                      {service.title}
                    </h2>
                  </div>

                  <p className='mt-4 text-base leading-7 text-gray-300'>
                    {service.description}
                  </p>

                  <div className='mt-6'>
                    <h3 className='text-sm font-semibold text-white'>
                      What&apos;s Included:
                    </h3>
                    <ul className='mt-3 space-y-2' role='list'>
                      {(service.features || []).map((feature, idx) => (
                        <li key={`${service.id}-feature-${idx}`} className='flex items-start'>
                          <svg
                            className='mt-1 h-5 w-5 flex-shrink-0 text-blue-400'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            aria-hidden='true'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z'
                              clipRule='evenodd'
                            />
                          </svg>
                          <span className='ml-2 text-sm text-gray-300'>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {service.featured && (
                    <div className='mt-6'>
                      <span className='inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10'>
                        Featured Service
                      </span>
                    </div>
                  )}

                  <div className='mt-6 flex items-center justify-between'>
                    <div>
                      <p className='text-2xl font-bold text-white'>
                        {service.price}
                      </p>
                      <p className='text-sm text-gray-400'>
                        Starting price
                      </p>
                    </div>
                    <a
                      href={service.href}
                      className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors'
                    >
                      Learn More
                    </a>
                  </div>
                </AnimatedCard>
              )
            })}
          </div>
        </div>

        <AnimatedCard
          delay={1.2}
          className='mt-16 text-center'
        >
          <h2 className='text-2xl font-bold text-white'>
            Not Sure Which Service You Need?
          </h2>
          <p className='mt-4 text-lg text-gray-300'>
            Let&apos;s have a conversation about your business goals. I&apos;ll
            recommend the best solution for your needs.
          </p>
          <div className='mt-8 flex justify-center gap-4'>
            <a
              href='/contact'
              className='inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors'
            >
              Schedule a Free Consultation
            </a>
            <a
              href='tel:+1234567890'
              className='inline-flex items-center justify-center rounded-md border border-gray-300 bg-transparent px-8 py-3 text-base font-medium text-white hover:bg-gray-800 transition-colors'
            >
              Call Now
            </a>
          </div>
        </AnimatedCard>
      </div>
    </main>
  )
}