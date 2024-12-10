import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import dotenv from 'dotenv';

dotenv.config(); // Load variables from .env

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';

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
        input: './src/app.jsx', // Specify the main entry point for your app
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
        },
      },
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        '/api': {
          target: isDevelopment ? 'http://localhost:5000' : apiUrl,
          changeOrigin: true,
          secure: false,
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
