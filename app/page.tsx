import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, TrendingUp, Users, Zap, BarChart3, Clock, Award, Star, Play, Shield, Target, DollarSign, Phone, Mail, MapPin, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HomepageServices } from '@/components/sections/homepage-services';
import { HeroHighlight, Highlight } from '@/components/aceternity/hero-highlight';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { StatsGrid, defaultBusinessStats } from '@/components/sections/count-up-modernized';
import { ContactForm } from '@/components/forms/contact-form';

export const metadata: Metadata = {
  title: 'Hudson Digital Solutions | Revenue Operations & Business Automation Experts',
  description: '10 years of enterprise RevOps experience from Thryv. Transform your business with proven automation, CRM systems, and growth strategies for small businesses in Dallas-Fort Worth.',
  keywords: 'revenue operations, business automation, CRM systems, web development, data analytics, Dallas Fort Worth, small business growth, sales automation',
};

export default function HomePage() {
  return (
    <div className="min-h-screen fade-in">
      {/* HERO SECTION - Enhanced with Aceternity Hero Highlight */}
      <HeroHighlight containerClassName="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
        <div className="container logical-padding relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - F-Pattern Content */}
            <div className="space-y-8">
              {/* Authority Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-800 rounded-full text-sm font-medium card-entrance">
                <Award className="w-4 h-4" />
                10 Years Enterprise Experience
              </div>
              
              {/* Problem-Focused Headline with Aceternity Highlight */}
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight hero-title slide-in-left">
                Stop Losing Revenue to{' '}
                <Highlight className="text-black dark:text-white">
                  Manual Processes
                </Highlight>
              </h1>
              
              {/* Value Proposition */}
              <p className="lead-text text-xl text-gray-700 leading-relaxed">
                I bring 10 years of enterprise revenue operations expertise from Thryv directly to small businesses. Get the same powerful automation and CRM systems that Fortune 500 companies use—designed for your budget and scale.
              </p>
              
              {/* Social Proof Stats */}
              <div className="flex items-center gap-8 pt-4 scroll-reveal">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-600">$2M+</div>
                  <div className="text-sm text-gray-600">Revenue Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-600">40%</div>
                  <div className="text-sm text-gray-600">Avg Revenue Increase</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-600">98%</div>
                  <div className="text-sm text-gray-600">Client Retention</div>
                </div>
              </div>
              
              {/* Strategic CTA Buttons - Single Color System */}
              <div className="flex flex-col sm:flex-row gap-4 fade-in">
                <Button asChild className="premium-button bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 text-lg button-press">
                  <Link href="#revenue-assessment">
                    Get Free Revenue Assessment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="premium-button border-2 border-brand-600 text-brand-600 hover:bg-brand-50 px-8 py-4 text-lg button-press">
                  <Link href="#case-studies">
                    View Success Stories
                  </Link>
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-4 pt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  No long-term contracts
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-green-500" />
                  24-hour response guarantee
                </div>
              </div>
            </div>
            
            {/* Right Column - Hero Visual */}
            <div className="relative slide-in-right">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Revenue Operations Dashboard</h3>
                {/* Mock Dashboard */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">+40%</div>
                      <div className="text-sm text-green-700">Revenue Growth</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-brand-600">85%</div>
                      <div className="text-sm text-blue-700">Lead Conversion</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Sales Pipeline</span>
                      <span className="text-sm text-gray-600">$127K active</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 italic">
                    * Real client results from Spotio CRM deduplication project
                  </div>
                </div>
              </div>
              
              {/* Floating Testimonial */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border max-w-xs scale-in">
                <div className="flex items-center gap-3">
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                    alt="Client testimonial"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="text-sm font-medium">&quot;Doubled our lead conversion rate&quot;</div>
                    <div className="text-xs text-gray-600">- Michael R., Business Owner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HeroHighlight>

      {/* CASE STUDIES SECTION - Authority Building */}
      <section id="case-studies" className="section-padding bg-surface">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title text-foreground hero-title mb-4">
              Real Results from Real Businesses
            </h2>
            <p className="lead-text max-w-3xl mx-auto">
              See how enterprise-level revenue operations transformed these small businesses
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 features-grid">
            {/* Case Study 1 - Spotio Deduplication */}
            <Card className="premium-card card-entrance card-lift scroll-reveal">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-brand-100 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Spotio CRM Deduplication</h3>
                  <p className="text-gray-600 mb-4">Enterprise sales team had 50,000+ duplicate leads clogging their Salesforce instance.</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Duplicate Leads Removed</span>
                    <span className="font-bold text-brand-600">32,847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Data Quality Improvement</span>
                    <span className="font-bold text-green-600">+85%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sales Team Efficiency</span>
                    <span className="font-bold text-green-600">+60%</span>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/case-studies/spotio-deduplication">
                    View Full Case Study
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Case Study 2 - Property Management */}
            <Card className="premium-card card-entrance card-lift scroll-reveal">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Property Management Automation</h3>
                  <p className="text-gray-600 mb-4">Local property management company struggling with manual tenant screening and rent collection.</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Manual Work Reduction</span>
                    <span className="font-bold text-green-600">-75%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rent Collection Rate</span>
                    <span className="font-bold text-green-600">+40%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tenant Satisfaction</span>
                    <span className="font-bold text-green-600">+90%</span>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/case-studies/property-management">
                    View Full Case Study
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Case Study 3 - Tattoo Booking */}
            <Card className="premium-card card-entrance card-lift scroll-reveal">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Tattoo Studio Booking System</h3>
                  <p className="text-gray-600 mb-4">Custom booking platform with integrated payment processing and customer management.</p>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Booking Efficiency</span>
                    <span className="font-bold text-purple-600">+200%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">No-Show Rate</span>
                    <span className="font-bold text-green-600">-80%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue Increase</span>
                    <span className="font-bold text-green-600">+45%</span>
                  </div>
                </div>
                
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="https://your-tattoo-demo.com" target="_blank">
                    View Live Demo
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION - Dynamic Services from Database */}
      <HomepageServices />

      {/* STATS SECTION - React 19 Modernized Count Up */}
      <StatsGrid 
        stats={defaultBusinessStats}
        title="Results That Speak Volumes"
        subtitle="Proven track record of transforming businesses across Dallas-Fort Worth"
      />

      {/* TESTIMONIALS SECTION - React 19 Modernized with Aceternity UI */}
      <TestimonialsSection 
        cardStyle="animated"
        title="What Our Clients Say"
        subtitle="Success stories from businesses we've transformed"
        useRealData={false}
      />

      {/* ABOUT/BIO SECTION - Personal Authority */}
      <section className="section-padding bg-surface">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 slide-in-left">
              <div>
                <h2 className="section-title text-foreground hero-title mb-4">
                  Meet Richard Hudson
                  <span className="block text-2xl text-brand-600 font-normal">Your Revenue Operations Expert</span>
                </h2>
                <p className="lead-text text-xl text-gray-700 leading-relaxed">
                  I spent 10 years as head of operations at Thryv, managing partner and franchise organizations across multiple markets. Now I bring those enterprise-level strategies directly to small businesses who need them most.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 features-grid">
                <div className="premium-card card-entrance scroll-reveal">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-brand-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Enterprise Experience</h3>
                  </div>
                  <p className="text-gray-600">Managed revenue operations for hundreds of Thryv partners and franchises across multiple markets.</p>
                </div>
                
                <div className="premium-card card-entrance scroll-reveal">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Proven Results</h3>
                  </div>
                  <p className="text-gray-600">Implemented systems that reduced manual work by 60% and increased conversion rates by 40%.</p>
                </div>
                
                <div className="premium-card card-entrance scroll-reveal">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Small Business Focus</h3>
                  </div>
                  <p className="text-gray-600">Exclusively serving small businesses in Dallas-Fort Worth with personalized attention and local support.</p>
                </div>
                
                <div className="premium-card card-entrance scroll-reveal">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Technical Expertise</h3>
                  </div>
                  <p className="text-gray-600">Expert in Salesforce, HubSpot, modern web technologies, and custom automation solutions.</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">Why I Started Hudson Digital Solutions</h4>
                <p className="text-blue-800">
                  After seeing how powerful revenue operations could be at enterprise scale, I realized small businesses needed access to the same strategies and systems. That&apos;s why I created Hudson Digital Solutions—to bring Fortune 500-level automation and growth strategies to businesses that previously couldn&apos;t afford them.
                </p>
              </div>
            </div>
            
            <div className="relative">
              {/* Professional headshot placeholder - you can replace with your actual photo */}
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-8 text-white text-center">
                <div className="w-48 h-48 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="w-24 h-24 text-white/80" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Professional Photo</h3>
                <p className="text-white/90">Your professional headshot would go here to build trust and personal connection with potential clients.</p>
              </div>
              
              {/* Credentials */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-600">10</div>
                  <div className="text-sm text-gray-600">Years Enterprise</div>
                  <div className="text-sm text-gray-600">Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVENUE ASSESSMENT CTA SECTION */}
      <section id="revenue-assessment" className="section-padding bg-gradient-to-br from-brand-600 to-purple-700 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center slide-in-left">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 hero-title">
              Get Your Free Revenue Assessment
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover exactly where your business is losing revenue and get a personalized roadmap to fix it. Based on my 10 years of enterprise RevOps experience.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12 features-grid">
              <div className="text-center card-entrance scroll-reveal">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Revenue Leak Analysis</h3>
                <p className="text-blue-100">Identify where you&apos;re losing potential revenue in your current processes.</p>
              </div>
              
              <div className="text-center card-entrance scroll-reveal">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Automation Opportunities</h3>
                <p className="text-blue-100">Discover which manual tasks are costing you time and money.</p>
              </div>
              
              <div className="text-center card-entrance scroll-reveal">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Growth Roadmap</h3>
                <p className="text-blue-100">Get a step-by-step plan to implement revenue-generating systems.</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4">What You&apos;ll Receive:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>60-minute strategic consultation call</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Custom revenue optimization plan</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Competitive analysis report</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>ROI projections for recommended changes</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="premium-button bg-white text-brand-600 hover:bg-gray-100 px-8 py-4 text-lg button-press font-semibold">
                <Link href="/contact">
                  Schedule My Free Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="premium-button border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg button-press">
                <Link href="tel:+1234567890">
                  Call Now: (234) 567-890
                  <Phone className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-blue-200 mt-4">
              No cost, no obligation. Just valuable insights you can implement immediately.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION - Multiple Contact Options */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="section-title text-foreground hero-title mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="lead-text max-w-3xl mx-auto">
              Choose the best way to get started. All consultations include a personalized revenue optimization strategy.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Phone Contact */}
            <Card className="premium-card text-center card-entrance card-lift scroll-reveal">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Phone className="w-8 h-8 text-brand-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Call for Immediate Help</h3>
                <p className="text-gray-600 mb-6">Speak directly with me about your revenue challenges.</p>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="tel:+1234567890">
                    (234) 567-890
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-2">Available Mon-Fri, 9am-6pm CST</p>
              </CardContent>
            </Card>
            
            {/* Email Contact */}
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-green-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Email Your Questions</h3>
                <p className="text-gray-600 mb-6">Get detailed answers and recommendations via email.</p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                  <Link href="mailto:richard@hudsondigitalsolutions.com">
                    Send Email
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-2">24-hour response guarantee</p>
              </CardContent>
            </Card>
            
            {/* Meeting Scheduler */}
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Schedule a Meeting</h3>
                <p className="text-gray-600 mb-6">Book a strategic consultation at your convenience.</p>
                <Button asChild className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  <Link href="/contact">
                    Schedule Now
                  </Link>
                </Button>
                <p className="text-sm text-gray-500 mt-2">30 or 60-minute sessions available</p>
              </CardContent>
            </Card>
          </div>
          
          {/* REACT 19 MODERNIZED CONTACT FORM */}
          <div className="mt-20">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">
                  Send Us a Message
                </h3>
                <p className="text-lg text-gray-600">
                  Get a personalized response within 24 hours. Include details about your business challenges for the most relevant advice.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Free initial consultation included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">Personalized revenue optimization tips</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">No sales pressure, just helpful insights</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-xl">
                <ContactForm 
                  variant="detailed"
                  includeFields={['phone', 'company', 'service']}
                  title="Get Started Today"
                  className="space-y-6"
                />
              </div>
            </div>
          </div>

          {/* Location & Service Area */}
          <div className="text-center mt-16 bg-gray-50 rounded-2xl p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="w-6 h-6 text-brand-600" />
              <h3 className="text-2xl font-semibold text-gray-900">Serving Dallas-Fort Worth</h3>
            </div>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Based in the DFW metroplex, providing local support with enterprise-level expertise. Remote services available nationwide.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="font-semibold text-gray-900">Local Support</div>
                <div className="text-gray-600">In-person meetings available</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">Remote Services</div>
                <div className="text-gray-600">Nationwide availability</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">Response Time</div>
                <div className="text-gray-600">Within 24 hours</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}