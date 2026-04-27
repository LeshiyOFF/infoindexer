import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for EGRUL Sync Worker
 *
 * @remarks
 * Использует Vitest (Jest-совместимый) для unit тестов.
 * Environment: Node.js для ClickHouse client.
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/index.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    },
    testTimeout: 30000,
    hookTimeout: 30000
  }
});
