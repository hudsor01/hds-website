'use client';

import React from 'react';
import { AnimatedServiceCard } from '@/components/interactive/animated-service-card';

interface Service {
  id: string
  title: string
  description: string
  price: string
  featured: boolean
  href: string
  features: string[]
  icon?: React.ElementType
}

interface ServicesClientProps {
  services: Service[]
}

export function ServicesClient({ services }: ServicesClientProps) {
  return (
    <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
      {services.map((service, index) => (
        <AnimatedServiceCard
          key={service.id}
          title={service.title}
          description={service.description}
          icon={service.icon}
          href={service.href}
          featured={service.featured}
          price={service.price}
          features={service.features}
          index={index}
        />
      ))}
    </div>
  );
}