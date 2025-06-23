<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <section class="bg-white py-24">
      <div class="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <div class="flex justify-center mb-8">
          <div class="inline-flex items-center gap-3 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-200">
            <img src="/HDS-Logo.jpeg" alt="Hudson Digital" class="h-8 w-auto" />
            <span class="text-lg font-semibold text-gray-900">Portfolio</span>
          </div>
        </div>
        <h1 class="text-5xl font-bold text-gray-900 mb-6">Our Portfolio</h1>
        <p class="text-xl text-gray-600">
          Explore some of our recent projects and see how we've helped businesses grow.
        </p>
      </div>
    </section>

    <!-- Portfolio Grid -->
    <section class="py-24">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div 
            v-for="project in projects" 
            :key="project.title"
            class="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            <div class="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <component :is="project.icon" class="h-16 w-16 text-primary-600" />
            </div>
            
            <div class="p-8">
              <div class="flex items-center gap-2 mb-4">
                <span 
                  v-for="tag in project.tags" 
                  :key="tag"
                  class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
              
              <h3 class="text-xl font-bold text-gray-900 mb-3">{{ project.title }}</h3>
              <p class="text-gray-600 mb-4">{{ project.description }}</p>
              
              <div v-if="project.stats" class="mb-6">
                <div class="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-2 rounded-lg">
                  📊 {{ project.stats }}
                </div>
              </div>
              
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">{{ project.timeline }}</span>
                <a 
                  v-if="project.url" 
                  :href="project.url" 
                  target="_blank"
                  class="text-primary-600 font-semibold hover:text-primary-700 transition-colors flex items-center gap-1"
                >
                  View Live
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <button v-else class="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">Project Success</h2>
          <p class="text-xl text-gray-600">
            Numbers that showcase our impact and expertise.
          </p>
        </div>
        
        <div class="grid md:grid-cols-4 gap-8">
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="text-4xl font-bold text-primary-600 mb-2">50+</div>
            <div class="text-gray-600">Projects Completed</div>
          </div>
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="text-4xl font-bold text-primary-600 mb-2">98%</div>
            <div class="text-gray-600">Client Satisfaction</div>
          </div>
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="text-4xl font-bold text-primary-600 mb-2">5+</div>
            <div class="text-gray-600">Years Experience</div>
          </div>
          <div class="bg-white text-center p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div class="text-4xl font-bold text-primary-600 mb-2">24/7</div>
            <div class="text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-primary-600">
      <div class="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <h2 class="text-4xl font-bold text-white mb-6">
          Ready to start your project?
        </h2>
        <p class="text-xl text-primary-100 mb-8">
          Let's create something amazing together that drives real results for your business.
        </p>
        <router-link 
          to="/contact"
          class="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200 shadow-lg"
        >
          Start Your Project
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { 
  ShoppingCartIcon, 
  BuildingOfficeIcon, 
  HeartIcon,
  AcademicCapIcon,
  CameraIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const projects = [
  {
    icon: HeartIcon,
    title: 'Ink 37 Tattoos - Artist Portfolio',
    description: 'Custom tattoo studio website featuring dynamic gallery, booking system, and artist showcase. Built for Fernando Govea in Dallas/Fort Worth with responsive design and integrated booking functionality.',
    tags: ['Vue.js', 'Custom Design', 'Booking System'],
    timeline: '2 months',
    stats: '500+ happy clients, 5.0 star reviews',
    url: 'https://ink37tattoos.com'
  },
  {
    icon: ChartBarIcon,
    title: 'Richard Hudson Jr. - Revenue Operations',
    description: 'Professional portfolio and consulting platform showcasing data analytics expertise. Features project galleries, interactive dashboards, and revenue optimization case studies.',
    tags: ['Next.js', 'Analytics', 'Data Viz'],
    timeline: '3 months',
    stats: '$3.7M+ revenue impact, 96.8% forecast accuracy',
    url: 'https://richardwhudsonjr.com'
  },
  {
    icon: ShoppingCartIcon,
    title: 'Commission Optimization System',
    description: 'Advanced commission management platform managing $254K+ commission structures with automated tier adjustments and ROI-driven compensation strategy.',
    tags: ['React', 'Python', 'Analytics'],
    timeline: '4 months',
    stats: '34% performance improvement, 87.5% automation'
  },
  {
    icon: BuildingOfficeIcon,
    title: 'Multi-Channel Attribution Dashboard',
    description: 'Marketing attribution analytics platform using ML models to track customer journeys across 12+ touchpoints with advanced attribution modeling.',
    tags: ['Vue.js', 'Machine Learning', 'Analytics'],
    timeline: '3 months',
    stats: '92.4% attribution accuracy, $2.3M ROI optimization'
  },
  {
    icon: AcademicCapIcon,
    title: 'Revenue Operations Command Center',
    description: 'Executive dashboard consolidating pipeline health, forecasting accuracy, and operational KPIs with real-time insights across sales and marketing.',
    tags: ['React', 'Real-time Data', 'Executive Dashboard'],
    timeline: '2 months',
    stats: '96.8% forecast accuracy, 89.7% operational efficiency'
  },
  {
    icon: CameraIcon,
    title: 'Customer Lifetime Value Analytics',
    description: 'Advanced CLV analytics platform leveraging BTYD predictive modeling with machine learning algorithms for customer behavior tracking.',
    tags: ['Python', 'Machine Learning', 'Predictive Analytics'],
    timeline: '3 months',
    stats: '94.3% prediction accuracy across 5 customer segments'
  }
]
</script>