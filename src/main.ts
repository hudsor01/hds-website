import { MotionPlugin } from '@vueuse/motion'
import { createApp } from 'vue'
import './style.css'

// Naive UI - Essential components for app functionality
import {
  create,
  NAvatar,
  NBackTop,
  NButton,
  NCard,
  NConfigProvider,
  NDivider,
  NDrawer,
  NDrawerContent,
  NForm,
  NFormItem,
  NGradientText,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NMessageProvider,
  NSelect,
  NSpace,
  NTag,
} from 'naive-ui'
import { initAccessibilityFeatures } from '@/utils/accessibility'
import { initCrawlingOptimizations } from '@/utils/crawling'
// SEO and Performance utilities
import { initPerformanceOptimizations } from '@/utils/performance'
import App from './App.vue'
import router from './router'

// Essential Naive UI components for app functionality
const naive = create({
  components: [
    NAvatar,
    NBackTop,
    NButton,
    NCard,
    NConfigProvider,
    NDivider,
    NDrawer,
    NDrawerContent,
    NForm,
    NFormItem,
    NGradientText,
    NGrid,
    NGridItem,
    NIcon,
    NInput,
    NMessageProvider,
    NSelect,
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
