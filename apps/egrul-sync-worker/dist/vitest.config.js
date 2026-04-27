"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
/**
 * Vitest configuration for EGRUL Sync Worker
 *
 * @remarks
 * Использует Vitest (Jest-совместимый) для unit тестов.
 * Environment: Node.js для ClickHouse client.
 */
exports.default = (0, config_1.defineConfig)({
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
