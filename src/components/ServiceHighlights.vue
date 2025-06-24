<template>
  <section id="services" class="py-24 bg-gray-50 relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-200 to-transparent"></div>
    
    <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative">
      <!-- Section Header -->
      <div 
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
        class="text-center mb-20"
      >
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
          <div class="w-2 h-2 bg-primary-500 rounded-full"></div>
          Our Services
        </div>
        <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          What We <span class="bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Create</span>
        </h2>
        <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          From concept to launch, we deliver cutting-edge digital solutions that drive results and exceed expectations.
        </p>
      </div>
      
      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div 
          v-for="(service, index) in services" 
          :key="service.title"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible-once="{ 
            opacity: 1, 
            y: 0, 
            transition: { 
              duration: 600, 
              delay: index * 200 
            } 
          }"
          class="group relative"
        >
          <!-- Card -->
          <div class="relative h-full p-8 bg-white rounded-2xl border border-gray-200 hover:border-primary-200 transition-all duration-300 hover:shadow-xl hover:shadow-primary-100/50 hover:-translate-y-2">
            <!-- Gradient Overlay on Hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-primary-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <!-- Icon -->
            <div class="relative mb-6">
              <div class="inline-flex p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl group-hover:from-primary-200 group-hover:to-primary-100 transition-all duration-300">
                <component 
                  :is="service.icon" 
                  class="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors duration-300" 
                />
              </div>
            </div>
            
            <!-- Content -->
            <div class="relative">
              <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors duration-300">
                {{ service.title }}
              </h3>
              <p class="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors duration-300">
                {{ service.description }}
              </p>
              
              <!-- Features List -->
              <ul class="space-y-3">
                <li 
                  v-for="feature in service.features" 
                  :key="feature"
                  class="flex items-center text-gray-700 group-hover:text-gray-800 transition-colors duration-300"
                >
                  <div class="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-3">
                    <CheckIcon class="h-3 w-3 text-white" />
                  </div>
                  <span class="text-sm font-medium">{{ feature }}</span>
                </li>
              </ul>
            </div>
            
            <!-- Learn More Link -->
            <div class="relative mt-6 pt-6 border-t border-gray-100">
              <a href="#contact" class="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors duration-200 group/link">
                <span>Learn More</span>
                <ArrowRightIcon class="ml-2 h-4 w-4 group-hover/link:translate-x-1 transition-transform duration-200" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bottom CTA -->
      <div 
        v-motion
        :initial="{ opacity: 0, y: 30 }"
        :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: 600 } }"
        class="text-center mt-16"
      >
        <div class="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 cursor-pointer"
             @click="scrollToContact">
          <span>Ready to start your project?</span>
          <ArrowRightIcon class="h-5 w-5" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  CodeBracketIcon,
  GlobeAltIcon,
  RocketLaunchIcon,
} from '@heroicons/vue/24/outline'

const services = [
  {
    icon: CodeBracketIcon,
    title: 'Web Applications',
    description:
      'Custom web applications built with cutting-edge technologies for optimal performance and scalability.',
    features: [
      'React & Vue.js Development',
      'Progressive Web Apps (PWA)',
      'API Development & Integration',
      'Database Architecture',
    ],
  },
  {
    icon: GlobeAltIcon,
    title: 'Modern Websites',
    description:
      'Stunning, responsive websites that convert visitors into customers with exceptional user experiences.',
    features: [
      'Responsive Design',
      'SEO Optimization',
      'Performance Optimization',
      'Content Management Systems',
    ],
  },
  {
    icon: RocketLaunchIcon,
    title: 'Digital Strategy',
    description:
      'Comprehensive digital transformation services to accelerate your business growth and success.',
    features: [
      'Technical Consulting',
      'Performance Audits',
      'Conversion Optimization',
      'Analytics & Insights',
    ],
  },
]

const scrollToContact = () => {
  const element = document.querySelector('#contact')
  element?.scrollIntoView({ behavior: 'smooth' })
}
</script>