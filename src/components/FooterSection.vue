<template>
  <footer class="bg-slate-800 border-t border-slate-700 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div 
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 600 } }"
          class="lg:col-span-2"
        >
          <h3 class="text-2xl font-bold font-roboto-flex mb-4">
            <span class="text-brand-cyan">Hudson</span>
            <span class="text-slate-50">Digital</span>
          </h3>
          <p class="text-slate-300 mb-6 max-w-md">
            Professional web development solutions that help your business grow. 
            We create modern, responsive, and high-performing web applications.
          </p>
          <div class="flex space-x-4">
            <a 
              v-for="social in socialLinks" 
              :key="social.name"
              :href="social.href" 
              class="text-slate-400 hover:text-brand-cyan transition-colors duration-300"
              :aria-label="social.name"
            >
              <component :is="social.icon" class="h-6 w-6" />
            </a>
          </div>
        </div>
        
        <!-- Services -->
        <div 
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: 200 } }"
        >
          <h4 class="text-lg font-semibold text-slate-50 mb-4">Services</h4>
          <ul class="space-y-2">
            <li v-for="service in services" :key="service">
              <a 
                href="#services" 
                class="text-slate-300 hover:text-brand-cyan transition-colors duration-300"
              >
                {{ service }}
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Quick Links -->
        <div 
          v-motion
          :initial="{ opacity: 0, y: 30 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 600, delay: 400 } }"
        >
          <h4 class="text-lg font-semibold text-slate-50 mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.name">
              <a 
                :href="link.href" 
                class="text-slate-300 hover:text-brand-cyan transition-colors duration-300"
              >
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div 
        v-motion
        :initial="{ opacity: 0 }"
        :visible-once="{ opacity: 1, transition: { duration: 600, delay: 600 } }"
        class="border-t border-slate-700 mt-12 pt-8"
      >
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-slate-400 text-sm">
            © {{ currentYear }} Hudson Digital. All rights reserved.
          </p>
          <div class="flex space-x-6 mt-4 md:mt-0">
            <a 
              href="/privacy" 
              class="text-slate-400 hover:text-brand-cyan text-sm transition-colors duration-300"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              class="text-slate-400 hover:text-brand-cyan text-sm transition-colors duration-300"
            >
              Terms of Service
            </a>
            <a 
              href="#contact" 
              class="text-slate-400 hover:text-brand-cyan text-sm transition-colors duration-300"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Note: These would typically be real social media icons
// For now using placeholder hrefs
const socialLinks = [
  {
    name: 'LinkedIn',
    href: '#',
    icon: 'div', // Placeholder - would use actual LinkedIn icon
  },
  {
    name: 'Twitter',
    href: '#',
    icon: 'div', // Placeholder - would use actual Twitter icon
  },
  {
    name: 'GitHub',
    href: '#',
    icon: 'div', // Placeholder - would use actual GitHub icon
  },
]

const services = [
  'Web App Development',
  'Website Solutions',
  'Digital Strategy',
  'Performance Optimization',
]

const quickLinks = [
  { name: 'Home', href: '#' },
  { name: 'Services', href: '#services' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
]

const currentYear = computed(() => new Date().getFullYear())
</script>