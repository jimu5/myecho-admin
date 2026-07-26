import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: '/admin/',
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/': {
        target: 'http://localhost:2999',
        changeOrigin: true,
        ws: true,
      },
      '/mos/': {
        target: 'http://localhost:2999',
        changeOrigin: true,
        ws: true,
      },
      '/static/': {
        target: 'http://localhost:2999',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    chunkSizeWarningLimit: 800,
  },
}));
