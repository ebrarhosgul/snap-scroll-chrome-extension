import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve('src/popup/index.html'),
        background: resolve('src/background/service-worker.ts'),
        content: resolve('src/content/index.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/service-worker.js';
          }
          if (chunkInfo.name === 'content') {
            return 'content/index.js';
          }
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.names && assetInfo.names.some(n => n.endsWith('.css'))) {
            return 'content/style.css';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  }
});
