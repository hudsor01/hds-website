import type { ComponentType, SVGProps } from 'react'
import { Icon } from './icon'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  title: string
  description: string
  features: string[]
  icon: ComponentType<SVGProps<SVGSVGElement>>
  gradient?: string
  pricing?: string
  className?: string
}

export function ServiceCard({
  title,
  description,
  features,
  icon,
  gradient = "bg-muted",
  pricing,
  className
}: ServiceCardProps) {
  return (
    <div className={cn("group glass-card-light card-padding-lg card-hover-glow transition-smooth", className)}>
      <div className="space-y-comfortable">
        {/* Icon and Title */}
        <div className="flex items-center space-x-4">
          <div className={cn(
            "p-3 rounded-xl bg-opacity-20 border border-current border-opacity-30",
            "hover-lift transition-smooth will-change-transform",
            gradient.startsWith('bg-gradient-') ? gradient : `bg-gradient-to-br ${gradient}`
          )}>
            <Icon icon={icon} size="lg" className="text-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Features */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-muted">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Pricing */}
        {pricing && (
          <div className="pt-4 border-t border-border">
            <p className="text-lg font-semibold text-accent">{pricing}</p>
          </div>
        )}
      </div>
    </div>
  )
}