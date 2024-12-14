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
            src: 'src/common/images/*',
            dest: 'assets/images',
          },
          {
            src: 'src/common/fonts/*',
            dest: 'assets/fonts',
          },
        ],
      }),
    ],
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: './index.html', // Set index.html as the build entry point
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]', // For all assets
          entryFileNames: 'assets/[name]-[hash].js', // For entry scripts
          chunkFileNames: 'assets/[name]-[hash].js', // For chunk files
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
