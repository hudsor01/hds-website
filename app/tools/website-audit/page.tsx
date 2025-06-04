import type { Metadata } from 'next'
import { WebsiteAuditTool } from './website-audit-tool'

export const metadata: Metadata = {
  title: 'Free Website Audit Tool | SEO & Performance Analysis | Hudson Digital',
  description: 'Get a comprehensive free website audit with SEO analysis, performance metrics, and actionable recommendations to improve your site.',
  keywords: 'free website audit, SEO audit tool, website performance analysis, site audit, web audit tool',
}

export default function WebsiteAuditPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Free Website Audit Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get a comprehensive analysis of your website&apos;s performance, SEO, and user experience. 
            Receive actionable recommendations to improve your site&apos;s effectiveness.
          </p>
        </div>
        
        <WebsiteAuditTool />
      </div>
    </main>
  )
}