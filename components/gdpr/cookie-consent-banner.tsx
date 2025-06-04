'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Settings, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CookieCategory } from '@/types/enum-types'
import { 
COOKIE_DEFINITIONS,
useCookieConsent,
type CookieConsent,
} from '@/lib/cookies/consent-manager'

/**
 * Cookie consent banner component
 */
export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { consent, updateConsent, acceptAll, rejectAll, isRequired } = useCookieConsent()

  useEffect(() => {
    // Show banner if consent is required
    if (isRequired) {
      setTimeout(() => setShowBanner(true), 1000) // Delay for better UX
    }
  }, [isRequired])

  const handleAcceptAll = () => {
    acceptAll()
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    rejectAll()
    setShowBanner(false)
  }

  const handleSaveSettings = () => {
    setShowSettings(false)
    setShowBanner(false)
  }

  return (
    <>
      <AnimatePresence>
        {showBanner && !showSettings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className='fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6'
          >
            <Card className='max-w-4xl mx-auto shadow-2xl border-2'>
              <CardContent className='p-6'>
                <div className='flex items-start gap-4'>
                  <div className='flex-shrink-0'>
                    <Cookie className='h-8 w-8 text-primary' />
                  </div>
                  <div className='flex-1 space-y-4'>
                    <div>
                      <h3 className='text-lg font-semibold'>Cookie Preferences</h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        We use cookies to enhance your browsing experience, serve personalized content, 
                        and analyze our traffic. By clicking &apos;Accept All&apos;, you consent to our use of cookies.
                      </p>
                    </div>
                    <div className='flex flex-wrap gap-3'>
                      <Button onClick={handleAcceptAll} size='sm'>
                        Accept All
                      </Button>
                      <Button onClick={handleRejectAll} variant='outline' size='sm'>
                        Reject All
                      </Button>
                      <Button 
                        onClick={() => setShowSettings(true)} 
                        variant='ghost' 
                        size='sm'
                        className='gap-2'
                      >
                        <Settings className='h-4 w-4' />
                        Customize
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowBanner(false)}
                    variant='ghost'
                    size='icon'
                    className='flex-shrink-0'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50'
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className='fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full md:max-h-[80vh]'
              onClick={(e) => e.stopPropagation()}
            >
              <Card className='h-full overflow-hidden'>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Shield className='h-5 w-5 text-primary' />
                    <CardTitle>Privacy Preferences</CardTitle>
                  </div>
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant='ghost'
                    size='icon'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </CardHeader>
                <CardContent className='overflow-y-auto max-h-[calc(100%-8rem)]'>
                  <CookieSettings 
                    consent={consent} 
                    updateConsent={updateConsent}
                    onSave={handleSaveSettings}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * Cookie settings component
 */
function CookieSettings({ 
consent, 
updateConsent, 
onSave, 
}: {
consent: CookieConsent
updateConsent: (consent: CookieConsent) => void
onSave: () => void
}) {
const [localConsent, setLocalConsent] = useState(consent)
// Avoid unused variable warning
void consent

  const categories = [
    {
      id: CookieCategory.NECESSARY,
      title: 'Necessary Cookies',
      description: 'These cookies are essential for the website to function properly.',
      required: true,
    },
    {
      id: CookieCategory.FUNCTIONAL,
      title: 'Functional Cookies',
      description: 'These cookies enable personalized features and functionality.',
      required: false,
    },
    {
      id: CookieCategory.ANALYTICS,
      title: 'Analytics Cookies',
      description: 'These cookies help us understand how visitors interact with our website.',
      required: false,
    },
    {
      id: CookieCategory.MARKETING,
      title: 'Marketing Cookies',
      description: 'These cookies are used to deliver personalized advertisements.',
      required: false,
    },
  ]

  const handleToggle = (category: CookieCategory, enabled: boolean) => {
    setLocalConsent({
      ...localConsent,
      [category]: enabled,
    })
  }

  const handleSave = () => {
    updateConsent(localConsent)
    onSave()
  }

  return (
    <div className='space-y-6'>
      <p className='text-sm text-muted-foreground'>
        When you visit our website, we may store or retrieve information on your browser, 
        mostly in the form of cookies. This information might be about you, your preferences, 
        or your device and is mostly used to make the site work as you expect it to.
      </p>

      <Tabs defaultValue='categories' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='categories'>Cookie Categories</TabsTrigger>
          <TabsTrigger value='details'>Cookie Details</TabsTrigger>
        </TabsList>

        <TabsContent value='categories' className='space-y-4 mt-4'>
          {categories.map((category) => (
            <Card key={category.id}>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <h4 className='font-medium'>{category.title}</h4>
                    <p className='text-sm text-muted-foreground mt-1'>
                      {category.description}
                    </p>
                  </div>
                  <Switch
                    checked={localConsent[category.id]}
                    onCheckedChange={(checked) => handleToggle(category.id, checked)}
                    disabled={category.required}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value='details' className='mt-4'>
          <div className='space-y-6'>
            {categories.map((category) => {
              const cookies = COOKIE_DEFINITIONS.filter(
                (cookie) => cookie.category === category.id,
              )
              
              if (cookies.length === 0) return null

              return (
                <div key={category.id}>
                  <h4 className='font-medium mb-3'>{category.title}</h4>
                  <div className='space-y-2'>
                    {cookies.map((cookie) => (
                      <Card key={cookie.name}>
                        <CardContent className='p-3'>
                          <div className='space-y-1'>
                            <div className='flex items-center justify-between'>
                              <span className='font-mono text-sm'>{cookie.name}</span>
                              <span className='text-xs text-muted-foreground'>
                                {cookie.duration}
                              </span>
                            </div>
                            <p className='text-xs text-muted-foreground'>
                              {cookie.description}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              Provider: {cookie.provider}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      <div className='flex gap-3 pt-4'>
        <Button onClick={handleSave} className='flex-1'>
          Save Preferences
        </Button>
        <Button
          onClick={() => {
            setLocalConsent({
              necessary: true,
              functional: true,
              analytics: true,
              marketing: true,
            })
          }}
          variant='outline'
        >
          Accept All
        </Button>
      </div>
    </div>
  )
}

/**
 * Cookie settings link for footer/privacy policy
 */
export function CookieSettingsLink() {
  const [showSettings, setShowSettings] = useState(false)
  const { consent, updateConsent } = useCookieConsent()

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        className='text-sm text-muted-foreground hover:text-foreground transition-colors'
      >
        Cookie Settings
      </button>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50'
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className='fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full md:max-h-[80vh]'
              onClick={(e) => e.stopPropagation()}
            >
              <Card className='h-full overflow-hidden'>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Shield className='h-5 w-5 text-primary' />
                    <CardTitle>Privacy Preferences</CardTitle>
                  </div>
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant='ghost'
                    size='icon'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </CardHeader>
                <CardContent className='overflow-y-auto max-h-[calc(100%-8rem)]'>
                  <CookieSettings 
                    consent={consent} 
                    updateConsent={updateConsent}
                    onSave={() => setShowSettings(false)}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
