<template>
  <nav class="bg-gradient-to-r from-black via-gray-900 to-black/90 shadow-xl border-b-4 border-cyan-400 sticky top-0 z-50 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <div class="flex items-center h-16 relative">
        <!-- Brand Text -->
        <router-link to="/" class="group flex items-center">
          <div class="text-2xl font-extrabold uppercase tracking-widest text-cyan-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-200">
            Hudson Digital
          </div>
        </router-link>
        
        <!-- Centered Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
          <router-link 
            v-for="item in navigation" 
            :key="item.href"
            :to="item.href"
            class="text-lg font-bold uppercase tracking-wide text-white hover:text-cyan-400 px-2 py-1 rounded transition-colors duration-200 relative group"
            :class="{ 'text-cyan-400': $route.path === item.href }"
          >
            {{ item.name }}
            <span 
              v-if="$route.path === item.href"
              class="absolute -bottom-1 left-0 w-full h-1 bg-cyan-400 rounded-full shadow-cyan-400/40"
            ></span>
          </router-link>
        </div>
        
        <!-- CTA Button -->
        <div class="hidden md:block ml-auto">
          <n-button 
            type="primary"
            size="large"
            strong
            style="background: linear-gradient(90deg, #22d3ee 0%, #0891b2 100%); color: white; border: none; padding: 12px 32px; font-size: 1rem; font-weight: 800; border-radius: 9999px; box-shadow: 0 4px 24px 0 rgba(34, 211, 238, 0.25); letter-spacing: 0.05em;"
            @click="$router.push('/contact')"
            class="hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400/40 transition-all duration-300"
          >
            <template #icon>
              <n-icon size="18">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </n-icon>
            </template>
            Get Started
          </n-button>
        </div>
        
        <!-- Mobile menu button -->
        <div class="md:hidden ml-auto">
          <n-button 
            quaternary 
            circle
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="hover:bg-white/10 text-white"
            style="border: 1px solid rgba(34, 211, 238, 0.3);"
          >
            <template #icon>
              <n-icon size="18" color="#22d3ee">
                <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
      
      <!-- Mobile Navigation -->
      <n-drawer 
        v-model:show="mobileMenuOpen" 
        placement="top"
        :height="250"
        class="md:hidden"
        :style="{ backgroundColor: 'rgba(9, 9, 11, 0.95)', backdropFilter: 'blur(16px)' }"
      >
        <n-drawer-content 
          title="Navigation" 
          closable
          :style="{ backgroundColor: 'rgba(9, 9, 11, 0.95)', color: 'white' }"
        >
          <n-space vertical size="large">
            <div class="flex flex-col space-y-3">
              <router-link 
                v-for="item in navigation" 
                :key="item.href"
                :to="item.href"
                @click="mobileMenuOpen = false"
                class="text-gray-300 hover:text-secondary-400 font-medium transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/10"
                :class="{ 'text-secondary-400 bg-white/10': $route.path === item.href }"
              >
                {{ item.name }}
              </router-link>
            </div>
            
            <n-divider style="border-color: rgba(34, 211, 238, 0.2);" />
            
            <n-button 
              type="primary"
              size="medium"
              block
              strong
              style="background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); color: white; border: none; font-weight: 600; box-shadow: 0 2px 8px rgba(34, 211, 238, 0.15);"
              @click="handleContactClick"
              class="hover:shadow-lg transition-all duration-300"
            >
              <template #icon>
                <n-icon size="16">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </n-icon>
              </template>
              Get Started
            </n-button>
          </n-space>
        </n-drawer-content>
      </n-drawer>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'Navbar',
  setup() {
    const router = useRouter()
    const mobileMenuOpen = ref(false)

    const navigation = [
      { name: 'Home', href: '/' },
      { name: 'Services', href: '/services' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ]

    const handleContactClick = () => {
      router.push('/contact')
      mobileMenuOpen.value = false
    }

    return {
      router,
      mobileMenuOpen,
      navigation,
      handleContactClick,
    }
  },
})
</script>
