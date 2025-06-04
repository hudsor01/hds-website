'use client'

import React, { useState } from 'react'
import { m } from 'framer-motion'
import {
  Download,
  FileText,
  Mail,
  Search,
  BookOpen,
  FileSpreadsheet,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card'
import {
  LeadMagnetForm,
  type LeadMagnetResource,
} from '@/components/forms/lead-magnet-form'
import { Section } from './section'

// Default icon mapping
const iconMap = {
  FileText,
  Mail,
  Search,
  Download,
  BookOpen,
  FileSpreadsheet,
}

export interface LeadMagnetSectionProps {
  title?: string
  subtitle?: string
  resources?: Array<LeadMagnetResource & { icon: keyof typeof iconMap }>
  formTitle?: string
  formDescription?: string
  formButtonText?: string
  formSuccessMessage?: string
  sectionProps?: {
    variant?: 'default' | 'dark' | 'accent' | 'gradient' | 'light'
    containerWidth?: 'default' | 'narrow' | 'wide' | 'full'
    padding?: 'default' | 'small' | 'large' | 'none'
    id?: string
    className?: string
  }
  useTrpc?: boolean
  darkMode?: boolean
}

// Default resources
const defaultResources = [
  {
    id: 'website-checklist',
    icon: 'FileText' as keyof typeof iconMap,
    title: '10-Point Website Checklist',
    description: 'Make sure your website has everything it needs',
    fileName: 'website-checklist.pdf',
  },
  {
    id: 'contact-form-templates',
    icon: 'Mail' as keyof typeof iconMap,
    title: '5 Contact Form Templates',
    description: 'Ready-to-use templates for your website',
    fileName: 'contact-form-templates.pdf',
  },
  {
    id: 'seo-basics-cheatsheet',
    icon: 'Search' as keyof typeof iconMap,
    title: 'SEO Basics Cheat Sheet',
    description: 'Get found on Google with these simple tips',
    fileName: 'seo-basics-cheatsheet.pdf',
  },
]

export function LeadMagnetSection({
  title = 'Free Resources for Small Businesses',
  subtitle = 'Download these free guides to improve your online presence',
  resources = defaultResources,
  formTitle,
  formDescription,
  formButtonText = 'Download Now',
  formSuccessMessage = 'Your download is ready!',
  sectionProps = {
    variant: 'gradient',
    containerWidth: 'wide',
    padding: 'large',
  },
  useTrpc = true,
  darkMode = false,
}: LeadMagnetSectionProps) {
  const [selectedResource, setSelectedResource] = useState(resources[0])

  // Convert to the form resource format by adding the actual icon component
  const selectedFormResource: LeadMagnetResource = {
    id: selectedResource?.id ?? '',
    title: selectedResource?.title ?? '',
    description: selectedResource?.description ?? '',
    fileName: selectedResource?.fileName ?? '',
    thumbnailUrl: selectedResource?.thumbnailUrl,
  }

  return (
    <Section
      variant={sectionProps.variant}
      title={title}
      subtitle={subtitle}
      containerWidth={sectionProps.containerWidth}
      padding={sectionProps.padding}
      id={sectionProps.id}
      className={sectionProps.className}
    >
      <div className='grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto'>
        {resources.map((resource, index) => {
          const IconComponent = iconMap[resource.icon]
          return (
            <m.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 ${
                  selectedResource.id === resource.id
                    ? 'border-blue-500 shadow-lg scale-105'
                    : 'hover:shadow-md hover:scale-102'
                }`}
                onClick={() => setSelectedResource(resource)}
              >
                <CardHeader>
                  <div className='h-10 w-10 bg-blue-100 rounded-lg mb-3 flex items-center justify-center'>
                    <IconComponent className='w-5 h-5 text-blue-600' />
                  </div>
                  <CardTitle className='text-lg'>{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
              </Card>
            </m.div>
          )
        })}
      </div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
        className='max-w-md mx-auto'
      >
        <LeadMagnetForm
          resource={selectedFormResource}
          title={formTitle || `Download: ${selectedResource.title}`}
          description={formDescription || selectedResource.description}
          buttonText={formButtonText}
          successMessage={formSuccessMessage}
          useTrpc={useTrpc}
          darkMode={darkMode}
        />
      </m.div>
    </Section>
  )
}
