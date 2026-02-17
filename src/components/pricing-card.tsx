import * as React from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

import { GlassCard } from '@/components/glass-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  price: string
  description: string
  features: string[]
  notIncluded?: string[]
  popular?: boolean
  cta: string
  href: string
  roi?: string
}

const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      name,
      price,
      description,
      features,
      notIncluded = [],
      popular = false,
      cta,
      href,
      roi,
      ...props
    },
    ref
  ) => (
    <div ref={ref} className={cn('relative', className)} {...props}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="px-3 py-1 text-xs font-bold text-accent-foreground bg-accent rounded-md shadow-lg">
            MOST POPULAR
          </div>
        </div>
      )}

      <GlassCard
        variant="light"
        padding="lg"
        hover
        className={cn(
          'group h-full flex flex-col',
          popular && 'border-accent/50 shadow-xl'
        )}
      >
        <div className="text-center mb-comfortable">
          <h3 className="text-card-title font-bold text-foreground mb-subheading text-balance group-hover:text-accent transition-colors">
            {name}
          </h3>
          <div className="text-section-title font-black text-accent mb-subheading">
            {price}
          </div>
          <div className="typography">
            <p className="text-muted-foreground leading-relaxed text-pretty">
              {description}
            </p>
          </div>
        </div>

        {roi && (
          <div className="mb-card-content p-button bg-success-text/10 border border-success-text/30 rounded-lg">
            <p className="text-caption font-bold text-success-text text-center">
              {roi}
            </p>
          </div>
        )}

        <div className="space-y-content mb-comfortable flex-grow">
          <div>
            <h4 className="text-caption uppercase tracking-wide text-muted-foreground font-bold mb-subheading">
              What&apos;s Included
            </h4>
            <ul className="space-y-tight">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-content">
                  <div className="w-2 h-2 rounded-full bg-muted mt-2 shrink-0" />
                  <span className="text-caption text-muted-foreground">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {notIncluded.length > 0 && (
            <div>
              <h4 className="text-caption uppercase tracking-wide text-muted-foreground font-bold mb-subheading mt-card-content">
                Not Included
              </h4>
              <ul className="space-y-tight">
                {notIncluded.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-content">
                    <X className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button
          asChild
          variant={popular ? 'default' : 'secondary'}
          size="lg"
          className="w-full font-bold"
        >
          <Link href={href}>{cta}</Link>
        </Button>
      </GlassCard>
    </div>
  )
)

PricingCard.displayName = 'PricingCard'

export { PricingCard }
