import type { Metadata } from 'next'
import { Building2 } from 'lucide-react'
import { AnimatedCard } from '@/components/animated/animated-card'
import { AnimatedText } from '@/components/animated/animated-text'

export const metadata: Metadata = {
  title: 'Case Studies | Hudson Digital Solutions - Real Results',
  description:
    "See how we've helped businesses optimize their operations and grow revenue. Real projects, real results.",
  keywords:
    'case studies, small business success stories, revenue operations results',
}

const caseStudies = [
  {
    id: 'spotio-salesforce',
    company: 'Spotio',
    industry: 'Sales Software',
    challenge:
      'Thousands of duplicate Salesforce records causing reporting issues and preventing accurate revenue attribution.',
    solution:
      'Developed custom deduplication logic and merge procedures that preserved historical data while consolidating duplicates.',
    results: {
      metric1: { value: '94%', label: 'Duplicate Reduction' },
      metric2: { value: '15K+', label: 'Records Cleaned' },
      metric3: { value: '100%', label: 'Data Integrity' },
    },
    quote:
      "Richard's systematic approach to our Salesforce deduplication saved us months of manual work.",
    technologies: ['Salesforce', 'Apex', 'DemandTools'],
  },
  {
    id: 'aaa-recycling',
    company: 'AAA Recycling',
    industry: 'Environmental Services',
    challenge:
      'Manual safety documentation process taking days to update and maintain compliance.',
    solution:
      'Built an automated documentation system that allows non-technical staff to update procedures easily.',
    results: {
      metric1: { value: '95%', label: 'Time Saved' },
      metric2: { value: 'Minutes', label: 'Update Time' },
      metric3: { value: '100%', label: 'Compliance' },
    },
    quote:
      'The automated safety manual system has transformed how we manage compliance documentation.',
    technologies: ['Python', 'Document Automation'],
  },
  {
    id: 'small-business-revops',
    company: 'Local Service Business',
    industry: 'Home Services',
    challenge:
      'No visibility into sales pipeline, manual lead tracking, and inconsistent follow-up.',
    solution:
      'Implemented HubSpot CRM with automated workflows and custom reporting dashboards.',
    results: {
      metric1: { value: '2x', label: 'Lead Conversion' },
      metric2: { value: '60%', label: 'Time Saved' },
      metric3: { value: '40%', label: 'Revenue Growth' },
    },
    quote:
      'Finally we can see our entire sales pipeline and nothing falls through the cracks.',
    technologies: ['HubSpot', 'Zapier', 'Custom Dashboards'],
  },
]

// Server Component - Static content rendered on server
export default function CaseStudiesPage() {
  return (
    <main className="py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <AnimatedText
            as="h1"
            text="Case Studies"
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
            delay={0}
          />
          <AnimatedText
            as="p"
            text="Real businesses. Real challenges. Real results. See how we've helped
            companies optimize their operations and grow revenue."
            className="mt-6 text-lg leading-8 text-gray-300"
            delay={0.2}
          />
        </div>

        <div className="mx-auto mt-16 space-y-20 lg:space-y-24">
          {caseStudies.map((study, index) => (
            <AnimatedCard
              key={study.id}
              delay={0.4 + index * 0.1}
              className="relative"
            >
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <Building2 className="h-10 w-10 text-blue-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {study.company}
                      </h2>
                      <p className="text-gray-400">{study.industry}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">
                        Challenge
                      </h3>
                      <p className="text-gray-300">{study.challenge}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">
                        Solution
                      </h3>
                      <p className="text-gray-300">{study.solution}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-blue-400 mb-2">
                        Technologies Used
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {study.technologies.map(tech => (
                          <span
                            key={tech}
                            className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-6">
                    Results
                  </h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {study.results.metric1.value}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {study.results.metric1.label}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {study.results.metric2.value}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {study.results.metric2.label}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {study.results.metric3.value}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {study.results.metric3.label}
                      </div>
                    </div>
                  </div>

                  <blockquote className="mt-8 border-l-4 border-blue-400 pl-4 py-2">
                    <p className="text-gray-300 italic">&quot;{study.quote}&quot;</p>
                  </blockquote>

                  <div className="mt-8">
                    <a
                      href="/contact"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Get Similar Results
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <AnimatedCard
          delay={1.0}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-white">
            Ready to Be Our Next Success Story?
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Let&apos;s discuss how we can help your business achieve similar results.
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
              View Our Services
            </a>
          </div>
        </AnimatedCard>
      </div>
    </main>
  )
}