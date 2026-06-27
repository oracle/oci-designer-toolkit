import { defineConfig } from 'vitest/config'

// Unit tests for @ocd/import Terraform round-trip logic (HCL → OcdDesign model).
// These exercise the pure parser/importer pipeline with no OCI SDK or network, so
// the default `node` environment is sufficient. Cross-package @ocd/* dependencies
// resolve to their built lib/esm output via the workspace symlinks.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Tests import { describe, it, expect } from 'vitest' explicitly, matching the
    // @ocd/query convention, so globals stay off.
    globals: false,
  },
})
