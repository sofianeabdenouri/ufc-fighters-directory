import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';

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
            ? 'http://localhost:5000' // Development backend
            : 'https://ufcrec.vercel.app/api', // Production backend
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
