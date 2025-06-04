'use client';

import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CountUp } from './count-up';

export interface HeroProps {
  title: string
  subtitle: string
  primaryCta?: {
    text: string
    href: string
  }
  secondaryCta?: {
    text: string
    href: string
  }
  imageSrc?: string
  imageAlt?: string
  darkMode?: boolean
  className?: string
  variant?: 'simple' | 'default' | 'animated'
  stats?: Array<{
    number: number
    label: string
    suffix?: string
  }>
}

/**
 * Unified hero section component that handles all variants
 */
export function Hero({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  imageSrc = '/images/placeholder.svg',
  imageAlt = 'Hero image',
  darkMode = true,
  className = '',
  variant = 'default',
  stats,
}: HeroProps) {
  if (variant === 'simple') {
    return (
      <section
        className={`relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} pt-16 pb-32 ${className}`}
      >
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mx-auto max-w-3xl text-center'
          >
            <h1
              className={`text-4xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'} sm:text-6xl`}
            >
              {title}
            </h1>
            <p
              className={`mt-6 text-lg leading-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              {subtitle}
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className={`rounded-md ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } 
                    px-6 py-3 text-base font-semibold shadow-sm transition-colors`}
                >
                  {primaryCta.text}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className={`text-base font-semibold leading-6 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                >
                  {secondaryCta.text} <span aria-hidden='true'>→</span>
                </Link>
              )}
            </div>
          </m.div>
        </div>
      </section>
    );
  }

  if (variant === 'animated') {
    return (
      <section
        className={`relative overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-background'} py-20 md:py-32 ${className}`}
      >
        {/* Animated background */}
        <div className='absolute inset-0 -z-10'>
          <m.div
            className='absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-sky-600/20'
            animate={{
              background: [
                'radial-gradient(circle at 20% 80%, #3b82f620 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, #3b82f620 0%, transparent 50%)',
                'radial-gradient(circle at 40% 40%, #3b82f620 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        <div className='container px-4 md:px-6'>
          <div className='grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]'>
            <div className='flex flex-col justify-center space-y-4'>
              <m.h1
                className={`text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {title}
              </m.h1>
              <m.p
                className={`max-w-[600px] ${darkMode ? 'text-gray-300' : 'text-muted-foreground'} md:text-xl`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {subtitle}
              </m.p>
              <m.div
                className='flex flex-col gap-2 min-[400px]:flex-row'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {primaryCta && (
                  <Button asChild size='lg' className='bg-gradient-to-r from-blue-600 to-sky-600 text-white hover:from-blue-700 hover:to-sky-700'>
                    <Link href={primaryCta.href}>{primaryCta.text}</Link>
                  </Button>
                )}
                {secondaryCta && (
                  <Button asChild variant='outline' size='lg'>
                    <Link href={secondaryCta.href}>{secondaryCta.text}</Link>
                  </Button>
                )}
              </m.div>
              {stats && (
                <m.div
                  className='flex gap-8 pt-8'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  {stats.map((stat, index) => (
                    <div key={index} className='text-center'>
                      <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        <CountUp end={stat.number} suffix={stat.suffix} />
                      </div>
                      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </m.div>
              )}
            </div>
            <div className='flex items-center justify-center'>
              <m.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={600}
                  height={400}
                  className='rounded-lg shadow-xl'
                  priority
                />
              </m.div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant
  return (
    <section
      className={`relative overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-background'} py-20 md:py-32 ${className}`}
    >
      {/* Background pattern/gradient */}
      <div className='absolute inset-0 -z-10 opacity-40'>
        <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]' />
      </div>

      <div className='container px-4 md:px-6'>
        <div className='grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]'>
          <div className='flex flex-col justify-center space-y-4'>
            <div className='space-y-2'>
              <m.h1
                className={`text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl ${darkMode ? 'text-white' : 'text-gray-900'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {title}
              </m.h1>
              <m.p
                className={`max-w-[600px] ${darkMode ? 'text-gray-300' : 'text-muted-foreground'} md:text-xl`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {subtitle}
              </m.p>
            </div>
            <m.div
              className='flex flex-col gap-2 min-[400px]:flex-row'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {primaryCta && (
                <Button asChild size='lg' className='bg-gradient-to-r from-blue-600 to-sky-600 text-white hover:from-blue-700 hover:to-sky-700'>
                  <Link href={primaryCta.href}>{primaryCta.text}</Link>
                </Button>
              )}
              {secondaryCta && (
                <Button asChild variant='outline' size='lg'>
                  <Link href={secondaryCta.href}>{secondaryCta.text}</Link>
                </Button>
              )}
            </m.div>
          </div>
          <div className='flex items-center justify-center'>
            <m.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={600}
                height={400}
                className='rounded-lg shadow-xl'
                priority
              />
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}