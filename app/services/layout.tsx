import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BarChart3, Code, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Services | Hudson Digital Solutions',
  description: 'Revenue operations, web development, and data analytics services to help small businesses grow and automate their sales processes.',
  openGraph: {
    title: 'Services | Hudson Digital Solutions',
    description: 'Revenue operations, web development, and data analytics services for small business growth.',
  },
}

interface ServicesLayoutProps {
  children: React.ReactNode
}

export default function ServicesLayout({ children }: ServicesLayoutProps) {
  const services = [
    {
      name: 'Revenue Operations',
      href: '/services/revenue-operations',
      icon: BarChart3,
      description: 'Optimize your sales process and CRM',
      price: '$1,499',
      popular: true,
    },
    {
      name: 'Web Development',
      href: '/services/web-development',
      icon: Code,
      description: 'Custom websites and web applications',
      price: '$799',
      popular: false,
    },
    {
      name: 'Data Analytics',
      href: '/services/data-analytics',
      icon: Zap,
      description: 'Business intelligence and reporting',
      price: '$599',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Services Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Our Services</h1>
              <p className="text-muted-foreground">
                Choose the service that best fits your business needs
              </p>
            </div>
            
            <Button asChild>
              <Link href="/book-consultation">
                Free Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {/* Services Quick Navigation */}
          <div className="mt-6 flex flex-wrap gap-2">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <Button
                  key={service.href}
                  variant="outline"
                  size="sm"
                  asChild
                  className="relative"
                >
                  <Link href={service.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {service.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {service.price}
                    </span>
                    {service.popular && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-2 -right-2 px-1 py-0 text-xs"
                      >
                        Popular
                      </Badge>
                    )}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-8">
        {children}
      </main>
    </div>
  )
}