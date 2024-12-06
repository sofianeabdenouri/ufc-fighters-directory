import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/common/images/**/*',
          dest: 'common/images', // Copies images to `dist/common/images`
        },
        {
          src: 'src/common/fonts/**/*',
          dest: 'common/fonts', // Copies fonts to `dist/common/fonts`
        },
      ],
    }),
  ],
  build: {
    outDir: 'dist', // Output directory for the build
    rollupOptions: {
      input: './index.html', // Specify the entry point
      output: {
        // Configure how assets (CSS, JS, etc.) are output
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    port: 5173, // Local development server port
    open: true, // Automatically open in the browser
    proxy: {
      // Proxy API requests to the backend
      '/api': {
        target: 'http://localhost:5000', // Backend server address
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src', // Allow `@/` to refer to the `src` folder
    },
  },
});
