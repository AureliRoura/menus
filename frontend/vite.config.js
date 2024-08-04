import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/menus/',
  plugins: [
    vue(),
    vuetify({
      autoImport: { labs: true }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      // Redirect requests from /api to https://example.com/api
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
     //   rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  },
})
