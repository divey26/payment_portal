import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    include: ['test/**/*.test.js'],
    restoreMocks: true,
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Produce detailed reports for application code only
      all: true,
      include: ['controllers/**/*.js', 'models/**/*.js', 'routes/**/*.js', 'app.js'],
      exclude: [
        'node_modules/**',
        'coverage/**',
        'test/**',
        'server.js',
        'billRepository.js',
        'eslint.config.js',
        '.eslintrc.cjs',
        'vitest.config.js',
        'scripts/**',
      ],
      reportOnFailure: true,
    },
  },
});
