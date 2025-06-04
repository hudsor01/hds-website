import React from 'react'
import { m } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp,
  Code,
  BarChart3,
  DollarSign,
} from 'lucide-react'
import { ServiceCard } from '@/components/service-card'
import { AnimatedSection } from '@/components/sections/section'
import { gradients } from '@/lib/design-system'
import type {
  ServicesSectionProps,
  ServiceItem,
} from '@/types/service-types'

// Animation variants for container and items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}



export function ServicesSection({
  variant = 'default',
  title = 'Services Built for Small Business',
  subtitle = 'Enterprise-level expertise without enterprise prices. I help small businesses automate, grow, and succeed.',
  services,
  className = '',
  showContactCta = true,
  ctaText = "Not sure which service you need? Let's talk about your business goals.",
  ctaLink = '/contact',
  ctaButtonText = 'Get a Free Consultation',
  bgColor = 'bg-gray-50',
}: ServicesSectionProps) {
  // Default services if none provided
  const defaultServices: ServiceItem[] = [
    {
      icon: <TrendingUp className='h-6 w-6' />,
      title: 'Revenue Operations',
      description:
        '10 years at Thryv taught me how to optimize sales. Set up CRM, automate workflows, track leads.',
      price: 'From $1,499',
      link: '/services/revenue-operations',
      gradient: gradients.primary,
    },
    {
      icon: <Code className='h-6 w-6' />,
      title: 'Web Development',
      description:
        'Fast, modern websites built with Next.js. No templates. 1-2 week delivery. Includes 1 year hosting.',
      price: 'From $799',
      link: '/services/web-development',
      gradient: gradients.secondary,
    },
    {
      icon: <BarChart3 className='h-6 w-6' />,
      title: 'Data Analytics',
      description:
        'Custom dashboards and reports that show exactly where your revenue comes from.',
      price: 'From $999',
      link: '/services/data-analytics',
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
    },
    {
      icon: <DollarSign className='h-6 w-6' />,
      title: 'Business Strategy',
      description:
        'We help define your business direction with actionable strategies for growth and market differentiation.',
      price: '$99/month',
      link: '/services/business-strategy',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      featured: true,
    },
  ]

  const servicesToDisplay = services || defaultServices

  // Simple variant (no animations, clean layout)
  if (variant === 'simple') {
    return (
      <section
        className={`w-full py-12 md:py-24 lg:py-32 ${bgColor} ${className}`}
      >
        <div className='container px-4 md:px-6'>
          <div className='flex flex-col items-center justify-center space-y-4 text-center mb-12'>
            <div className='space-y-2'>
              <div className='inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary'>
                Our Services
              </div>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
                {title}
              </h2>
              <p className='max-w-[900px] text-muted-foreground md:text-xl/relaxed'>
                {subtitle}
              </p>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
            {servicesToDisplay.map(service => (
              <ServiceCard
                key={service.title}
                variant='default'
                title={service.title}
                description={service.description}
                icon={service.icon}
                href={service.link}
                featured={service.featured}
                price={service.price}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Minimal variant (compact, less spacing)
  if (variant === 'minimal') {
    return (
      <section className={`py-8 md:py-12 ${bgColor} ${className}`}>
        <div className='container px-4'>
          <h2 className='text-2xl font-bold mb-6 text-center'>{title}</h2>
          <p className='text-center text-gray-600 mb-8 max-w-3xl mx-auto'>
            {subtitle}
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {servicesToDisplay.map(service => (
              <ServiceCard
                key={service.title}
                variant='minimal'
                title={service.title}
                description={service.description}
                icon={service.icon}
                href={service.link}
                featured={service.featured}
                price={service.price}
              />
            ))}
          </div>

          {showContactCta && (
            <div className='mt-8 text-center'>
              <Link
                href={ctaLink}
                className='inline-block px-5 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-colors'
              >
                {ctaButtonText}
              </Link>
            </div>
          )}
        </div>
      </section>
    )
  }

  // Gradient variant (animated cards with gradients)
  if (variant === 'gradient') {
    return (
      <AnimatedSection className={`py-20 ${bgColor} ${className}`}>
        <div className='container mx-auto px-6'>
          <m.div
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className='text-center mb-16'
          >
            <m.h2
              variants={itemVariants}
              className='text-4xl font-bold text-gray-900 mb-4'
            >
              {title}
            </m.h2>
            <m.p
              variants={itemVariants}
              className='text-xl text-gray-600 max-w-3xl mx-auto'
            >
              {subtitle}
            </m.p>
          </m.div>

          <m.div
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
          >
            {servicesToDisplay.map((service, index) => (
              <m.div
                key={service.title}
                variants={itemVariants}
                custom={index}
              >
                <ServiceCard
                  variant='gradient'
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  href={service.link}
                  price={service.price}
                  gradient={service.gradient}
                  delay={index * 0.1}
                />
              </m.div>
            ))}
          </m.div>

          {showContactCta && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className='mt-16 text-center'
            >
              <p className='text-gray-600 mb-8'>{ctaText}</p>
              <m.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={ctaLink}
                  className='inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300'
                >
                  {ctaButtonText}
                </Link>
              </m.div>
            </m.div>
          )}
        </div>
      </AnimatedSection>
    )
  }

  // Default variant (animated cards without gradients)
  return (
    <section className={`py-16 md:py-24 ${bgColor} ${className}`}>
      <div className='container mx-auto px-4'>
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-12'
        >
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>{title}</h2>
          <p className='text-gray-600 md:text-lg max-w-3xl mx-auto'>
            {subtitle}
          </p>
        </m.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {servicesToDisplay.map((service, index) => (
            <ServiceCard
              key={service.title}
              variant='animated'
              title={service.title}
              description={service.description}
              icon={service.icon}
              href={service.link}
              featured={service.featured}
              price={service.price}
              delay={index * 0.1}
            />
          ))}
        </div>

        {showContactCta && (
          <div className='mt-16 text-center'>
            <p className='text-gray-600 mb-6'>{ctaText}</p>
            <Link
              href={ctaLink}
              className='inline-block px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors'
            >
              {ctaButtonText}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
