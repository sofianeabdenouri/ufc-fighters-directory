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
          dest: 'common/images', // Ensure the images are copied
        },
        {
          src: 'src/common/fonts/**/*',
          dest: 'common/fonts', // Ensure fonts are copied correctly
        },
      ],
    }),
  ],
  build: {
    outDir: 'dist', // Ensure this matches your Vercel output directory
    rollupOptions: {
      output: {
        // Ensure that assets are placed correctly in the output directory
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
