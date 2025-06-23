import { createApp } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import './style.css'
import App from './App.vue'
import router from './router'

// Naive UI
import {
  // create naive ui
  create,
  // component
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
  darkTheme
} from 'naive-ui'

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
    NMessageProvider
  ]
})

const app = createApp(App)
app.use(router)
app.use(MotionPlugin)
app.use(naive)
app.mount('#app')