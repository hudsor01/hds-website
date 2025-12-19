import Link from "next/link"
import { X } from "lucide-react"
import { GlassCard } from "./glass-card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  name: string
  price: string
  description: string
  features: string[]
  notIncluded?: string[]
  popular?: boolean
  cta: string
  href: string
  roi?: string
  className?: string
}

export function PricingCard({
  name,
  price,
  description,
  features,
  notIncluded = [],
  popular = false,
  cta,
  href,
  roi,
  className
}: PricingCardProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Popular Badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge variant="default" className="px-4 py-2 text-caption font-bold">
            MOST POPULAR
          </Badge>
        </div>
      )}

      {/* Card Container */}
      <GlassCard
        variant="light"
        padding="lg"
        hover
        className={cn(
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
      </GlassCard>
    </div>
  )
}
