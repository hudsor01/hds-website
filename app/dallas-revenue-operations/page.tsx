import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle, MapPin, Clock, Star, BarChart3, TrendingUp, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dallas Revenue Operations Consultant | Hudson Digital Solutions',
  description: 'Expert revenue operations consultant in Dallas, TX. 10+ years enterprise experience helping Dallas businesses automate sales, optimize CRM, and increase revenue by 40%.',
  keywords: 'Dallas revenue operations, Dallas CRM consultant, Dallas sales automation, revenue operations Dallas Texas, RevOps consultant Dallas',
  openGraph: {
    title: 'Dallas Revenue Operations Expert | Hudson Digital Solutions',
    description: 'Professional RevOps consultant serving Dallas businesses. Enterprise-level automation at small business prices.',
    url: 'https://hudsondigitalsolutions.com/dallas-revenue-operations',
    images: [
      {
        url: 'https://hudsondigitalsolutions.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dallas Revenue Operations Services',
      },
    ],
  },
}

const DALLAS_SKYLINE = 'https://images.unsplash.com/photo-1570089635851-e4537d7b4042?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'

export default function DallasRevenueOperationsPage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative section-padding responsive-hero overflow-hidden">
        <div className="business-gradient-bg absolute inset-0 opacity-50" />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-800 rounded-full text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  Proudly Serving Dallas, Texas
                </div>
                <h1 className="hero-text text-foreground">
                  Dallas Revenue Operations 
                  <span className="brand-text-gradient"> Expert</span>
                </h1>
                <p className="lead-text text-xl leading-relaxed">
                  Transform your Dallas business with enterprise-level revenue operations. 10+ years at Thryv taught me how to automate sales processes, optimize CRM systems, and drive 40% revenue growth for Dallas-area small businesses.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/contact" 
                  className="premium-button bg-brand-600 text-white hover:bg-brand-700 hover-lift"
                >
                  Free Dallas Consultation
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/tools/roi-calculator" 
                  className="premium-button border-brand-300 text-brand-700 hover:border-brand-500 hover:bg-brand-50"
                >
                  Calculate Your ROI
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-neutral-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-600">50+</div>
                  <div className="text-sm text-neutral-600">Dallas Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-600">24hr</div>
                  <div className="text-sm text-neutral-600">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-600">40%</div>
                  <div className="text-sm text-neutral-600">Avg Revenue Increase</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="premium-shadow-lg rounded-2xl overflow-hidden">
                <Image
                  src={DALLAS_SKYLINE}
                  alt="Dallas skyline representing local business expertise"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white premium-shadow rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Local Expert</div>
                    <div className="text-sm text-neutral-600">Dallas-Fort Worth</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Dallas Businesses Choose Us */}
      <section className="section-padding bg-surface">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="section-title text-foreground">Why Dallas Businesses Choose Hudson Digital</h2>
            <p className="lead-text max-w-2xl mx-auto">
              As a Dallas-area revenue operations expert, I understand the unique challenges facing Texas businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="premium-card hover-lift">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Local Dallas Expertise</h3>
                <p className="text-neutral-600">
                  Deep understanding of the Dallas-Fort Worth business landscape, local market conditions, and regulatory requirements.
                </p>
              </div>
            </div>

            <div className="premium-card hover-lift">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Fast Response Time</h3>
                <p className="text-neutral-600">
                  Same-day response for Dallas clients. Local meetings available throughout the DFW metroplex.
                </p>
              </div>
            </div>

            <div className="premium-card hover-lift">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Proven Dallas Results</h3>
                <p className="text-neutral-600">
                  Track record of helping Dallas businesses increase revenue by an average of 40% within 6 months.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dallas Revenue Operations Services */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="section-title text-foreground">Revenue Operations Services for Dallas Businesses</h2>
            <p className="lead-text max-w-2xl mx-auto">
              Comprehensive RevOps solutions tailored for the Dallas market
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">CRM Implementation & Optimization</h3>
                    <p className="text-neutral-600 mb-3">
                      Complete CRM setup with Dallas-specific customizations, lead routing, and automated follow-up sequences.
                    </p>
                    <div className="text-brand-600 font-medium">Starting at $1,499</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-accent-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Sales Process Automation</h3>
                    <p className="text-neutral-600 mb-3">
                      Automated lead qualification, pipeline management, and sales reporting tailored for Dallas business needs.
                    </p>
                    <div className="text-accent-600 font-medium">Starting at $999</div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Revenue Analytics & Reporting</h3>
                    <p className="text-neutral-600 mb-3">
                      Custom dashboards and KPI tracking to monitor your Dallas business performance in real-time.
                    </p>
                    <div className="text-purple-600 font-medium">Starting at $599</div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-brand-50 rounded-xl border border-brand-200">
                <h4 className="font-semibold text-brand-900 mb-2">Dallas Business Success Story</h4>
                <p className="text-brand-700 mb-4">
                  &quot;Hudson Digital transformed our Dallas consulting firm&apos;s sales process. Revenue increased 45% in 4 months, and we&apos;ve eliminated 20 hours of manual work per week.&quot;
                </p>
                <div className="text-sm text-brand-600 font-medium">
                  - Michael Roberts, Roberts Consulting (Dallas, TX)
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="premium-card">
                <h4 className="text-lg font-semibold text-foreground mb-4">Free Dallas Business Assessment</h4>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">15-point revenue operations audit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">Custom automation recommendations</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">ROI projection for your Dallas business</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-600">No-obligation 60-minute consultation</span>
                  </li>
                </ul>
                <Link 
                  href="/contact" 
                  className="premium-button bg-brand-600 text-white hover:bg-brand-700 w-full justify-center"
                >
                  Schedule Free Assessment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Dallas Areas Served */}
      <section className="section-padding bg-surface">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="section-title text-foreground">Dallas Areas We Serve</h2>
            <p className="lead-text max-w-2xl mx-auto">
              Providing revenue operations consulting throughout the Dallas-Fort Worth metroplex
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Downtown Dallas', 'Uptown Dallas', 'Deep Ellum', 'Bishop Arts District',
              'Lakewood', 'Highland Park', 'University Park', 'Oak Cliff',
              'Addison', 'Carrollton', 'Plano', 'Richardson',
              'Garland', 'Mesquite', 'Irving', 'Grand Prairie',
            ].map((area) => (
              <div key={area} className="p-4 bg-white rounded-lg border border-neutral-200 text-center">
                <div className="font-medium text-foreground">{area}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding business-gradient-bg">
        <div className="container">
          <div className="text-center space-y-8">
            <h2 className="section-title text-foreground">Ready to Transform Your Dallas Business?</h2>
            <p className="lead-text max-w-2xl mx-auto text-xl">
              Join 50+ Dallas businesses that have increased revenue by 40% with our revenue operations expertise.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="premium-button bg-brand-600 text-white hover:bg-brand-700 hover-lift text-lg px-8 py-4"
              >
                Schedule Free Dallas Consultation
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="tel:+12345678900" 
                className="premium-button border-brand-300 text-brand-700 hover:border-brand-500 hover:bg-brand-50 text-lg px-8 py-4"
              >
                Call (234) 567-8900
              </Link>
            </div>

            <div className="text-center pt-4">
              <div className="text-sm text-brand-600 font-medium">Serving Dallas-Fort Worth Since 2020</div>
              <div className="text-neutral-700">Same-day response • Local meetings available</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}