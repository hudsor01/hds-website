import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hudson Digital Solutions',
    short_name: 'Hudson Digital',
    description: 'Revenue Operations & Web Development for Small Business. Expert CRM optimization, sales automation, and custom web development based in Dallas-Fort Worth.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'en-US',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Contact Us',
        short_name: 'Contact',
        description: 'Get in touch for a consultation',
        url: '/contact',
        icons: [{ src: '/logo.png', sizes: '96x96' }],
      },
      {
        name: 'Revenue Assessment',
        short_name: 'Assessment',
        description: 'Free revenue operations assessment',
        url: '/book-consultation',
        icons: [{ src: '/logo.png', sizes: '96x96' }],
      },
      {
        name: 'Services',
        short_name: 'Services',
        description: 'View our service offerings',
        url: '/services',
        icons: [{ src: '/logo.png', sizes: '96x96' }],
      },
    ],
  }
}