import * as React from "react"
import type { ComponentType, SVGProps } from 'react'
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "../icon"
import { PricingCard, type PricingCardProps } from "@/components/pricing-card"
import { ProjectCard, type ProjectCardProps } from "@/components/project-card"
import { TestimonialCard, type TestimonialCardProps } from "@/components/testimonial-card"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground transition-smooth",
  {
    variants: {
      variant: {
        default: "border-border shadow-xs",
        glass: "glass-card",
        glassLight: "glass-card-light",
        glassSection: "glass-section",
        outline: "border-2 border-border/60 bg-transparent",
      },
      size: {
        sm: "card-padding-sm",
        md: "card-padding",
        lg: "card-padding-lg",
        xl: "p-12 md:p-16",
        none: "",
      },
      hover: {
        true: "card-hover-glow hover-lift",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      hover: false,
    },
  }
)

// Base Card props
interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glassLight" | "glassSection" | "outline"
  size?: "sm" | "md" | "lg" | "xl" | "none"
  hover?: boolean
}

// Service Card props
interface ServiceCardProps extends Omit<BaseCardProps, 'variant'> {
  variant: "service"
  title: string
  description: string
  features: string[]
  icon: ComponentType<SVGProps<SVGSVGElement>>
  surface?: string
  pricing?: string
}

// Pricing Card props
type PricingCardVariantProps = PricingCardProps & { variant: "pricing" }

// Project Card props
type ProjectCardVariantProps = ProjectCardProps & { variant: "project" }

// Testimonial Card props
type TestimonialCardVariantProps = TestimonialCardProps & { variant: "testimonial" }

// Discriminated union of all card types
export type CardProps =
  | BaseCardProps
  | ServiceCardProps
  | PricingCardVariantProps
  | ProjectCardVariantProps
  | TestimonialCardVariantProps

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    const { className, variant, size, hover, ...rest } = props as BaseCardProps

    // Service Card
    if ('variant' in props && props.variant === 'service') {
      const { title, description, features, icon, surface = "surface-overlay", pricing } = props as ServiceCardProps

      return (
        <div
          ref={ref}
          className={cn(cardVariants({ variant: 'glassLight', size: 'lg', hover: true }), "group", className)}
        >
          <div className="space-y-comfortable">
            {/* Icon and Title */}
            <div className="flex items-center space-x-4">
              <div className={cn(
                "p-3 rounded-xl bg-opacity-20 border border-current border-opacity-30",
                "hover-lift transition-smooth will-change-transform",
                surface
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

    // Pricing Card
    if ('variant' in props && props.variant === 'pricing') {
      const { variant: _variant, ...restProps } = props as PricingCardVariantProps
      return (
        <PricingCard
          ref={ref}
          className={className}
          {...restProps}
        />
      )
    }

    // Project Card
    if ('variant' in props && props.variant === 'project') {
      const { variant: _variant, ...restProps } = props as ProjectCardVariantProps
      return (
        <ProjectCard
          ref={ref}
          className={className}
          {...restProps}
        />
      )
    }

    // Testimonial Card
    if ('variant' in props && props.variant === 'testimonial') {
      const { variant: _variant, ...restProps } = props as TestimonialCardVariantProps
      return (
        <TestimonialCard
          ref={ref}
          className={className}
          {...restProps}
        />
      )
    }

    // Default/Base Card (compositional primitive)
    return (
      <div
        ref={ref}
        className={cn(cardVariants({
          variant: variant ?? "default",
          size: size ?? "md",
          hover: hover ?? false
        }), className)}
        {...rest}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
