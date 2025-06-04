import type { Metadata } from 'next'
import { CheckCircle, Building2 } from 'lucide-react'
import { AnimatedCard } from '@/components/animated/animated-card'
import { AnimatedText } from '@/components/animated/animated-text'

export const metadata: Metadata = {
  title: 'Portfolio | Hudson Digital Solutions - Client Success Stories',
  description:
    'Real projects completed for real businesses. See how we helped Spotio and others optimize their operations.',
  keywords:
    'portfolio, case studies, Spotio, Salesforce deduplication, small business success',
}

const projects = [
  {
    id: 'spotio',
    name: 'Spotio',
    industry: 'Sales Software / SaaS',
    logo: Building2,
    type: 'Salesforce Data Optimization',
    challenge:
      'Spotio, a sales engagement platform acquired by Salesforce, had thousands of duplicate records causing data integrity issues and preventing accurate reporting.',
    solution:
      'I developed a comprehensive deduplication strategy using custom matching rules and merge procedures that preserved critical historical data while consolidating duplicate accounts, contacts, and leads.',
    results: [
      'Reduced duplicate records by 94%',
      'Improved data accuracy for 15,000+ records',
      'Enabled accurate revenue attribution',
      'Created reusable deduplication processes',
    ],
    technologies: ['Salesforce', 'Apex', 'Data Loader', 'DemandTools'],
    testimonial:
      'Richard tackled our complex Salesforce data challenges head-on. His deduplication work was thorough and professional.',
    duration: '3 months',
    value: '$30,000+',
  },
  {
    id: 'aaa-recycling',
    name: 'AAA Recycling',
    industry: 'Environmental Services',
    logo: Building2,
    type: 'Safety Manual Automation',
    challenge:
      'AAA Recycling needed a programmatic way to maintain and update their comprehensive safety manual that could be easily modified without technical expertise.',
    solution:
      'Built a dynamic documentation system that allows non-technical staff to update safety procedures, policies, and training materials through a simple interface.',
    results: [
      'Automated safety manual generation',
      'Reduced update time from days to minutes',
      'Ensured compliance consistency',
      'Enabled version control and tracking',
    ],
    technologies: ['Python', 'Document Generation', 'Version Control'],
    testimonial:
      'The automated safety manual system Richard built saves us countless hours and ensures our compliance documentation is always up to date.',
    duration: '6 weeks',
    value: '$12,000',
  },
  {
    id: 'thryv-operations',
    name: 'Thryv',
    industry: 'Business Software',
    logo: Building2,
    type: 'Revenue Operations Leadership',
    challenge:
      'Thryv needed to optimize revenue operations across hundreds of partners and franchise organizations while maintaining consistency and scalability.',
    solution:
      'Led operations for partner and franchise organizations for 10 years, implementing automated workflows, CRM optimizations, and data analytics that drove measurable revenue growth.',
    results: [
      'Managed operations for 200+ partners',
      'Implemented scalable RevOps processes',
      'Increased partner productivity by 40%',
      'Built automated reporting systems',
    ],
    technologies: ['HubSpot', 'Salesforce', 'Zapier', 'Data Analytics'],
    testimonial:
      '10 years of exceptional leadership in revenue operations, consistently delivering results that exceeded expectations.',
    duration: '10 years',
    value: 'Multi-million dollar impact',
  },
]

// Server Component - Static content rendered on server
export default function PortfolioPage() {
  return (
    <main className="py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <AnimatedText
            as="h1"
            text="Portfolio & Case Studies"
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
            delay={0}
          />
          <AnimatedText
            as="p"
            text="Real projects. Real results. See how I've helped businesses optimize
            their operations and grow their revenue."
            className="mt-6 text-lg leading-8 text-gray-300"
            delay={0.2}
          />
        </div>

        <div className="mx-auto mt-16 space-y-16">
          {projects.map((project, index) => {
            const Logo = project.logo
            return (
              <AnimatedCard
                key={project.id}
                delay={0.4 + index * 0.1}
                className="relative rounded-2xl bg-gray-800/50 p-8 backdrop-blur-lg"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3">
                    <div className="flex items-center gap-4 mb-4">
                      <Logo className="h-12 w-12 text-blue-400" />
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {project.name}
                        </h2>
                        <p className="text-gray-400">{project.industry}</p>
                      </div>
                    </div>
                    <p className="text-blue-400 font-semibold">{project.type}</p>
                    <div className="mt-6 space-y-2 text-sm">
                      <p className="text-gray-400">
                        Duration:{' '}
                        <span className="text-white">{project.duration}</span>
                      </p>
                      <p className="text-gray-400">
                        Value: <span className="text-white">{project.value}</span>
                      </p>
                    </div>
                  </div>

                  <div className="lg:w-2/3 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Challenge
                      </h3>
                      <p className="text-gray-300">{project.challenge}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Solution
                      </h3>
                      <p className="text-gray-300">{project.solution}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Results
                      </h3>
                      <ul className="space-y-2">
                        {project.results.map((result, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-gray-300">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Technologies Used
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map(tech => (
                          <span
                            key={tech}
                            className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {project.testimonial && (
                      <blockquote className="border-l-4 border-blue-400 pl-4 py-2">
                        <p className="text-gray-300 italic">
                          &quot;{project.testimonial}&quot;
                        </p>
                      </blockquote>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            )
          })}
        </div>

        <AnimatedCard
          delay={1.0}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-white">
            Want Results Like These?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Let&apos;s discuss how I can help your business optimize operations and
            grow revenue.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Start Your Project
            </a>
            <a
              href="/services"
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-transparent px-8 py-3 text-base font-medium text-white hover:bg-gray-800 transition-colors"
            >
              View Services
            </a>
          </div>
        </AnimatedCard>
      </div>
    </main>
  )
}