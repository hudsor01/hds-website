'use client';

'use client';

import * as React from "react"
import type { ComponentType, SVGProps } from 'react'
import Link from "next/link"
import { X, ExternalLink, Code2, Sparkles, Star, MessageCircle } from "lucide-react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "@/components/utilities/Icon"
import { Button } from "./button"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground transition-smooth",
  {
    variants: {
      variant: {
        default: "border-border shadow-xs",
        glass: "glass-card",
        glassLight: "glass-card-light",
        glassSection: "glass-section",
        outline: "border-2 border-accent/30 bg-transparent",
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
  gradient?: string
  pricing?: string
}

// Pricing Card props
interface PricingCardProps extends Omit<BaseCardProps, 'variant'> {
  variant: "pricing"
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

// Project Card props
interface ProjectCardProps extends Omit<BaseCardProps, 'variant'> {
  variant: "project"
  id: string
  slug: string
  title: string
  description: string
  category: string
  featured?: boolean
  stats?: Record<string, string>
  tech_stack: string[]
}

// Testimonial Card props
interface TestimonialCardProps extends Omit<BaseCardProps, 'variant' | 'id'> {
  variant: "testimonial"
  testimonialId: number | string
  name: string
  company: string
  role: string
  content: string
  rating: number
  service?: string
  highlight?: string
}

// Discriminated union of all card types
export type CardProps = BaseCardProps | ServiceCardProps | PricingCardProps | ProjectCardProps | TestimonialCardProps

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    const { className, variant, size, hover, ...rest } = props as BaseCardProps

    // Service Card
    if ('variant' in props && props.variant === 'service') {
      const { title, description, features, icon, gradient = "bg-muted", pricing } = props as ServiceCardProps

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
                gradient
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
      const { name, price, description, features, notIncluded = [], popular = false, cta, href, roi } = props as PricingCardProps

      return (
        <div ref={ref} className={cn("relative", className)}>
          {/* Popular Label */}
          {popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <div className="px-3 py-1 text-xs font-bold text-accent-foreground bg-accent rounded-md shadow-lg">
                MOST POPULAR
              </div>
            </div>
          )}

          {/* Card Container */}
          <div
            className={cn(
              cardVariants({ variant: 'glassLight', size: 'lg', hover: true }),
              "group h-full flex flex-col",
              popular && "border-accent/50 shadow-xl"
            )}
          >
            {/* Header Section */}
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

            {/* ROI Badge */}
            {roi && (
              <div className="mb-card-content p-button bg-success-text/10 border border-success-text/30 rounded-lg">
                <p className="text-caption font-bold text-success-text text-center">
                  {roi}
                </p>
              </div>
            )}

            {/* Features & Exclusions */}
            <div className="space-y-content mb-comfortable flex-grow">
              {/* Included Features */}
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

              {/* Not Included */}
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

            {/* CTA Button */}
            <Button
              asChild
              variant={popular ? "default" : "secondary"}
              size="lg"
              className="w-full font-bold"
            >
              <Link href={href}>
                {cta}
              </Link>
            </Button>
          </div>
        </div>
      )
    }

    // Project Card
    if ('variant' in props && props.variant === 'project') {
      const { id: _id, slug, title, description, category, featured = false, stats = {}, tech_stack } = props as ProjectCardProps

      return (
        <div
          ref={ref}
          className={cn(
            "group relative snap-center shrink-0 w-[85vw] md:w-auto",
            featured && "md:col-span-2",
            className
          )}
        >
          <Link href={`/portfolio/${slug}`}>
            <div
              className={cn(
                cardVariants({ variant: 'glass', size: 'none', hover: true }),
                "h-full overflow-hidden"
              )}
            >
              {/* Project Header */}
              <div
                className={cn(
                  "relative overflow-hidden bg-muted border-b border-border",
                  featured ? "h-80" : "h-64"
                )}
              >
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 grid-pattern-light" />

                <div className="relative z-sticky card-padding-lg h-full flex flex-col justify-center text-center text-foreground">
                  {/* Category Label */}
                  <div className="inline-flex flex-center gap-2 px-3 py-1 text-sm mb-4 mx-auto text-muted-foreground">
                    <Code2 className="w-4 h-4" />
                    <span>{category}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-responsive-lg font-black mb-3">
                    {title}
                  </h3>

                  {/* Featured Label */}
                  {featured && (
                    <div className="inline-flex flex-center gap-2 px-3 py-1 text-sm font-medium mx-auto text-accent">
                      <Sparkles className="w-4 h-4" />
                      <span>Featured Project</span>
                    </div>
                  )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-center z-fixed">
                  <Button
                    variant="default"
                    size="lg"
                    className="transform hover:scale-105 will-change-transform transform-gpu"
                  >
                    View Project
                    <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* Project Details */}
              <div className="card-padding-lg">
                {/* Description */}
                <div className="typography mb-comfortable">
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {description}
                  </p>
                </div>

                {/* Stats Grid */}
                {Object.keys(stats).length > 0 && (
                  <div className="grid grid-cols-3 gap-comfortable mb-comfortable">
                    {Object.entries(stats).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div className="text-2xl font-bold text-foreground mb-1">
                          {value}
                        </div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-tight">
                  {tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-sm text-muted-foreground border border-border rounded-md hover:border-accent/50 hover:text-accent transition-colors duration-300"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </div>
      )
    }

    // Testimonial Card
    if ('variant' in props && props.variant === 'testimonial') {
      const { testimonialId: _testimonialId, name, company, role, content, rating, service, highlight } = props as TestimonialCardProps

      return (
        <div
          ref={ref}
          className={cn(
            cardVariants({ variant: 'glassLight', size: 'lg', hover: true }),
            "snap-center shrink-0 w-[90vw] md:w-auto h-full flex flex-col",
            className
          )}
        >
          {/* Rating */}
          <div className="mb-subheading">
            <div className="flex gap-tight">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < rating
                      ? "text-accent fill-accent"
                      : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Highlight Label */}
          {highlight && (
            <div className="mb-card-content">
              <div className="px-4 py-2 text-caption font-semibold text-accent-foreground bg-accent border border-accent rounded-md inline-block">
                {highlight}
              </div>
            </div>
          )}

          {/* Quote */}
          <div className="mb-content-block flex-grow">
            <MessageCircle className="w-8 h-8 text-accent/30 mb-3" />
            <p className="text-muted-foreground leading-relaxed">
              &ldquo;{content}&rdquo;
            </p>
          </div>

          {/* Client Info */}
          <div className="border-t border-border pt-6">
            <div className="font-semibold text-foreground">
              {name}
            </div>
            <div className="text-caption text-muted-foreground">
              {role} at {company}
            </div>
            {service && (
              <div className="text-caption text-accent mt-2">
                {service}
              </div>
            )}
          </div>
        </div>
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
