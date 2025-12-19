import Link from "next/link"
import { ExternalLink, Code2, Sparkles } from "lucide-react"
import { GlassCard } from "./glass-card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  id: string
  slug: string
  title: string
  description: string
  category: string
  featured?: boolean
  stats?: Record<string, string>
  tech_stack: string[]
  className?: string
}

export function ProjectCard({
  id: _id,
  slug,
  title,
  description,
  category,
  featured = false,
  stats = {},
  tech_stack,
  className
}: ProjectCardProps) {
  return (
    <div
      className={cn(
        "group relative snap-center shrink-0 w-[85vw] md:w-auto",
        featured && "md:col-span-2",
        className
      )}
    >
      <Link href={`/portfolio/${slug}`}>
        <GlassCard
          variant="default"
          padding="none"
          hover
          className="h-full overflow-hidden"
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
              {/* Category Badge */}
              <Badge
                variant="outline"
                className="inline-flex flex-center gap-tight px-3 py-1 text-sm mb-heading mx-auto"
              >
                <Code2 className="w-4 h-4" />
                {category}
              </Badge>

              {/* Title */}
              <h3 className="text-responsive-lg font-black mb-3">
                {title}
              </h3>

              {/* Featured Badge */}
              {featured && (
                <Badge
                  variant="accent"
                  className="inline-flex flex-center gap-tight px-3 py-1 text-sm font-medium mx-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  Featured Project
                </Badge>
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
                <Badge
                  key={tech}
                  variant="outline"
                  className="px-3 py-1 text-sm hover:border-accent/50 hover:text-accent transition-colors duration-300"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </GlassCard>
      </Link>
    </div>
  )
}
