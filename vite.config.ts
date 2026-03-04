import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'content') {
    return {
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry: resolve('src/content/index.ts'),
          name: 'SnapScrollContent',
          formats: ['iife'],
          fileName: () => 'content/index.js'
        },
        rollupOptions: {
          output: {
            assetFileNames: (assetInfo) => {
              if (assetInfo.names && assetInfo.names.some(n => n.endsWith('.css'))) {
                return 'content/style.css';
              }
              return 'assets/[name]-[hash].[ext]';
            }
          }
        }
      }
    };
  }

  return {
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve('src/popup/index.html'),
          background: resolve('src/background/service-worker.ts')
        },
        output: {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'background') {
              return 'background/service-worker.js';
            }
            return 'assets/[name]-[hash].js';
          }
        }
      }
    }
  };
});
