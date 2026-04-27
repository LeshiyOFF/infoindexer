import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['__tests__/**/*.test.ts', '**/*.test.tsx'],
    testTimeout: 10000,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.mjs'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'shared': path.resolve(__dirname, '../../packages/shared'),
    },
  },
});
