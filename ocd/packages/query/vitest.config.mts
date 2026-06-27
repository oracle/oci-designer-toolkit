import { defineConfig } from 'vitest/config'

// Unit tests for @ocd/query pure logic (concurrency pool, retry/backoff policy).
// These exercise transform/control-flow functions with no OCI SDK or network, so
// the default `node` environment is sufficient. Live OCI clients are never
// constructed in tests — only the standalone helpers are imported.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Tests import { describe, it, expect } from 'vitest' explicitly, matching the
    // @ocd/react convention, so globals stay off.
    globals: false,
  },
})
