import { createRouter, createWebHistory } from 'vue-router'
import { SEO_CONFIG, updateMetaTags } from '@/utils/seo'

// Lazy load components for better code splitting
const HomePage = () => import('@/pages/HomePage.vue')
const ServicesPage = () => import('@/pages/ServicesPage.vue')
const AboutPage = () => import('@/pages/AboutPage.vue')
const ContactPage = () => import('@/pages/ContactPage.vue')
const NotFound = () => import('@/pages/NotFound.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
      meta: {
        seo: 'home',
      },
    },
    {
      path: '/services',
      name: 'Services',
      component: ServicesPage,
      meta: {
        seo: 'services',
      },
    },
    {
      path: '/about',
      name: 'About',
      component: AboutPage,
      meta: {
        seo: 'about',
      },
    },
    {
      path: '/contact',
      name: 'Contact',
      component: ContactPage,
      meta: {
        seo: 'contact',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    },
  ],
  scrollBehavior(_, __, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Global navigation guard for SEO
router.beforeEach((to) => {
  // Update meta tags based on route
  if (to.meta.seo && SEO_CONFIG[to.meta.seo as keyof typeof SEO_CONFIG]) {
    const seoConfig = SEO_CONFIG[to.meta.seo as keyof typeof SEO_CONFIG]
    updateMetaTags(seoConfig)
  }

  return true
})

export default router
