import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const apiUrl = import.meta.env.VITE_API_URL; // Fetch directly from .env during production

  return {
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
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: isDevelopment
            ? 'http://localhost:5000' // Local backend
            : apiUrl, // Use production URL from .env
          changeOrigin: true,
          secure: !isDevelopment, // Enforce HTTPS in production
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  };
});
