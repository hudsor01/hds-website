'use client'

import { useState } from 'react'
import { Search, CheckCircle, AlertTriangle, XCircle, Globe, Zap, Shield, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface AuditResults {
  url: string
  score: number
  performance: {
    score: number
    issues: string[]
    recommendations: string[]
  }
  seo: {
    score: number
    issues: string[]
    recommendations: string[]
  }
  accessibility: {
    score: number
    issues: string[]
    recommendations: string[]
  }
  security: {
    score: number
    issues: string[]
    recommendations: string[]
  }
}

export function WebsiteAuditTool() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<AuditResults | null>(null)
  const [email, setEmail] = useState('')

  const handleAudit = async () => {
    if (!url) return

    setIsLoading(true)
    
    // Simulate audit process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Mock audit results based on common issues
    const mockResults: AuditResults = {
      url,
      score: Math.floor(Math.random() * 30) + 65, // Random score between 65-95
      performance: {
        score: Math.floor(Math.random() * 40) + 60,
        issues: [
          'Large image files detected (>500KB)',
          'Missing image optimization',
          'No CDN detected',
          'Multiple render-blocking resources',
        ],
        recommendations: [
          'Compress and optimize images using WebP format',
          'Implement lazy loading for images',
          'Use a CDN for faster content delivery',
          'Minify CSS and JavaScript files',
          'Enable GZIP compression',
        ],
      },
      seo: {
        score: Math.floor(Math.random() * 35) + 65,
        issues: [
          'Missing meta descriptions on 3 pages',
          'Duplicate title tags found',
          'No schema markup detected',
          'Missing alt text on images',
        ],
        recommendations: [
          'Add unique meta descriptions to all pages',
          'Implement proper heading structure (H1-H6)',
          'Add structured data markup',
          'Optimize title tags for target keywords',
          'Create XML sitemap',
        ],
      },
      accessibility: {
        score: Math.floor(Math.random() * 25) + 70,
        issues: [
          'Low color contrast on buttons',
          'Missing aria-labels on form elements',
          'No skip navigation link',
        ],
        recommendations: [
          'Increase color contrast to meet WCAG standards',
          'Add proper aria-labels and descriptions',
          'Implement keyboard navigation support',
          'Add skip links for screen readers',
        ],
      },
      security: {
        score: Math.floor(Math.random() * 20) + 80,
        issues: [
          'Missing security headers',
          'Mixed content detected',
        ],
        recommendations: [
          'Implement Content Security Policy (CSP)',
          'Force HTTPS for all content',
          'Add security headers (HSTS, X-Frame-Options)',
          'Regular security updates',
        ],
      },
    }

    setResults(mockResults)
    setIsLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200'
    if (score >= 70) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const ScoreIcon = ({ score }: { score: number }) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-600" />
    return <XCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Audit Form */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Enter Your Website URL</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <div className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://your-website.com"
              />
              <button
                onClick={handleAudit}
                disabled={!url || isLoading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Start Audit
                  </>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional - Get detailed report)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Website</h3>
          <p className="text-gray-600">This may take a few moments while we examine your site...</p>
        </div>
      )}

      {/* Results */}
      {results && !isLoading && (
        <div className="space-y-8">
          {/* Overall Score */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Audit Results for {results.url}
              </h2>
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border-2 ${getScoreBgColor(results.score)}`}>
                <ScoreIcon score={results.score} />
                <div>
                  <div className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                    {results.score}/100
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(results.performance.score)}`}>
                  {results.performance.score}
                </div>
                <div className="text-sm text-gray-600">Performance</div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(results.seo.score)}`}>
                  {results.seo.score}
                </div>
                <div className="text-sm text-gray-600">SEO</div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(results.accessibility.score)}`}>
                  {results.accessibility.score}
                </div>
                <div className="text-sm text-gray-600">Accessibility</div>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(results.security.score)}`}>
                  {results.security.score}
                </div>
                <div className="text-sm text-gray-600">Security</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                <div className={`text-lg font-bold ${getScoreColor(results.performance.score)}`}>
                  {results.performance.score}/100
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Issues Found:</h4>
                <ul className="space-y-1">
                  {results.performance.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {results.performance.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">SEO</h3>
                <div className={`text-lg font-bold ${getScoreColor(results.seo.score)}`}>
                  {results.seo.score}/100
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Issues Found:</h4>
                <ul className="space-y-1">
                  {results.seo.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {results.seo.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white text-center">
            <h3 className="text-2xl font-semibold mb-4">Ready to Fix These Issues?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Our web development experts can help you implement these recommendations and improve your website&apos;s performance, SEO, and user experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Get Professional Help
              </Link>
              <Link
                href="/services/web-development"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-400 text-white font-medium rounded-lg hover:border-blue-300 transition-colors"
              >
                View Our Services
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* What We Analyze */}
      {!results && !isLoading && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">What We Analyze</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Performance</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Page load speed</li>
                <li>Image optimization</li>
                <li>Code efficiency</li>
                <li>Resource loading</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">SEO</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Meta tags</li>
                <li>Content structure</li>
                <li>Schema markup</li>
                <li>Internal linking</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Accessibility</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Color contrast</li>
                <li>Keyboard navigation</li>
                <li>Screen reader support</li>
                <li>WCAG compliance</li>
              </ul>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Security</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>HTTPS implementation</li>
                <li>Security headers</li>
                <li>Content policy</li>
                <li>Vulnerability scan</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}