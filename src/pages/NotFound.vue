<template>
  <div class="min-h-screen bg-gradient-primary flex items-center justify-center px-6">
    <div class="max-w-2xl mx-auto text-center">
      <!-- 404 Visual -->
      <div class="mb-12">
        <h1 class="text-8xl lg:text-9xl font-black text-transparent bg-gradient-to-r from-secondary-400 to-accent-400 bg-clip-text mb-4">
          404
        </h1>
        <div class="w-32 h-1 bg-gradient-secondary mx-auto rounded-full glow-cyan"></div>
      </div>
      
      <!-- Error Message -->
      <div class="mb-12">
        <h2 class="text-3xl lg:text-4xl font-black text-white mb-4">
          Page Not Found
        </h2>
        <p class="text-xl text-gray-300 mb-8 leading-relaxed">
          The page you're looking for has vanished into the digital void. 
          But don't worry—our navigation system is still operational.
        </p>
      </div>
      
      <!-- Action Buttons -->
      <n-space size="large" justify="center" class="flex-wrap">
        <n-button 
          type="primary"
          size="large"
          strong
          style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); border: none; padding: 16px 32px; font-size: 18px; height: auto; box-shadow: 0 4px 16px rgba(34, 211, 238, 0.25);"
          @click="$router.push('/')"
          class="hover:scale-105 transition-all duration-300 glow-cyan"
          aria-label="Return to homepage"
        >
          <template #icon>
            <n-icon>
              <HomeIcon />
            </n-icon>
          </template>
          Return Home
        </n-button>
        
        <n-button 
          quaternary
          size="large"
          style="color: white; padding: 16px 32px; font-size: 18px; height: auto; border: 2px solid #4ade80; background: rgba(74, 222, 128, 0.1); backdrop-filter: blur(10px);"
          @click="$router.push('/contact')"
          class="hover:scale-105 transition-all duration-300 glass-light"
          aria-label="Contact us for help"
        >
          <template #icon>
            <n-icon>
              <ChatBubbleLeftRightIcon />
            </n-icon>
          </template>
          Get Help
        </n-button>
      </n-space>
      
      <!-- Quick Links -->
      <div class="mt-16">
        <h3 class="text-lg font-semibold text-gray-400 mb-6">Or explore these sections:</h3>
        <n-space size="medium" justify="center" class="flex-wrap">
          <n-button 
            text 
            style="color: #22d3ee; font-weight: 500;"
            @click="$router.push('/services')"
            class="hover:text-secondary-300 transition-colors"
          >
            Services
          </n-button>
          <n-button 
            text 
            style="color: #4ade80; font-weight: 500;"
            @click="$router.push('/about')"
            class="hover:text-accent-300 transition-colors"
          >
            About
          </n-button>
          <n-button 
            text 
            style="color: #fb923c; font-weight: 500;"
            @click="$router.push('/portfolio')"
            class="hover:text-warning-300 transition-colors"
          >
            Portfolio
          </n-button>
        </n-space>
      </div>
      
      <!-- Background Elements -->
      <div class="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-secondary opacity-5 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-1/4 left-1/4 w-48 h-48 bg-gradient-accent opacity-5 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatBubbleLeftRightIcon, HomeIcon } from '@heroicons/vue/24/solid'
import { onMounted } from 'vue'

// SEO for 404 page
onMounted(() => {
  document.title = '404 - Page Not Found | Hudson Digital Solutions'

  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute(
      'content',
      'Page not found. Return to Hudson Digital Solutions for premium web development and digital strategy services.',
    )
  }

  // Add noindex to prevent 404 pages from being indexed
  const robotsMeta =
    document.querySelector('meta[name="robots"]') ||
    document.createElement('meta')
  robotsMeta.setAttribute('name', 'robots')
  robotsMeta.setAttribute('content', 'noindex, nofollow')
  if (!document.querySelector('meta[name="robots"]')) {
    document.head.appendChild(robotsMeta)
  }
})
</script>