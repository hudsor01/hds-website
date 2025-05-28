'use client'

import { m } from 'framer-motion'

// Types
export interface TechStackStat {
  value: string
  label: string
}

export interface TechStackSectionProps {
  title?: string
  subtitle?: string
  sectionId?: string
  bgColor?: string
  className?: string
  techCategories?: Record<string, string[]>
  statsSectionTitle?: string
  stats?: TechStackStat[]
  showDivider?: boolean
}

// Default tech stack
const defaultTechStack = {
  frontend: [
    'Next.js 15',
    'React 19',
    'TypeScript',
    'Tailwind CSS',
    'Framer Motion',
    'Radix UI',
  ],
  backend: ['NestJS', 'Django', 'Node.js', 'Python', 'GraphQL', 'REST APIs'],
  database: [
    'PostgreSQL',
    'Supabase',
    'Redis',
    'MongoDB',
    'Prisma ORM',
    'TypeORM',
  ],
  infrastructure: [
    'Docker',
    'Kubernetes',
    'AWS/GCP',
    'Nginx',
    "Let's Encrypt",
    'CI/CD',
  ],
  tools: ['Git', 'GitHub Actions', 'Jest', 'Playwright', 'ESLint', 'Prettier'],
}

// Default stats
const defaultStats: TechStackStat[] = [
  { value: '50%', label: 'Faster development time' },
  { value: '99.9%', label: 'Uptime guarantee' },
  { value: '100%', label: 'Type-safe code' },
]

export function TechStackSection({
  title = 'Modern Tech Stack',
  subtitle = 'We use cutting-edge technologies to build performant, scalable, and maintainable applications',
  sectionId = 'tech-stack',
  bgColor = 'bg-gradient-to-b from-slate-50 to-white',
  className = '',
  techCategories = defaultTechStack,
  statsSectionTitle = 'Why Our Tech Stack Matters',
  stats = defaultStats,
  showDivider = true,
}: TechStackSectionProps) {
  return (
    <section id={sectionId} className={`py-20 ${bgColor} ${className}`}>
      <div className='container mx-auto px-6'>
        <div className='text-center mb-16'>
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className='text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700'
          >
            {title}
          </m.h2>
          {showDivider && (
            <div className='w-20 h-1 bg-gradient-to-r from-blue-600 to-sky-600 mx-auto mb-6' />
          )}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className='text-lg text-slate-600 max-w-2xl mx-auto'
          >
            {subtitle}
          </m.p>
        </div>

        <div className='max-w-6xl mx-auto'>
          {Object.entries(techCategories).map(
            ([category, technologies], categoryIndex) => (
              <m.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className='mb-10'
              >
                <h3 className='text-2xl font-semibold text-slate-800 mb-4 capitalize'>
                  {category}
                </h3>
                <div className='flex flex-wrap gap-3'>
                  {technologies.map((tech, techIndex) => (
                    <m.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: categoryIndex * 0.1 + techIndex * 0.05,
                      }}
                      viewport={{ once: true }}
                      className='px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all duration-200'
                    >
                      {tech}
                    </m.span>
                  ))}
                </div>
              </m.div>
            ),
          )}
        </div>

        {stats && stats.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className='mt-16 bg-gradient-to-r from-blue-50 to-sky-50 p-8 rounded-lg border border-blue-200'
          >
            <div className='max-w-4xl mx-auto text-center'>
              <h3 className='text-2xl font-semibold text-slate-800 mb-4'>
                {statsSectionTitle}
              </h3>
              <div
                className={`grid md:grid-cols-${Math.min(stats.length, 3)} gap-8 mt-8`}
              >
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className='text-3xl font-bold text-blue-600 mb-2'>
                      {stat.value}
                    </div>
                    <p className='text-slate-700'>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </m.div>
        )}
      </div>
    </section>
  )
}
