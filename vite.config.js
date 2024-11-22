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
          dest: 'images',
        },
      ],
    }),
  ],
  build: {
    outDir: 'dist', // Ensure this matches your Netlify publish directory
  },
});