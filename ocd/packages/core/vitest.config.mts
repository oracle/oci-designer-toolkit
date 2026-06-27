import { defineConfig } from 'vitest/config'

// Unit tests for @ocd/core pure logic (currently the fetchWithTimeout wrapper).
// These exercise standalone helpers with no DOM or live network — an injected
// fetch stub is used — so the default `node` environment is sufficient.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Tests import { describe, it, expect, vi } from 'vitest' explicitly, matching
    // the @ocd/query and @ocd/react convention, so globals stay off.
    globals: false,
  },
})
