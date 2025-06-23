<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
    <!-- Header -->
    <section class="relative py-32 bg-gradient-to-br from-white via-gray-50/50 to-white overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0">
        <div class="absolute top-20 right-20 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-float"></div>
        <div class="absolute bottom-20 left-20 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl animate-float animation-delay-1000"></div>
      </div>
      
      <div class="relative max-w-6xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <!-- Badge -->
        <div class="flex justify-center mb-12 animate-fade-in-up">
          <div class="inline-flex items-center gap-4 p-4 glass-morphism rounded-2xl shadow-xl border border-white/30 hover:scale-105 transition-all duration-300">
            <div class="relative">
              <img src="/HDS-Logo.jpeg" alt="Hudson Digital" class="h-10 w-auto" />
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur-sm"></div>
            </div>
            <div class="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <span class="font-display text-xl font-bold text-gray-900">Our Services</span>
          </div>
        </div>
        
        <!-- Main Heading -->
        <h1 class="font-display text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-none text-balance animate-fade-in-up animation-delay-200">
          Comprehensive <span class="gradient-text">Digital Solutions</span>
        </h1>
        
        <!-- Subtitle -->
        <p class="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto text-balance leading-relaxed animate-fade-in-up animation-delay-400">
          From custom web development to strategic consulting, we deliver cutting-edge solutions that drive growth and success for your business.
        </p>
      </div>
    </section>

    <!-- Services Grid -->
    <!-- Why Choose Us Section -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Why Choose Hudson Digital?</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine technical expertise with business understanding to deliver solutions that drive real results.
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Proven Results</h3>
            <p class="text-gray-600">Track record of delivering projects that exceed expectations and drive business growth.</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Cutting-Edge Tech</h3>
            <p class="text-gray-600">We use the latest technologies and frameworks to build scalable, future-proof solutions.</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Fast Delivery</h3>
            <p class="text-gray-600">Agile development process ensures rapid delivery without compromising on quality.</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-3">Dedicated Support</h3>
            <p class="text-gray-600">Ongoing support and maintenance to ensure your solutions continue performing optimally.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="py-32 bg-gradient-to-b from-gray-50/50 to-white">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <!-- Section Header -->
        <div class="text-center mb-20 animate-fade-in-up">
          <div class="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <div class="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            Featured Services
          </div>
          <h2 class="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-6 text-balance">
            What We <span class="gradient-text">Build</span>
          </h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
            Tailored solutions designed to meet your unique business needs and drive meaningful results.
          </p>
        </div>
        
        <!-- Services Grid -->
        <div class="grid lg:grid-cols-2 gap-12">
          <div 
            v-for="(service, index) in services" 
            :key="service.title"
            class="group relative animate-fade-in-up"
            :class="{ 'animation-delay-200': index === 0, 'animation-delay-400': index === 1, 'animation-delay-600': index === 2, 'animation-delay-800': index === 3 }"
          >
            <!-- Glow Effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <!-- Service Card -->
            <div class="relative bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500">
              <!-- Icon -->
              <div class="relative mb-8">
                <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                  <component :is="service.icon" class="h-10 w-10 text-white" />
                </div>
                <div class="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              </div>
              
              <!-- Content -->
              <h3 class="font-display text-2xl lg:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                {{ service.title }}
              </h3>
              <p class="text-gray-600 mb-8 leading-relaxed text-lg">
                {{ service.description }}
              </p>
              
              <!-- Features -->
              <ul class="space-y-4 mb-10">
                <li v-for="feature in service.features" :key="feature" class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckIcon class="h-4 w-4 text-green-600" />
                  </div>
                  <span class="text-gray-700 font-medium">{{ feature }}</span>
                </li>
              </ul>
              
              <!-- Pricing & CTA -->
              <div class="flex items-center justify-between pt-6 border-t border-gray-100">
                <div>
                  <div class="text-sm text-gray-500 font-medium">Starting at</div>
                  <div class="text-3xl font-bold text-gray-900">{{ service.pricing }}</div>
                </div>
                <router-link 
                  to="/contact"
                  class="group/btn relative bg-gradient-to-r from-primary-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span class="relative flex items-center gap-2">
                    Get Quote
                    <ArrowRightIcon class="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Process Section -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Our Process</h2>
          <p class="text-xl text-gray-600">
            We follow a proven methodology to deliver exceptional results.
          </p>
        </div>
        
        <div class="grid md:grid-cols-4 gap-8">
          <div v-for="(step, index) in process" :key="step.title" class="bg-white text-center p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              {{ index + 1 }}
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ step.title }}</h3>
            <p class="text-gray-600">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { 
  CodeBracketIcon, 
  DevicePhoneMobileIcon, 
  ChartBarIcon,
  GlobeAltIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'

const services = [
  {
    icon: CodeBracketIcon,
    title: 'Custom Web Development',
    description: 'Build powerful, scalable web applications tailored to your business needs with modern technologies.',
    features: [
      'React, Vue.js & Angular Development',
      'Node.js & Python Backend',
      'Database Design & Architecture',
      'API Development & Integration',
      'Performance Optimization'
    ],
    pricing: 'From $5,000'
  },
  {
    icon: GlobeAltIcon,
    title: 'Professional Websites',
    description: 'Create stunning, responsive websites that convert visitors into customers and drive business growth.',
    features: [
      'Responsive Design',
      'SEO Optimization',
      'Content Management System',
      'E-commerce Integration',
      'Analytics & Tracking'
    ],
    pricing: 'From $2,500'
  },
  {
    icon: DevicePhoneMobileIcon,
    title: 'Mobile Applications',
    description: 'Develop native and cross-platform mobile apps that provide exceptional user experiences.',
    features: [
      'iOS & Android Development',
      'React Native & Flutter',
      'App Store Optimization',
      'Push Notifications',
      'Offline Functionality'
    ],
    pricing: 'From $8,000'
  },
  {
    icon: ChartBarIcon,
    title: 'Digital Strategy & Consulting',
    description: 'Strategic guidance to help you make informed decisions about your digital transformation.',
    features: [
      'Technical Architecture Review',
      'Performance Audits',
      'Security Assessment',
      'Technology Recommendations',
      'Project Planning & Management'
    ],
    pricing: 'From $1,500'
  }
]

const process = [
  {
    title: 'Discovery',
    description: 'We learn about your business, goals, and requirements through detailed consultations.'
  },
  {
    title: 'Planning',
    description: 'Create a comprehensive project plan with timelines, milestones, and deliverables.'
  },
  {
    title: 'Development',
    description: 'Build your solution using modern technologies and best practices with regular updates.'
  },
  {
    title: 'Launch',
    description: 'Deploy your project and provide ongoing support to ensure continued success.'
  }
]
</script>