import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['xlsx', 'file-saver'],
  },
  resolve: {
    alias: {
      xlsx: 'xlsx/xlsx.mjs',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) return 'vendor-chart'
          if (id.includes('xlsx') || id.includes('file-saver')) return 'vendor-xlsx'
          if (id.includes('lucide-react') || id.includes('react-hot-toast')) return 'vendor-ui'
          if (id.includes('react-router-dom') || id.includes('react-dom') || (id.includes('node_modules/react/') && !id.includes('react-'))) return 'vendor-react'
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://script.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
