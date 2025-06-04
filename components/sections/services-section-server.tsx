import React from 'react'
import { BarChart3, Code, Zap } from 'lucide-react'
import { getServices } from '@/lib/data-fetchers'
import { ServicesClient } from './services-client'

// Icon mapping for services
const iconMap = {
  'revenue-operations': BarChart3,
  'web-development': Code,
  'data-analytics': Zap,
}

export async function ServicesSection() {
  // Fetch data on the server
  const services = await getServices()
  
  // Add icons to services data
  const servicesWithIcons = services.map((service: { id: string }) => ({
    ...service,
    icon: iconMap[service.id as keyof typeof iconMap],
  }))

  return (
    <section className='py-24 bg-background'>
      <div className='container'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl mb-4'>
            Our Services
          </h2>
          <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
            Choose from our range of services designed to accelerate your business growth
            and optimize your revenue operations.
          </p>
        </div>
        
        {/* Pass server data to client component for animations */}
        <ServicesClient services={servicesWithIcons} />
      </div>
    </section>
  )
}