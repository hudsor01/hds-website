<template>
  <section class="min-h-screen bg-gray-50 flex items-center justify-center px-6">
    <div class="max-w-5xl mx-auto">
      <div class="grid lg:grid-cols-2 gap-16 items-center">
        <!-- Content -->
        <div>
          <div class="mb-6">
            <img 
              src="/HDS-Logo.jpeg" 
              alt="Hudson Digital Solutions" 
              class="h-16"
            />
          </div>
          
          <h1 class="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            We build 
            <span class="text-primary-600">exceptional</span>
            websites
          </h1>
          
          <p class="text-xl text-gray-600 mb-8 leading-relaxed">
            Professional web development that drives real business results. Fast, modern, and built to convert.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4">
            <button 
              @click="scrollToContact"
              class="bg-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Your Project
            </button>
            
            <button 
              @click="scrollToServices"
              class="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-all duration-200"
            >
              View Our Work
            </button>
          </div>
        </div>
        
        <!-- Visual Element -->
        <div class="relative">
          <div class="bg-white rounded-2xl shadow-2xl p-8 border">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div class="h-px bg-gray-200"></div>
              <div class="space-y-3">
                <div class="h-4 bg-primary-100 rounded"></div>
                <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                <div class="h-4 bg-gray-100 rounded w-1/2"></div>
                <div class="h-8 bg-primary-600 rounded w-32"></div>
              </div>
            </div>
          </div>
          <!-- Floating elements -->
          <div class="absolute -top-6 -right-6 w-24 h-24 bg-primary-100 rounded-2xl opacity-60"></div>
          <div class="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-50 rounded-2xl opacity-40"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const scrollToContact = () => {
  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToServices = () => {
  document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' })
}
</script>