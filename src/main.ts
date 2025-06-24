import { MotionPlugin } from '@vueuse/motion'
import { createApp } from 'vue'
import './style.css'

// Naive UI
import {
  // create naive ui
  create,
  NAffix,
  NAlert,
  NAvatar,
  NBackTop,
  NBadge,
  // component
  NButton,
  NCard,
  NCarousel,
  NCarouselItem,
  NCollapse,
  NCollapseItem,
  NConfigProvider,
  NCountdown,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NDrawer,
  NDropdown,
  NEmpty,
  NForm,
  NFormItem,
  NGradientText,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NList,
  NListItem,
  NMenu,
  NMessageProvider,
  NModal,
  NPopover,
  NProgress,
  NRate,
  NResult,
  NSelect,
  NSpace,
  NSpin,
  NStatistic,
  NStep,
  NSteps,
  NTabPane,
  NTabs,
  NTag,
  NTimeline,
  NTimelineItem,
  NTooltip,
} from 'naive-ui'
import { initAccessibilityFeatures } from '@/utils/accessibility'
// SEO and Performance utilities
import { initPerformanceOptimizations } from '@/utils/performance'
import App from './App.vue'
import router from './router'

const naive = create({
  components: [
    NButton,
    NCard,
    NSpace,
    NGrid,
    NGridItem,
    NGradientText,
    NIcon,
    NTag,
    NDivider,
    NStatistic,
    NConfigProvider,
    NProgress,
    NTimeline,
    NTimelineItem,
    NCarousel,
    NCarouselItem,
    NAvatar,
    NRate,
    NCountdown,
    NAlert,
    NBadge,
    NTooltip,
    NDropdown,
    NMenu,
    NPopover,
    NModal,
    NDrawer,
    NSteps,
    NStep,
    NResult,
    NEmpty,
    NSpin,
    NBackTop,
    NAffix,
    NCollapse,
    NCollapseItem,
    NTabs,
    NTabPane,
    NList,
    NListItem,
    NDescriptions,
    NDescriptionsItem,
    NForm,
    NFormItem,
    NInput,
    NSelect,
    NMessageProvider,
  ],
})

const app = createApp(App)
app.use(router)
app.use(MotionPlugin)
app.use(naive)

// Initialize optimizations after DOM is ready
app.mount('#app')

// Initialize performance and accessibility features
window.addEventListener('DOMContentLoaded', () => {
  initPerformanceOptimizations()
  initAccessibilityFeatures()
})
