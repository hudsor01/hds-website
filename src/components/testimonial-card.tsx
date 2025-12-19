import { Star, MessageCircle } from "lucide-react"
import { GlassCard } from "./glass-card"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

interface TestimonialCardProps {
  id: number | string
  name: string
  company: string
  role: string
  content: string
  rating: number
  service?: string
  highlight?: string
  className?: string
}

function StarRating({ rating }: { rating: number }) {
  return (
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
  )
}

export function TestimonialCard({
  id: _id,
  name,
  company,
  role,
  content,
  rating,
  service,
  highlight,
  className
}: TestimonialCardProps) {
  return (
    <GlassCard
      variant="light"
      padding="lg"
      hover
      className={cn(
        "snap-center shrink-0 w-[90vw] md:w-auto h-full flex flex-col",
        className
      )}
    >
      {/* Rating */}
      <div className="mb-subheading">
        <StarRating rating={rating} />
      </div>

      {/* Highlight Label */}
      {highlight && (
        <div className="mb-card-content">
          <Badge variant="accent" className="px-4 py-2 text-caption font-semibold">
            {highlight}
          </Badge>
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
    </GlassCard>
  )
}
