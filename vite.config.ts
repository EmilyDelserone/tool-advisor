import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // Relative base keeps the bundle deployable from any static path (incl. GitHub Pages)
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    host: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@tests': path.resolve(rootDir, './tests'),
    },
  },
});
