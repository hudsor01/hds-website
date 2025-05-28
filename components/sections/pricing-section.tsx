'use client'

import { m } from 'framer-motion'
import { Check } from 'lucide-react'
import { Button } from '../ui/button'
import Link from 'next/link'

// Types
export interface PricingPlan {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  buttonText?: string
  buttonLink?: string
  billingPeriod?: string
}

export interface PricingSectionProps {
  title?: string
  subtitle?: string
  highlightedLabel?: string
  plans?: PricingPlan[]
  sectionId?: string
  className?: string
  bgColor?: string
  showDivider?: boolean
  includeNote?: boolean
  noteLine1?: string
  noteLine2?: string
  contactLink?: string
  contactLinkText?: string
}

// Default plans
const defaultPlans: PricingPlan[] = [
  {
    name: 'Starter',
    price: '$499',
    billingPeriod: 'one-time',
    description: 'Perfect for solopreneurs and new businesses',
    features: [
      '5-page professional website',
      'Mobile responsive design',
      'Contact form',
      'Basic SEO setup',
      '1 month of support',
      'Free domain for 1 year',
    ],
    highlighted: false,
    buttonText: 'Get Started',
    buttonLink: '/contact',
  },
  {
    name: 'Professional',
    price: '$999',
    billingPeriod: 'one-time',
    description: 'Ideal for growing small businesses',
    features: [
      '10-page website',
      'Advanced SEO optimization',
      'Newsletter integration',
      'Lead capture forms',
      '3 months of support',
      'Free domain for 1 year',
      'Google Analytics setup',
      'Social media integration',
    ],
    highlighted: true,
    buttonText: 'Get Started',
    buttonLink: '/contact',
  },
  {
    name: 'Custom',
    price: 'Contact Us',
    description: 'Tailored solutions for your specific needs',
    features: [
      'Unlimited pages',
      'Custom functionality',
      'E-commerce capabilities',
      'Advanced integrations',
      'Priority support',
      'Monthly maintenance',
      'Performance optimization',
      'Custom training',
    ],
    highlighted: false,
    buttonText: 'Get Started',
    buttonLink: '/contact',
  },
]

export function PricingSection({
  title = 'Simple, Transparent Pricing',
  subtitle = 'Choose the perfect plan for your business. All plans include hosting for the first year.',
  highlightedLabel = 'Most Popular',
  plans = defaultPlans,
  sectionId = 'pricing',
  className = '',
  bgColor = 'bg-gradient-to-b from-white to-slate-50',
  showDivider = true,
  includeNote = true,
  noteLine1 = 'All plans include free SSL certificate, basic hosting, and mobile-responsive design.',
  noteLine2 = 'Need something different?',
  contactLink = '/contact',
  contactLinkText = 'Contact us',
}: PricingSectionProps) {
  return (
    <section id={sectionId} className={`py-20 ${bgColor} ${className}`}>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className='text-4xl font-bold mb-4 text-slate-900'
          >
            {title}
          </m.h2>
          {showDivider && (
            <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-sky-600 mx-auto mb-6' />
          )}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className='text-lg text-slate-600 max-w-2xl mx-auto'
          >
            {subtitle}
          </m.p>
        </div>

        <div className='grid md:grid-cols-3 gap-8 max-w-6xl mx-auto'>
          {plans.map((plan, index) => (
            <m.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.highlighted
                  ? 'ring-2 ring-blue-600 transform scale-105'
                  : 'hover:shadow-xl transition-shadow'
              }`}
            >
              {plan.highlighted && (
                <div className='bg-blue-600 text-white text-center py-2 text-sm font-medium'>
                  {highlightedLabel}
                </div>
              )}
              <div className='p-8'>
                <h3 className='text-2xl font-bold text-slate-900 mb-2'>
                  {plan.name}
                </h3>
                <p className='text-slate-600 mb-6'>{plan.description}</p>
                <div className='mb-6'>
                  <span className='text-4xl font-bold text-slate-900'>
                    {plan.price}
                  </span>
                  {plan.billingPeriod && (
                    <span className='text-slate-600 ml-2'>
                      {plan.billingPeriod}
                    </span>
                  )}
                </div>
                <ul className='space-y-3 mb-8'>
                  {plan.features.map(feature => (
                    <li key={feature} className='flex items-start'>
                      <Check className='w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5' />
                      <span className='text-slate-700'>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.buttonLink || '/contact'} className='block'>
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                    size='lg'
                  >
                    {plan.buttonText || 'Get Started'}
                  </Button>
                </Link>
              </div>
            </m.div>
          ))}
        </div>

        {includeNote && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className='text-center mt-12'
          >
            <p className='text-slate-600'>{noteLine1}</p>
            <p className='text-slate-600 mt-2'>
              {noteLine2}{' '}
              <Link
                href={contactLink}
                className='text-blue-600 hover:underline'
              >
                {contactLinkText}
              </Link>{' '}
              for a custom quote.
            </p>
          </m.div>
        )}
      </div>
    </section>
  )
}
