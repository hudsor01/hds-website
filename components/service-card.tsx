'use client'

import React from 'react'
import Link from 'next/link'
import { m } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedCard } from '@/components/animated/animated-card'
import { transitions, shadows, hover, gradients } from '@/lib/design-system'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import type { ServiceCardProps } from '@/types/service-types'

export function ServiceCard({
  title,
  description,
  icon,
  href,
  className,
  featured = false,
  variant = 'default',
  price,
  gradient = gradients.primary,
  delay = 0,
  onClick,
}: ServiceCardProps) {
  // Simplified icon rendering - handle both JSX elements and component functions
  const renderIcon = (className: string) => {
    if (React.isValidElement(icon)) {
      // If it's already a JSX element, clone it with new className
      return React.cloneElement(icon as React.ReactElement, { className })
    } else if (typeof icon === 'function') {
      // If it's a component function, render it
      const IconComponent = icon as React.FC<React.SVGProps<SVGSVGElement>>
      return <IconComponent className={className} />
    }
    // Fallback for other cases
    return null
  }

  // Animated gradient variant
  if (variant === 'gradient') {
    return (
      <AnimatedCard
        className={cn(
          'card-interactive h-full bg-white p-6 rounded-xl border border-gray-200 transition-all duration-300',
          className,
        )}
        whileHover={{
          y: -8,
          boxShadow: shadows.xl,
          transition: { duration: 0.3 },
        }}
        delay={delay}
        onClick={onClick}
      >
        {/* Icon with gradient background */}
        <m.div
        className='h-16 w-16 rounded-lg mb-4 flex items-center justify-center'
        style={{
        background: gradient,
        }}
        whileHover={{ rotate: 5, scale: 1.05 }}
        transition={transitions.spring}
        >
        {renderIcon('h-8 w-8 text-white')}
        </m.div>

        <h3 className='text-xl font-semibold text-gray-900 mb-2'>{title}</h3>
        <p className='text-gray-600 mb-4'>{description}</p>

        <div className='mt-auto'>
          {price && (
            <m.p
              className='text-2xl font-bold mb-4'
              style={{
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {price}
            </m.p>
          )}
          <Link href={href}>
            <m.button
              className='btn-primary w-full text-center px-4 py-2 rounded-md text-white font-medium relative overflow-hidden'
              style={{
                background: gradient,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <m.span
                className='absolute inset-0 bg-white/20'
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              <span className='relative z-10'>Learn More</span>
            </m.button>
          </Link>
        </div>
      </AnimatedCard>
    )
  }

  // Animated variant
  if (variant === 'animated') {
    return (
      <m.div
        className={cn(
          'bg-white p-6 rounded-xl border border-gray-200 h-full',
          className,
        )}
        whileHover={hover.lift}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        onClick={onClick}
      >
        <div className='space-y-4'>
          <div className='rounded-md w-12 h-12 flex items-center justify-center text-primary bg-primary/10'>
            {renderIcon('h-6 w-6')}
          </div>
          <h3 className='text-xl font-bold text-gray-900'>{title}</h3>
          <p className='text-gray-600'>{description}</p>
          {price && (
            <div className='font-bold text-primary text-lg'>{price}</div>
          )}
          <div className='pt-4'>
            <Link
              href={href}
              className='inline-flex items-center text-primary font-medium hover:underline'
            >
              Learn more
              <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
            </Link>
          </div>
        </div>
      </m.div>
    )
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          'relative p-6 border rounded-lg',
          featured ? 'border-primary/50 bg-primary/5' : 'border-gray-200',
          'hover:shadow-md transition-all duration-300',
          className,
        )}
      >
        <div className='rounded-md w-10 h-10 flex items-center justify-center text-primary bg-primary/10 mb-4'>
{renderIcon('h-5 w-5')}
        </div>
        <h3 className='text-lg font-semibold mb-2'>{title}</h3>
        <p className='text-sm text-gray-600 mb-4'>{description}</p>
        {price && (
          <div className='text-sm font-medium text-gray-900 mb-2'>{price}</div>
        )}
        <Link
          href={href}
          className='text-sm text-primary hover:underline inline-flex items-center'
        >
          Learn more
          <ArrowRight className='ml-1 h-3 w-3' />
        </Link>
      </div>
    )
  }

  // Default variant (shadcn/ui Card based)
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-300 group hover:shadow-lg h-full',
        featured && 'border-primary/50 bg-primary/5',
        className,
      )}
    >
      <CardHeader className={cn('pb-2', featured && 'bg-primary/10')}>
        <div className='mb-2 rounded-md w-12 h-12 flex items-center justify-center text-primary bg-primary/10'>
          {renderIcon('h-6 w-6')}
        </div>
        <CardTitle className='group-hover:text-primary transition-colors'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-4'>
        <CardDescription className='text-base'>{description}</CardDescription>
        {price && <div className='mt-2 font-bold text-primary'>{price}</div>}
      </CardContent>
      <CardFooter>
        <Link href={href} passHref>
          <Button
            variant='ghost'
            className='p-0 h-auto font-medium group-hover:text-primary group-hover:underline'
          >
            Learn more
            <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
