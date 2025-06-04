'use client'

import { m } from 'framer-motion'
import { CheckCircle, TrendingUp, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'
import type { FC, SVGProps } from 'react'

// Types
export interface RevOpsFeature {
  icon: FC<SVGProps<SVGSVGElement>>
  title: string
  description: string
}

export interface RevenueOpsSectionProps {
  title?: string
  subtitle?: string
  features?: RevOpsFeature[]
  ctaTitle?: string
  ctaDescription?: string
  ctaPricing?: string
  ctaButtonText?: string
  ctaButtonLink?: string
  className?: string
  bgColor?: string
}

// Default features
const defaultFeatures: RevOpsFeature[] = [
  {
    icon: CheckCircle,
    title: 'Sales Process Automation',
    description:
      'Turn manual sales tasks into automated workflows. What I learned from scaling operations at Thryv.',
  },
  {
    icon: TrendingUp,
    title: 'CRM Implementation',
    description:
      'Set up HubSpot, Pipedrive, or similar tools the right way from day one. No more messy data.',
  },
  {
    icon: DollarSign,
    title: 'Revenue Analytics',
    description:
      'See exactly where your revenue comes from with custom dashboards and reports.',
  },
  {
    icon: Users,
    title: 'Lead Management',
    description:
      'Track leads from first touch to closed deal. Never lose another opportunity.',
  },
]

export function RevenueOpsSection({
  title = 'Revenue Operations from Thryv Experience',
  subtitle = 'I spent 10 years as head of operations at Thryv, managing partner and franchise organizations. Now I bring those enterprise-level strategies to small businesses.',
  features = defaultFeatures,
  ctaTitle = 'Real Experience. Real Results.',
  ctaDescription = 'At Thryv, I managed revenue operations for hundreds of partners and franchises. I\'ve seen what works and what doesn\'t. Let me implement the same winning strategies for your business.',
  ctaPricing = 'Starting at just $1,499 for complete revenue operations setup',
  ctaButtonText = 'Get Started with RevOps',
  ctaButtonLink = '/contact',
  className = '',
  bgColor = 'bg-gray-900',
}: RevenueOpsSectionProps) {
  return (
    <section className={`py-24 ${bgColor} ${className}`}>
      <div className='container mx-auto px-6'>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className='text-center mb-16'
        >
          <h2 className='text-4xl font-bold text-white mb-4'>{title}</h2>
          <p className='text-xl text-gray-300 max-w-3xl mx-auto'>{subtitle}</p>
        </m.div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {features.map((feature, index) => (
            <m.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className='bg-gray-800 p-8 rounded-lg'
            >
              <feature.icon className='h-12 w-12 text-blue-400 mb-4' />
              <h3 className='text-xl font-semibold text-white mb-2'>
                {feature.title}
              </h3>
              <p className='text-gray-300'>{feature.description}</p>
            </m.div>
          ))}
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className='mt-16 bg-blue-600 p-8 rounded-lg text-center'
        >
          <h3 className='text-2xl font-bold text-white mb-4'>{ctaTitle}</h3>
          <p className='text-white mb-6'>{ctaDescription}</p>
          {ctaPricing && (
            <p className='text-white font-semibold mb-8'>{ctaPricing}</p>
          )}
          <Link
            href={ctaButtonLink}
            className='inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors'
          >
            {ctaButtonText}
          </Link>
        </m.div>
      </div>
    </section>
  )
}
