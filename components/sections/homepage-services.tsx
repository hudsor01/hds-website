import Link from 'next/link'
import { ArrowRight, CheckCircle, BarChart3, Zap, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getServices } from '@/lib/data-fetchers'

// Icon mapping for services
const iconMap = {
  'revenue-operations': BarChart3,
  'web-development': Zap,
  'data-analytics': Target,
}

// Fallback services for when database is not available
const fallbackServices = [
  {
    id: 'revenue-operations',
    title: 'Revenue Operations',
    description: 'Complete sales process automation with enterprise-grade CRM systems',
    price: 'Starting at $1,499',
    featured: true,
    href: '/services/revenue-operations',
    features: [
      'Salesforce/HubSpot implementation',
      'Automated lead scoring & routing',
      'Custom reporting dashboards',
      'Sales team training & support',
    ],
  },
  {
    id: 'web-development',
    title: 'Web Development',
    description: 'High-performance websites that convert visitors into customers',
    price: 'Starting at $799',
    featured: false,
    href: '/services/web-development',
    features: [
      'Mobile-first responsive design',
      'SEO optimization & performance',
      'Integrated lead capture forms',
      'Analytics & tracking setup',
    ],
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    description: 'Custom dashboards and insights to drive business decisions',
    price: 'Starting at $599',
    featured: false,
    href: '/services/data-analytics',
    features: [
      'Custom analytics setup',
      'Real-time performance dashboards',
      'Monthly reporting & insights',
      'Goal tracking & optimization',
    ],
  },
]

export async function HomepageServices() {
  // Fetch services from database
  const dbServices = await getServices()
  
  // Use database services if available, otherwise use fallback
  const services = dbServices.length > 0 ? dbServices.slice(0, 3) : fallbackServices

  return (
    <section className='py-20 bg-white'>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-bold text-gray-900 mb-4'>
            Enterprise Solutions for Small Business Budgets
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Choose from our specialized service offerings, each designed to solve specific business challenges
          </p>
        </div>
        
        <div className='features-grid gap-8 container'>
          {services.map((service, index) => {
            const Icon = iconMap[service.id as keyof typeof iconMap] || BarChart3
            const gradientColors = [
              'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400',
              'from-green-50 to-green-100 border-green-200 hover:border-green-400',
              'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400',
            ]
            const iconColors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600']
            const buttonColors = [
              'bg-blue-600 hover:bg-blue-700',
              'bg-green-600 hover:bg-green-700', 
              'bg-purple-600 hover:bg-purple-700',
            ]
            
            return (
              <Card 
                key={service.id}
                className={`service-card bg-gradient-to-br ${gradientColors[index]} border-2 transition-all duration-300 hover:shadow-xl scroll-reveal ${service.featured ? 'ring-2 ring-blue-500' : ''}`}
              >
                <CardContent className='p-8'>
                  <div className='text-center mb-6'>
                    <div className={`w-16 h-16 ${iconColors[index]} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className='w-8 h-8 text-white' />
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-2'>{service.title}</h3>
                    <p className='text-gray-700'>{service.description}</p>
                  </div>
                  
                  <div className='space-y-3 mb-6'>
                    {(service.features || []).slice(0, 4).map((feature, idx) => (
                      <div key={idx} className='flex items-center gap-3'>
                        <CheckCircle className='w-5 h-5 text-green-500 flex-shrink-0' />
                        <span className='text-gray-700'>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className='text-center mb-6'>
                    <div className={`text-3xl font-bold ${iconColors[index].replace('bg-', 'text-')} mb-2`}>
                      {service.price}
                    </div>
                    <div className='text-sm text-gray-600'>
                      {service.featured ? 'Most Popular' : 'One-time setup + support'}
                    </div>
                  </div>
                  
                  <Button asChild className={`w-full ${buttonColors[index]} text-white`}>
                    <Link href={service.href}>
                      Learn More About {service.title}
                      <ArrowRight className='w-4 h-4 ml-2' />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}