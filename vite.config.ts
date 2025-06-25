import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/router': path.resolve(__dirname, './src/router'),
      '@/types': path.resolve(__dirname, './src/types')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for core Vue ecosystem
          if (id.includes('vue') || id.includes('vue-router')) {
            return 'vendor'
          }
          
          // Split Naive UI into smaller chunks by component type
          if (id.includes('naive-ui')) {
            if (id.includes('button') || id.includes('card') || id.includes('space')) {
              return 'ui-core'
            }
            if (id.includes('form') || id.includes('input') || id.includes('select')) {
              return 'ui-forms'
            }
            if (id.includes('carousel') || id.includes('timeline') || id.includes('progress') || id.includes('statistic') || id.includes('steps')) {
              return 'ui-display'
            }
            if (id.includes('modal') || id.includes('drawer') || id.includes('popover')) {
              return 'ui-overlay'
            }
            return 'ui-misc'
          }
          
          // VueUse Motion
          if (id.includes('@vueuse/motion')) {
            return 'motion'
          }
          
          // Heroicons
          if (id.includes('@heroicons')) {
            return 'icons'
          }
          
          // Node modules that aren't explicitly chunked
          if (id.includes('node_modules')) {
            return 'vendor-libs'
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId && facadeModuleId.includes('pages/')) {
            return 'assets/[name]-[hash].js'
          }
          return 'assets/[name]-[hash].js'
        }
      }
    },
    cssCodeSplit: true,
    cssMinify: true,
    sourcemap: false,
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },
    chunkSizeWarningLimit: 300
  },
  server: {
    port: 5180,
    host: true
  }
})