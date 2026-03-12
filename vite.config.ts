import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (
            id.includes('/vue/') ||
            id.includes('/vue-router/') ||
            id.includes('/vue-i18n/')
          ) {
            return 'vue-vendor';
          }

          if (
            id.includes('/chart.js/') ||
            id.includes('/vue-chartjs/')
          ) {
            return 'chart-vendor';
          }

          if (id.includes('/d3/')) {
            return 'd3-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
})
