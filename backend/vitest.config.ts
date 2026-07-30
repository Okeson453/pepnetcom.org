import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // env.setup.ts must run first — it populates process.env from
    // .env.test before setup.ts's top-level imports (prisma-client.ts,
    // redis-client.ts) read env.ts's zod-validated config. setup.ts itself
    // existed already but was never referenced here, so it silently never
    // ran and DB/Redis connections were never actually established or torn
    // down around the suite.
    setupFiles: ['./tests/env.setup.ts', './tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'prisma/'],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
