'use client'

import { useState, useEffect } from 'react'
import { X, Download, Gift } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExitIntentPopupProps {
  title?: string
  subtitle?: string
  ctaText?: string
  leadMagnetTitle?: string
  leadMagnetDescription?: string
  onClose?: () => void
  onSubmit?: (_email: string) => void
}

export function ExitIntentPopup({
title = "Wait! Don't Miss Out on These Free Resources",
subtitle = 'Get our exclusive small business automation toolkit before you go',
ctaText = 'Get Free Resources',
leadMagnetTitle = 'Small Business Automation Toolkit',
leadMagnetDescription = '5 essential templates and guides to automate your business operations',
onClose,
onSubmit,
}: ExitIntentPopupProps) {
const [isVisible, setIsVisible] = useState(false)
const [emailAddress, setEmailAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasBeenShown, setHasBeenShown] = useState(false)

  useEffect(() => {
    // Check if popup has already been shown in this session
    const popupShown = sessionStorage.getItem('exitIntentShown')
    if (popupShown) {
      setHasBeenShown(true)
      return
    }

    let isExiting = false

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving through the top of the viewport
      if (e.clientY <= 0 && !isExiting && !hasBeenShown) {
        isExiting = true
        setIsVisible(true)
        setHasBeenShown(true)
        sessionStorage.setItem('exitIntentShown', 'true')
      }
    }

    // Add event listener after a short delay to avoid immediate triggering
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave)
    }, 3000)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [hasBeenShown])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailAddress) return

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSubmit?.(emailAddress)
      
      // Close popup after successful submission
      setTimeout(() => {
        setIsVisible(false)
      }, 2000)
    } catch (error) {
      console.error('Error submitting email:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          {/* Backdrop */}
          <div 
            className='absolute inset-0' 
            onClick={handleClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className='relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden'
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className='absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors'
            >
              <X className='w-5 h-5' />
            </button>

            {/* Header with gradient */}
            <div className='bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 pb-8'>
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
                  <Gift className='w-5 h-5' />
                </div>
                <h2 className='text-xl font-bold'>{title}</h2>
              </div>
              <p className='text-blue-100'>{subtitle}</p>
            </div>

            {/* Content */}
            <div className='p-6 -mt-4'>
              <div className='bg-gray-50 rounded-xl p-4 mb-6'>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Download className='w-4 h-4 text-blue-600' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900 mb-1'>{leadMagnetTitle}</h3>
                    <p className='text-sm text-gray-600'>{leadMagnetDescription}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <input
                    type='email'
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder='Enter your email address'
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    required
                  />
                </div>

                <button
                  type='submit'
                  disabled={isSubmitting || !emailAddress}
                  className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2'
                >
                  {isSubmitting ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Download className='w-4 h-4' />
                      {ctaText}
                    </>
                  )}
                </button>
              </form>

              <p className='text-xs text-gray-500 mt-4 text-center'>
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </motion.div>
          </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to easily add exit intent to any page
export function useExitIntent() {
  const [showPopup, setShowPopup] = useState(false)

  const handleClose = () => {
    setShowPopup(false)
  }

  const handleSubmit = (email: string) => {
    console.log('Email submitted:', email)
    // Handle email submission here
  }

  return {
    showPopup,
    setShowPopup,
    handleClose,
    handleSubmit,
    ExitIntentPopup: () => (
      <ExitIntentPopup
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    ),
  }
}