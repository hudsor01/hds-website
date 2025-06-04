import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type ServiceCardProps } from '@/types/service-types'

type ServiceCardServerProps = ServiceCardProps

export function ServiceCardServer({
  title,
  description,
  icon: Icon,
  href,
  className,
  featured = false,
  variant: _variant = 'default',
  price,
  features,
}: ServiceCardServerProps) {
  return (
    <Card
      className={cn(
        'relative h-full transition-shadow hover:shadow-lg',
        featured && 'ring-2 ring-primary',
        className,
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
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10'>
            <Icon className='h-6 w-6 text-primary' />
          </div>
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
            {features.map((feature, index) => (
              <li key={index} className='flex items-center justify-center gap-2'>
                <ArrowRight className='h-3 w-3 text-primary' />
                {feature}
              </li>
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
  )
}