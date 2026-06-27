# PR Review: #1 — feat: LZNG Redwood theme, OCI cost estimator & Landing Zone wizard

**Reviewed**: 2026-06-04
**Author**: adibirzu
**Branch**: feature/lzng-redwood-cost-estimator → master
**Decision**: APPROVE with comments

## Summary
Large PR (509 files), but the bulk is generated codegen output, vendored icons, and prior-session work. This review focuses on the substantive hand-written code added in the most recent session (perf code-split, Vitest wiring + tests, A5 palette→LZ placement, A4 Terraform preview, A2 curated catalog, E2E). No CRITICAL or HIGH issues. One MEDIUM correctness issue found and **fixed during review**. Validation is green across the board.

## Findings

### CRITICAL
None.

### HIGH
None.

### MEDIUM
- **`OcdProperties.tsx` — stale Terraform preview (FIXED).** `OcdResourceTerraformPreview` memoized the generated HCL on `[selectedResource]` only, while the body reads `ocdDocument.design`. Editing a field on the already-selected resource did not change `selectedResource`'s identity, so the Terraform tab showed stale HCL until reselect. Fixed by adding `ocdDocument` (recreated immutably on each design edit) to the dependency array.

### LOW
- **`OcdCanvas.tsx` (A5) — palette-class→model-type derivation is string-based.** `dragData.dragObject.class.replace(/^oci-/, '').replaceAll('-', '_')` assumes the `oci-<type>` palette naming convention. Safe (falls back to `layer.id`), already documented as A5 follow-up. Consider a lookup via the B3 map's `paletteClass` field instead.
- **`OcdTerraformPreview.ts` (A4) — 3× `@ts-ignore` for the dynamic provider registry lookup.** Matches the existing dynamic-registry pattern in the codebase; acceptable. Could be a typed index signature later.
- **`OcdTerraformPreview.ts` — `buildIdTFResourceMap` runs per preview render.** O(n) over all design resources each time; fine for interactive single-resource preview.
- **Pre-existing `console.debug`/`console.info`** remain in `OcdProperties.tsx`/`OcdCanvas.tsx` (not introduced by this work).

## Validation Results

| Check | Result |
|---|---|
| Type check (`tsc -b` via react build) | Pass |
| Lint | Skipped (no root eslint bin; per-package only) |
| Unit tests (`npm test`, vitest) | Pass — 73/73 |
| E2E (`npm run test:e2e`, Playwright) | Pass — 1/1 (Chromium) |
| Python (`pytest -q`) | Pass — 2/2 |
| Build (`npm run build:pages`) | Pass |

## Files Reviewed (substantive, hand-written)
- `ocd/packages/desktop/vite.web.config.mts` — Modified (manualChunks)
- `ocd/packages/react/src/pages/OcdConsole.tsx` — Modified (React.lazy + Suspense)
- `ocd/packages/react/src/landingzone/OcdLzPlacement.ts` — Added (A5 resolver) — clean
- `ocd/packages/react/src/components/OcdCanvas.tsx` — Modified (A5 integration)
- `ocd/packages/export/src/terraform/OcdTerraformPreview.ts` — Added (A4 helper)
- `ocd/packages/react/src/components/OcdProperties.tsx` — Modified (A4 tab) — MEDIUM fixed
- `ocd/packages/codegen/src/importer/data/OciResourceMap.ts` — Modified (A2 curation)
- `ocd/packages/react/vitest.config.mts` + `*/__tests__/*.test.ts` — Added (tests)
- `e2e/playwright.config.ts`, `e2e/specs/lzng-wizard-smoke.spec.ts` — Added (E2E)

Generated/vendored files (160 A2 codegen wrappers, icons) reviewed by pattern-spot-check only — they follow the established generator templates and are reproducible from the tracked source + schema.
