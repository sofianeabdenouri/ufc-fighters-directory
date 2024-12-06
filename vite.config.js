import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/common/images/**/*',
          dest: 'common/images',
        },
        {
          src: 'src/common/fonts/**/*',
          dest: 'common/fonts',
        },
      ],
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html',
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: mode === 'development' ? {
    port: 5173,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  } : undefined, // No server proxy in production
  resolve: {
    alias: {
      '@': '/src',
    },
  },
}));
