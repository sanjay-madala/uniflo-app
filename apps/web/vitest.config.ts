import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.tsx'],
    globals: true,
    css: false,
    include: ['**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@uniflo/mock-data': path.resolve(__dirname, '../../packages/mock-data/src'),
      '@uniflo/ui': path.resolve(__dirname, '../../packages/ui/src'),
      // recharts is a dependency of @uniflo/ui, resolve it from there
      'recharts': path.resolve(__dirname, '../../packages/ui/node_modules/recharts'),
    },
  },
});
