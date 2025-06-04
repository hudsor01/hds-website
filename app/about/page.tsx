import type { Metadata } from 'next'
import { CheckCircle, Users, Target, DollarSign } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About | Hudson Digital Solutions - Revenue Operations Expert',
  description:
    'Solo freelancer with 10 years of revenue operations experience at Thryv, now helping small businesses automate and grow in Dallas-Fort Worth.',
  keywords:
    'revenue operations, Dallas Fort Worth, small business consultant, Thryv experience, sales automation',
  openGraph: {
    title: 'About Hudson Digital Solutions',
    description:
      'Revenue operations expert helping small businesses automate and grow.',
    url: 'https://hudsondigitalsolutions.com/about',
    images: [
      {
        url: 'https://hudsondigitalsolutions.com/about-og.png',
        width: 1200,
        height: 630,
        alt: 'About Hudson Digital Solutions',
      },
    ],
  },
}

const stats = [
  { id: 1, name: 'Years at Thryv', value: '10', icon: CheckCircle },
  { id: 2, name: 'Small Businesses Helped', value: '5+', icon: Users },
  { id: 3, name: 'Revenue Operations', value: 'Expert', icon: Target },
  { id: 4, name: 'Affordable Solutions', value: '100%', icon: DollarSign },
]

const timeline = [
  {
    year: '2013-2023',
    title: 'Revenue Operations at Thryv',
    description:
      'Led operations for partner and franchise organizations, mastered sales automation and revenue optimization.',
  },
  {
    year: '2022',
    title: 'Started Coding Journey',
    description:
      'Began learning React, Next.js, and modern web development to create custom solutions.',
  },
  {
    year: '2023',
    title: 'Founded Hudson Digital',
    description:
      'Combined revenue operations expertise with web development skills to help small businesses grow.',
  },
  {
    year: 'Today',
    title: 'Your Growth Partner',
    description:
      'Helping Dallas-Fort Worth small businesses automate operations and build their digital presence.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen fade-in">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-brand-50 via-white to-purple-50">
        <div className="container logical-padding">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-6 slide-in-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-800 rounded-full text-sm font-medium card-entrance">
                <Target className="w-4 h-4" />
                Revenue Operations Expert
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight hero-title">
                Revenue Operations Expert
                <span className="text-brand-600"> Turned Developer</span>
              </h1>
              <p className="lead-text text-xl max-w-2xl mx-auto">
                After 10 years optimizing revenue operations at Thryv, I now help
                small businesses in Dallas-Fort Worth implement the same powerful
                strategies - at a price they can afford.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="section-padding bg-surface">
        <div className="container">
          <div className="features-grid max-w-4xl mx-auto">
            {stats.map((stat, _index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.id}
                  className="premium-card text-center space-y-4 card-entrance card-lift scroll-reveal"
                >
                  <div className="flex items-center justify-center gap-3">
                    <Icon className="w-6 h-6 text-brand-600" aria-hidden="true" />
                    <dt className="text-sm font-semibold text-foreground">{stat.name}</dt>
                  </div>
                  <dd className="text-4xl font-bold text-brand-600">{stat.value}</dd>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="section-title text-foreground hero-title">My Journey</h2>
              <p className="lead-text">
                From enterprise revenue operations to small business growth partner
              </p>
            </div>
            
            <div className="space-y-8 slide-in-right">
              {timeline.map((event, _index) => (
                <div
                  key={event.year}
                  className="premium-card relative pl-12 border-l-4 border-brand-200 ml-6 card-entrance scroll-reveal"
                >
                  <div className="absolute -left-3 top-6 w-6 h-6 rounded-full bg-brand-600 border-4 border-white shadow-lg" />
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                      {event.year}
                    </span>
                    <h3 className="text-xl font-semibold text-foreground">
                      {event.title}
                    </h3>
                    <p className="text-neutral-600">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="section-padding bg-gradient-to-br from-brand-600 to-purple-700 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8 slide-in-left">
            <h2 className="text-4xl lg:text-5xl font-bold hero-title">
              My Mission
            </h2>
            <p className="text-xl leading-relaxed max-w-3xl mx-auto opacity-90">
              Small businesses deserve the same powerful revenue operations tools
              that enterprise companies use. I&apos;m here to bridge that gap with
              affordable automation, custom websites, and data-driven insights.
            </p>
            <div className="pt-6">
              <Link
                href="/contact"
                className="premium-button bg-white text-brand-600 hover:bg-gray-50 button-press card-entrance text-lg px-8 py-4"
              >
                Let&apos;s Talk About Your Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="section-title text-foreground hero-title">Why Choose Hudson Digital</h2>
            <p className="lead-text max-w-2xl mx-auto">
              Enterprise expertise meets small business affordability
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto features-grid">
            <div className="premium-card text-center space-y-4 card-entrance card-lift scroll-reveal">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Enterprise Experience</h3>
              <p className="text-neutral-600">
                10 years of revenue operations experience at a Fortune 500 company, 
                now available to small businesses at affordable rates.
              </p>
            </div>

            <div className="premium-card text-center space-y-4 card-entrance card-lift scroll-reveal">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Affordable Solutions</h3>
              <p className="text-neutral-600">
                No enterprise pricing here. Get powerful automation and custom websites 
                designed specifically for small business budgets.
              </p>
            </div>

            <div className="premium-card text-center space-y-4 card-entrance card-lift scroll-reveal">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Personal Service</h3>
              <p className="text-neutral-600">
                Work directly with me, not a team of junior developers. You get 
                personalized attention and solutions tailored to your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-surface">
        <div className="container">
          <div className="premium-card text-center space-y-6 max-w-3xl mx-auto card-entrance">
            <h2 className="text-3xl font-bold text-foreground">Ready to Transform Your Business?</h2>
            <p className="text-neutral-600">
              Let&apos;s discuss how revenue operations and automation can help your 
              Dallas-Fort Worth business grow faster and more efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="premium-button bg-brand-600 text-white hover:bg-brand-700 button-press"
              >
                Schedule Free Consultation
              </Link>
              <Link
                href="/services"
                className="premium-button bg-transparent text-brand-600 border-2 border-brand-600 hover:bg-brand-50 button-press"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}