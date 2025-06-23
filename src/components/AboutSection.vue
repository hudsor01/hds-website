<template>
  <section class="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div 
          v-motion
          :initial="{ opacity: 0, x: -50 }"
          :visible-once="{ opacity: 1, x: 0, transition: { duration: 600 } }"
        >
          <h2 class="text-4xl md:text-5xl font-bold font-roboto-flex text-slate-50 mb-6">
            About <span class="text-brand-cyan">Hudson Digital</span>
          </h2>
          <p class="text-lg text-slate-300 leading-relaxed mb-6">
            We are a dedicated team of web development professionals committed to delivering 
            exceptional digital solutions. With years of experience in modern web technologies, 
            we help businesses establish a strong online presence and achieve their digital goals.
          </p>
          <p class="text-lg text-slate-300 leading-relaxed mb-8">
            Our mission is to create web experiences that not only look great but also drive 
            real business results. We combine technical expertise with strategic thinking to 
            build solutions that scale with your business.
          </p>
          
          <div class="space-y-4">
            <div 
              v-for="(value, index) in values" 
              :key="value.title"
              v-motion
              :initial="{ opacity: 0, x: -30 }"
              :visible-once="{ 
                opacity: 1, 
                x: 0, 
                transition: { 
                  duration: 500, 
                  delay: 200 + (index * 150) 
                } 
              }"
              class="flex items-start"
            >
              <component 
                :is="value.icon" 
                class="h-6 w-6 text-brand-cyan mr-4 mt-1 flex-shrink-0" 
              />
              <div>
                <h3 class="text-lg font-semibold text-slate-50 mb-2">{{ value.title }}</h3>
                <p class="text-slate-300">{{ value.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div 
          v-motion
          :initial="{ opacity: 0, x: 50 }"
          :visible-once="{ opacity: 1, x: 0, transition: { duration: 600, delay: 200 } }"
          class="space-y-8"
        >
          <div class="bg-slate-900 p-8 rounded-xl border border-slate-700">
            <h3 class="text-2xl font-semibold font-roboto-flex text-slate-50 mb-6">
              Why Choose Us
            </h3>
            <div class="space-y-4">
              <div 
                v-for="(reason, index) in reasons" 
                :key="reason"
                v-motion
                :initial="{ opacity: 0, y: 20 }"
                :visible-once="{ 
                  opacity: 1, 
                  y: 0, 
                  transition: { 
                    duration: 400, 
                    delay: 400 + (index * 100) 
                  } 
                }"
                class="flex items-center"
              >
                <CheckCircleIcon class="h-5 w-5 text-brand-cyan mr-3 flex-shrink-0" />
                <span class="text-slate-300">{{ reason }}</span>
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-6">
            <div 
              v-for="(stat, index) in stats" 
              :key="stat.label"
              v-motion
              :initial="{ opacity: 0, scale: 0.9 }"
              :visible-once="{ 
                opacity: 1, 
                scale: 1, 
                transition: { 
                  duration: 500, 
                  delay: 600 + (index * 150) 
                } 
              }"
              class="bg-slate-900 p-6 rounded-xl border border-slate-700 text-center"
            >
              <div class="text-3xl font-bold font-roboto-flex text-brand-cyan mb-2">
                {{ stat.value }}
              </div>
              <div class="text-slate-300 text-sm">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { 
  LightBulbIcon, 
  ShieldCheckIcon, 
  RocketLaunchIcon,
  CheckCircleIcon 
} from '@heroicons/vue/24/outline'

const values = [
  {
    icon: LightBulbIcon,
    title: 'Innovation',
    description: 'We stay ahead of the curve with the latest technologies and best practices.'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Reliability',
    description: 'Consistent delivery of high-quality solutions that you can depend on.'
  },
  {
    icon: RocketLaunchIcon,
    title: 'Performance',
    description: 'Optimized solutions that load fast and perform exceptionally well.'
  }
]

const reasons = [
  'Modern, cutting-edge technology stack',
  'SEO-optimized and performance-focused',
  'Responsive design for all devices',
  'Ongoing support and maintenance',
  'Transparent communication throughout',
  'Competitive pricing and timelines'
]

const stats = [
  { value: '50+', label: 'Projects Completed' },
  { value: '99%', label: 'Client Satisfaction' },
  { value: '24/7', label: 'Support Available' },
  { value: '5+', label: 'Years Experience' }
]
</script>