import type { Metadata } from 'next'
import Image from 'next/image'
import { MapPin, Phone, Mail, Clock, Calendar, CheckCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Us | Hudson Digital Solutions',
  description:
    'Get in touch with Hudson Digital Solutions for revenue operations and web development services in Dallas-Fort Worth.',
}

// High-quality contact page image
const CONTACT_IMAGE = 'https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2026&q=80'

export default function ContactPage() {
  return (
    <main className="min-h-screen fade-in">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container logical-padding">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 slide-in-left">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-800 rounded-full text-sm font-medium card-entrance">
                  <MessageSquare className="w-4 h-4" />
                  Free Consultation Available
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight hero-title">
                  Let&apos;s Transform Your 
                  <span className="text-brand-600"> Business Together</span>
                </h1>
                <p className="lead-text text-xl">
                  Ready to automate your revenue operations or build a website that converts? 
                  We&apos;d love to discuss how our enterprise experience can help your small business grow.
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="premium-card card-entrance card-lift scroll-reveal">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Quick Response</div>
                      <div className="text-sm text-neutral-600">Within 24 hours</div>
                    </div>
                  </div>
                </div>
                
                <div className="premium-card card-entrance card-lift scroll-reveal">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Free Consultation</div>
                      <div className="text-sm text-neutral-600">No commitment required</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="premium-shadow-lg rounded-2xl overflow-hidden">
                <Image
                  src={CONTACT_IMAGE}
                  alt="Professional business consultation meeting"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-8 slide-in-right">
              <div className="space-y-6">
                <h2 className="section-title text-foreground hero-title">Get in Touch</h2>
                <p className="lead-text">
                  We work with small businesses in Dallas-Fort Worth to implement enterprise-level 
                  revenue operations and build websites that drive growth. Let&apos;s discuss your project.
                </p>
              </div>

              <div className="space-y-6 scroll-reveal">
                <div className="flex items-start gap-4 card-entrance">
                  <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                    <p className="text-neutral-700 mb-1">+1 (234) 567-890</p>
                    <p className="text-sm text-neutral-600">Mon-Fri 9am-6pm CST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 card-entrance">
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-accent-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <Link 
                      href="mailto:hello@hudsondigitalsolutions.com"
                      className="text-neutral-700 hover:text-brand-600 smooth-transition mb-1 block"
                    >
                      hello@hudsondigitalsolutions.com
                    </Link>
                    <p className="text-sm text-neutral-600">Response within 24 hours guaranteed</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 card-entrance">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Location</h3>
                    <p className="text-neutral-700 mb-1">Dallas-Fort Worth, Texas</p>
                    <p className="text-sm text-neutral-600">Serving all DFW businesses</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 card-entrance">
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-6 h-6 text-success-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Schedule a Call</h3>
                    <p className="text-neutral-700 mb-2">Book a free 30-minute consultation</p>
                    <Link 
                      href="#"
                      className="premium-button bg-success-600 text-white hover:bg-success-700 text-sm"
                    >
                      Schedule Now
                    </Link>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="p-6 bg-brand-50 rounded-xl border border-brand-200 card-lift scroll-reveal">
                <h3 className="font-semibold text-brand-900 mb-4">Service Areas</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-brand-700">• Dallas</div>
                  <div className="text-brand-700">• Fort Worth</div>
                  <div className="text-brand-700">• Plano</div>
                  <div className="text-brand-700">• Arlington</div>
                  <div className="text-brand-700">• Irving</div>
                  <div className="text-brand-700">• Garland</div>
                  <div className="text-brand-700">• Frisco</div>
                  <div className="text-brand-700">• McKinney</div>
                </div>
                <p className="text-xs text-brand-600 mt-3">
                  Remote services available nationwide
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="premium-card card-entrance card-lift">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Send us a Message</h3>
                  <p className="text-neutral-600">
                    Fill out the form below and we&apos;ll get back to you within 24 hours.
                  </p>
                </div>

                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus-ring smooth-transition"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus-ring smooth-transition"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus-ring smooth-transition"
                      placeholder="john@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus-ring smooth-transition"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Service Interest
                    </label>
                    <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus-ring smooth-transition">
                      <option value="">Select a service</option>
                      <option value="revenue-ops">Revenue Operations</option>
                      <option value="web-development">Web Development</option>
                      <option value="data-analytics">Data Analytics</option>
                      <option value="consultation">Free Consultation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Project Budget
                    </label>
                    <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus-ring smooth-transition">
                      <option value="">Select budget range</option>
                      <option value="under-1000">Under $1,000</option>
                      <option value="1000-2500">$1,000 - $2,500</option>
                      <option value="2500-5000">$2,500 - $5,000</option>
                      <option value="5000-plus">$5,000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus-ring smooth-transition resize-none"
                      placeholder="Tell us about your project and how we can help..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="premium-button bg-brand-600 text-white hover:bg-brand-700 button-press w-full py-4 text-lg"
                  >
                    Send Message
                  </button>

                  <p className="text-xs text-neutral-500 text-center">
                    By submitting this form, you agree to our privacy policy and terms of service.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding bg-surface fade-in">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="section-title text-foreground hero-title">Frequently Asked Questions</h2>
            <p className="lead-text max-w-2xl mx-auto">
              Quick answers to common questions about our services and process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto features-grid">
            <div className="space-y-6">
              <div className="premium-card card-entrance card-lift scroll-reveal">
                <h3 className="font-semibold text-foreground mb-2">How much does a website cost?</h3>
                <p className="text-neutral-600 text-sm">
                  Our websites start at $799 for a basic 5-page site. Revenue operations 
                  packages start at $1,499. All pricing is transparent with no hidden fees.
                </p>
              </div>

              <div className="premium-card card-entrance card-lift scroll-reveal">
                <h3 className="font-semibold text-foreground mb-2">How long does a project take?</h3>
                <p className="text-neutral-600 text-sm">
                  Most websites are completed in 2-3 weeks. Revenue operations implementation 
                  typically takes 4-6 weeks depending on complexity.
                </p>
              </div>

              <div className="premium-card card-entrance card-lift scroll-reveal">
                <h3 className="font-semibold text-foreground mb-2">Do you offer payment plans?</h3>
                <p className="text-neutral-600 text-sm">
                  Yes! We offer flexible payment options including 50% upfront and 50% on 
                  completion, or monthly payment plans for larger projects.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="premium-card card-entrance card-lift scroll-reveal">
                <h3 className="font-semibold text-foreground mb-2">What&apos;s included in RevOps?</h3>
                <p className="text-neutral-600 text-sm">
                  CRM setup, sales pipeline automation, email sequences, reporting dashboards, 
                  training, and 3 months of support. Everything you need to automate your sales process.
                </p>
              </div>

              <div className="premium-card card-entrance card-lift scroll-reveal">
                <h3 className="font-semibold text-foreground mb-2">Do you provide ongoing support?</h3>
                <p className="text-neutral-600 text-sm">
                  All projects include support during implementation. We also offer ongoing 
                  maintenance plans starting at $99/month for websites and RevOps systems.
                </p>
              </div>

              <div className="premium-card card-entrance card-lift scroll-reveal">
                <h3 className="font-semibold text-foreground mb-2">Can you help with content?</h3>
                <p className="text-neutral-600 text-sm">
                  Absolutely! We can help write website copy, create email sequences, and 
                  develop content strategies that convert visitors into customers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding fade-in">
        <div className="container">
          <div className="text-center space-y-8">
            <h2 className="section-title text-foreground hero-title">Why Dallas-Fort Worth Businesses Choose Us</h2>
            
            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto features-grid">
              <div className="text-center space-y-2 card-entrance scroll-reveal">
                <div className="text-4xl font-bold text-brand-600">10+</div>
                <div className="text-sm font-medium text-foreground">Years Experience</div>
                <div className="text-xs text-neutral-600">Enterprise background</div>
              </div>
              
              <div className="text-center space-y-2 card-entrance scroll-reveal">
                <div className="text-4xl font-bold text-brand-600">100+</div>
                <div className="text-sm font-medium text-foreground">Happy Clients</div>
                <div className="text-xs text-neutral-600">Small businesses helped</div>
              </div>
              
              <div className="text-center space-y-2 card-entrance scroll-reveal">
                <div className="text-4xl font-bold text-brand-600">40%</div>
                <div className="text-sm font-medium text-foreground">Revenue Increase</div>
                <div className="text-xs text-neutral-600">Average client growth</div>
              </div>
              
              <div className="text-center space-y-2 card-entrance scroll-reveal">
                <div className="text-4xl font-bold text-brand-600">24hr</div>
                <div className="text-sm font-medium text-foreground">Response Time</div>
                <div className="text-xs text-neutral-600">Guaranteed communication</div>
              </div>
            </div>

            <div className="pt-8">
              <Link 
                href="/" 
                className="premium-button bg-brand-600 text-white hover:bg-brand-700 button-press card-entrance"
              >
                Learn More About Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}