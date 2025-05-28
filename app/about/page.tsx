import type { Metadata } from 'next'
import { CheckCircle, Users, Target, DollarSign } from 'lucide-react'
import { LazyAnimatedCard, LazyAnimatedText } from '@/components/lazy/lazy-components'
import React from 'react' // Added import

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

// Define an interface for the expected props of LazyAnimatedText
interface AppLazyAnimatedTextProps {
  as: React.ElementType
  text: string
  className?: string
  delay?: number
}

// Cast LazyAnimatedText to the defined props type
const TypedLazyAnimatedText =
  LazyAnimatedText as React.ComponentType<AppLazyAnimatedTextProps>

// Define an interface for the expected props of LazyAnimatedCard
interface AppLazyAnimatedCardProps {
  children: React.ReactNode
  delay: number
  className?: string
}

// Cast LazyAnimatedCard to the defined props type
const TypedLazyAnimatedCard =
  LazyAnimatedCard as React.ComponentType<AppLazyAnimatedCardProps>

// Server Component - Static content rendered on server
export default function AboutPage() {
  return (
    <main className="py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mx-auto max-w-2xl text-center">
          <TypedLazyAnimatedText
            as="h1"
            text="Revenue Operations Expert Turned Developer"
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
            delay={0}
          />
          <TypedLazyAnimatedText
            as="p"
            text="After 10 years optimizing revenue operations at Thryv, I now help
            small businesses in Dallas-Fort Worth implement the same powerful
            strategies - at a price they can afford."
            className="mt-6 text-lg leading-8 text-gray-300"
            delay={0.2}
          />
        </div>

        {/* Stats Grid */}
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <dl className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <TypedLazyAnimatedCard
                  key={stat.id}
                  delay={index * 0.1}
                  className="flex flex-col items-center"
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-300">
                    <Icon
                      className="h-5 w-5 flex-none text-blue-400"
                      aria-hidden="true"
                    />
                    {stat.name}
                  </dt>
                  <dd className="mt-3 text-4xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </dd>
                </TypedLazyAnimatedCard>
              )
            })}
          </dl>
        </div>

        {/* Timeline */}
        <div className="mx-auto mt-32 max-w-2xl">
          <TypedLazyAnimatedText
            as="h2"
            text="My Journey"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl text-center mb-16"
            delay={0.5}
          />
          <div className="space-y-8">
            {timeline.map((event, index) => (
              <TypedLazyAnimatedCard
                key={event.year}
                delay={0.6 + index * 0.1}
                className="relative pl-8 border-l-2 border-gray-700"
              >
                <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-blue-500" />
                <div>
                  <span className="text-sm font-semibold text-blue-400">
                    {event.year}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-gray-300">{event.description}</p>
                </div>
              </TypedLazyAnimatedCard>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <TypedLazyAnimatedCard
          delay={1.0}
          className="mx-auto mt-32 max-w-3xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            My Mission
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Small businesses deserve the same powerful revenue operations tools
            that enterprise companies use. I&apos;m here to bridge that gap with
            affordable automation, custom websites, and data-driven insights.
          </p>
          <div className="mt-10">
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Let&apos;s Talk About Your Business
            </a>
          </div>
        </TypedLazyAnimatedCard>
      </div>
    </main>
  )
}