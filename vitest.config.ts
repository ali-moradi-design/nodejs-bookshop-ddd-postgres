import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@interfaces': path.resolve(__dirname, 'src/interfaces'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  test: {
    globals: false,
    environment: 'node',
    setupFiles: ['./tests/setup-env.ts'],
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 60_000,
    hookTimeout: 120_000,
    include: ['tests/**/*.test.ts'],
  },
});
