<template>
  <nav class="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-300"></div>
            <div class="relative bg-white p-2 rounded-2xl shadow-lg border border-gray-100 group-hover:scale-105 transition-transform duration-200">
              <img src="/HDS-Logo.jpeg" alt="Hudson Digital" class="h-8 w-auto" />
            </div>
          </div>
          <div class="hidden sm:block">
            <div class="font-display font-bold text-xl text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
              Hudson Digital
            </div>
          </div>
        </router-link>
        
        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-1">
          <router-link 
            v-for="item in navigation" 
            :key="item.name"
            :to="item.href" 
            class="relative px-4 py-2 text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 rounded-xl hover:bg-gray-50 group"
            :class="{ 'text-primary-600 bg-primary-50': $route.path === item.href }"
          >
            <span class="relative z-10">{{ item.name }}</span>
            <div 
              v-if="$route.path === item.href"
              class="absolute inset-0 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl"
            ></div>
          </router-link>
          
          <div class="ml-6">
            <router-link 
              to="/contact"
              class="group relative bg-gradient-to-r from-primary-600 to-blue-700 text-white px-8 py-3 rounded-2xl font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative flex items-center gap-2">
                Get Started
                <ArrowRightIcon class="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </router-link>
          </div>
        </div>
        
        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-3 rounded-2xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="h-6 w-6" />
            <XMarkIcon v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <!-- Mobile Navigation -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200/50 py-6 bg-white/95 backdrop-blur-lg">
          <div class="space-y-3">
            <router-link 
              v-for="item in navigation" 
              :key="item.name"
              :to="item.href" 
              @click="mobileMenuOpen = false"
              class="block px-4 py-3 text-gray-700 hover:text-primary-600 font-medium transition-all duration-200 rounded-xl hover:bg-gray-50"
              :class="{ 'text-primary-600 bg-primary-50': $route.path === item.href }"
            >
              {{ item.name }}
            </router-link>
            
            <div class="pt-4">
              <router-link 
                to="/contact"
                @click="mobileMenuOpen = false"
                class="block mx-4 bg-gradient-to-r from-primary-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 text-center shadow-lg hover:shadow-xl"
              >
                Get Started
              </router-link>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Bars3Icon, XMarkIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

const mobileMenuOpen = ref(false)

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Contact', href: '/contact' },
]
</script>