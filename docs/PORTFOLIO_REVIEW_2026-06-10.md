# Portfolio Review & Engineering Roadmap — 2026-06-10

Post-remediation systemic review of `oci-designer-toolkit-fork` (after the 12-batch
remediation + wave-3 follow-ups). Four parallel review passes: subsystem map,
architecture/observability, code-patterns, security. Every finding below is a Task
Card; the confirmed-HIGH + cheap-win subset was executed the same day as **Wave 4**
(marked ✅ DONE). The rest are an ordered backlog.

> Verification note: line numbers verified 2026-06-10; re-verify before editing.
> Hard rules from `SHARED_TASK_NOTES.remediation.md` apply (no real OCIDs/IPs, no
> `npm dedupe`, desktop verify with `tsc -b` not `--noEmit`, no commits without ask).

---

## 1. WORKSPACE MAP (high-level)

```
oci-designer-toolkit-fork/
├── ocd/                      npm-workspaces monorepo (TS)
│   └── packages/
│       ├── core              utils + OcdLogger (structured logging)
│       ├── model             OcdDesign/OcdResource, validators, layout engines
│       ├── parser            hand-rolled Terraform HCL lexer/parser
│       ├── import            terraform/OKIT/draw.io → OcdDesign  ← untrusted input
│       ├── export            OcdDesign → terraform/svg/markdown/excel/RM
│       ├── query             Oci SDK discovery (OciQuery 1,383 ln; concurrency-limited)
│       ├── codegen/-cli      schema → generated model/props/export/validator code
│       ├── react             UI (OcdConsole/OcdCanvas single state tree; facade)
│       ├── web/desktop       Vite web + Electron (main.ts ~960 ln IPC surface)
│       ├── web-server        loopback-only HTTP twin of the desktop IPC facade
│       └── cli               export/query/parse CLI (no tests)
├── scripts/                  Python LZ gen/validate/cost + Node setup-lz updater
├── e2e/                      Playwright smoke specs (static build, not in CI gate)
├── addons/ examples/ docs/   Observability LZ assets + specs
└── .github/workflows/        pages deploy, desktop build, codeql
```

**Two-backend facade**: `react/src/facade/OciApiFacade.ts` switches `window.ocdAPI`
(Electron IPC → `desktop/src/main.ts`) vs `fetch('/api/oci/*')` (→ `web-server`).
Third implicit target = static Pages build with NO backend.

**Structural insight**: nearly every feature touches the same console "seam" files
(OcdConsole, OcdCanvas, Menu, main.ts, OciApiFacade). The two backends re-implement
the same operations twice — the dominant source of correctness drift.

---

## 2. TASK MATRIX

### ✅ DONE — Wave 4 (2026-06-10)

| ID | Title | Severity |
|----|-------|----------|
| T1 | Stored XSS via rehype-raw on design-derived markdown | HIGH (sec) |
| T2 | Architecture-agent SSRF (http allowed when no apiKey) | HIGH (sec) |
| T3 | Azure/Google validation undefined-import ReferenceError | HIGH (code) |
| T4 | Title-bar in-place mutation breaks document identity contract | HIGH (code) |
| T5 | Electron library-fetch path injection + missing content-type guard | MED (sec) |
| T6 | draw.io ReDoS on unclosed `<mxCell>` | LOW (sec) |
| T7 | Canvas inline `setContextMenu` lambda defeats memo (partial) | MED (code) |
| T8 | CI workflow injection via unquoted dispatch input | LOW (sec) — pre-applied |
| T9 | web-server has no rate limiting | MED (sec) — pre-applied |

Details of each in `SHARED_TASK_NOTES.remediation.md` → BATCH 13.

---

### 🔴 OPEN — ordered backlog

---

#### T10 — Facade/backend contract unification (kill the `Promise<void>` lie + error drift)
- **Target**: `react/src/facade/OcdElectronAPI.ts`, `react/src/facade/OciApiFacade.ts`, `desktop/src/main.ts`, `web-server/src/handlers.ts`
- **Issue**: `OcdElectronAPI` types every method `Promise<void>` though all return data; facade is `Promise<any>` throughout; the web path throws clean `Error(body.error)` while the Electron path `reject(new Error(err))` double-wraps already-`Error` values (`"Error: Error: ..."`). No shared contract — a renamed/added field compiles clean and fails at runtime.
- **Blueprint**: (1) Define `interface OcdBackend` in `@ocd/core` (or react/facade) with real per-method return types. (2) Make both `window.ocdAPI` and the web fetch path implement it. (3) In `main.ts` normalize: `reject(err instanceof Error ? err : new Error(String(err)))`. (4) Standardize one error envelope (`{success,data,error}`) and unwrap in a single place. (5) Add a type-level + mocked round-trip contract test asserting both impls satisfy `OcdBackend`.
- **Verify**: `tsc -b` clean with `Promise<any>` removed from facade; contract test passes for every method on both backends; injected field-rename fails the test.
- **Effort**: M

#### T11 — Static-Pages target degrades gracefully (no backend → typed banner, not parse error)
- **Target**: `react/src/facade/OciApiFacade.ts`, query dialog + cost panel, `OcdConsole.tsx` menu gating
- **Issue**: On GitHub Pages (no Node backend) `window.ocdAPI` is undefined and `fetch('/api/oci/*')` returns the SPA `index.html` → `unwrap()` throws `"non-JSON response (HTTP 200)"`. Discovery and pricing both surface an opaque parse error instead of "unavailable in static build".
- **Blueprint**: (1) One cached capability probe `hasBackend = !!window.ocdAPI || (await fetch('/api/oci/health')).ok`. (2) When `!hasBackend`, reject backend-only calls with a typed `BackendUnavailableError`. (3) Surface it as a banner (reuse the Batch-10 WASM-unavailable banner pattern), not a toast. (4) Disable/annotate menu entries that need a backend in static mode.
- **Verify**: built Pages bundle served at a base path → clicking Query / opening cost panel shows the banner, no console parse error; Electron + dev-web unaffected.
- **Effort**: M

#### T12 — Move jsonnet-WASM evaluation off the renderer main thread
- **Target**: `react/src/landingzone/OcdJsonnetWasm.ts`, `OcdLzGenerator.ts`, `OcdLandingZone.tsx`
- **Issue**: go-jsonnet `jsonnet_evaluate_snippet` runs synchronously on the main thread under `setBusy(true)` — the window freezes (spinner can't even animate) for seconds on the 152-file OE bundle, with no timeout, so a pathological config hangs the app.
- **Blueprint**: (1) Move `ensureJsonnetWasm` + `evaluateJsonnet` into a dedicated Web Worker (`new Worker(new URL('./jsonnet.worker.ts', import.meta.url))`), keeping the single-flight cache inside the worker. (2) Post `{filename, code, files, tlaCodes}`, await a message, wrap with a timeout that rejects after N seconds. (3) Keep the `probeJsonnetEngine` banner contract (probe pings the worker). (4) Verify Electron `file://`/asar can instantiate the worker (port the `wasmCandidateUrls` fallbacks).
- **Verify**: LZ generation keeps the UI responsive (spinner animates); a synthetic slow config rejects on timeout with the engine banner; output identical to current for the bundled OE config.
- **Effort**: M→L

#### T13 — `OcdDocument` deep-identity & true immutability (clone shares nested model)
- **Target**: `react/src/components/OcdDocument.ts`, `OcdConsole.tsx`, `OcdCanvas.tsx`
- **Issue**: constructor `this.design = {...design}` copies only the top level; `design.model`/`design.view` stay shared, so add/drag/title handlers mutate the prior document in place. React change-detection only works via top-level identity; there's no real history (forecloses undo/redo) and nested-slice memoization is unreliable. Violates the project immutability rule.
- **Blueprint**: (1) Decide boundary: deep-clone `design` in the constructor (simple, a copy per edit) or adopt structural sharing (immer `produce`). (2) Convert `addXResourceToList` mutators + title onChange to return new model objects. (3) Extend `OcdDocument.cloneTree.test.ts` to assert `clone(doc)` does not share `design.model`/`design.view` references.
- **Verify**: clone-no-share test passes; drag/add/edit/title still work; foundation for undo/redo + nested memo.
- **Effort**: M

#### T14 — Canvas render-cost: memoize derived arrays + stabilize drag handlers
- **Target**: `react/src/components/OcdCanvas.tsx`
- **Issue**: `visibleCoords`/`parentConnectors`/`associationConnectors` recompute every render; `svgDragDropEvents` handlers capture live drag state so the React.memo on `OcdResourceSvg` never holds during interaction (all N SVGs re-render per pointer event). T7 fixed only the `setContextMenu` lambda.
- **Blueprint**: (1) `useMemo` the derived coord/connector arrays keyed on page + design identity (needs T13's fresh identity to be safe). (2) Rewrite drag handlers with a `useRef` holding mutable drag state so the handler closures are stable (`useCallback` with empty deps), making `svgDragDropEvents` memoizable. (3) Throttle drag-driven `setOcdDocument` to `requestAnimationFrame`.
- **Verify**: React DevTools profiler shows unchanged-coord SVGs skip re-render during a drag; drag/drop behavior unchanged.
- **Effort**: M

#### T15 — Renderer + web-server observability (adopt OcdLogger where it still flies blind)
- **Target**: `react/src/**` (379 `console.*`), `web-server/src/server.ts`, `react/src/components/OcdErrorBoundary.tsx`, `eslint.config.js`
- **Issue**: OcdLogger is adopted only in desktop main + query. The renderer (379 raw `console.*`) and web-server bypass it — no level control, no scope, no redaction contract. The ErrorBoundary logs `console.error(error, info)` raw (component stack + possibly design-derived strings). No timing marks on the two genuinely expensive ops.
- **Blueprint**: (1) `OcdLogger.scope('renderer')` in ErrorBoundary `componentDidCatch` (log `error.message` + redacted stack, never raw `info`). (2) Migrate high-traffic files (OcdConsole, OcdCanvas, facades, OcdPropertiesResourceProxy per-render debug). (3) `OcdLogger.scope('web-server')` in server.ts. (4) `performance.now()` timing marks around `queryTenancy`, `queryDropdown`, wasm eval. (5) Add `no-console: warn` to `eslint.config.js`. Proportionate ceiling — NO tracing stack for a desktop+static-web tool.
- **Verify**: ErrorBoundary + web-server emit scoped lines; `OCD_LOG_LEVEL` controls verbosity in renderer; eslint flags new `console.*`; no design JSON/OCIDs in any log.
- **Effort**: M

#### T16 — Extract the dual-backend OCI logic into one shared module (kill duplication + drift)
- **Target**: `desktop/src/main.ts`, `web-server/src/handlers.ts`, new shared module in `@ocd/query` or `@ocd/core`
- **Issue**: The Electron IPC handlers and web-server handlers implement the same operations twice and have **already drifted**: e.g. missing `~/.oci/config` → desktop rejects with a raw message, web-server with a friendly one; empty-profiles → desktop silently resolves `[]` (blank dropdown, no error), web-server throws an actionable message; unknown profile → desktop `{}`, web-server throws.
- **Blueprint**: (1) Extract config-read + profile/region/compartment logic into a shared helper (depends on `oci-common`, already present). (2) Replace both backends' handlers with thin wrappers calling the helper, matching the better (web-server) error shapes. (3) Add the empty-profiles guard to the desktop path. (4) Split `main.ts` into `handlers/` by domain (query/design/export/config/cache — the seam already exists for price-list) behind a single `registerHandler(channel, fn)` wrapper that normalizes errors once. Pairs with T10.
- **Verify**: both backends return identical shapes/messages for the config matrix; `main.ts` reduced to lifecycle + registration; existing flows unchanged.
- **Effort**: M→L

#### T17 — Type the query layer (remove 60+ `Promise<any>` + per-method `@ts-ignore`)
- **Target**: `query/src/OciQuery.ts`, `query/src/OciReferenceDataQuery.ts`
- **Issue**: every `list*` method returns `Promise<any>`, erasing the OCI SDK's typed response interfaces; the concurrency limiter propagates `any` through `queryTenancy`. A renamed API field is caught nowhere. (NOTE: this surface is currently RED from codex's in-flight model regeneration — coordinate.)
- **Blueprint**: (1) Shared helper `extractItems<T>(results: PromiseSettledResult<{items:T[]}>[]): T[]` eliminating both the `any` and the `@ts-ignore` in one pass. (2) Type each method's return as `Promise<T[]>` using the SDK response interfaces. (3) Type `queryTenancy`'s aggregate result.
- **Verify**: `tsc -b` clean with zero `@ts-ignore` in these files; a deliberate field rename fails compilation.
- **Effort**: M

#### T18 — Import/export round-trip + Menu test coverage (currently zero)
- **Target**: new tests in `@ocd/import`, `@ocd/export`, `react/src/components/Menu.ts`
- **Issue**: the product's primary I/O path (terraform/draw.io/OKIT import → model → terraform/excel/markdown export) and the user-facing file ops in `Menu.ts` (loadDesign, importFromTerraform, importFromDrawio, saveDesign) have **zero** automated tests. 349 tests exist but none cover this path.
- **Blueprint**: (1) `@ocd/import` Vitest: ingest a minimal VCN+subnet `.tf` fixture, assert resulting `OcdDesign` fields. (2) `@ocd/export` round-trip: feed that design to `OcdTerraformExporter`, assert key HCL tokens. (3) `Menu.loadDesign`/`importFromTerraform` unit tests with mocked facade, assert OcdDocument state transition. (4) Wire a vitest gate into CI (see T19).
- **Verify**: round-trip test green; coverage of import/export/Menu > 0; CI runs them.
- **Effort**: M

#### T19 — CI quality gates (vitest + tsc + audit + codegen-drift + redaction)
- **Target**: `.github/workflows/pages.yml`, `build-desktop-application.yml`, new `ci.yml`
- **Issue**: no workflow runs vitest, `tsc --noEmit`, `npm audit`, or the redaction gate; CodeQL runs only on schedule. Generated data files are committed but nothing regenerates-and-diffs them, so a model change merged without `npm run generate` ships stale UI silently. (This review surfaced exactly such a drift: codex's `oci-schema.json` regen broke the desktop build with no gate to catch it.)
- **Blueprint**: (1) New `ci.yml` on PR: install → `npm test` → `tsc -b` (react + desktop) → `npm audit --audit-level=high` → `bash scripts/check-redaction.sh`. (2) Codegen-drift job: `npm run compile && npm run generate`, then `git diff --exit-code` over generated paths. (3) Make Pages/desktop builds depend on a fresh `@ocd/react` build (block stale-dist ship). (4) Track the vite-8 migration as a scheduled PR (desktop `moduleResolution: bundler/nodenext`).
- **Verify**: a PR that breaks a test / type / introduces a high vuln / leaves codegen stale fails CI; redaction runs server-side, not just pre-commit.
- **Effort**: M

#### T20 — Supply-chain & misc hardening (setup-lz `:latest`, react strict flags, generated-file hygiene, OcdHelp urlTransform done)
- **Target**: `scripts/setup_landing_zone.mjs`, `react/tsconfig.app.json`, `react/eslint.config.js`, `react/src/components/OcdDocument.ts`
- **Issue**: (a) `setup-lz:latest` clones+vendors+generates upstream default-branch HEAD in one unreviewed step (supply-chain blast radius into compiled `.ts`). (b) react `tsconfig.app.json` disables `noUnusedLocals`/`noUnusedParameters` (would have caught T3). (c) 7.8K/7.4K-line generated data files (`OcdDefaultCache`, `OcdSvgCssData`) are lint-processed and have no documented regen script. (d) `OcdDocument.ts` has 12 `@ts-ignore` masking `find().prop` possibly-undefined chains.
- **Blueprint**: (1) Split `--latest` into "resolve+print new SHA for review" vs "vendor pinned" — never clone-and-vendor unreviewed; keep CI on plain pinned `setup-lz`. (2) Set `noUnusedLocals/Parameters: true`, fix fallout. (3) Add `src/data/**` + generated `resources/generated/**` to eslint `ignores`; document/add regen scripts for the two cache modules (or move to `src/gen/`). (4) Replace `OcdDocument` `@ts-ignore` with `?.` guards / explicit early returns.
- **Verify**: `:latest` no longer vendors in one step; strict flags on with clean build; generated files excluded from lint; no `@ts-ignore` on the find-chains.
- **Effort**: S→M (split into sub-PRs)

---

## 3. CLEAN SURFACES (negative results — worth recording)

- **web-server auth model**: loopback bind + Host-header DNS-rebinding guard + CORS allowlist (no wildcard) + 1 MiB body cap + credential-key stripping are correctly implemented together. (Rate limiting added T9.)
- **draw.io parser**: regex-based, no DOMParser/xmldom → no XXE; no zip/tar extraction. (ReDoS fixed T6.)
- **Terraform/OKIT import**: no eval, no shell, no prototype-pollution sink under V8 JSON.parse semantics.
- **Electron Batch-1 perimeter** (TLS bypass removed, openExternal allowlist, will-navigate guard, nodeIntegration false, save-path validation): all confirmed still in place.
- **CI**: no `pull_request_target`; `id-token: write` correctly scoped to the Pages deploy environment.

---

## 4. RECOMMENDED SEQUENCE

1. **Unblock**: codex resolves the query type-surface break (T17 prerequisite) so `build:pages` is green.
2. **Correctness foundation**: T10 (facade contract) + T13 (document immutability) — they de-risk everything downstream.
3. **Resilience**: T11 (static degradation) + T12 (WASM worker) + T16 (backend unification).
4. **Guardrails**: T19 (CI gates) — do early; it catches the rest's regressions. T18 (I/O tests) feeds it.
5. **Polish**: T14 (canvas perf) + T15 (observability) + T20 (hardening split).
