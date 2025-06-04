'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Motion, fadeInUp } from '@/components/ui/framer-motion-wrapper';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AnimatedServiceCardProps {
  title: string
  description: string
  icon?: React.ElementType
  href: string
  className?: string
  featured?: boolean
  price?: string
  features?: string[]
  index?: number
}

export function AnimatedServiceCard({
  title,
  description,
  icon: Icon,
  href,
  className,
  featured = false,
  price,
  features,
  index = 0,
}: AnimatedServiceCardProps) {
  return (
    <Motion.div
      variants={fadeInUp}
      initial='initial'
      whileInView='animate'
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className={cn('h-full', className)}
    >
      <Card
        className={cn(
          'relative h-full transition-all duration-300 hover:shadow-xl',
          featured && 'ring-2 ring-primary shadow-lg',
        )}
      >
        {featured && (
          <div className='absolute -top-2 left-1/2 -translate-x-1/2'>
            <span className='bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full'>
              Most Popular
            </span>
          </div>
        )}
        
        <CardHeader className='text-center'>
          {Icon && (
            <Motion.div
              className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10'
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className='h-6 w-6 text-primary' />
            </Motion.div>
          )}
          <CardTitle className='text-xl'>{title}</CardTitle>
          {price && (
            <div className='text-2xl font-bold text-primary'>{price}</div>
          )}
        </CardHeader>
        
        <CardContent className='text-center'>
          <CardDescription className='text-base'>
            {description}
          </CardDescription>
          
          {features && features.length > 0 && (
            <ul className='mt-4 space-y-2 text-sm text-muted-foreground'>
              {features.map((feature, featureIndex) => (
                <Motion.li
                  key={featureIndex}
                  className='flex items-center justify-center gap-2'
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index * 0.1) + (featureIndex * 0.05) }}
                  viewport={{ once: true }}
                >
                  <ArrowRight className='h-3 w-3 text-primary' />
                  {feature}
                </Motion.li>
              ))}
            </ul>
          )}
        </CardContent>
        
        <CardFooter className='pt-6'>
          <Button asChild className='w-full' variant={featured ? 'default' : 'outline'}>
            <Link href={href}>
              Learn More
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </Motion.div>
  );
}