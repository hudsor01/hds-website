import * as React from 'react'
import Link from 'next/link'
import { Code2, ExternalLink, Sparkles } from 'lucide-react'

import { GlassCard } from '@/components/glass-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ProjectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  slug: string
  title: string
  description: string
  category: string
  featured?: boolean
  stats?: Record<string, string>
  tech_stack: string[]
}

const ProjectCard = React.forwardRef<HTMLDivElement, ProjectCardProps>(
  (
    {
      className,
      slug,
      title,
      description,
      category,
      featured = false,
      stats = {},
      tech_stack,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'group relative snap-center shrink-0 w-[85vw] md:w-auto',
        featured && 'md:col-span-2',
        className
      )}
      {...props}
    >
      <Link href={`/showcase/${slug}`}>
        <GlassCard
          variant="default"
          padding="md"
          hover
          className="h-full overflow-hidden p-0"
        >
          <div
            className={cn(
              'relative overflow-hidden bg-muted border-b border-border',
              featured ? 'h-80' : 'h-64'
            )}
          >
            <div className="absolute inset-0 grid-pattern-light" />

            <div className="relative z-sticky card-padding-lg h-full flex flex-col justify-center text-center text-foreground">
              <div className="inline-flex flex-center gap-2 px-3 py-1 text-sm mb-4 mx-auto text-muted-foreground">
                <Code2 className="w-4 h-4" />
                <span>{category}</span>
              </div>

              <h3 className="text-responsive-lg font-black mb-3">{title}</h3>

              {featured && (
                <div className="inline-flex flex-center gap-2 px-3 py-1 text-sm font-medium mx-auto text-accent">
                  <Sparkles className="w-4 h-4" />
                  <span>Featured Project</span>
                </div>
              )}
            </div>

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

          <div className="card-padding-lg">
            <div className="typography mb-comfortable">
              <p className="text-muted-foreground leading-relaxed text-lg">
                {description}
              </p>
            </div>

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

            <div className="flex flex-wrap gap-2">
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
        </GlassCard>
      </Link>
    </div>
  )
)

ProjectCard.displayName = 'ProjectCard'

export { ProjectCard }
