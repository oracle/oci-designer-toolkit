import { defineConfig } from 'vitest/config'

// Unit tests for @ocd/react logic (cost SKUs, LZ name map, jsonnet sources,
// model cloning). These exercise pure data/transform functions, so the default
// `node` environment is sufficient — no jsdom needed. Component render tests, if
// added later, should opt into `environment: 'jsdom'` per-file via a docblock.
export default defineConfig({
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    // The existing tests import { describe, it, expect } from 'vitest' explicitly,
    // so globals stay off to keep the test surface explicit.
    globals: false,
  },
})
