<template>
  <div class="bg-gradient-primary min-h-screen">
    <!-- Header - Tech Minimal -->
    <section class="relative bg-gradient-hero py-32 overflow-hidden">
      <!-- Tech grid overlay -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
        <div class="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(34,211,238,0.1)_50%,transparent_51%)] bg-[length:60px_60px]"></div>
      </div>
      
      <!-- Subtle energy elements -->
      <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
      
      <div class="relative max-w-6xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <n-tag 
          size="large"
          style="background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.3); color: #22d3ee; font-weight: 600; margin-bottom: 32px;"
        >
          <template #icon>
            <div class="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></div>
          </template>
          Services
        </n-tag>
        
        <h1 class="text-6xl lg:text-8xl font-black text-white mb-8 leading-none tracking-tight">
          DIGITAL
          <br>
          <span class="text-secondary-400 glow-cyan">DOMINATION</span>
        </h1>
        
        <p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Three core services. Zero compromise. Maximum impact.
        </p>
      </div>
    </section>

    <!-- Services Grid - Ultra Clean -->
    <section class="py-32 bg-gradient-primary">
      <div class="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <n-grid cols="1 m:3" x-gap="0" y-gap="0" responsive="screen">
          <n-grid-item v-for="(service, index) in services" :key="service.title">
            <div class="p-8 border-r border-gray-700 last:border-r-0 hover:bg-white/5 transition-all duration-300 group">
              <!-- Number -->
              <div class="text-6xl font-black text-secondary-400/40 mb-6 group-hover:text-secondary-400 group-hover:scale-105 transition-all duration-300 glow-cyan">
                {{ String(index + 1).padStart(2, '0') }}
              </div>
              
              <!-- Service -->
              <h3 class="text-2xl font-black text-white mb-4 group-hover:text-secondary-400 transition-colors duration-300">
                {{ service.title }}
              </h3>
              
              <p class="text-gray-400 mb-8 leading-relaxed">
                {{ service.description }}
              </p>
              
              <!-- Features -->
              <div class="space-y-3 mb-8">
                <div v-for="feature in service.features" :key="feature" class="flex items-center gap-3">
                  <div class="w-1 h-1 bg-secondary-400 rounded-full"></div>
                  <span class="text-sm text-gray-500 uppercase tracking-wide">{{ feature }}</span>
                </div>
              </div>
              
              <!-- Price -->
              <div class="text-3xl font-black text-white mb-6">
                {{ service.pricing }}
              </div>
              
              <!-- CTA -->
              <n-button 
                text
                size="large"
                style="color: #22d3ee; padding: 0;"
                @click="$router.push('/contact')"
                class="group/btn glow-cyan"
              >
                START PROJECT
                <template #icon>
                  <n-icon class="group-hover/btn:translate-x-1 transition-transform duration-200">
                    <ArrowRightIcon />
                  </n-icon>
                </template>
              </n-button>
            </div>
          </n-grid-item>
        </n-grid>
      </div>
    </section>

    <!-- Why Choose Section - Minimal -->
    <section class="py-32 bg-gradient-primary border-t border-gray-700">
      <div class="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-20">
          <h2 class="text-4xl font-black text-white mb-6">
            WHY CHOOSE US?
          </h2>
          <p class="text-gray-400 max-w-2xl mx-auto">
            Because we deliver results, not excuses.
          </p>
        </div>
        
        <n-grid cols="2 m:4" x-gap="0" y-gap="32" responsive="screen">
          <n-grid-item v-for="reason in reasons" :key="reason.title">
            <div class="text-center group cursor-pointer">
              <div class="text-5xl font-black text-secondary-400/40 mb-4 group-hover:text-secondary-400 group-hover:scale-105 transition-all duration-300 glow-cyan">
                {{ reason.value }}
              </div>
              <div class="text-sm uppercase tracking-wide text-gray-400 font-bold group-hover:text-secondary-400 transition-colors duration-300">
                {{ reason.title }}
              </div>
            </div>
          </n-grid-item>
        </n-grid>
      </div>
    </section>

    <!-- Process Section - Minimal -->
    <section class="py-32 bg-gradient-primary border-t border-gray-700">
      <div class="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div class="text-center mb-20">
          <h2 class="text-4xl font-black text-white mb-6">
            THE PROCESS
          </h2>
          <p class="text-gray-400">
            Four steps to digital dominance.
          </p>
        </div>
        
        <div class="grid md:grid-cols-4 gap-8">
          <div v-for="(step, index) in process" :key="step.title" class="text-center group cursor-pointer">
            <div class="w-16 h-16 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-black text-secondary-400/40 group-hover:border-secondary-400 group-hover:text-secondary-400 group-hover:scale-105 group-hover:bg-secondary-400/10 transition-all duration-300 glow-cyan">
              {{ index + 1 }}
            </div>
            <h3 class="text-lg font-black text-white mb-3 uppercase tracking-wide group-hover:text-secondary-400 transition-colors duration-300">
              {{ step.title }}
            </h3>
            <p class="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
              {{ step.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-32 bg-gradient-primary border-t border-gray-700">
      <div class="max-w-4xl mx-auto text-center px-6 sm:px-8 lg:px-12">
        <h2 class="text-5xl font-black text-white mb-8">
          READY TO
          <br>
          <span class="text-secondary-400 glow-cyan">DOMINATE?</span>
        </h2>
        
        <n-button 
          size="large"
          strong
          style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); color: white; border: none; padding: 24px 48px; font-size: 18px; height: auto; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 4px 16px rgba(34, 211, 238, 0.25);"
          @click="$router.push('/contact')"
          class="hover:scale-105 transition-all duration-300 glow-cyan"
        >
          <template #icon>
            <n-icon>
              <ArrowRightIcon />
            </n-icon>
          </template>
          Start Now
        </n-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { updateMetaTags, SEO_CONFIG } from '@/utils/seo'

updateMetaTags(SEO_CONFIG.services)

const services = [
  {
    title: 'WEB APPS',
    description:
      'Lightning-fast applications that scale with your business growth.',
    features: [
      'React • Vue • Next.js',
      'API Development',
      'Database Architecture',
      'Performance Optimization',
    ],
    pricing: '$5K+',
  },
  {
    title: 'CUSTOM SOLUTIONS',
    description:
      'Bespoke software engineered for your exact business requirements.',
    features: [
      'Business Automation',
      'System Integrations',
      'Data Analytics',
      'Revenue Operations',
    ],
    pricing: '$8K+',
  },
  {
    title: 'STRATEGY',
    description: 'Data-driven digital strategy that cuts through the noise.',
    features: [
      'Technical Audits',
      'Growth Planning',
      'ROI Optimization',
      'Market Analysis',
    ],
    pricing: '$2K+',
  },
]

const reasons = [
  { value: '150+', title: 'Projects Delivered' },
  { value: '98%', title: 'Success Rate' },
  { value: '340%', title: 'Average ROI' },
  { value: '24/7', title: 'Support' },
]

const process = [
  {
    title: 'Discover',
    description: 'Understand your business and requirements.',
  },
  {
    title: 'Plan',
    description: 'Create comprehensive strategy and timeline.',
  },
  {
    title: 'Build',
    description: 'Engineer your solution with precision.',
  },
  {
    title: 'Launch',
    description: 'Deploy and dominate your market.',
  },
]
</script>
