import { defineConfig } from 'vitest/config'

// Unit tests for @ocd/model pure logic (the Landing Zone variable/naming
// contract). These exercise pure string generators with no OCI SDK or network,
// so the default `node` environment is sufficient.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Tests import { describe, it, expect } from 'vitest' explicitly, matching the
    // @ocd/query / @ocd/react convention, so globals stay off.
    globals: false,
  },
})
