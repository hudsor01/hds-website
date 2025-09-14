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
  gradient = "from-cyan-400 to-blue-500",
  pricing,
  className
}: ServiceCardProps) {
  return (
    <div className={cn("group glass-card-light p-8 hover:border-cyan-400/50 transition-all duration-300", className)}>
      <div className="space-y-6">
        {/* Icon and Title */}
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient.replace('to-', 'to-').replace('from-', 'from-')} bg-opacity-20 border border-current border-opacity-30 group-hover:scale-110 transition-transform duration-300 will-change-transform`}>
            <Icon icon={icon} size="lg" className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-gray-400 leading-relaxed">
          {description}
        </p>

        {/* Features */}
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Pricing */}
        {pricing && (
          <div className="pt-4 border-t border-gray-700">
            <p className="text-lg font-semibold text-cyan-400">{pricing}</p>
          </div>
        )}
      </div>
    </div>
  )
}