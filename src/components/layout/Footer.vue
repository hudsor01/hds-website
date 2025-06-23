<template>
  <footer class="bg-gray-900 text-white">
    <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Company Info -->
        <div class="lg:col-span-2">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
              <img src="/HDS-Logo.jpeg" alt="Hudson Digital" class="h-8 w-auto" />
            </div>
            <div class="text-xl font-bold text-white">Hudson Digital</div>
          </div>
          <p class="text-gray-400 mb-6 max-w-md">
            Professional web development solutions that help your business grow. 
            We create modern, responsive, and high-performing web applications.
          </p>
          <div class="flex space-x-3">
            <a href="#" class="p-3 bg-white/10 rounded-2xl border border-white/20 text-gray-400 hover:text-white hover:bg-white/20 transition-all duration-300 group">
              <span class="sr-only">LinkedIn</span>
              <svg class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="#" class="p-3 bg-white/10 rounded-2xl border border-white/20 text-gray-400 hover:text-white hover:bg-white/20 transition-all duration-300 group">
              <span class="sr-only">Twitter</span>
              <svg class="h-5 w-5 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
              </svg>
            </a>
          </div>
        </div>
        
        <!-- Services -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Services</h4>
          <ul class="space-y-2">
            <li><router-link to="/services" class="text-gray-400 hover:text-white transition-colors">Web Development</router-link></li>
            <li><router-link to="/services" class="text-gray-400 hover:text-white transition-colors">Mobile Apps</router-link></li>
            <li><router-link to="/services" class="text-gray-400 hover:text-white transition-colors">Digital Strategy</router-link></li>
            <li><router-link to="/services" class="text-gray-400 hover:text-white transition-colors">SEO Optimization</router-link></li>
          </ul>
        </div>
        
        <!-- Company -->
        <div>
          <h4 class="text-lg font-semibold mb-4">Company</h4>
          <ul class="space-y-2">
            <li><router-link to="/about" class="text-gray-400 hover:text-white transition-colors">About Us</router-link></li>
            <li><router-link to="/portfolio" class="text-gray-400 hover:text-white transition-colors">Portfolio</router-link></li>
            <li><router-link to="/contact" class="text-gray-400 hover:text-white transition-colors">Contact</router-link></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      
      <div class="border-t border-gray-800 mt-12 pt-8 text-center">
        <p class="text-gray-400">
          © {{ currentYear }} Hudson Digital Solutions. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>