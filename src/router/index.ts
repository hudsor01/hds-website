import { createRouter, createWebHistory } from 'vue-router'
import AboutPage from '@/pages/AboutPage.vue'
import ContactPage from '@/pages/ContactPage.vue'
import HomePage from '@/pages/HomePage.vue'
import ServicesPage from '@/pages/ServicesPage.vue'
import { SEO_CONFIG, updateMetaTags } from '@/utils/seo'

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
      redirect: '/',
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
