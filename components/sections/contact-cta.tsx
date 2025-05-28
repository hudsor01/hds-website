'use client'

import { m } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Types
export interface ContactInfo {
  label: string
  value: string
}

export interface ContactCTAProps {
  title?: string
  subtitle?: string
  primaryButtonText?: string
  primaryButtonLink?: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
  email?: string
  contactInfo?: ContactInfo[]
  sectionId?: string
  className?: string
  bgColor?: string
  showPattern?: boolean
}

export function ContactCTA({
  title = 'Ready to Build Something Amazing?',
  subtitle = "Let's discuss how we can help transform your business with modern, self-hosted solutions that you control.",
  primaryButtonText = 'Schedule a Consultation',
  primaryButtonLink = '/contact',
  secondaryButtonText = 'hello@hudsondigitalsolutions.com',
  secondaryButtonLink = 'mailto:hello@hudsondigitalsolutions.com',
  contactInfo = [
    { label: 'Response Time', value: 'Within 24 hours' },
    { label: 'Availability', value: 'Mon-Fri, 9am-6pm EST' },
    { label: 'Phone', value: '+1 (234) 567-890' },
  ],
  sectionId = 'contact',
  className = '',
  bgColor = 'bg-gradient-to-r from-blue-600 to-sky-600',
  showPattern = true,
}: ContactCTAProps) {
  return (
    <section
      id={sectionId}
      className={`py-20 ${bgColor} text-white relative overflow-hidden ${className}`}
    >
      {/* Background pattern */}
      {showPattern && (
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]' />
        </div>
      )}

      <div className='container mx-auto px-6 relative z-10'>
        <div className='max-w-3xl mx-auto text-center'>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className='text-4xl font-bold mb-6'
          >
            {title}
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className='text-xl mb-8 opacity-90'
          >
            {subtitle}
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className='flex flex-col sm:flex-row gap-4 justify-center'
          >
            {primaryButtonLink && primaryButtonText && (
              <Link
                href={primaryButtonLink}
                className='inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-slate-100 transition-all duration-200 transform hover:scale-105'
              >
                {primaryButtonText}
                <ArrowRight className='ml-2 h-5 w-5' />
              </Link>
            )}

            {secondaryButtonLink && secondaryButtonText && (
              <a
                href={secondaryButtonLink}
                className='inline-flex items-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-all duration-200'
              >
                {secondaryButtonText}
              </a>
            )}
          </m.div>

          {contactInfo && contactInfo.length > 0 && (
            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className='mt-12 flex flex-col sm:flex-row gap-6 justify-center text-white/80'
            >
              {contactInfo.map((info, index) => (
                <div key={index}>
                  <span className='font-semibold'>{info.label}:</span>{' '}
                  {info.value}
                </div>
              ))}
            </m.div>
          )}
        </div>
      </div>
    </section>
  )
}
