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
  optimizeDeps: {
    include: ['vuetify/lib/components/VLayout/index.mjs',
              'vuetify/lib/components/VContainer/index.mjs',
              'vuetify/lib/components/VBtn/index.mjs',
              'vuetify/lib/components/VIcon/index.mjs',
              'vuetify/lib/components/VTable/index.mjs',
              'vuetify/lib/components/transitions/index.mjs',
              'vuetify/lib/components/VProgressLinear/index.mjs',
              'vuetify/lib/components/VTextField/index.mjs',
              'vuetify/lib/components/VCard/index.mjs',
              'vuetify/lib/components/VAutocomplete/index.mjs',
              'vuetify/lib/components/VChip/index.mjs', 
              'vuetify/lib/components/VTooltip/index.mjs', 
              'vuetify/lib/components/VSelect/index.mjs', 
              'vuetify/lib/components/VSheet/index.mjs', 
              'vuetify/lib/components/VTabs/index.mjs',
              'vuetify/lib/components/VTextarea/index.mjs',
              'vuetify/lib/components/VResponsive/index.mjs',
              'vuetify/lib/components/VForm/index.mjs', 
              'vuetify/lib/components/VToolbar/index.mjs',
    ],
  },
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
