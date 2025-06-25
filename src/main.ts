import { MotionPlugin } from '@vueuse/motion'
import { createApp } from 'vue'
import './style.css'

// Naive UI - Core components only (others loaded on demand)
import {
  create,
  NButton,
  NCard,
  NConfigProvider,
  NGradientText,
  NGrid,
  NGridItem,
  NIcon,
  NSpace,
  NTag,
} from 'naive-ui'
import { initAccessibilityFeatures } from '@/utils/accessibility'
import { initCrawlingOptimizations } from '@/utils/crawling'
// SEO and Performance utilities
import { initPerformanceOptimizations } from '@/utils/performance'
import App from './App.vue'
import router from './router'

// Core Naive UI components
const naive = create({
  components: [
    NButton,
    NCard,
    NConfigProvider,
    NGradientText,
    NGrid,
    NGridItem,
    NIcon,
    NSpace,
    NTag,
  ],
})

const app = createApp(App)
app.use(router)
app.use(MotionPlugin)
app.use(naive)

// Initialize optimizations after DOM is ready
app.mount('#app')

// Initialize performance, accessibility, and crawling features
window.addEventListener('DOMContentLoaded', () => {
  initPerformanceOptimizations()
  initAccessibilityFeatures()
  initCrawlingOptimizations()
})
