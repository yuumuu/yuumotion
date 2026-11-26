import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'https://yuumotion.wasmer.app',
      robots: [{ userAgent: '*', allow: '/', disallow: '/api/' }]
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-tiptap': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-task-list',
            '@tiptap/extension-task-item'
          ],
          'vendor-three': ['three'],
          'vendor-icons': ['@phosphor-icons/react']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
});
