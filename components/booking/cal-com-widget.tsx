'use client'

import { useEffect } from 'react'
import { Clock, Video, MapPin } from 'lucide-react'

interface CalComWidgetProps {
  calLink?: string
  theme?: 'light' | 'dark'
  hideEventTypeDetails?: boolean
  layout?: 'month_view' | 'week_view' | 'column_view'
  className?: string
}

export function CalComWidget({
  calLink = 'hudsondigital/consultation', // Default Cal.com username/event
  theme = 'light',
  hideEventTypeDetails = false,
  layout = 'month_view',
  className = '',
}: CalComWidgetProps) {
  useEffect(() => {
    // Load Cal.com embed script
    const script = document.createElement('script')
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.querySelector('script[src="https://app.cal.com/embed/embed.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  const embedConfig = {
    namespace: 'consultation-booking',
    styles: {
      branding: {
        brandColor: '#2563eb',
      },
    },
    hideEventTypeDetails,
    layout,
    theme,
  }

  return (
    <div className={`cal-com-widget ${className}`}>
      {/* Cal.com Inline Embed */}
      <div
        data-cal-namespace='consultation-booking'
        data-cal-link={calLink}
        data-cal-config={JSON.stringify(embedConfig)}
        style={{ width: '100%', height: '100%', overflow: 'scroll' }}
      />
    </div>
  )
}

// Alternative: Button trigger for Cal.com popup
interface CalComButtonProps {
  calLink?: string
  children: React.ReactNode
  className?: string
  theme?: 'light' | 'dark'
}

export function CalComButton({
  calLink = 'hudsondigital/consultation',
  children,
  className = '',
  theme = 'light',
}: CalComButtonProps) {
  useEffect(() => {
    // Load Cal.com embed script
    const script = document.createElement('script')
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      const existingScript = document.querySelector('script[src="https://app.cal.com/embed/embed.js"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  const handleClick = () => {
    // @ts-ignore - Cal.com global object
    if (typeof window !== 'undefined' && window.Cal) {
      // @ts-ignore
      window.Cal('inline', {
        elementOrSelector: '#cal-booking-modal',
        calLink,
        layout: 'month_view',
        theme,
        styles: {
          branding: {
            brandColor: '#2563eb',
          },
        },
      })
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        data-cal-link={calLink}
        data-cal-namespace='consultation-button'
        className={className}
      >
        {children}
      </button>
      
      {/* Modal container for popup */}
      <div id='cal-booking-modal' />
    </>
  )
}

// Predefined consultation types
export function ConsultationBooking() {
  return (
    <div className='bg-white rounded-xl shadow-lg p-8'>
      <div className='text-center mb-8'>
        <h2 className='text-2xl font-semibold text-gray-900 mb-4'>
          Schedule Your Free Consultation
        </h2>
        <p className='text-gray-600 max-w-2xl mx-auto'>
          Choose a time that works for you to discuss your revenue operations needs. 
          All consultations are completely free with no obligation.
        </p>
      </div>

      {/* Consultation Options */}
      <div className='grid md:grid-cols-3 gap-6 mb-8'>
        <div className='text-center p-4 border border-gray-200 rounded-lg'>
          <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <Video className='w-6 h-6 text-blue-600' />
          </div>
          <h3 className='font-semibold text-gray-900 mb-2'>Video Call</h3>
          <p className='text-sm text-gray-600'>30-60 minutes via Zoom</p>
        </div>

        <div className='text-center p-4 border border-gray-200 rounded-lg'>
          <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <MapPin className='w-6 h-6 text-green-600' />
          </div>
          <h3 className='font-semibold text-gray-900 mb-2'>In-Person</h3>
          <p className='text-sm text-gray-600'>Dallas-Fort Worth area</p>
        </div>

        <div className='text-center p-4 border border-gray-200 rounded-lg'>
          <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
            <Clock className='w-6 h-6 text-purple-600' />
          </div>
          <h3 className='font-semibold text-gray-900 mb-2'>Flexible</h3>
          <p className='text-sm text-gray-600'>Evenings & weekends available</p>
        </div>
      </div>

      {/* Cal.com Widget */}
      <div className='min-h-[600px]'>
        <CalComWidget
          calLink='hudsondigital/consultation'
          theme='light'
          layout='month_view'
          className='w-full h-full'
        />
      </div>

      {/* Contact Alternative */}
      <div className='mt-8 pt-8 border-t border-gray-200 text-center'>
        <p className='text-gray-600 mb-4'>
          Prefer to talk first? Call us directly or send an email.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <a
            href='tel:+12345678900'
            className='inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
          >
            Call (234) 567-8900
          </a>
          <a
            href='mailto:hello@hudsondigitalsolutions.com'
            className='inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
          >
            hello@hudsondigitalsolutions.com
          </a>
        </div>
      </div>
    </div>
  )
}