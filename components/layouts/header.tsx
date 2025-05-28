'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { m, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useNavigationStore } from '@/lib/store/navigation-store'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Case Studies', href: '/case-studies' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
]

export function Header() {
  const pathname = usePathname()
  const { isMobileMenuOpen, isScrolled, setMobileMenuOpen, setScrolled } =
    useNavigationStore()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setScrolled])

  return (
    <m.header
      className='fixed inset-x-0 top-0 z-50 smooth-transition'
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        backdropFilter: isScrolled ? 'blur(12px)' : 'blur(0px)',
        backgroundColor: isScrolled
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(255, 255, 255, 0.8)',
        borderBottom: isScrolled ? '1px solid var(--color-border)' : 'none',
      }}
    >
      <nav
        className='mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8 h-20'
        aria-label='Global'
      >
        <div className='flex lg:flex-1'>
          <Link href='/' className='-m-1.5 p-1.5'>
            <m.span
              className='text-xl font-bold brand-text-gradient'
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              Hudson Digital Solutions
            </m.span>
          </Link>
        </div>

        <div className='flex lg:hidden'>
          <m.button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-neutral-600 hover:text-brand-600 smooth-transition'
            onClick={() => setMobileMenuOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className='sr-only'>Open main menu</span>
            <Menu className='h-6 w-6' aria-hidden='true' />
          </m.button>
        </div>

        <div className='hidden lg:flex lg:gap-x-8'>
          {navigation.map(item => (
            <m.div
              key={item.name}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Link
                href={item.href}
                className={`text-sm font-semibold leading-6 smooth-transition relative group ${
                  pathname === item.href
                    ? 'text-brand-600'
                    : 'text-neutral-700 hover:text-brand-600'
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <m.div
                    layoutId='navbar-active'
                    className='absolute -bottom-2 left-0 right-0 h-0.5 bg-brand-600'
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <m.div
                  className='absolute -bottom-2 left-0 right-0 h-0.5 bg-brand-600 opacity-0 group-hover:opacity-100'
                  transition={{ duration: 0.2 }}
                />
              </Link>
            </m.div>
          ))}
        </div>

        <div className='hidden lg:flex lg:flex-1 lg:justify-end'>
          <Link 
            href='/contact' 
            className='premium-button bg-brand-600 text-white hover:bg-brand-700 hover-lift text-sm'
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 z-40 bg-neutral-900/80 backdrop-blur-sm lg:hidden'
              onClick={() => setMobileMenuOpen(false)}
            />
            <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm border-l border-neutral-200 lg:hidden'
            >
              <div className='flex items-center justify-between'>
                <Link
                  href='/'
                  className='-m-1.5 p-1.5'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className='text-lg font-bold brand-text-gradient'>
                    Hudson Digital
                  </span>
                </Link>
                <m.button
                  type='button'
                  className='-m-2.5 rounded-md p-2.5 text-neutral-600 hover:text-brand-600'
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className='sr-only'>Close menu</span>
                  <X className='h-6 w-6' aria-hidden='true' />
                </m.button>
              </div>
              <div className='mt-6 flow-root'>
                <div className='-my-6 divide-y divide-neutral-200'>
                  <div className='space-y-2 py-6'>
                    {navigation.map((item, index) => (
                      <m.div
                        key={item.name}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 smooth-transition ${
                            pathname === item.href
                              ? 'text-brand-600 bg-brand-50'
                              : 'text-neutral-700 hover:bg-neutral-100 hover:text-brand-600'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      </m.div>
                    ))}
                  </div>
                  <div className='py-6'>
                    <Link
                      href='/contact'
                      className='premium-button bg-brand-600 text-white hover:bg-brand-700 w-full text-center'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </m.header>
  )
}