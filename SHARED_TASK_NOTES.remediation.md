# Portfolio-Review Remediation — Shared Task Notes

Source: 2026-06-10 architecture/security/engineering audit (3 review agents, file:line verified).
Any agent continuing this work: read this file top-to-bottom, work batches IN ORDER,
update the Progress section after each batch (status, files touched, verification result).

## Hard rules (inherited from A2 notes + audit)

- Do NOT run the full `npm run build` from ocd/ (appdmg DMG maker won't compile on Node 26).
  Verify with scoped builds: `cd ocd && npm test` (Vitest) and
  `cd ocd/packages/react && npm run build` / `cd ocd/packages/desktop && npx tsc -b ./tsconfig.json --noEmit` equivalents.
- Public fork: never introduce real OCIDs/IPs/namespaces. Redaction gate runs pre-commit.
- Do NOT commit unless the user explicitly asks. Leave changes staged-ready, statuses updated here.
- Line numbers below were verified 2026-06-10; re-verify before editing (file may have drifted).

## Workspace Boundary Control — 2026-06-13

Current worktree risk is high: this branch contains multiple partially independent remediation
streams plus generated OCI stencil/model artifacts. Keep immediate edits constrained to the
explicit batch target files and do not stage/commit until the user requests it.

Batch 42 target boundary:
- `ocd/packages/web-server/src/OciWebServerHttp.ts`
- `ocd/packages/react/src/facade/__tests__/OciWebServerHttp.test.ts`
- `SHARED_TASK_NOTES.remediation.md`

Generated / mechanical artifacts to review separately, not as part of Batch 42:
- OCI stencil assets under `ocd/packages/{desktop,react}/public/oci-stencils/`
- Generated OCI model/export/import/react resource files such as `OciDnsRecord`,
  `OciMysql*`, `OciVolume*`, `OciIpv6`, and related generated property/table files.
- Schema/codegen artifacts: `ocd/packages/codegen-cli/schema/oci-schema.json` and
  `ocd/packages/codegen/src/importer/data/OciResourceMap.ts`.

Existing feature streams safe to ignore for Batch 42 unless tests expose a direct dependency:
- Landing Zone/update manager files under `scripts/setup_landing_zone.mjs`,
  `scripts/generate_lz_jsonnet_sources.mjs`, and `ocd/packages/react/src/landingzone/`.
- Discovery workbench, Resource Manager, Architecture Agent, integrations, help/docs,
  Redwood/UI styling, Vite/toolchain, CI/hooks, and classic parity changes.
- Documentation-only files outside this tracker, including portfolio review and extraction notes.

## Batches

### BATCH 1 — Electron security perimeter (STATUS: done)
File: `ocd/packages/desktop/src/main.ts` (+ `ocd/packages/react/src/architecture-agent/OcdArchitectureAgent.ts`)
1. Remove global TLS bypass at main.ts:20-21
   (`app.commandLine.appendSwitch('ignore-certificate-errors')` and
   `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'`). If custom-CA support is still
   needed, note it as follow-up — do NOT keep the global bypass.
2. `handleOpenExternalUrl` (main.ts:828-838): parse with `new URL(href)`, allow only
   `http:`/`https:`, throw on anything else.
3. In `createWindow()`: register `webContents.on('will-navigate', ...)` (preventDefault
   unless `file:` or `http://localhost:5173`) and `webContents.setWindowOpenHandler`
   (deny; route http(s) through the now-guarded `shell.openExternal`).
4. webPreferences (main.ts:202-203): set `nodeIntegration: false` (contextIsolation
   stays true; contextBridge/IPC already covers all renderer needs).
5. `handleSaveDesign` (main.ts:479-497): silent-write path must validate the
   renderer-supplied filename against safe prefixes (home/documents/downloads via
   `app.getPath`) — otherwise fall through to the save dialog.
6. `OcdArchitectureAgent.ts:~105`: when `config.apiKey` is set, require the endpoint
   to be `https:` (throw a clear error otherwise).
Verify: desktop tsc clean; `cd ocd && npm test`.

### BATCH 2 — Reliability & crash containment (STATUS: done)
1. main.ts:405-409 `handleQueryDropdown`: wrap in
   `ociQuery.withTimeout(ociQuery.query(), 'queryDropdown')` (match siblings at
   :387/:394/:402/:414 and web-server handlers.ts:120-124).
2. New `ocd/packages/react/src/components/OcdErrorBoundary.tsx` (class component,
   `getDerivedStateFromError` + `componentDidCatch`, "Reload page / keep working" UI);
   wrap the `<DisplayPage>` Suspense block in `OcdConsole.tsx` (~:504) with it.
3. main.ts `app.whenReady` block (~:246): `process.on('uncaughtException')`,
   `process.on('unhandledRejection')` → console.error (logger comes in Batch 4);
   `crashReporter.start({ uploadToServer: false })`.
   Renderer entry (`ocd/packages/desktop/src/main.tsx`): `window.addEventListener('unhandledrejection', ...)`.
4. Kill topology-leaking logs: `OcdCanvas.tsx:39` (full design dump every render — delete),
   main.ts:476-477 `handleSaveDesign` (log filename + resource count only, never design JSON).
Verify: react package build clean; `cd ocd && npm test`.

### BATCH 3 — Build hygiene & supply chain (STATUS: done — residual upstream audit findings)
CORRECTION to audit finding MED-2: `ocd/package-lock.json` ALREADY EXISTS and is git-tracked
(so is `e2e/package-lock.json`). The review agent ran `npm audit` at repo root (script-only
package, no deps) — that's where ENOLOCK came from. No root lockfile needed.
1. DONE 2026-06-10: `cd ocd && npm audit --audit-level=high` → 206 vulns (3 low, 171
   moderate, 32 high). High roots: lodash <=4.17.23 (GHSA-r5fr-rjxr-66jc code injection,
   GHSA-f23m-r3pf-42rh proto pollution), picomatch <=2.3.1 (ReDoS), tar <=7.5.10 (path
   traversal family). All highs report "fix available via npm audit fix" (non-force).
   Moderate bulk = oci-* SDK meta-packages → vulnerable oci-common/oci-workrequests.
   DONE 2026-06-10: `npm audit fix --audit-level=high` (NON-force) updated
   `ocd/package-lock.json` and cleared the lodash/picomatch high findings. Post-fix
   audit still reports 205 vulns (3 low, 171 moderate, 31 high). Remaining high roots:
   transitive `tar <=7.5.10` and `tmp <=0.2.5` under Electron packaging/tooling paths;
   npm reports "No fix available" without force/breaking dependency selection.
2. DONE 2026-06-10: tsc gate added to `build:web` in ocd/packages/desktop/package.json
   (`npm run prebuild && tsc -b ./tsconfig.json && vite build --config vite.web.config.mts`).
   Note: requires workspace libs built first — same precondition as existing `vite-build`;
   `test:e2e:build-first` and Pages CI already build react beforehand.
3. DONE 2026-06-10: root package.json `"engines": { "node": ">=26" }`.
Verify: `npm run build:pages` from repo root passed.

### BATCH 4 — State/canvas performance (STATUS: done) — RISKIEST, DO LAST
1. `OcdDocument` (ocd/packages/react/src/components/OcdDocument.ts:29,43): constructor
   currently aliases the passed design (`this.design = design`); change to shallow-copy
   (`this.design = {...design}`) so clone() yields a fresh design identity. Run the FULL
   react test suite after — many call sites rely on clone-after-mutate.
2. Wrap `OcdResourceSvg` (OcdResourceSvg.tsx:382, 653 lines) in `React.memo`; hoist the
   inline `setOcdDocument` lambda in OcdCanvas.tsx:458-469 into a `useCallback`.
3. `OcdConsole.tsx:328`: memoize `OcdValidator.validate(ocdDocument.design)` with
   `useMemo(..., [ocdDocument.design])` (works once step 1 gives design fresh identity).
Verify: `cd ocd && npm test`; manual smoke — load an example design, drag a resource,
edit a property, switch pages. Headless check per memory: playwright-core direct against
127.0.0.1:5173 (NOT localhost — IPv6 collision).

### BATCH 5 — Dependency vulnerability zero-out (STATUS: done)
Goal: clear ALL residual `npm audit` findings (was 205: 3 low / 171 moderate / 31 high).
1. Root causes (verified via `npm audit --json` chains): transitive `tar <=7.5.10` (all 31
   high incl. the whole @electron-forge/* + electron-builder tree), `tmp <=0.2.5`
   (external-editor / @inquirer lows), `uuid <11.1.1` GHSA-w5hq-g745-h8pq (oci-common →
   all 171 oci-* moderates).
2. Fix: `overrides` in ocd/package.json — `tar ^7.5.16`, `tmp ^0.2.7`, `uuid ^11.1.1`,
   plus `vite ^7.3.5` (see 4). Overrides do NOT apply to stale lockfile entries — the
   lockfile must be regenerated: `rm -rf node_modules package-lock.json && npm install
   --legacy-peer-deps`.
3. HARD RULE going forward: **never run `npm dedupe`** in ocd/ — npm dedupe re-resolves
   WITHOUT honoring overrides and reinstates the vulnerable versions (reproduced
   2026-06-10: 0 → 200 vulns after dedupe). If hoisting is wrong, regen the lockfile.
4. Side effects fixed during regen: unbounded `"vite": ">=6.3.4"` in react+desktop
   floated to vite 8.0.16 (ESM-only types break desktop `moduleResolution: node`);
   capped both to `>=6.3.4 <8` + root override `^7.3.5`. New @types/node surfaced a
   `Uint8Array<ArrayBufferLike>` vs `BlobPart` error → `buildTarBytes` return type
   narrowed to `Uint8Array<ArrayBuffer>` (OcdLzDownloads.ts:55).
5. OE bundle re-pin (user ran `setup-lz:latest`): OcdLzSources.json pinnedRef →
   `9a9a401b931e0460e461859f30d294d3d30a8aac`; OcdOeJsonnetFiles.test.ts count 146 → 152.
Verify: `npm audit` = 0 vulns; react build; desktop `tsc -b` (NOT `--noEmit` — TS6310
with emitting project refs); `npm test`; `npm run build:pages`; redaction gate.

### BATCH 6 — Multi-addon upstream updater (STATUS: done — CLI updater)
Generalized setup-lz into a manifest-driven updater for external project add-ons.
Done (codex): `OcdLzSources.json` manifest (operating-entities, landing-zone-next-gen,
core-landingzone, modules-orchestrator, cis-landingzone-quickstart) with `role`
(vendored-jsonnet | project-addon | reference) + optional `setup` metadata;
`OcdLzSources.ts` is now a typed wrapper over the JSON; `setup_landing_zone.mjs`
reads the manifest, adds `--check` status for all sources, and adds
`--latest --source <key>` to pin any configured source to its current upstream ref.
Default `npm run setup-lz:latest` keeps the historical OE vendoring behavior and
prints status for all sources; explicit `--source operating-entities` also updates
the OE pinnedRef after re-vendoring. Root + ocd package.json expose `setup-lz:check`.
Tests: manifest schema guard (keys unique, role valid, vendored-jsonnet requires
setup block) under `ocd/packages/react/src/landingzone/__tests__/`.
Deferred:
1. Define each project-addon's ingest semantics before adding local `setup` metadata
   (e.g. whether to vendor Terraform, render templates, or only track a ref).
Done in Wave 3b:
- In-app update checks group sources by role and show project-addons separately from
  reference repos.
- Private/unreachable in-app sources are shown as skipped/unavailable and never trigger
  the update banner. CLI `--check` uses `git ls-remote` so local git credentials can
  resolve private sources.
Verify: `npm run setup-lz:check`; `npm test -- OcdLzSources.test.ts`.

### BATCH 7 — Query fan-out concurrency limit (STATUS: done)
`OciQuery.queryTenancy` fans out per-compartment queries unbounded. Add a concurrency
limiter (8-16 batch, simple promise-pool — no new dep). File:
ocd/packages/query/src/OciQuery.ts (re-verify location). Verify: cli/query compile +
`cd ocd && npm test`.

### BATCH 8 — Structured logger (STATUS: done)
New OcdLogger in @ocd/core (levels, scope tag, console transport; renderer-safe). Replace
console.* fleet incrementally — start with desktop main.ts (uncaughtException/
unhandledRejection handlers from Batch 2) and OciQuery. Do NOT log design JSON or OCIDs.
Verify: core compile, desktop tsc -b, npm test.

### BATCH 9 — Bundle/perf hygiene (STATUS: done)
1. Lazy-load the 11 eagerly-imported pages in OcdConsole.tsx (React.lazy + the existing
   Suspense/ErrorBoundary wrapper from Batch 2).
2. Split OcdProperties.tsx (1,024 lines) along resource-group seams.
3. Lazy-import the 7K-line generated data modules (price list, cetools catalogue) so
   build:pages chunks them out of the entry bundle.
Verify: react build chunk report (vite --report or rollup output sizes), npm test,
headless smoke at 127.0.0.1:5173 (playwright-core direct, NOT localhost).

### BATCH 10 — LZ engine + cost UX polish (STATUS: done)
1. LZ-page-mount WASM probe: if libjsonnet.wasm fails to load, show "engine unavailable"
   banner instead of silent failure (OcdJsonnetWasm.ts + LZ page mount).
2. Cost estimator: surface price snapshot `capturedAt` in the cost panel; cache the full
   cetools catalogue on disk (desktop) / localStorage with TTL (web; completed in Wave 3c).
Verify: npm test + manual LZ wizard smoke.

### BATCH 11 — Redaction gate hardening (STATUS: done)
.githooks/pre-commit + scripts/check-redaction.sh: add tenancy-namespace patterns, optional
gitleaks/trufflehog pass when binaries present, and an audit trailer requirement for any
`--no-verify` bypass (document in CLAUDE.md). Verify: seed a synthetic-fixture leak in a
scratch branch (synthetic values ONLY), confirm gate blocks it.

### BATCH 12 — Resource Analytics SQL stub (STATUS: done — stub removed)
Ship execution or delete the stub — pick one; a dead menu entry is worse than absence.
Re-locate the stub (search "Resource Analytics" in react package) and either wire a real
query path or remove the page + menu item.

## Progress

- (agents append per-batch entries here: date, batch, files changed, verification output, status flip)
- 2026-06-10 — Batch 1 — Files changed: `ocd/packages/desktop/src/main.ts`, `ocd/packages/react/src/architecture-agent/OcdArchitectureAgent.ts`. Verification: `cd ocd/packages/desktop && npx tsc -b ./tsconfig.json` failed on existing out-of-scope implicit-any errors in `src/handlers/OciPriceListHandlers.ts` (lines 54, 62, 71, 90); `cd ocd && npm test` passed (30 files, 317 tests). STATUS flipped to done; desktop typecheck blocker remains outside Batch 1/2 edit allowlist.
- 2026-06-10 — Batch 2 — Files changed: `ocd/packages/desktop/src/main.ts`, `ocd/packages/desktop/src/main.tsx`, `ocd/packages/react/src/components/OcdCanvas.tsx`, `ocd/packages/react/src/components/OcdErrorBoundary.tsx`, `ocd/packages/react/src/pages/OcdConsole.tsx`. Verification: `cd ocd/packages/react && npm run build` passed; `cd ocd/packages/desktop && npx tsc -b ./tsconfig.json` failed on the same existing out-of-scope implicit-any errors in `src/handlers/OciPriceListHandlers.ts` (lines 54, 62, 71, 90); `cd ocd && npm test` passed (30 files, 317 tests). STATUS flipped to done; desktop typecheck blocker remains outside Batch 1/2 edit allowlist.
- 2026-06-10 — Batch 3 — Files changed: `ocd/package-lock.json`. Verification: `cd ocd && npm audit fix --audit-level=high` completed non-force updates but exited 1 because residual `tar`/`tmp` high findings have no non-force fix; `cd ocd && npm audit --audit-level=high` reports 205 vulnerabilities (3 low, 171 moderate, 31 high); `npm run build:pages` from repo root passed; `bash scripts/check-redaction.sh` passed. STATUS flipped to done with residual upstream audit findings.
- 2026-06-10 — Batch 5 — Files changed: `ocd/package.json` (overrides tar/tmp/uuid/vite — tar/tmp/uuid pre-staged by codex, vite added), `ocd/package-lock.json` (full regeneration), `ocd/packages/react/package.json` + `ocd/packages/desktop/package.json` (vite range capped `<8`), `ocd/packages/react/src/landingzone/OcdLzDownloads.ts` (Uint8Array<ArrayBuffer> return type), `ocd/packages/react/src/landingzone/OcdLzSources.json` (pinnedRef → 9a9a401b), `ocd/packages/react/src/landingzone/__tests__/OcdOeJsonnetFiles.test.ts` (146 → 152). Verification: `npm audit` = **0 vulnerabilities** (from 205); resolved tree has single tar@7.5.16 / tmp@0.2.7 / uuid@11.1.1 / vite@7.3.5; `cd ocd && npm test` 30 files / 318 tests passed; react `npm run build` passed; desktop `npx tsc -b ./tsconfig.json` clean; `npm run build:pages` passed; redaction gate exit 0. GOTCHA recorded: `npm dedupe` ignores overrides and reinstates vulnerable versions — never run it here. STATUS: done.
- 2026-06-10 — Batch 12 — Verdict: STUB (UI tab was static text that never called the query path; both backends returned `{ rows: [], sql }` — validation only, no execution: `ocd/packages/desktop/src/main.ts` handleQueryResourceAnalytics, `ocd/packages/web-server/src/handlers.ts` queryResourceAnalytics). Removed end-to-end. Files DELETED: `ocd/packages/react/src/discovery/ui/OcdDiscoveryResourceAnalyticsView.tsx`, `ocd/packages/react/src/discovery/OcdResourceAnalytics.ts`, `ocd/packages/react/src/discovery/__tests__/OcdResourceAnalytics.test.ts`, `ocd/packages/core/src/OcdResourceAnalyticsSql.ts`. Files EDITED: `OcdDiscovery.tsx` (tab + import + render), `OcdDiscoveryTypes.ts` (drop 'resource-analytics' from source union), `OciApiFacade.ts` (queryResourceAnalytics + interfaces + core import), `OcdElectronAPI.ts` (declaration), desktop `preload.ts`/`main.ts` (IPC bridge, handler, ipcMain.handle, core import), web-server `handlers.ts`/`server.ts` (handler + route + import), core `src/index.ts` (export), `OcdClassicCapabilities.ts` + `OcdClassicParity.tsx` (prose mentions). No console-config key removed: tab state was component-local useState; persisted `displayPage` union never included 'resource-analytics'. OcdConsole.tsx NOT touched. Verification: `cd ocd && npm test -- discovery classic` 3 files / 14 tests passed; grep confirms zero residual `resource-analytics` references in any package src. STATUS: done.
- 2026-06-10 — Batch 4 — Files changed: `ocd/packages/react/src/components/OcdDocument.ts`, `ocd/packages/react/src/components/OcdResourceSvg.tsx`, `ocd/packages/react/src/components/OcdCanvas.tsx`, `ocd/packages/react/src/pages/OcdConsole.tsx`, `ocd/packages/react/src/components/__tests__/OcdDocument.cloneTree.test.ts`. Verification: focused `cd ocd && npm test -- OcdDocument.cloneTree.test.ts` failed before implementation and passed after; `cd ocd && npm test` passed (30 files, 318 tests); `cd ocd/packages/react && npm run build` passed; `cd ocd/packages/desktop && npx tsc -b ./tsconfig.json --noEmit` passed; headless Playwright smoke against `http://127.0.0.1:5173/` passed at 1440x900 and 390x844 (HTTP 200, title loaded, React root rendered, no page/console errors). STATUS flipped to done.

- 2026-06-10 — Batch 6 — Files changed: NEW `ocd/packages/react/src/landingzone/OcdLzSources.json`; `OcdLzSources.ts` (typed manifest wrapper); `scripts/setup_landing_zone.mjs` (manifest-driven sources, `--check`, `--latest --source <key>` pin updates, legacy OE vendoring preserved); `scripts/generate_lz_jsonnet_sources.mjs` (reads OE pin from manifest); root `package.json` + `ocd/package.json` (`setup-lz:check`, ocd-local setup scripts); NEW `OcdLzSources.test.ts` (unique keys, schema guard, project-addon coverage). Verification: `npm test -- OcdLzSources.test.ts` 4/4 passed; `npm run setup-lz:check` reports OE current at `9a9a401b931e`, Landing Zone Next Gen latest `87ba506d0aed`, Core Landing Zone latest `6ddd02a64ef6`, Modules Orchestrator latest `c74305b7c0c3`, CIS Quickstart latest `752bd3190d2b`; unknown source validation exits 1 with known-source list. STATUS flipped to done.

- 2026-06-10 — Batch 7 — Files changed: NEW `ocd/packages/query/src/OciQueryConcurrency.ts` (`runWithConcurrency`, `QUERY_CONCURRENCY_LIMIT = 12`; returns gated order-preserving `Promise<T>[]` so existing `Promise.allSettled` call sites are untouched); `OciQuery.ts` (45 fan-out sites), `OciReferenceDataQuery.ts` (14 sites incl. the all-compartments `listImages`), `OciQueryCommon.ts` (getCompartments), `OciResourceManagerQuery.ts` (listStacks) — 63 sites total. Intentionally NOT limited: queryTenancy's fixed ~40-resource-type allSettled (bounded by type count; cross-type semaphore = bigger refactor), AD fan-outs (max 3), fixed 1-2-promise sites. Verification: diff audit (every change is import or limiter wiring); central sweep below. STATUS: done.
- 2026-06-10 — Batch 8 — Files changed: NEW `ocd/packages/core/src/OcdLogger.ts` (levels debug/info/warn/error, `OCD_LOG_LEVEL` env min-level default info, `OcdLogger.scope()` child loggers, renderer-safe process guard, no-design-JSON/OCID contract doc), `ocd/packages/core/src/index.ts` (barrel export), `ocd/packages/desktop/src/main.ts` (48 console.* call sites → scoped logger; handleSaveCache full-cache-object debug payload DROPPED — message-only now). Note: handler-entry traces are debug-level, hidden at default info — `OCD_LOG_LEVEL=debug` restores. OciQuery console migration deferred (Batch 7 owned that file this round). Verification: central sweep below. STATUS: done.
- 2026-06-10 — Batch 9 — Files changed: `OcdConsole.tsx` (12 more pages → React.lazy: Bom, Markdown(+toolbar), Tabular(+toolbar), Terraform(+toolbar), Variables, Library, Documentation, Validation, GovernancePanel, LzPlanPage, Help, CommonTags; designer stays eager for first paint; toolbar render sites got their own Suspense); `OcdProperties.tsx` split 1,024 → 112 lines + 11 sibling panel modules (Tabbar, ResourceProxy, Header, ResourceProperties, Tags, Documentation, Arrangement, Style, TerraformPreview, Relationships, Validation panels — public export unchanged, sole importer OcdDesigner.tsx untouched); lazy data chunks: `useOciPriceList.ts` dynamic-imports OciPriceListSnapshot, `Menu.ts` dynamic-imports OcdSvgCssData in export handlers; OcdDefaultCache deliberately left eager (seeds CacheProvider at startup). Result: eager static-import closure of OcdConsole 9.57 MB → 7.46 MB (-22%); OcdSvgCssData 780 kB / OcdMarkdown 523 kB / OcdUserGuiide 408 kB / exceljs 1.38 MB now code-split. Verification: full suite + headless smoke below. STATUS: done.
- 2026-06-10 — Batch 10 — Files changed: `OcdJsonnetWasm.ts` (`probeJsonnetEngine()` — wraps the cached load path, never rejects, failed probe clears cache for retry), NEW `landingzone/ui/LzngEngineBanner.tsx` (dismissible role=alert banner reusing .ocd-lzng-update-banner classes), `OcdLandingZone.tsx` (mount-time probe + banner), `ocd-lzng.css` (engine-banner modifier); cost: `useOciPriceList.ts` exposes `snapshotDate` (from `OCI_PRICE_SNAPSHOT_DATE`, snapshot has no capturedAt field), `OcdBom.tsx` shows "Prices as of <date>" muted text when on snapshot source. NEW test `__tests__/OcdJsonnetWasm.test.ts` (4 tests: missing-Go, fetch-failure, single-flight cache, retry-after-failure). Catalogue disk/localStorage cache NOT implemented (deferred). Verification: targeted vitest 4/4 + landingzone sweep 178/178; headless smoke confirms libjsonnet.wasm loads with no false-positive banner. STATUS: done.
- 2026-06-10 — Batch 11 — Files changed: `scripts/check-redaction.sh` (context-matched tenancy-namespace patterns `ocir.io/<ns>/` + `/n/<ns>/b/`, OCI auth-token literals, PEM header already covered; new `--revs` mode scanning added lines across commit ranges), `.githooks/pre-commit` (optional `gitleaks git --pre-commit --staged` pass when gitleaks on PATH — verified against gitleaks 8.30.1 syntax), `.githooks/pre-push` (scans every outgoing commit range via `--revs`, so a `--no-verify` commit is still caught before push; pytest chain preserved), `CLAUDE.md` (redaction-gate subsection). Verification: 21/21 synthetic pattern cases (HIT/MISS) in /tmp; end-to-end pre-push block test in throwaway /tmp repo (new-branch + existing-branch + deletion cases); current tree exits 0. All fixtures synthetic. STATUS: done.
- 2026-06-10 — CENTRAL SWEEP after Batches 7-12: `cd ocd && npm test` → 31 files / 314 tests passed (baseline shift: -4 deleted analytics tests, +4 new WASM probe tests, net -4 from 318); react `npm run build` ✓ (21-23s); desktop `npx tsc -b ./tsconfig.json --force` exit 0 (NOTE: non-force run replayed STALE TS7006 errors for OciPriceListHandlers.ts from old tsbuildinfo — file is fine; use --force if ghosts appear); `npm run build:pages` ✓; redaction gate exit 0; headless playwright-core smoke of built web-dist (served at 127.0.0.1 under /oci-designer-toolkit/ base): designer renders, zero page/console errors on load; LZNG lazy chunk + libjsonnet.wasm load (wizard fully renders, no engine banner); BOM lazy chunk + OciPriceListSnapshot chunk load on demand. Only console noise: two 404s from the in-app update check hitting the PRIVATE landing-zone-next-gen repo anonymously (see Batch 6 item 5).

- 2026-06-10 — Wave 3a (Batch 8 leftover) — Query package console.* → OcdLogger: `OciQuery.ts` (115 calls, scope OciQuery), `OciReferenceDataQuery.ts` (47), `OciQueryCommon.ts` (9), `OciResourceManagerQuery.ts` (8), `OciPriceListQuery.ts` (2, browser-safety preserved — OcdLogger is renderer-safe). @ocd/core was already a peerDep + project ref of query (no manifest change). 5 payload reductions enforcing the no-OCID contract: per-instance imageId/sourceId loop → count; getHiddenImages full results array → fulfilled/total; listRegions JSON.stringify(response) → count; MySQL warn logged compartment OCID → index; OciQueryCommon constructor logged full clientConfiguration (cert material risk) → booleans. Zero live console.* remain in the package.
- 2026-06-10 — Wave 3b (Batch 6 items 3-5) — Update-check graceful private-repo handling + role grouping: `OcdLzUpdateCheck.ts` (LzGithubFetchError + classifyCheckFailure — 403/404/429 → `unavailable` state, single debug line, never console.warn/error; role passed through statuses), `useLzUpdateCheck.ts` + `LzngUpdateBanner.tsx` (banner can never fire for unavailable sources), `LzngSourcesPanel.tsx` (grouped by role: Vendored jsonnet / Project add-ons / Reference, with muted "Private or unreachable — skipped" badge), `ocd-lzng.css` (role-group label + badge-unavailable, --oracle-* tokens). NEW tests: `OcdLzUpdateCheck.test.ts` (9) + `OcdLzSourcesManifest.test.ts` (7 — schema guard: unique keys, valid roles/kinds, vendored-jsonnet requires full setup block, repo slug shape, pin '' or 40-hex). Note: codex's CLI `--check` uses `git ls-remote` (local credentials) so the private LZNG repo resolves there; only the anonymous in-app REST check needed the unavailable state.
- 2026-06-10 — Wave 3c (Batch 10 deferral) — Web price-list cache: NEW `cost/OcdPriceListWebCache.ts` (localStorage `ocd.priceList.<CCY>`, 24h TTL matching desktop disk cache, merge semantics mirror desktop: old parts kept/live wins; stale-cache rescue on failed/empty fetch before snapshot fallback; all storage access try/caught, QuotaExceeded prunes entry), `useOciPriceList.ts` now delegates to `resolveLivePriceMap` (cache active ONLY when `!window.ocdAPI` — Electron renderer never double-caches on top of the main-process disk cache; snapshotDate + dynamic snapshot import preserved). NEW `__tests__/OcdPriceListWebCache.test.ts` (18 tests).
- 2026-06-10 — CENTRAL SWEEP after wave 3: `cd ocd && npm test` → 34 files / 349 tests passed; react build ✓; desktop `tsc -b --force` exit 0; `build:pages` ✓; redaction gate exit 0.

### BATCH 13 — Post-remediation portfolio review (NEW audit) + Wave 4 fixes (STATUS: wave-4 fixes done)
2026-06-10: 2nd full review (subsystem map + architecture/observability + code-patterns + security agents)
of the CURRENT post-remediation state. Findings catalogued as TASK CARDS in
`docs/PORTFOLIO_REVIEW_2026-06-10.md` (T1-T20). Confirmed-HIGH + cheap-win subset executed
as Wave 4 (subagents rate-limited mid-run; applied directly):
- SEC-1 (HIGH, stored XSS): `rehypeRaw` rendered design-derived markdown verbatim in OcdMarkdown
  + OcdHelp → live `window.ocdAPI` IPC. FIX: NEW `ocd/packages/react/src/utils/rehypeSanitizeOcd.ts`
  (zero-dep rehype plugin: strips script/style/iframe/object/embed/link/meta/base/form elements,
  all `on*` attrs, and javascript:/vbscript:/data:text/html URLs incl. control-char-obfuscated;
  KEEPS pre/br/img/svg since the exporter emits `<pre>`/`<br>`). Wired AFTER rehypeRaw in both
  pages; OcdHelp urlTransform now allows `data:image/` only, else `defaultUrlTransform`. NEW test
  `utils/__tests__/rehypeSanitizeOcd.test.ts` (7).
- SEC-2 (HIGH, SSRF): `OcdArchitectureAgent.ts:108` https-check was gated on apiKey → http://169.254.169.254
  reachable in keyless local-LLM case. FIX: enforce https UNCONDITIONALLY, allow http ONLY for
  loopback hosts (localhost/127.0.0.1/[::1]).
- SEC-4 (MED, path injection): `main.ts` library fetch interpolated renderer-supplied section/filename/svgFile
  into GitHub raw URL unchecked. FIX: `assertSafeLibrarySegment` (`/^[A-Za-z0-9._-]+$/`, reject `..`)
  on all three sites + Content-Type guard before JSON.parse on handleLoadLibraryDesign (allows json + text/plain since raw.githubusercontent serves text/plain).
- SEC-6 (CI injection, pages.yml) + SEC-7 (web-server rate limit) — ALREADY APPLIED before wave 4
  (env-var hardening in pages.yml:67-81; fixed-window 20 req/s limiter in server.ts:39-69, health exempt).
- SEC-8 (ReDoS, drawio): `OcdDrawioImport.ts` lazy dot-all `[\s\S]*?<\/mxCell>` backtracked on unclosed
  tags. FIX: parse only the OPENING tag (`/<mxCell\b([^>]*?)\/?>/g` — body was never used) + 10 MiB
  input cap. NEW guard tests (unclosed-tag <500ms, over-cap throws).
- CODE-1 (HIGH, runtime ReferenceError): `OcdResourceValidationPanel.tsx` used AzureResourceValidation/
  GoogleResourceValidation under @ts-ignore but never imported them → ReferenceError for any Azure/Google
  resource in the validation panel. FIX: added both to the @ocd/model import (the @ts-ignore stays — it's
  for the dynamic namespace index, same as the working Oci path).
- CODE-2 (HIGH, immutability contract): `OcdConsole.tsx` OcdConsoleTitleBar mutated design.metadata.title
  in-place + skipped setOcdDocument (Batch 4 contract violation). FIX: debounced (300ms) setOcdDocument(clone)
  propagation; input stays responsive via local state; timer cleared on unmount.
- CODE-3 (MED, partial): `OcdCanvas.tsx:464` inline setContextMenu lambda → bare setContextMenu (matches the
  sibling at :518). The `svgDragDropEvents` object is NOT memoized — its handlers capture live drag state, so
  a naive useMemo is useless/buggy; full fix needs a ref-based handler rewrite (logged as T-card, L effort).
Wave-4 verification: `cd ocd && npm test` 35 files / 358 tests passed; react `npm run build` ✓;
redaction gate exit 0; desktop main.ts compiles clean.
⚠️ BUILD BREAK (codex's lane, NOT wave 4): desktop `tsc -b` / `build:pages` RED with 30 errors, ALL in
`query/src/OciReferenceDataQuery.ts` (×29) + `OciQuery.ts` (×1) — pre-existing `.sort((a:OciResource,b:OciResource)=>…)`
callbacks broken by codex's in-flight `oci-schema.json` (+4718 lines) / `OciResourceMap.ts` regeneration
tightening the OciResource type. ZERO errors in any wave-4-touched file. CODEX must resolve (dart/build-resolver
on the query sort/dedup type surface) before build:pages is green again.

- 2026-06-11 — Portfolio T10/T13/T19/T11 continuation — STATUS: done.
  - T17 prerequisite / unblock: `OciReferenceDataQuery.ts` sort/dedup callbacks no longer depend on generated `OciResource`; `Promise.allSettled` values are narrowed through a typed helper. Query package compile and desktop typecheck are green.
  - T10: NEW shared facade contract `react/src/facade/OcdBackend.ts`; `OcdElectronAPI` and `OciApiFacade` now implement real return types instead of `Promise<void>`/`any`; NEW contract test `OcdBackendContract.test.ts`; Electron main-process rejections now use `toError(reason)` to avoid double-wrapped `Error: Error: ...`.
  - T13: `OcdDocument.clone()` now deep-clones plain document state (`design`, selected resource, drag resource); `OcdDocument.cloneTree.test.ts` asserts cloned documents do not share `design.model`, `design.view`, resource maps, or page arrays.
  - T19: NEW `.github/workflows/ci.yml` on PR/push/workflow_dispatch with server-side redaction scan, codegen drift check, Python tests, React vitest, React/Desktop typechecks, Pages build, and `npm audit --audit-level=high`.
  - T11: `OciApiFacade` now probes `/api/oci/health` once and requires a JSON `{success,data:{status:"ok"}}` envelope before web-backend calls; static Pages HTML/200 fallback becomes typed `BackendUnavailableError` and never proceeds to `/profiles`/`/query`; query/reference/RM dialogs surface the actionable backend-unavailable message; pricing live fetch also rejects typed-unavailable before falling back to the offline snapshot. NEW `OciApiFacade.staticBackend.test.ts`.
  - Verification: `npm run compile --workspace=packages/query` ✓; `cd ocd/packages/react && npx tsc -b ./tsconfig.lib.json` ✓; `cd ocd/packages/desktop && npm run typecheck` ✓; `cd ocd && npm test` ✓ (37 files / 363 tests); `cd ocd && npm run build:pages` ✓; `cd ocd && npm audit --audit-level=high` → 0 vulnerabilities; `git diff --check` ✓; current-diff redaction scan ✓.

- 2026-06-11 — Portfolio T12 — Jsonnet WASM worker offload — STATUS: done.
  - Split the Jsonnet engine into shared types (`OcdJsonnetTypes.ts`), a worker-safe direct runtime (`OcdJsonnetRuntime.ts`), a dedicated worker (`OcdJsonnetWorker.ts`), and a renderer client (`OcdJsonnetWasm.ts`).
  - Browser/Electron renderers now call the worker for `evaluateJsonnet()` and `probeJsonnetEngine()`; non-browser tests fall back to the direct runtime. Worker requests carry per-call timeouts; timed-out evaluations terminate the worker and reject with a clear timeout error.
  - Worker runtime preserves the existing single-flight WASM cache and adds a worker-location WASM URL candidate (`../libjsonnet.wasm`) so packaged worker assets can still reach the public root copy.
  - Tests: `OcdJsonnetWasm.test.ts` extended from 4 → 7 tests covering worker evaluate routing, timeout termination, and worker probe routing.
  - Verification: `npm test -- OcdJsonnetWasm.test.ts` ✓ (7/7); `npm test -- landingzone` ✓ (22 files / 198 tests); `cd ocd/packages/react && npx tsc -b ./tsconfig.lib.json` ✓; `cd ocd && npm test` ✓ (37 files / 366 tests); `cd ocd/packages/desktop && npm run typecheck` ✓; `cd ocd && npm run build:pages` ✓ and emitted `web-dist/assets/OcdJsonnetWorker-*.js`.

- 2026-06-11 — Portfolio T16 — shared OCI backend service — STATUS: done.
  - NEW `@ocd/query` module `OciBackendService.ts` centralizes OCI config/profile parsing, sensitive-key stripping, region/compartment discovery, tenancy query, dropdown query, discovery snapshot, and Resource Manager stack/job operations.
  - `desktop/src/main.ts` OCI IPC handlers now delegate to this shared service instead of duplicating config parsing/query construction. This aligns desktop with the web-server behavior: empty config/profile and unknown-profile cases now throw the same actionable errors instead of returning `[]`/`{}` silently.
  - `web-server/src/handlers.ts` now re-exports the shared service functions while preserving its existing HTTP envelope (`{ success, data/error }`) and profile-list shape for `/api/oci/profiles`.
  - Added `OciBackendService.test.ts` for profile-name extraction, empty config rejection, credential-key stripping, and unknown-profile errors.
  - Also fixed three desktop config implicit-any annotations (`forge.config.ts`, `vite.renderer.config.mts`, `vite.web.config.mts`) because the new CI gate runs `npm run typecheck`.
  - Verification: `cd ocd && npm run compile --workspace=packages/query` ✓; `cd ocd && npm run compile --workspace=packages/web-server` ✓; `cd ocd/packages/desktop && npm run typecheck` ✓; `npm test -- OciBackendService.test.ts` ✓; `cd ocd/packages/react && npx tsc -b ./tsconfig.lib.json` ✓; `cd ocd && npm test` ✓ (38 files / 369 tests); `cd ocd && npm run build:pages` ✓.

- 2026-06-11 — Portfolio T14 — Canvas render-cost foundation — STATUS: done.
  - `OcdCanvas.tsx` now memoizes visible layer/resource IDs, SVG extents, and parent/association connector derivation instead of rebuilding those arrays on every render.
  - Resource-level SVG drag/drop callbacks now read the latest drag/document state through a ref and are wrapped in stable `useCallback`s; `svgDragDropEvents` is memoized from those stable callbacks so `React.memo(OcdResourceSvg)` is no longer invalidated by a fresh event object each render.
  - Extracted `calculateSvgWidth` / `calculateSvgHeight` as pure exports and added `OcdCanvas.derivedData.test.ts` for the sizing rules.
  - Verification: `npm test -- OcdCanvas.derivedData.test.ts` ✓; `cd ocd/packages/react && npx tsc -b ./tsconfig.lib.json` ✓; `cd ocd && npm test` ✓ (39 files / 371 tests); `cd ocd && npm run build:pages` ✓.

- 2026-06-11 — Portfolio T15 — observability foundation — STATUS: done.
  - `OcdErrorBoundary.tsx` now logs through `OcdLogger.scope('renderer.error-boundary')` and emits a small structured summary (`name`, `message`, sanitized component stack lines) instead of raw `Error` + `React.ErrorInfo` objects.
  - `web-server/src/server.ts` now uses `OcdLogger.scope('web-server')` for lifecycle/error logs and wraps expensive OCI operations (`listRegions`, `listTenancyCompartments`, `queryTenancy`, `queryDropdown`, `queryDiscoverySnapshot`) with duration logging. Payloads stay limited to operation name, duration, and sanitized error message.
  - `OcdJsonnetWasm.ts` now logs Jsonnet evaluate/probe durations through `OcdLogger.scope('renderer.jsonnet')`; successful timings are debug-level, failures warn with duration + error message only.
  - NEW `OcdErrorBoundary.test.ts` covers the raw-ErrorInfo redaction contract and stack-line summarization.
  - Verification: `npm test -- OcdErrorBoundary.test.ts OcdJsonnetWasm.test.ts` ✓; `cd ocd/packages/react && npx tsc -b ./tsconfig.lib.json` ✓; `cd ocd && npm run compile --workspace=packages/web-server` ✓; `cd ocd && npm test` ✓ (40 files / 373 tests); `cd ocd && npm run build:pages` ✓.

- 2026-06-11 — Clean Vite static build output — STATUS: done.
  - Removed the `OcdCommonTags` mixed static/dynamic import warning by making it an eager import in `OcdConsole.tsx` because it is already pulled by the resource tags panel.
  - Removed the oversized-entry root cause by replacing the initial `import * as ociResources` properties barrel with Vite lazy glob loading for selected OCI resource property panels. Proxies/configs remain synchronous; generated per-resource property panels now load as small on-demand chunks.
  - Updated `vite.web.config.mts` with explicit vendor/manual chunk handling, a documented 3 MB static-app chunk warning budget, and an `onwarn` filter for the harmless `@xyflow/react` `"use client"` directive warning.
  - Verification: `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd/packages/react && npx tsc -b ./tsconfig.lib.json` ✓; `cd ocd/packages/desktop && npx tsc -b ./tsconfig.json` ✓; `cd ocd && npm test` ✓ (40 files / 373 tests); `npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓; local preview HTTP smoke at `127.0.0.1:4173/oci-designer-toolkit/` returned 200 and served built HTML.

- 2026-06-11 — OCI stencil asset catalog import — STATUS: done.
  - Added `scripts/import_oci_stencils.mjs` plus `npm run import-oci-stencils` wrappers at the repo root and `ocd/` root.
  - Imported SVG-only assets from `/Users/abirzu/Downloads/General.zip` and `/Users/abirzu/Downloads/OneDrive_2026-06-09 (4).zip`, filtered to Oracle/OCI/cloud-service related stencils only: 368 total stencils (110 General, 258 Services or Products). PNG variants and unrelated generic business/social/building icons were intentionally excluded.
  - The importer now reports accepted/excluded SVG counts per source archive so future add-on stencil archives do not silently bulk-load unrelated assets; current run accepted 110/1062 General SVGs and 258/362 Services or Products SVGs.
  - Mirrored the static SVG catalog into both `react/public/oci-stencils/` and `desktop/public/oci-stencils/` so React dev, desktop renderer, and static Pages builds all have the same assets.
  - Generated `OcdOciStencils.ts` with shared ids, titles, collection names, paths, CSS class names, and CSS variable names; exported it from `@ocd/react`. Generated `oci-stencils.css` with global `--ocd-oci-stencil-*` variables plus `.ocd-oci-stencil-*` classes and imported it in both renderer entry points.
  - CSS variables reference the public-root `/oci-stencils/...` path. Vite rewrites these under the Pages base (`/oci-designer-toolkit/oci-stencils/...`) and no longer emits duplicate hashed stencil assets; `web-dist/oci-stencils` holds 368 SVGs, while `web-dist/assets` contains 0 generated `general-*.svg` / `services-products-*.svg` copies.
  - Added `OcdOciStencils.test.ts` to lock the filtered counts, id/class/variable contract, mirrored public files, and DOM-free URL helper.
  - Verification: React and desktop typechecks ✓; `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npm test` ✓ (41 files / 377 tests); preview smoke returned 200 for the app root and a generated stencil SVG asset; `npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.

- 2026-06-11 — Designer command center UX enhancement — STATUS: done.
  - Added a canvas command center to the Designer so users can start from Landing Zone Next-Gen, import Terraform, import generated LZ JSON, open an OCD design, import draw.io, open templates, open Discovery, or show the manual resource palette without hunting through menus.
  - Empty canvases show a larger `Start architecture` panel; populated canvases switch to compact `Architecture shortcuts` via a tested helper.
  - Wired every action to existing app flows in `Menu.ts` / console routing instead of adding parallel import logic.
  - Verified in the running app at `http://127.0.0.1:5174/` using the desktop renderer Vite config so `@ocd/react` resolves to source.

- 2026-06-11 — Designer palette search UX enhancement — STATUS: done.
  - Added a compact resource search field above the Provider/Model palette tabs so users can find OCI resources by provider, category, type, title, CSS class, resource display name, resource name, resource type name, or id.
  - Provider palette filtering preserves existing visible-provider settings and no longer mutates shared palette resource objects while preparing drag data.
  - Model palette filtering keeps the existing hidden/excluded resource rules and auto-expands matched resource groups while search is active.
  - Added `OcdPaletteSearch.test.ts` for the normalization/matching contract.
  - Verification: `npm test -- OcdPaletteSearch.test.ts OcdDesignerCommandCenter.test.ts` ✓; React typecheck ✓; desktop typecheck ✓; `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.

- 2026-06-11 — Screenshot follow-up — movable command center + Jsonnet asset hardening — STATUS: done.
  - Evidence: command center overlaps populated architectures in the upper-right canvas; users need to move or collapse it to inspect resources behind it.
  - Evidence: Landing Zone engine can fail with `expected magic word 00 61 73 6d, found 3c 21 44 4f`, meaning an HTML fallback response was accepted as `libjsonnet.wasm`.
  - Evidence: the file picker screenshot shows `.tf` files disabled while the active picker is in OKIT-file mode; the next guided intake pass must make file-type intent clearer and prevent users from entering the wrong picker path.
  - Immediate implementation:
    - Make `OcdDesignerCommandCenter` draggable within the visible designer surface, collapsible, and resettable without changing document/resource coordinates.
    - Validate WASM magic bytes before instantiation in `OcdJsonnetRuntime.ts`; skip HTML or other non-WASM 200 responses and continue to the next candidate path.
    - Extend tests for command-center bounds and HTML fallback handling.
  - Task updates:
    - T06 Guided Architecture Intake Flow: add source-specific import screens for OKIT, Terraform/HCL folder, LZ JSON, and draw.io with matching file filters, inline validation, and a post-import preview/count before canvas placement.
    - T12 UX Quality Gates: add Playwright coverage for command-center overlap, drag/collapse/reset behavior, and first-screen command visibility at desktop/mobile widths.
    - T16 Landing Zone Engine Asset Health: add startup/static build assertions that `libjsonnet.wasm` is present, served with a valid WASM binary header, and reachable from both renderer and worker candidate paths.
    - T17 Import Affordance Clarity: split "Open Design" from "Import Terraform" copy and picker state so `.tf` files are never shown under an OKIT-only action without an explanatory empty/disabled state.
  - Verification: `npm test -- OcdJsonnetWasm.test.ts OcdDesignerCommandCenter.test.ts` ✓; React typecheck ✓; desktop typecheck ✓; `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npm test` ✓ (43 files / 385 tests); `npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓; built `web-dist/libjsonnet.wasm` header is `00 61 73 6d`; running dev app returns 200 at `http://127.0.0.1:5174/`; screenshot captured at `/private/tmp/ocd-command-center-draggable.png`.

- 2026-06-11 — AAG Batch 1 — Architecture Agent relation/readiness contract — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/architecture-agent/OcdArchitectureAgent.ts`
    - `ocd/packages/react/src/pages/OcdArchitectureAgent.tsx`
    - `ocd/packages/react/src/architecture-agent/__tests__/OcdArchitectureAgent.test.ts`
  - Prerequisites / gaps before later batches:
    - No new env vars are required for Batch 1.
    - OCI GenAI must be added behind desktop/web-server handlers, not as direct renderer OCI SDK calls.
    - Cap tenancy execution must stay behind explicit profile, compartment, successful PLAN, and operator approval; Batch 1 does not mutate tenancy state.
    - Live Discovery still needs to replace static sample data before Discovery-to-design can be end-to-end.
  - Implemented:
    - Added `ArchitecturePlanValidation`, `ArchitectureRelationGraph`, and `ArchitectureAgentReadiness` contracts.
    - Added `validateArchitecturePlan()` to block invalid CIDRs, excessive resource counts, unsupported kinds, and sensitive OCI/credential-like text before canvas/deployment use.
    - Added `buildArchitectureRelationGraph()` to derive parent edges from existing OCI model parent rules and association edges from explicit model associations plus `*Id`/`*Ids` references.
    - Added `buildArchitectureAgentReadiness()` to expose plan-schema, relation-graph, Terraform-contract, and deployment-safety checks for UI/backends.
    - `buildDesignFromArchitecturePlan()` now fails fast on blocked plans and stores validation, relation graph, and readiness metadata under `design.userDefined.architectureAgent`.
    - Architecture Agent page now shows readiness checks, relation count, and refuses to apply a blocked plan.
  - Verification: `npm test -- OcdArchitectureAgent.test.ts` ✓ (8/8); `cd ocd/packages/react && npx tsc -b ./tsconfig.lib.json` ✓; `cd ocd && npm test` ✓ (43 files / 388 tests); `cd ocd/packages/desktop && npx tsc -b ./tsconfig.json --force` ✓; `cd ocd && npm run build:pages` ✓ with no Vite warnings; `npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Next targets:
    - AAG Batch 2: `OcdExportToResourceManagerDialog.tsx`, `OciResourceManagerQuery.ts`, desktop preload/main IPC, facade types/tests — enforce generate → PLAN → review → APPLY and remove direct auto-approved apply from the default path.
    - AAG Batch 3: `OcdDiscovery.tsx`, `OciBackendService.ts`, `OciQuery.ts`, discovery mappers/tests — live profile/region discovery with “Create architecture” and “Send to Agent”.
    - AAG Batch 4: `OcdCanvas.tsx`, `OcdResourceSvg.tsx`, `OcdDocument.ts` — movable/resizable frames as first-class containers that move children safely.

- 2026-06-11 — AAG Batch 2 — Resource Manager plan/apply safety gate — STATUS: done.
  - Target files modified:
    - `ocd/packages/query/src/OciResourceManagerQuery.ts`
    - `ocd/packages/query/src/OciBackendService.ts`
    - `ocd/packages/query/src/index.ts`
    - `ocd/packages/react/src/facade/OcdBackend.ts`
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/facade/__tests__/OciBackendService.test.ts`
    - `ocd/packages/react/src/components/dialogs/OcdExportToResourceManagerDialog.tsx`
    - `ocd/packages/desktop/src/main.ts`
    - `ocd/packages/desktop/src/preload.ts`
  - Prerequisites / gaps before later batches:
    - No new env vars are required for Batch 2.
    - Cap tenancy apply remains operator-gated; the app now requires a successful plan job id and exact `APPLY` confirmation before submitting an apply job.
    - Batch 2 does not poll Resource Manager job lifecycle yet; add job-status polling and plan-output preview before treating a plan as fully reviewed in Cap testing.
  - Implemented:
    - Added a typed `OciResourceManagerJobOptions` contract and pure `buildResourceManagerJobDetails()` helper.
    - Stack create/update now submits Resource Manager `PLAN` jobs by default.
    - `APPLY` now uses OCI Resource Manager `FROM_PLAN_JOB_ID` and requires `planJobId` plus typed approval; generated job payloads no longer use `AUTO_APPROVED`.
    - Threaded structured job options through shared query service, React facade, Electron main process, and preload IPC.
    - Changed the Resource Manager export dialog from a direct plan/apply toggle to a two-step flow: `Create/Update Stack + Plan`, then `Apply Reviewed Plan` after a plan job is available and the operator types `APPLY`.
    - Added tests covering default PLAN payloads, blocked apply without reviewed plan metadata, and no `AUTO_APPROVED` payload generation.
  - Verification: `npm test -- OciBackendService.test.ts` ✓ (6/6); `cd ocd && npx tsc -b ./packages/query/tsconfig.json --force` ✓; `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npx tsc -b ./packages/desktop/tsconfig.json --force` ✓; `cd ocd && npm test` ✓ (43 files / 391 tests); `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Next targets:
    - AAG Batch 3: live Discovery to design/agent flow with profile/region-backed snapshots, discovery mappers, and “Create architecture” / “Send to Agent” actions.
    - AAG Batch 4: movable/resizable architecture frames that preserve containment and can move children safely.

- 2026-06-11 — AAG Batch 3 — Live Discovery to design/agent flow — STATUS: done.
  - Target files modified:
    - `ocd/packages/query/src/OciBackendService.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/web-server/src/handlers.ts`
    - `ocd/packages/desktop/src/main.ts`
    - `ocd/packages/desktop/src/preload.ts`
    - `ocd/packages/react/src/facade/OcdBackend.ts`
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/discovery/OcdDiscoveryTypes.ts`
    - `ocd/packages/react/src/discovery/OcdDiscoveryMappers.ts`
    - `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`
    - `ocd/packages/react/src/pages/OcdDiscovery.tsx`
    - `ocd/packages/react/src/pages/OcdArchitectureAgent.tsx`
    - `ocd/packages/react/src/css/theme.css`
  - Prerequisites / gaps before later batches:
    - No new env vars are required.
    - Live discovery still depends on a valid local OCI profile and reachable OCI APIs; static Pages without desktop/web-server keeps sample data and shows a backend-unavailable message.
    - Cap tenancy testing should start with a small explicit compartment selection; no tenancy mutations are performed by discovery.
    - Resource Manager plan output preview/polling is still a later enhancement before any Cap apply workflow.
  - Implemented:
    - Extended discovery snapshots to accept selected compartment ids and return a generated OCD design plus compact resource counts.
    - Threaded selected compartments through web-server, Electron IPC, React facade, and backend contracts.
    - Added Discovery page profile/region/compartment controls, live discovery status, and sample-data fallback.
    - Added `Create Architecture`, which opens the live discovered design in Designer when available or builds a conservative discovery-based scaffold from sample/imported data.
    - Added `Send to Agent`, which stores a redacted discovery brief and opens the Architecture Agent with that prompt preloaded.
    - Added discovery mappers for OCI design summaries, redacted agent prompts, and conservative architecture plans.
    - Added tests covering OCI design summarization, prompt redaction, OCI target mapping, and discovery-based architecture plan generation.
  - Verification: `npm test -- OcdDiscoveryMappers.test.ts` ✓ (4/4); `cd ocd && npx tsc -b ./packages/query/tsconfig.json --force` ✓; `cd ocd && npm run compile --workspace=packages/web-server` ✓; `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npx tsc -b ./packages/desktop/tsconfig.json --force` ✓; `cd ocd && npm test` ✓ (43 files / 393 tests); `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Next targets:
    - AAG Batch 4: movable/resizable architecture frames that preserve containment and move children safely.
    - AAG Batch 5: external module manager for add-on projects beyond Landing Zone Next-Gen.

- 2026-06-11 — AAG Batch 4 — Movable/resizable architecture frames — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/components/OcdDocument.ts`
    - `ocd/packages/react/src/components/OcdResourceSvg.tsx`
    - `ocd/packages/react/src/components/OcdCanvas.tsx`
    - `ocd/packages/react/src/components/__tests__/OcdDocument.frames.test.ts`
  - Prerequisites / gaps before later batches:
    - No new env vars are required.
    - The current frame attach behavior is explicit from the resource context menu; automatic attach-on-drag is intentionally deferred to avoid surprising users by moving unrelated overlapping resources.
    - Model parent clearing when dragging a resource back out to the page remains a follow-up because OCI parent semantics differ by resource type and must be handled as a typed operation, not a blind FK wipe.
  - Implemented:
    - Added document-level bounds helpers and minimum frame sizing rules.
    - Added `attachContainedCoordsToFrame()`, which reparents only fully contained sibling resources into a selected frame and converts their view coordinates to frame-relative coordinates so moving the frame moves its contents.
    - Added `constrainContainerResize()`, which prevents a frame from being resized smaller than its child-resource bounds and preserves the far edge when resizing from north or west.
    - Added the context-menu action `Attach Contained Resources` for container resources.
    - Updated frame resize handling to use the new constraint API and fixed north/west resize modification detection.
    - Updated the callback-based SVG drop path so dropping a resource into a container updates the model parent as well as the view parent.
    - Removed remaining full document/model object debug logs from canvas drop, frame resize, clone, and parent assignment paths.
    - Added regression tests for full containment attach, partial-overlap rejection, and resize clamping around child resources.
  - Verification: `npm test -- OcdDocument.frames.test.ts` ✓ (3/3); `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npm test` ✓ (44 files / 396 tests); `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npx tsc -b ./packages/desktop/tsconfig.json --force` ✓ after serializing behind the Pages build (parallel run raced against Vite replacing `web-dist` assets and produced transient TS6053 stale asset errors); `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Next targets:
    - AAG Batch 5: external module/add-on manager for Landing Zone Next-Gen and future project add-ons, with update status, local source isolation, and safe on-demand refresh.
    - AAG Batch 6: Resource Manager job polling + plan output preview before any Cap apply handoff.

- 2026-06-11 — AAG Batch 5 — External project add-on manager — STATUS: done.
  - Target files modified:
    - `.gitignore`
    - `package.json`
    - `ocd/package.json`
    - `scripts/setup_landing_zone.mjs`
    - `ocd/packages/query/src/OcdLzAddonUpdater.ts`
    - `ocd/packages/query/src/index.ts`
    - `ocd/packages/web-server/src/handlers.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/desktop/src/main.ts`
    - `ocd/packages/desktop/src/preload.ts`
    - `ocd/packages/react/src/facade/OcdBackend.ts`
    - `ocd/packages/react/src/facade/OcdElectronAPI.ts`
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/facade/__tests__/OcdBackendContract.test.ts`
    - `ocd/packages/react/src/facade/__tests__/OciApiFacade.staticBackend.test.ts`
    - `ocd/packages/react/src/landingzone/OcdLzAddonManager.ts`
    - `ocd/packages/react/src/landingzone/OcdLzSources.json`
    - `ocd/packages/react/src/landingzone/OcdLzSources.ts`
    - `ocd/packages/react/src/landingzone/__tests__/OcdLzAddonManager.test.ts`
    - `ocd/packages/react/src/landingzone/__tests__/OcdLzSourcesManifest.test.ts`
    - `ocd/packages/react/src/landingzone/ui/LzngSourcesPanel.tsx`
    - `ocd/packages/react/src/css/ocd-lzng.css`
  - Prerequisites / gaps before later batches:
    - Project add-on checkouts are local-only and git-ignored under `external/lz-addons/`.
    - The UI sends only a manifest source key; Electron/local web-server validate that the source is a `project-addon` with `setup.install.mode=git-checkout` before running the fixed setup script. Static Pages without a backend still reports backend unavailable.
    - No OCI tenancy mutation is performed by this batch; updates clone/fetch local source repos only.
    - Future add-ons should be added only through `OcdLzSources.json` with explicit `setup.localSubdir`, `gitIgnored: true`, and `install.mode: git-checkout`.
  - Implemented:
    - Extended the LZ source manifest schema to support installable project add-ons.
    - Added Landing Zone Next Gen checkout metadata at `external/lz-addons/landing-zone-next-gen`.
    - Added `external/lz-addons/` to `.gitignore`.
    - Added `npm run setup-lz:addon -- --source <key>` convenience scripts.
    - Extended `setup_landing_zone.mjs` with `--install --source <key>` to clone/fetch a project add-on into its declared local checkout path and pin latest refs when `--latest` is used.
    - Added backend `updateLandingZoneAddon(sourceKey)` in `@ocd/query`, plus Electron IPC and local web-server route `/api/oci/lz/addon/update`.
    - Added a Sources panel "Project add-on manager" with per-add-on `Install / refresh` / `Update add-on` buttons that trigger the backend runner and show command/status feedback.
    - Added tests for add-on descriptor generation, manifest project-add-on install metadata, facade backend contract, and the web-backend update route.
    - Recorded the Discovery Workbench screenshot issue under Deferred / follow-ups.
  - Verification: `npm test -- OcdLzAddonManager.test.ts OcdLzSourcesManifest.test.ts OcdBackendContract.test.ts OciApiFacade.staticBackend.test.ts` ✓ (18/18); `cd ocd && npx tsc -b ./packages/query/tsconfig.json --force` ✓; `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npm run compile --workspace=packages/web-server` ✓; `cd ocd && npx tsc -b ./packages/desktop/tsconfig.json --force` ✓; `cd ocd && npm test` ✓ (45 files / 402 tests); `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓; `node scripts/setup_landing_zone.mjs --install --source operating-entities` correctly rejects non-project-addon source before network access.
  - Next targets:
    - AAG Batch 6: Resource Manager job polling + plan output preview before any Cap apply handoff.
    - Discovery Workbench UX polish: static-build live-control gating, sample/live labeling, region default handling, and active-dataset summary counts.

- 2026-06-12 — AAG Batch 6 — Resource Manager plan polling and preview gate — STATUS: done.
  - Target files modified:
    - `ocd/packages/query/src/OciResourceManagerQuery.ts`
    - `ocd/packages/query/src/OciBackendService.ts`
    - `ocd/packages/query/src/index.ts`
    - `ocd/packages/desktop/src/main.ts`
    - `ocd/packages/desktop/src/preload.ts`
    - `ocd/packages/react/src/facade/OcdBackend.ts`
    - `ocd/packages/react/src/facade/OcdElectronAPI.ts`
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/components/dialogs/OcdExportToResourceManagerDialog.tsx`
    - `ocd/packages/react/src/css/ocd.css`
    - `ocd/packages/react/src/facade/__tests__/OciBackendService.test.ts`
  - Prerequisites / gaps before later batches:
    - No new env vars are required.
    - Resource Manager stack creation/update/apply remains desktop-only through Electron IPC; static builds still reject these mutating OCI actions.
    - Cap tenancy testing should use a small test stack first and stop at reviewed plan until the operator explicitly types `APPLY`.
    - Plan preview text is returned only to the UI and is not logged or persisted by this batch.
  - Implemented:
    - Added Resource Manager job-state helpers, terminal/succeeded classification, bounded plan preview summarization, SDK job lookup, and Terraform plan retrieval.
    - Added shared backend `getResourceManagerPlanReview({ profile, region, jobId })` and exported its contract.
    - Added Electron IPC/preload/facade method `getResourceManagerPlanReview(profile, region, jobId)`.
    - Updated Resource Manager export dialog to poll the plan job after stack create/update, display the lifecycle state and Terraform plan output, and keep `Apply Reviewed Plan` disabled until the plan job is `SUCCEEDED`, non-empty plan output is returned, and the user types `APPLY`.
    - Added tests for terminal state classification, plan-preview truncation, and ready-to-apply gating.
  - Verification: `cd ocd && npm test -- --run src/facade/__tests__/OciBackendService.test.ts` ✓ (9/9); `cd ocd && npx tsc -b ./packages/query/tsconfig.json --force` ✓; `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npx tsc -b ./packages/desktop/tsconfig.json --force` ✓; `cd ocd && npm run compile --workspace=packages/web-server` ✓; `cd ocd && npm test` ✓ (45 files / 405 tests); `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Next targets:
    - AAG Batch 7: Discovery Workbench UX polish: static-build live-control gating, sample/live labeling, region default handling, and active-dataset summary counts.
    - AAG Batch 8: per-source update controls on every external source card, where each update button calls the backend runner for that source key and shows command/status feedback.

- 2026-06-12 — AAG Batch 7 — Discovery Workbench UX polish — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/discovery/OcdDiscoveryState.ts`
    - `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryState.test.ts`
    - `ocd/packages/react/src/pages/OcdDiscovery.tsx`
    - `ocd/packages/react/src/css/theme.css`
  - Prerequisites / gaps before later batches:
    - No new env vars are required.
    - Live discovery still depends on desktop or the local OCD web server. Static Pages keeps sample data active and disables live-only controls.
    - This batch does not change OCI query scope or tenancy permissions; it is a UI/state cleanup only.
  - Implemented:
    - Added source-aware Discovery UI helpers for sample/live/imported labels, summary badges, live-run gating, and stable region placeholders.
    - Updated the header KPIs to summarize the active dataset: source, apps, assets, services, dependencies, cost, and OCI resources only when mapped resources exist.
    - Removed the misleading `0 OCI resources` badge for sample data.
    - Disabled profile, region, compartment, and `Run Live Discovery` controls when the live backend is unavailable or no region is loaded.
    - Changed backend-unavailable static builds from a red error state to a neutral sample-data-active state.
    - Added tests covering source labels, sample summary badges, OCI resource badge behavior, run gating, and region placeholders.
  - Verification: `cd ocd && npm test -- --run src/discovery/__tests__/OcdDiscoveryState.test.ts` ✓ (5/5); `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npm test` ✓ (46 files / 410 tests); `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Next targets:
    - AAG Batch 8: per-source update controls on every external source card, where each update button calls the backend runner for that source key and shows command/status feedback.
    - Cap tenancy Resource Manager smoke: create a small plan-only stack first, verify plan preview, and do not apply unless the operator explicitly approves.

- 2026-06-12 — AAG Batch 8 — Per-source external update controls — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/landingzone/OcdLzAddonManager.ts`
    - `ocd/packages/react/src/landingzone/__tests__/OcdLzAddonManager.test.ts`
    - `ocd/packages/react/src/landingzone/ui/LzngSourcesPanel.tsx`
    - `ocd/packages/react/src/css/ocd-lzng.css`
  - Prerequisites / gaps before later batches:
    - No new env vars are required.
    - Card-level update buttons send only the manifest source key. The backend still validates that the key is an installable `project-addon` with `setup.install.mode=git-checkout` before running the fixed setup command.
    - Static Pages without desktop/local web-server still reports backend unavailable for update actions.
  - Implemented:
    - Added `canUpdateSourceFromBackend(source)` to centralize which source cards can trigger backend updates.
    - Restricted project add-on descriptors to installable add-ons that the backend can update.
    - Added contextual update buttons directly on eligible source cards in `Sources & Updates`.
    - Reused the existing backend runner and status refresh flow for both the add-on manager and card-level actions.
    - Added per-card success/error status text and compact action layout styles.
    - Added tests for supported and unsupported source update eligibility.
  - Verification: `cd ocd && npm test -- --run src/landingzone/__tests__/OcdLzAddonManager.test.ts` ✓ (5/5); `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npm test` ✓ (46 files / 411 tests); `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Next targets:
    - Cap tenancy Resource Manager smoke: create a small plan-only stack first, verify plan preview, and do not apply unless the operator explicitly approves.
    - Discovery-to-agent polish: use live discovery snapshots to prepopulate relationship-aware architecture suggestions and Terraform preview.

- 2026-06-12 — AAG Batch 9 — Discovery-to-agent relationship and Terraform preview — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/discovery/OcdDiscoveryMappers.ts`
    - `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`
    - `ocd/packages/react/src/architecture-agent/OcdArchitectureAgent.ts`
    - `ocd/packages/react/src/architecture-agent/__tests__/OcdArchitectureAgent.test.ts`
    - `ocd/packages/react/src/pages/OcdArchitectureAgent.tsx`
    - `ocd/packages/react/src/css/theme.css`
  - Prerequisites / gaps before later batches:
    - No new env vars are required.
    - This batch does not run OCI, Resource Manager, Terraform, or Cap tenancy actions. It generates an offline preview from the existing in-memory design/exporter path.
    - Terraform preview is a readiness signal only; Resource Manager PLAN review and explicit `APPLY` confirmation remain the deployment gate.
  - Implemented:
    - Added discovery dependency brief generation so Architecture Agent prompts include the top observed application/service relationships.
    - Added relationship-derived assumptions to discovery-based architecture plans so network paths are preserved as explicit routing/security review items.
    - Added an Architecture Agent Terraform preview envelope that builds a design locally, exports the Resource Manager Terraform package, reports generated files, and counts resource blocks without a tenancy call.
    - Suppressed a noisy exporter debug line during preview generation while restoring `console.debug` immediately after the synchronous export.
    - Updated the Architecture Agent page to seed from discovery prompts, show readiness checks, show relation counts, and display Terraform/package and relationship previews before applying the generated design to the canvas.
    - Added tests for dependency briefs, discovery prompt dependency context, relationship-aware generated assumptions, and offline Terraform preview generation.
  - Verification: `cd ocd && npm test -- --run src/discovery/__tests__/OcdDiscoveryMappers.test.ts src/architecture-agent/__tests__/OcdArchitectureAgent.test.ts` ✓ (14/14); `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npm test` ✓ (46 files / 413 tests); `cd ocd && npm run build:pages` ✓ with no Vite warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Next targets:
    - Cap tenancy Resource Manager smoke: create a small plan-only stack first, verify plan preview, and do not apply unless the operator explicitly approves.
    - Designer relation UX: expose relation graph overlays/auto-connectors for imported Terraform/LZ architectures and let users toggle/show generated edges while moving frames.

- 2026-06-12 — AAG Batch 10 — OCI GenAI Architecture Agent backend bridge — STATUS: done.
  - Target files modified:
    - `ocd/packages/query/src/OciGenAiArchitectureQuery.ts`
    - `ocd/packages/query/src/OciBackendService.ts`
    - `ocd/packages/query/src/index.ts`
    - `ocd/packages/web-server/src/handlers.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/desktop/src/main.ts`
    - `ocd/packages/desktop/src/preload.ts`
    - `ocd/packages/react/src/facade/OcdBackend.ts`
    - `ocd/packages/react/src/facade/OcdElectronAPI.ts`
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/facade/__tests__/OcdBackendContract.test.ts`
    - `ocd/packages/react/src/facade/__tests__/OciApiFacade.staticBackend.test.ts`
    - `ocd/packages/react/src/facade/__tests__/OciGenAiArchitectureQuery.test.ts`
    - `ocd/packages/react/src/pages/OcdArchitectureAgent.tsx`
    - `ocd/packages/react/src/css/theme.css`
  - Prerequisites / gaps before live use:
    - Requires an OCI config profile with access to OCI Generative AI inference, a target region, a GenAI compartment, and a supported model id.
    - This batch does not run a live GenAI call during verification and does not mutate OCI resources.
    - The Cap tenancy test remains plan-only and requires explicit operator approval before any Resource Manager action.
  - Implemented:
    - Added `OciGenAiArchitectureQuery` with bounded prompt size, prompt redaction for OCIDs/key labels/fingerprints/internal topology IPs, JSON-mode on-demand chat request construction, non-stream response extraction, and a 60s timeout.
    - Exposed `generateArchitecturePlanWithGenAi` through the shared query backend, Electron IPC/preload bridge, local web-server route, and React facade contract.
    - Added `/api/oci/architecture/genai` to the loopback web backend using the existing JSON envelope, rate limit, host checks, and structured error handling.
    - Added an explicit planner selector to the Architecture Agent page: Local deterministic, OpenAI-compatible, and OCI GenAI. OCI GenAI responses are parsed through the existing Architecture Plan schema gate before applying to the document model.
    - Kept the OCI SDK server-side only; the renderer imports only facade types/methods and the Pages build did not add OCI SDK bundles to the Architecture Agent chunk.
    - Added focused tests for GenAI prompt redaction/request construction/response extraction, backend facade routing, and facade contract coverage.
  - Verification: `cd ocd && npm test -- --run src/facade/__tests__/OciGenAiArchitectureQuery.test.ts src/facade/__tests__/OciApiFacade.staticBackend.test.ts src/facade/__tests__/OcdBackendContract.test.ts src/architecture-agent/__tests__/OcdArchitectureAgent.test.ts` ✓ (20/20); `cd ocd && npx tsc -b ./packages/query/tsconfig.json --force` ✓; `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npx tsc -b ./packages/desktop/tsconfig.json --force` ✓; `cd ocd && npm run compile --workspace=packages/web-server` ✓; `cd ocd && npm test` ✓ (47 files / 418 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Next targets:
    - Designer relation UX: expose relation graph overlays/auto-connectors for imported Terraform/LZ architectures and let users toggle/show generated edges while moving frames.
    - Cap tenancy Resource Manager smoke: create a small plan-only stack first, verify plan preview, and do not apply unless the operator explicitly approves.

- 2026-06-12 — AAG Batch 11 — Redwood design foundation and modular Integration Hub — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/integrations/OcdIntegrationRegistry.ts`
    - `ocd/packages/react/src/integrations/__tests__/OcdIntegrationRegistry.test.ts`
    - `ocd/packages/react/src/pages/OcdIntegrations.tsx`
    - `ocd/packages/react/src/pages/OcdConsole.tsx`
    - `ocd/packages/react/src/components/OcdConsoleConfiguration.ts`
    - `ocd/packages/react/src/components/Menu.ts`
    - `ocd/packages/react/src/css/theme.css`
    - `ocd/packages/react/src/css/ocd.css`
    - `ocd/packages/react/src/index.ts`
  - Source design input:
    - Inspected `/Users/abirzu/Downloads/Oracle Redwood Design System (2).zip`, using its `SKILL.md`, `tokens/colors.css`, `tokens/base.css`, and `ui_kits/oci-console/console.css` direction.
  - Implemented:
    - Added a typed integration/plugin registry for external products and local bridges: Landing Zone Next-Gen, OCI Operating Entities, Terraform Import, Resource Manager Plan Review, OCI Discovery, OCI GenAI Architecture Agent, and Governance checks.
    - Added a lazy-loaded `Integration Hub` page with category filters, readiness counters, status/runtime badges, capabilities, and navigation actions into the existing workflows.
    - Exposed the registry and its types from the React package entrypoint so future add-on managers can consume the same contract.
    - Added `integrations` to the console page union, menu navigation, body routing, and top toolbar as a first-class workbench section.
    - Added a Redwood FY26 token bridge and refreshed the console chrome with an Oracle Cloud Console-inspired shell: dark top bar, warmer surfaces, cleaner menu dropdowns, larger target sizes, and restrained red action emphasis.
    - Added focused registry tests to protect plugin id uniqueness, category/runtime/status validity, action shape, and dashboard counters.
  - Verification: `cd ocd && npm test -- --run src/integrations/__tests__/OcdIntegrationRegistry.test.ts` ✓ (2/2); `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npm test` ✓ (48 files / 420 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓; `cd ocd && npx playwright screenshot http://127.0.0.1:5176/ /tmp/ocd-redwood-shell.png` ✓ shell smoke.
  - Next targets:
    - Turn the registry into executable plugin contracts: update/install hooks per integration, capability health checks, and backend command routing.
    - Continue Redwood migration for dense property panels, palette search, and draggable command surfaces without changing canvas semantics.
    - Designer relation UX: expose relation graph overlays/auto-connectors for imported Terraform/LZ architectures and let users toggle/show generated edges while moving frames.

- 2026-06-12 — AAG Batch 12 — executable Integration Hub source update actions — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/integrations/OcdIntegrationRegistry.ts`
    - `ocd/packages/react/src/integrations/__tests__/OcdIntegrationRegistry.test.ts`
    - `ocd/packages/react/src/pages/OcdIntegrations.tsx`
    - `ocd/packages/react/src/css/theme.css`
    - `ocd/packages/react/src/index.ts`
  - Implemented:
    - Added explicit integration action kinds: `navigate`, `external-link`, and `update-source`.
    - Added a contextual `Update source` action to the Landing Zone Next-Gen integration card while leaving non-project-addon sources out of the executable update path.
    - Wired the Integration Hub action to the existing safe backend bridge through `OciApiFacade.updateLandingZoneAddon`, which validates project-addon source keys server-side before running the setup command.
    - Added per-action running/success/error feedback in the Integration Hub cards so backend update status is visible without leaving the hub.
    - Strengthened the registry test contract so navigation actions require a target page, external links require an href, and source update actions require a source key.
  - Verification: `cd ocd && npm test -- --run src/integrations/__tests__/OcdIntegrationRegistry.test.ts` ✓ (2/2); `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npm test` ✓ (48 files / 420 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Next targets:
    - Add capability health probes to the Integration Hub so each plugin reports backend availability, pinned/latest source status, and required environment prerequisites.
    - Continue Redwood migration for dense property panels, palette search, and draggable command surfaces without changing canvas semantics.
    - Designer relation UX: expose relation graph overlays/auto-connectors for imported Terraform/LZ architectures and let users toggle/show generated edges while moving frames.

- 2026-06-12 — AAG Batch 13 — Integration Hub readiness probes — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/integrations/OcdIntegrationRegistry.ts`
    - `ocd/packages/react/src/integrations/__tests__/OcdIntegrationRegistry.test.ts`
    - `ocd/packages/react/src/pages/OcdIntegrations.tsx`
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/facade/__tests__/OciApiFacade.staticBackend.test.ts`
    - `ocd/packages/react/src/css/theme.css`
    - `ocd/packages/react/src/index.ts`
  - Implemented:
    - Added a typed readiness contract to each integration with health check kinds for backend reachability, source status, configuration prerequisites, and offline/static workflows.
    - Exposed `OciApiFacade.checkBackendAvailability()` as a public cached health probe that returns true for Electron bridge availability and reuses the existing `/api/oci/health` web probe for browser builds.
    - Reused the existing cached Landing Zone update checker in the Integration Hub so source-backed plugins can show private/unreachable, update-available, latest-checked, and checking states without duplicating GitHub logic.
    - Rendered compact Redwood readiness badges on each integration card with tooltip messages while keeping first render non-blocking.
    - Refreshed source status after a successful project add-on update so the Integration Hub reflects the post-update source posture.
    - Strengthened tests for registry health-check validity and facade readiness behavior in web and Electron contexts.
  - Verification: `cd ocd && npm test -- --run src/integrations/__tests__/OcdIntegrationRegistry.test.ts src/facade/__tests__/OciApiFacade.staticBackend.test.ts` ✓ (9/9); `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npm test` ✓ (48 files / 422 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Next targets:
    - Backend source-health DTO: report project add-on installability/installed/missing status from the same manifest parser used by `OcdLzAddonUpdater`, without exposing absolute local paths.
    - Continue Redwood migration for dense property panels, palette search, and draggable command surfaces without changing canvas semantics.
    - Designer relation UX: expose relation graph overlays/auto-connectors for imported Terraform/LZ architectures and let users toggle/show generated edges while moving frames.

- 2026-06-12 — AAG Batch 14 — live Discovery refresh, bundled Library, and current Help docs — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/pages/OcdDiscovery.tsx`
    - `ocd/packages/react/src/discovery/OcdDiscoveryMappers.ts`
    - `ocd/packages/react/src/discovery/OcdDiscoveryTypes.ts`
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryInventoryView.tsx`
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryTopologyView.tsx`
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryAnalyticsView.tsx`
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`
    - `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`
    - `ocd/packages/react/src/facade/OcdDesignFacade.ts`
    - `ocd/packages/react/src/facade/__tests__/OcdDesignFacade.browserLibrary.test.ts`
    - `ocd/packages/desktop/scripts/prepare-static-assets.mjs`
    - `ocd/packages/desktop/package.json`
    - `ocd/packages/react/src/data/OcdReleaseNotes.ts`
    - `ocd/packages/react/src/data/OcdUserGuiide.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Discovery profile/region/compartment context now replaces stale sample data with an `oci-query` context snapshot as soon as live OCI context loads.
    - Selected live compartments auto-refresh through the local backend with a debounce, while the manual `Run Live Discovery` button remains available and does not duplicate the same auto-refresh request.
    - Live OCI design mapping now preserves safe compartment display names, redacts raw identifiers from prompts, and converts discovered OCI resource types into service signals for downstream LZ mapping.
    - Inventory now shows a separate OCI Resource Inventory table; Topology falls back to OCI containment/resource relationships when app dependency telemetry is absent; Analytics shows OCI resource mix when utilization metrics are not supplied; LZ Mapping shows a clear empty state when no service mappings exist.
    - Replaced the shell-only desktop `prebuild` copy chain with a cross-platform Node asset-prep script that copies CSS, `libjsonnet.wasm`, and the bundled `ocd/library` reference architectures into `packages/desktop/public`; `dev` and `web` now run this prebuild step before starting Vite.
    - Added a browser/static Library fallback that loads `referenceArchitectures.json`, SVG previews, and OKIT designs from the bundled `/library` path, with safe segment validation and base-path-aware URLs for Pages deployments.
    - Updated release notes and prepended a current Next Gen user-guide section covering Discovery, Landing Zone Next-Gen, AI Architect, Integrations, Library, Designer, and plan-first provisioning.
  - Verification: `cd ocd && npm test -- --run src/discovery/__tests__/OcdDiscoveryMappers.test.ts src/facade/__tests__/OcdDesignFacade.browserLibrary.test.ts` ✓ (9/9); `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npm run prebuild --workspace=packages/desktop` ✓ copied library assets; `cd ocd && npm test` ✓ (49 files / 426 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `curl -I http://127.0.0.1:5176/library/oci/ObservabilityLandingZoneFreeFirst.okit` ✓ served bundled OKIT.
  - Notes:
    - `http://127.0.0.1:5176` is the verified active app port for this batch.
    - `http://127.0.0.1:5173` is occupied by an older/different local listener and returned/hung on `/library` checks; it should be restarted separately if it is the browser tab the operator wants to use.
  - Next targets:
    - Backend source-health DTO: report project add-on installability/installed/missing status from the same manifest parser used by `OcdLzAddonUpdater`, without exposing absolute local paths.
    - Provisioning-script reconciliation from Discovery snapshots: generate variable-driven Terraform/Ansible/Bash/Python REST script deltas from the active model without hardcoded tenancy-specific names or OCIDs.
    - Designer relation UX: expose relation graph overlays/auto-connectors for imported Terraform/LZ architectures and let users toggle/show generated edges while moving frames.

- 2026-06-12 — AAG Batch 15 — backend source-health DTO and Integration Hub install status — STATUS: done.
  - Target files modified:
    - `ocd/packages/query/src/OcdLzAddonUpdater.ts`
    - `ocd/packages/query/src/index.ts`
    - `ocd/packages/web-server/src/handlers.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/desktop/src/main.ts`
    - `ocd/packages/desktop/src/preload.ts`
    - `ocd/packages/react/src/facade/OcdBackend.ts`
    - `ocd/packages/react/src/facade/OcdElectronAPI.ts`
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/pages/OcdIntegrations.tsx`
    - `ocd/packages/react/src/facade/__tests__/OcdLzAddonUpdater.test.ts`
    - `ocd/packages/react/src/facade/__tests__/OciApiFacade.staticBackend.test.ts`
    - `ocd/packages/react/src/facade/__tests__/OcdBackendContract.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added `listLandingZoneAddonHealth()` in the query package, backed by the same `OcdLzSources.json` manifest parser used by the safe add-on updater.
    - Reported each tracked LZ source as `installed`, `missing`, or `not-installable`, with installability, role, pinned ref, and relative local subdir only; no absolute workstation paths are exposed.
    - Exposed the source-health DTO through the local web backend at `GET /api/oci/lz/addon/health` and through the Electron IPC bridge as `OciLzAddon:health`.
    - Added the source-health method to the shared backend contract, web facade, Electron API type, and contract test so plugin integrations remain aligned across runtime surfaces.
    - Updated the Integration Hub readiness badges to combine local install status with upstream update status: update available wins, missing installable add-ons warn, installed add-ons show healthy unless upstream is private/unreachable, and reference-only sources stay informational.
    - Refreshed local source health after a successful project add-on update so the Integration Hub reflects the installed/missing state immediately.
  - Verification: `cd ocd && npm test -- --run src/facade/__tests__/OcdLzAddonUpdater.test.ts src/facade/__tests__/OciApiFacade.staticBackend.test.ts src/facade/__tests__/OcdBackendContract.test.ts src/integrations/__tests__/OcdIntegrationRegistry.test.ts` ✓ (13/13); `cd ocd && npm run compile --workspace=packages/query` ✓; `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npx tsc -b ./packages/desktop/tsconfig.json --force` ✓; `cd ocd && npm run compile --workspace=packages/web-server` ✓; `cd ocd && npm test` ✓ (50 files / 428 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓; `curl -sS http://127.0.0.1:5050/api/oci/lz/addon/health` ✓ returned source health; `curl -I http://127.0.0.1:5176/` ✓ served the app.
  - Notes:
    - Restarted the stale local web backend on port 5050 so the new health endpoint is live.
    - `http://127.0.0.1:5176` remains the verified active app port.
  - Next targets:
    - Provisioning-script reconciliation from Discovery snapshots: generate variable-driven Terraform/Ansible/Bash/Python REST script deltas from the active model without hardcoded tenancy-specific names or OCIDs.
    - Designer relation UX: expose relation graph overlays/auto-connectors for imported Terraform/LZ architectures and let users toggle/show generated edges while moving frames.
    - Plugin installer hardening: move add-on installation/update jobs into a queued backend runner with progress events, cancellation, output caps, and per-source command allowlists.

- 2026-06-12 — AAG Batch 16 — private source auth, backend pin refresh, and discovery provisioning delta — STATUS: done.
  - Target files modified:
    - `scripts/setup_landing_zone.mjs`
    - `ocd/packages/query/src/OcdLzAddonUpdater.ts`
    - `ocd/packages/query/src/index.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/desktop/src/main.ts`
    - `ocd/packages/desktop/src/preload.ts`
    - `ocd/packages/react/src/facade/OcdBackend.ts`
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/landingzone/OcdLzUpdateCheck.ts`
    - `ocd/packages/react/src/landingzone/useLzUpdateCheck.ts`
    - `ocd/packages/react/src/landingzone/ui/LzngSourcesPanel.tsx`
    - `ocd/packages/react/src/pages/OcdLandingZone.tsx`
    - `ocd/packages/react/src/discovery/OcdDiscoveryProvisioning.ts`
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`
    - `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`
    - `ocd/packages/react/src/landingzone/__tests__/OcdLzUpdateCheck.test.ts`
    - `ocd/packages/react/src/facade/__tests__/OciApiFacade.staticBackend.test.ts`
    - `ocd/packages/react/src/facade/__tests__/OcdLzAddonUpdater.test.ts`
    - `ocd/packages/react/src/css/ocd-lzng.css`
    - `ocd/packages/react/src/css/theme.css`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added a session-only GitHub token path for private Landing Zone project add-ons in the Sources & Updates panel; tokens are kept in React state and are not written to localStorage.
    - Authenticated GitHub REST update checks now send `Authorization: Bearer <token>` when provided, while unauthenticated public checks still use the cached public path.
    - Authenticated check results are not persisted; unauthenticated cache entries are keyed by source pinned refs so backend pin changes invalidate stale update banners.
    - The backend add-on update endpoint now accepts an optional transient `githubToken`; Electron IPC and web-server routes pass it to the query updater without logging it.
    - `scripts/setup_landing_zone.mjs` now honors `GITHUB_TOKEN` / `GH_TOKEN` for private `git ls-remote`, clone/fetch, and release checks via scoped Git URL rewrite and GitHub REST auth headers.
    - `updateLandingZoneAddon()` returns the refreshed `pinnedRef`, redacts the token from returned stdout/stderr, and the UI immediately applies that pin so the update-available banner can disappear without a page reload.
    - Added a variable-driven Discovery provisioning delta in the LZ Mapping tab: Terraform `versions.tf`, `variables.tf`, `main.tf`, `terraform.tfvars.json`, Ansible dry-run scaffolding, Bash plan script, REST dry-run script, and manifest. Generated source uses variables/placeholders instead of tenant-specific names or OCIDs.
  - Verification: focused tests ✓ (29/29); `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓; `cd ocd && npm run compile --workspace=packages/query` ✓; `cd ocd && npm run compile --workspace=packages/web-server` ✓; `cd ocd && npx tsc -b ./packages/desktop/tsconfig.json --force` ✓; `cd ocd && npm test` ✓ (50 files / 433 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓; `curl -I http://127.0.0.1:5176/` ✓; `curl -sS http://127.0.0.1:5050/api/oci/lz/addon/health` ✓.
  - Notes:
    - Restarted the local backend on port 5050 so the updated authenticated update route is live.
    - Private source login is intentionally session-only; operators can also run backend/setup commands with `GITHUB_TOKEN` or `GH_TOKEN`.
  - Next targets:
    - Add backend job progress/events for source install/update so the UI can stream fetch/clone/checkout output without polling.
    - Designer relation UX: expose relation graph overlays/auto-connectors for imported Terraform/LZ architectures and let users toggle/show generated edges while moving frames.
    - Resource Manager handoff for Discovery provisioning delta: package generated artifacts and submit PLAN-only jobs with explicit apply review.

- 2026-06-12 — AAG Batch 17 — queued add-on update jobs and live UI progress — STATUS: done.
  - Target files modified:
    - `ocd/packages/query/src/OcdLzAddonUpdater.ts`
    - `ocd/packages/query/src/index.ts`
    - `ocd/packages/web-server/src/handlers.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/desktop/src/main.ts`
    - `ocd/packages/desktop/src/preload.ts`
    - `ocd/packages/react/src/facade/OcdBackend.ts`
    - `ocd/packages/react/src/facade/OcdElectronAPI.ts`
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/landingzone/OcdLzUpdateJobClient.ts`
    - `ocd/packages/react/src/landingzone/ui/LzngSourcesPanel.tsx`
    - `ocd/packages/react/src/pages/OcdIntegrations.tsx`
    - `ocd/packages/react/src/facade/__tests__/OcdLzAddonUpdater.test.ts`
    - `ocd/packages/react/src/facade/__tests__/OciApiFacade.staticBackend.test.ts`
    - `ocd/packages/react/src/facade/__tests__/OcdBackendContract.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added a process-local queued backend runner for Landing Zone project add-on install/update jobs. The renderer still sends only the manifest source key plus an optional transient GitHub token; the backend validates the key against the installable project-add-on allowlist before enqueueing.
    - Added typed job status DTOs with `queued` / `running` / `succeeded` / `failed` / `cancelled` states, timestamps, exit code, refreshed pinned ref, redacted stdout/stderr, and bounded retained output.
    - Exposed job start/status/cancel methods through `@ocd/query`, local web-server routes (`POST/GET/DELETE /api/oci/lz/addon/update-jobs`), Electron IPC/preload, and the shared React backend contract.
    - Switched Sources & Updates and the Integration Hub update actions to the job API so users see backend progress instead of a single blocking button state. Successful jobs still refresh source health and update-check state so stale update banners clear after the backend pin changes.
    - Added focused tests for job execution, token redaction, pin refresh, source-key validation, web facade routing, and backend contract coverage.
  - Verification: focused job/facade tests ✓ (17/17); `cd ocd && npx tsc -b ./packages/query/tsconfig.json --force` ✓; React typecheck ✓; desktop typecheck ✓; web-server compile ✓; `cd ocd && npm test` ✓ (50 files / 437 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; backend restarted on port 5050; source-health smoke ✓; unsafe job-start validation smoke ✓; frontend smoke at `http://127.0.0.1:5176/` ✓.
  - Notes:
    - The job queue is intentionally process-local. It is suitable for local desktop/web-server add-on checkout updates; persisted/distributed job storage is not needed unless the backend is later deployed as a shared service.
    - Status is currently surfaced through polling from the renderer. A later pass can add Server-Sent Events if we need push streaming for long-running installs.
  - Next targets:
    - Designer relation UX: expose relation graph overlays/auto-connectors for imported Terraform/LZ architectures and let users toggle/show generated edges while moving frames.
    - Resource Manager handoff for Discovery provisioning delta: package generated artifacts and submit PLAN-only jobs with explicit apply review.

- 2026-06-12 — AAG Batch 18 — Designer relation overlay toggle — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/components/OcdCanvas.tsx`
    - `ocd/packages/react/src/components/__tests__/OcdCanvas.derivedData.test.ts`
    - `ocd/packages/react/src/css/ocd.css`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Reused the existing Architecture Agent relation graph builder instead of introducing a second relation model.
    - Added `buildRelationOverlayConnectors()` to convert graph edges into visible page connector pairs, with parent edges rendered parent-to-child and association edges rendered source-to-target.
    - Added a canvas relation toolbar that appears when the current design has derived relation edges. The toggle enables/disables automatic relation overlays without changing resource model/view state.
    - Merged automatic overlay connectors with existing per-resource connector flags using stable de-duplication so users can still keep explicit resource-level connector behavior.
    - Added tests for parent/association connector derivation and hidden-edge counting when a relation points to a resource outside the active visible page/layer.
  - Verification: focused canvas tests ✓ (4/4); React typecheck ✓; full `cd ocd && npm test` ✓ (50 files / 439 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; desktop typecheck ✓ after build completed; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; Playwright screenshot smoke at `http://127.0.0.1:5176/` ✓.
  - Notes:
    - The overlay is intentionally visual-only. It does not auto-mutate Terraform fields or attach resources; those mutations remain explicit through import/discovery/agent flows.
    - The relation toolbar is hidden on documents with no derived relation graph edges.
  - Next targets:
    - Resource Manager handoff for Discovery provisioning delta: package generated artifacts and submit PLAN-only jobs with explicit apply review.

- 2026-06-12 — AAG Batch 19 — Discovery provisioning Resource Manager PLAN handoff — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/discovery/OcdDiscoveryProvisioning.ts`
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`
    - `ocd/packages/react/src/pages/OcdDiscovery.tsx`
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/facade/__tests__/OciApiFacade.staticBackend.test.ts`
    - `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`
    - `ocd/packages/web-server/src/handlers.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/react/src/css/theme.css`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added `buildDiscoveryResourceManagerPackage()` to convert Discovery provisioning delta artifacts into an OCI Resource Manager ZIP payload shape. Terraform files are placed at ZIP root (`versions.tf`, `variables.tf`, `main.tf`, `terraform.tfvars.json`), with discovery manifest and README metadata included.
    - The package adapter injects runtime region, tenancy, target compartment, and architecture name values at submission time, validates unresolved placeholders, and rejects any package containing `terraform apply`.
    - Added a PLAN-only Resource Manager handoff panel to the Discovery LZ Mapping tab. It blocks sample datasets, uses the selected Discovery profile/region/first compartment, loads tenancy from the selected profile only at submit time, and calls Resource Manager with `{ operation: 'PLAN' }`.
    - Exposed Resource Manager stack/plan-review operations through the local loopback web backend (`/api/oci/resource-manager/*`) so the browser build can use the same plan-first Resource Manager path as Electron when the local backend is running.
    - Updated the web React facade to use those Resource Manager backend routes instead of returning “Currently Not Implemented” outside Electron.
    - Added focused tests for Resource Manager packaging, unresolved-variable blockers, no-apply guard, web facade PLAN submission, and plan-review route usage.
  - Verification: focused Discovery/facade tests ✓ (22/22); React typecheck ✓; web-server compile ✓; desktop typecheck ✓; full `cd ocd && npm test` ✓ (50 files / 442 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; local backend restarted on port 5050; safe frontend/backend health/source-health smoke ✓.
  - Notes:
    - Verification intentionally did not submit a real Resource Manager plan job. The code path is covered by facade/unit tests and will require operator-selected profile/region/compartment at runtime.
    - Discovery remains PLAN-only. Apply still stays behind the existing Resource Manager plan-review dialog flow and explicit `APPLY` confirmation.
  - Next targets:
    - Add a plan-job status preview link or polling panel after Discovery submits a Resource Manager PLAN so users can jump directly into plan review.
    - Extend imported Terraform/LZ architectures with richer relation overlays and selectable edge labels.

- 2026-06-12 — AAG Batch 20 — Discovery Resource Manager plan review polling — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`
    - `ocd/packages/react/src/css/theme.css`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - After Discovery submits a Resource Manager PLAN, the LZ Mapping view now stores the returned job id and polls the backend plan-review endpoint.
    - Added an inline plan-review panel showing lifecycle state, waiting/error status, readiness messaging, and read-only Terraform plan output when Resource Manager returns it.
    - Kept Discovery strictly PLAN-only. There is no apply action in the Discovery flow; apply remains gated by the existing Resource Manager review path and explicit confirmation.
    - Styled the plan-review panel and plan output preview with the same Redwood-aligned visual language used by the Discovery provisioning handoff.
  - Verification: focused Discovery/facade tests ✓ (22/22); React typecheck ✓; full `cd ocd && npm test` ✓ (50 files / 442 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Notes:
    - Verification intentionally did not submit a real Resource Manager plan job. The polling path is covered through the existing facade/backend contract and activates after an operator submits a PLAN from the selected profile, region, and compartment.
    - The local backend remains the required bridge for browser builds that need live OCI and Resource Manager operations.
  - Next targets:
    - Add direct navigation from completed Discovery PLAN jobs into the existing Resource Manager review dialog when the host shell can provide a shared review surface.
    - Continue relation UX work for imported Terraform/LZ architectures with selectable edge labels and better frame-aware routing.

- 2026-06-12 — AAG Batch 21 — Canvas relation overlay labels and filters — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/components/OcdCanvas.tsx`
    - `ocd/packages/react/src/components/OcdResourceSvg.tsx`
    - `ocd/packages/react/src/components/__tests__/OcdCanvas.derivedData.test.ts`
    - `ocd/packages/react/src/types/ReactComponentProperties.ts`
    - `ocd/packages/react/src/css/ocd.css`
    - `ocd/packages/react/src/css/ocd-svg.css`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Extended derived relation overlay connectors with non-persisted edge metadata (`kind` and `label`) from the architecture relation graph.
    - Added canvas toolbar controls for relation overlay visibility, parent-edge visibility, association/link visibility, and label visibility.
    - Rendered SVG connector labels at the connector midpoint with truncated display text and full label in the SVG title for hover/tooling.
    - Kept existing explicit connector behavior intact by merging derived relation connectors with per-resource connector flags without mutating the design model.
  - Verification: focused canvas derived-data tests ✓ (4/4); React typecheck ✓; full `cd ocd && npm test` ✓ (50 files / 442 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Notes:
    - Relation labels are derived at render time and are not written into OCD design JSON. This keeps imported Terraform/LZ designs portable and avoids adding view-state churn while users move frames and resources.
  - Next targets:
    - Add a shared Resource Manager plan-review handoff model so Discovery-created PLAN jobs can be opened from the broader Resource Manager review surface.
    - Add frame-aware connector routing or label collision handling if labels become dense on larger imported topologies.

- 2026-06-12 — AAG Batch 22 — Shared Resource Manager plan-review polling — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/resource-manager/OcdResourceManagerPlanReview.tsx`
    - `ocd/packages/react/src/resource-manager/__tests__/OcdResourceManagerPlanReview.test.ts`
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`
    - `ocd/packages/react/src/components/dialogs/OcdExportToResourceManagerDialog.tsx`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Extracted Resource Manager PLAN polling into `useResourceManagerPlanReview()` with one bounded polling policy, cancellation behavior, and error handling path.
    - Added shared plan-review message formatting and a reusable `OcdResourceManagerPlanReviewPanel` for inline Resource Manager plan status/output surfaces.
    - Rewired Discovery LZ Mapping to use the shared hook/panel after submitting PLAN jobs.
    - Rewired the existing Resource Manager export dialog to use the same polling hook and formatter while preserving its explicit `APPLY` confirmation gate.
    - Added focused tests for waiting, running, successful, and terminal-failed plan-review messages.
  - Verification: focused Resource Manager/Discovery/facade tests ✓ (24/24); React typecheck ✓; full `cd ocd && npm test` ✓ (51 files / 444 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Notes:
    - No live Resource Manager plan or apply operation was submitted during verification.
    - Apply remains blocked unless Resource Manager reports a succeeded reviewed PLAN and the operator types `APPLY`.
  - Next targets:
    - Add a persisted local recent-plan registry so Discovery-submitted PLAN jobs can be resumed after tab navigation/reload.
    - Add frame-aware connector routing or label collision handling for dense imported topologies.

- 2026-06-12 — AAG Batch 23 — Local Resource Manager recent-plan resume — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/resource-manager/OcdResourceManagerPlanRegistry.ts`
    - `ocd/packages/react/src/resource-manager/__tests__/OcdResourceManagerPlanRegistry.test.ts`
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`
    - `ocd/packages/react/src/components/dialogs/OcdExportToResourceManagerDialog.tsx`
    - `ocd/packages/react/src/css/theme.css`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added a best-effort localStorage-backed recent-plan registry capped to the latest 10 Resource Manager PLAN jobs.
    - Discovery now restores the latest matching local PLAN for the selected profile and region, resumes polling through the shared plan-review hook, and shows a visible “Recent PLAN resumed” strip.
    - Added a Discovery “Forget” action to remove the local pointer and stop polling the restored PLAN.
    - The existing Resource Manager export dialog now records designer-origin PLAN jobs through the same registry for consistent future reuse.
    - Added unit coverage for save, newest-first ordering, source/profile/region filtering, deduplication, cap enforcement, removal, and unavailable localStorage behavior.
  - Verification: focused Resource Manager/Discovery/facade tests ✓ (27/27); React typecheck ✓; full `cd ocd && npm test` ✓ (52 files / 447 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Notes:
    - The registry stores only runtime-local browser metadata; no committed tenancy data, OCIDs, or plan output were added.
    - No live Resource Manager plan or apply operation was submitted during verification.
  - Next targets:
    - Add frame-aware connector routing or label collision handling for dense imported topologies.
    - Consider a shared Resource Manager review drawer that can list recent local PLAN jobs across Designer and Discovery.

- 2026-06-12 — AAG Batch 24 — Relation label de-duplication and offsetting — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/components/OcdCanvas.tsx`
    - `ocd/packages/react/src/components/OcdResourceSvg.tsx`
    - `ocd/packages/react/src/components/__tests__/OcdCanvas.derivedData.test.ts`
    - `ocd/packages/react/src/types/ReactComponentProperties.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Improved relation connector de-duplication so multiple distinct derived relations between the same two resources keep a combined label instead of silently dropping later labels.
    - Added deterministic label baseline offsets for parent and association connectors so mixed relation types are easier to read in dense imported/generated topologies.
    - Kept label handling render-derived only; no connector labels or offsets are persisted into the OCD design model.
    - Added focused test coverage for duplicate relation connectors with unique and repeated labels.
  - Verification: focused canvas derived-data tests ✓ (5/5); React typecheck ✓; full `cd ocd && npm test` ✓ (52 files / 448 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Notes:
    - This is a readability improvement, not a full edge-routing engine. True obstacle avoidance around frames/resources remains a separate layout task.
  - Next targets:
    - Add frame-aware connector routing or a relation inspection drawer for very dense imported topologies.
    - Consider a shared Resource Manager review drawer that can list recent local PLAN jobs across Designer and Discovery.

- 2026-06-12 — AAG Batch 25 — Canvas relation inspection drawer — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/components/OcdCanvas.tsx`
    - `ocd/packages/react/src/components/__tests__/OcdCanvas.derivedData.test.ts`
    - `ocd/packages/react/src/css/ocd.css`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added `buildRelationInspectionRows()` to derive a flat relation list with source/target display names, relation type, label, and visible/off-page state.
    - Added a canvas relation “Details” toggle that opens a compact relation inspection drawer.
    - The drawer lists parent/link relations, labels, source resources, targets, and whether each relation is visible on the current page/layer.
    - Kept the inspector render-derived only; no relation drawer state or relation metadata is persisted into OCD design JSON.
    - Added focused test coverage for relation inspector display-name resolution and visibility classification.
  - Verification: focused canvas derived-data tests ✓ (6/6); React typecheck ✓; full `cd ocd && npm test` ✓ (52 files / 449 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Notes:
    - This gives users an inspectable relation list for dense topologies. It does not yet route connector paths around frames or resources.
  - Next targets:
    - Consider a shared Resource Manager review drawer that can list recent local PLAN jobs across Designer and Discovery.
    - Add true frame-aware connector routing if relation lines remain hard to read in very large imported layouts.

- 2026-06-12 — AAG Batch 26 — Resource Manager recent PLAN review in Designer export — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/components/dialogs/OcdExportToResourceManagerDialog.tsx`
    - `ocd/packages/react/src/resource-manager/OcdResourceManagerPlanRegistry.ts`
    - `ocd/packages/react/src/resource-manager/__tests__/OcdResourceManagerPlanRegistry.test.ts`
    - `ocd/packages/react/src/css/ocd.css`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added a shared in-memory filter helper for recent local Resource Manager PLAN entries.
    - Added a Recent Plans section to the Designer Resource Manager export dialog, showing up to six local PLAN jobs from Designer or Discovery, prioritizing the currently selected profile and region.
    - Added Review and Forget actions so users can resume polling a recent PLAN job or remove stale local pointers.
    - Reused the shared plan-review hook so reviewed plans show lifecycle state and Terraform plan output before apply is enabled.
    - Kept apply gated behind a succeeded Resource Manager PLAN, a stack id, and an explicit typed `APPLY` confirmation.
  - Verification: focused Resource Manager tests ✓ (6/6); React typecheck ✓; full `cd ocd && npm test` ✓ (52 files / 450 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Notes:
    - Recent plan history is browser-local metadata only; no committed tenancy data, OCIDs, or plan output were added.
    - No live Resource Manager plan or apply operation was submitted during verification.
  - Next targets:
    - Add true frame-aware connector routing if relation lines remain hard to read in very large imported layouts.
    - Consider moving recent Resource Manager review into a first-class drawer/surface outside the export dialog if users need it available from Discovery and Designer at all times.

- 2026-06-12 — AAG Batch 27 — Side-aware canvas connector routing — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/components/OcdResourceSvg.tsx`
    - `ocd/packages/react/src/components/__tests__/OcdResourceSvg.connectorPath.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added `buildConnectorPath()` as a deterministic, testable connector-path helper.
    - Replaced always-left/right connector curves with side-aware routing that selects horizontal or vertical anchors based on nearest center-line direction.
    - Added top/bottom anchor support for vertically stacked imported/generated layouts, reducing long side-loop connectors.
    - Kept routing render-derived only; no connector path data is persisted into OCD design JSON.
    - Added focused unit tests for horizontal routing, vertical stacked routing, and frame-to-contained-resource routing.
    - Confirmed KAG local project scope for future reuse queries: `1c4f0f6e77eccbe9`.
  - Verification: focused canvas/resource SVG tests ✓ (9/9); React typecheck ✓; full `cd ocd && npm test` ✓ (53 files / 453 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Notes:
    - This improves connector readability for vertical and frame-heavy layouts. It is not a full orthogonal obstacle-avoidance router.
  - Next targets:
    - Use KAG evidence to identify the cleanest surface for a first-class Resource Manager recent-plan drawer available outside the export dialog.
    - Add optional connector path modes if users need strict orthogonal routing later.

- 2026-06-12 — AAG Batch 28 — Shared Resource Manager recent-plan component — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/resource-manager/OcdResourceManagerRecentPlans.tsx`
    - `ocd/packages/react/src/resource-manager/__tests__/OcdResourceManagerRecentPlans.test.tsx`
    - `ocd/packages/react/src/components/dialogs/OcdExportToResourceManagerDialog.tsx`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added `OcdResourceManagerRecentPlans` as a shared, reusable recent PLAN history component.
    - Added `buildResourceManagerRecentPlanDisplayList()` to centralize profile/region prioritization and display-limit behavior.
    - Refactored the Designer Resource Manager export dialog to use the shared component instead of inline list rendering.
    - Kept review/forget behavior unchanged and still delegated to the dialog's existing guarded plan-review/apply flow.
    - Added focused unit coverage for display ordering and limit application.
  - Verification: focused Resource Manager tests ✓ (8/8); React typecheck ✓; full `cd ocd && npm test` ✓ (54 files / 455 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Notes:
    - KAG endpoint was validated at `http://127.0.0.1:8000/api/kag/llm-guide`; scope discovery identified this repo as `1c4f0f6e77eccbe9`.
    - Exact KAG symbol lookup currently over-indexes generated web-dist assets for some React symbols, so local source reads remain the reliable edit source.
  - Next targets:
    - Mount the shared recent-plan component in a first-class Discovery or global drawer surface.
    - Add KAG-friendly project source exclusions for generated `web-dist` artifacts if DevVisualization KAG supports ignore rules.

- 2026-06-12 — AAG Batch 29 — Discovery recent Resource Manager PLAN history — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`
    - `ocd/packages/react/src/css/theme.css`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Mounted the shared `OcdResourceManagerRecentPlans` component inside Discovery's Resource Manager PLAN handoff panel.
    - Discovery now shows local recent PLAN history, prioritizing selected profile/region, with Review and Forget actions.
    - Review loads the selected plan into existing plan-review polling by setting stack name, job id, and status.
    - Forget removes local metadata, refreshes displayed history, and clears active review if the forgotten entry is selected.
    - Kept Resource Manager apply out of Discovery; Discovery remains plan-first and review-only.
  - Verification: focused Discovery/Resource Manager tests ✓ (15/15); React typecheck ✓; full `cd ocd && npm test` ✓ (54 files / 455 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
  - Notes:
    - Recent history is local browser metadata only; no committed tenancy data, plan output, OCIDs, or stack ids were added.
    - No live Resource Manager plan or apply operation was submitted during verification.
  - Next targets:
    - Add an explicit recent-plans toolbar/drawer at the app shell level if users need the same list outside Discovery/LZ mapping.
    - Add KAG ignore/exclusion rules for generated `web-dist` assets if DevVisualization supports them.

- 2026-06-12 — AAG Batch 30 — Global Resource Manager recent PLAN drawer — STATUS: done.
  - Target files modified:
    - `ocd/packages/react/src/resource-manager/OcdResourceManagerRecentPlansDrawer.tsx`
    - `ocd/packages/react/src/resource-manager/__tests__/OcdResourceManagerRecentPlansDrawer.test.ts`
    - `ocd/packages/react/src/pages/OcdConsole.tsx`
    - `ocd/packages/react/src/css/theme.css`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added a global Plans toolbar button with a periodically refreshed local recent-plan count.
    - Added `OcdResourceManagerRecentPlansDrawer`, a reusable app-shell drawer that lists local Resource Manager PLAN history across Designer and Discovery.
    - Drawer Review loads a selected PLAN into the shared guarded Resource Manager plan-review polling component.
    - Drawer Forget removes browser-local metadata and clears the active review if the forgotten plan is selected.
    - Kept the global drawer review-only; no Resource Manager apply action is exposed outside the existing explicit export dialog confirmation flow.
    - Added Redwood-aligned toolbar and drawer styling with fixed responsive bounds to avoid toolbar/canvas overlap.
  - Verification: focused Resource Manager tests ✓ (9/9); React typecheck ✓; full `cd ocd && npm test` ✓ (55 files / 456 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓; frontend `curl -I http://127.0.0.1:5176/` ✓ 200; backend `curl -sS http://127.0.0.1:5050/api/oci/health` ✓ `{"success":true,"data":{"status":"ok"}}`.
  - UI smoke:
    - In-app Browser connector could not be used because the Playwright MCP Bridge extension timed out.
    - Fallback `npx playwright screenshot http://127.0.0.1:5176/ /tmp/ocd-batch30.png` succeeded and showed the Plans toolbar control without shell overlap.
  - Notes:
    - Recent plan history remains browser-local metadata only; no committed tenancy data, plan output, OCIDs, or stack ids were added.
    - No live Resource Manager plan or apply operation was submitted during verification.
  - Next targets:
    - Add optional drawer interaction coverage once a DOM/jsdom test harness is introduced for React component behavior.
    - Add KAG source exclusions for generated `web-dist` assets if DevVisualization supports them.

- 2026-06-12 — AAG Batch 31 — TDD backend route boundary validation foundation — STATUS: done.
  - Roadmap task started:
    - NW-01 Backend Boundary Schema Validation.
  - Target files modified:
    - `ocd/packages/web-server/src/OciWebServerValidation.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/react/src/facade/__tests__/OciWebServerValidation.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: added `OciWebServerValidation.test.ts`; focused test failed because `../../../../web-server/src/OciWebServerValidation` did not exist.
    - GREEN: implemented the pure validation module and wired `server.ts` routes to it before calling OCI query, Resource Manager, or LZ add-on update handlers.
    - Refined route-specific tests for create-stack vs generic create/update stack normalization.
  - Implemented:
    - Added typed validators for OCI query/discovery/dropdown request bodies, Resource Manager job options, stack create/update/job request bodies, Terraform data maps, and Landing Zone add-on update requests.
    - Resource Manager backend routes now reject malformed job options at the HTTP boundary instead of casting `jobOptions as never`.
    - Create-stack/update-stack/create-job routes now normalize profile/region identifiers and reject missing required IDs before invoking backend operations.
    - LZ add-on update routes now reject unsafe source keys and newline-bearing GitHub tokens before command execution.
    - Terraform upload data now accepts only object entries whose values are string arrays; malformed file entries are ignored rather than trusted.
  - Verification: focused validation test ✓ (4/4); focused facade/backend tests ✓ (28/28); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React typecheck ✓; full `cd ocd && npm test` ✓ (56 files / 460 tests); `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Notes:
    - No secrets, OCIDs, plan output, or real tenancy data were added.
    - TDD checkpoint commits were intentionally not created because this checkout already contains a broad dirty worktree from prior accepted batches; committing would mix unrelated changes.
  - Next targets:
    - Extend boundary validation to `/api/oci/architecture/genai` route payloads at the web-server layer, reusing existing query-layer GenAI validation.
    - Add HTTP-level integration tests for invalid route payloads once a lightweight server test harness exists.

- 2026-06-12 — AAG Batch 32 — TDD GenAI route boundary validation — STATUS: done.
  - Roadmap task advanced:
    - NW-01 Backend Boundary Schema Validation follow-up for OCI GenAI Architecture Agent.
  - Target files modified:
    - `ocd/packages/web-server/src/OciWebServerValidation.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/react/src/facade/__tests__/OciWebServerValidation.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: added `validateGenAiArchitectureRouteRequest` coverage; focused test failed with `validateGenAiArchitectureRouteRequest is not a function`.
    - GREEN: implemented the route-level GenAI validator and replaced the `/api/oci/architecture/genai` ad hoc parser with the validated request object.
  - Implemented:
    - GenAI route payloads now require a JSON object and normalize profile, region, compartment, model, prompt, temperature, and max tokens before invoking OCI SDK-backed query code.
    - The route-level validator reuses the existing query-layer GenAI constraints for required fields, prompt size, temperature clamping, and max-token bounds.
    - Non-numeric `temperature` / `maxTokens` values fall back to the same safe defaults used by the query layer instead of crossing the backend boundary as unchecked `unknown` values.
  - Verification: focused GenAI boundary test ✓ (5/5); focused facade/backend/GenAI contract tests ✓ (24/24); full `cd ocd && npm test` ✓ (56 files / 461 tests); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React typecheck ✓; `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Notes:
    - No live OCI GenAI call was made during verification.
    - No secrets, OCIDs, prompts from real tenancies, or topology outputs were added.
  - Next targets:
    - Add HTTP-level invalid-payload tests around the loopback web server once a lightweight handler/server test harness is introduced.
    - Continue defensive route validation for GET query endpoints such as Resource Manager plan-review and list-stacks.

- 2026-06-12 — AAG Batch 33 — TDD Resource Manager GET boundary validation — STATUS: done.
  - Roadmap task advanced:
    - NW-01 Backend Boundary Schema Validation follow-up for Resource Manager read endpoints.
  - Target files modified:
    - `ocd/packages/web-server/src/OciWebServerValidation.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/react/src/facade/__tests__/OciWebServerValidation.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: added list-stacks and plan-review query-param tests; focused test failed with `validateResourceManagerListStacksQuery is not a function`.
    - GREEN: implemented query-string validators and wired `/api/oci/resource-manager/stacks` plus `/api/oci/resource-manager/plan-review` through them before backend calls.
  - Implemented:
    - Resource Manager stack listing now requires normalized `region` and `compartmentId` query parameters instead of allowing empty strings into the query layer.
    - Resource Manager plan review now requires normalized `region` and `jobId` query parameters instead of invoking review handlers with missing IDs.
    - The pure validator test now covers POST request bodies, GenAI payloads, add-on update payloads, and Resource Manager GET query strings in one focused boundary suite.
  - Verification: focused boundary/facade/backend tests ✓ (30/30); full `cd ocd && npm test` ✓ (56 files / 462 tests); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React typecheck ✓; `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Notes:
    - No live Resource Manager list/review calls were made during verification.
    - No OCIDs, stack IDs, plan output, or tenancy data were added.
  - Next targets:
    - Introduce a lightweight HTTP handler/server test harness so route status codes and JSON error envelopes can be tested without hitting OCI.
    - Continue applying the same validator module pattern to any future plugin/backend endpoints before adding new integrations.

- 2026-06-12 — AAG Batch 34 — TDD loopback web-server HTTP test harness — STATUS: done.
  - Roadmap task advanced:
    - NW-01 Backend Boundary Schema Validation follow-up: route-level HTTP envelope coverage.
  - Target files modified:
    - `ocd/packages/web-server/src/OciWebServerHttp.ts`
    - `ocd/packages/web-server/src/server.ts`
    - `ocd/packages/react/src/facade/__tests__/OciWebServerHttp.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: added `OciWebServerHttp.test.ts`; focused test failed because `../../../../web-server/src/OciWebServerHttp` did not exist.
    - GREEN: extracted a side-effect-free `createOciWebServer()` / `handleOciWebRequest()` module and made `server.ts` a thin executable startup wrapper.
  - Implemented:
    - Added an ephemeral-port HTTP test harness that exercises the real Node `http.Server` route path without binding the default backend port.
    - Verified malformed Resource Manager create-stack payloads return HTTP 400 with the standard `{ success: false, error }` envelope before any backend handler can run.
    - Verified malformed OCI GenAI architecture payloads return HTTP 400 with the same envelope.
    - Verified malformed Resource Manager plan-review query strings return HTTP 400 at the route layer.
    - Preserved production startup, bind-error logging, and graceful shutdown in `server.ts` while removing listener side effects from test imports.
  - Verification: focused HTTP boundary test ✓ (2/2); focused boundary/facade/backend tests ✓ (32/32); full `cd ocd && npm test` ✓ (57 files / 464 tests); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React typecheck ✓; `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy calls were made.
    - No OCIDs, stack IDs, prompts from real tenancies, plan output, or topology data were added.
  - Next targets:
    - Add HTTP coverage for CORS/loopback-host/rate-limit behavior now that the side-effect-free test harness exists.
    - Introduce dependency injection for backend handlers if future HTTP tests need successful route responses without touching OCI.

- 2026-06-12 — AAG Batch 35 — TDD structured DNS-rebinding rejection envelope — STATUS: done.
  - Roadmap task advanced:
    - NW-01 Backend Boundary Schema Validation follow-up: defensive perimeter responses.
  - Target files modified:
    - `ocd/packages/web-server/src/OciWebServerHttp.ts`
    - `ocd/packages/react/src/facade/__tests__/OciWebServerHttp.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: added Host-header rejection coverage through Node `http.request`; focused test exposed the existing plain-text `Forbidden` response instead of the standard JSON envelope.
    - GREEN: changed the DNS-rebinding Host rejection path to return HTTP 403 via `sendError()`.
  - Implemented:
    - Invalid Host headers now receive `{ success: false, error: 'Forbidden' }` with JSON content type, matching the backend envelope used by validation and route errors.
    - The HTTP test harness can now send explicit Host headers, which browser `fetch` does not allow reliably.
    - The raw HTTP helper now rejects JSON parse failures cleanly so future envelope regressions fail fast instead of timing out.
  - Verification: focused HTTP boundary test ✓ (3/3); full `cd ocd && npm test` ✓ (57 files / 465 tests); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React typecheck ✓; `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy calls were made.
    - No OCIDs, stack IDs, prompts from real tenancies, plan output, or topology data were added.
  - Next targets:
    - Add HTTP coverage for CORS allowlist behavior and rate-limit envelopes.
    - Add handler dependency injection when success-path HTTP tests need backend stubs instead of live OCI calls.

- 2026-06-12 — AAG Batch 36 — TDD loopback Vite CORS fallback ports — STATUS: done.
  - Roadmap task advanced:
    - NW-01 Backend Boundary Schema Validation follow-up: browser/backend local perimeter compatibility.
  - Target files modified:
    - `ocd/packages/web-server/src/OciWebServerHttp.ts`
    - `ocd/packages/react/src/facade/__tests__/OciWebServerHttp.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: added OPTIONS preflight coverage for `http://127.0.0.1:5176`; focused test failed because `access-control-allow-origin` was missing.
    - GREEN: replaced the fixed two-origin allowlist with a bounded loopback Vite-port policy.
  - Implemented:
    - Browser backend CORS now allows only HTTP loopback origins on Vite fallback ports `5173` through `5179`.
    - Non-loopback origins continue to receive no `Access-Control-Allow-Origin` header.
    - The HTTP test harness now supports raw OPTIONS requests with explicit Origin and Access-Control request headers.
  - Verification: focused HTTP boundary test ✓ (4/4); full `cd ocd && npm test` ✓ (57 files / 466 tests); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React typecheck ✓; `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Notes:
    - This fixes local dev-server fallback ports without broadening CORS to arbitrary websites.
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy calls were made.
  - Next targets:
    - Add HTTP coverage for the rate-limit envelope and isolate the rate bucket for deterministic tests.
    - Add handler dependency injection when success-path HTTP tests need backend stubs instead of live OCI calls.

- 2026-06-12 — AAG Batch 37 — TDD deterministic rate-limit HTTP envelope — STATUS: done.
  - Roadmap task advanced:
    - NW-01 Backend Boundary Schema Validation follow-up: local backend abuse guard coverage.
  - Target files modified:
    - `ocd/packages/web-server/src/OciWebServerHttp.ts`
    - `ocd/packages/react/src/facade/__tests__/OciWebServerHttp.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: added a rate-limit HTTP test using `createOciWebServer({ rateLimit: { maxRequests: 1, windowMs: 1000 } })`; focused test failed because the second request still returned the normal 404 route envelope.
    - GREEN: made the rate limiter instance-scoped and configurable through `createOciWebServer()` options while preserving production defaults.
  - Implemented:
    - Each created web-server instance now owns an isolated rate bucket, preventing HTTP tests and multiple local server instances from sharing limiter state.
    - Production behavior remains capped at 20 non-health requests per client per 1 second.
    - Tests can now use a strict local rate-limit override to assert the real HTTP 429 envelope without sleeping or making live OCI calls.
  - Verification: focused HTTP boundary test ✓ (5/5); full `cd ocd && npm test` ✓ (57 files / 467 tests); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React typecheck ✓; `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Notes:
    - Health and OPTIONS requests remain outside the rate limiter, matching existing operational behavior.
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy calls were made.
  - Next targets:
    - Add handler dependency injection when success-path HTTP tests need backend stubs instead of live OCI calls.
    - Add coverage for malformed JSON and oversized request-body envelopes now that HTTP error paths are easy to exercise.

- 2026-06-12 — AAG Batch 38 — TDD oversized request-body HTTP envelope — STATUS: done.
  - Roadmap task advanced:
    - NW-01 Backend Boundary Schema Validation follow-up: request body abuse guard coverage.
  - Target files modified:
    - `ocd/packages/web-server/src/OciWebServerHttp.ts`
    - `ocd/packages/react/src/facade/__tests__/OciWebServerHttp.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: added oversized-body coverage using `createOciWebServer({ maxBodyBytes: 16 })`; the initial focused run timed out and emitted OCI retry logs because the option was not implemented and the request reached `queryTenancy`.
    - GREEN: made the body cap instance-configurable and returned a 400 JSON envelope before route handlers run.
  - Implemented:
    - Added `maxBodyBytes` to the HTTP server factory options while keeping the production default at 1 MiB.
    - Reworked request-body reading so oversized bodies are drained without destroying the socket before the server can respond.
    - Threaded the configured cap through every POST route that parses JSON.
    - Added HTTP coverage proving oversized bodies receive `{ success: false, error: 'Request body too large' }`.
  - Verification: focused HTTP boundary test ✓ (6/6); full `cd ocd && npm test` ✓ (57 files / 468 tests); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React facade typecheck ✓; `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities after AAG Batch 39; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Notes:
    - No live Resource Manager, GenAI, git update, or Cap tenancy actions were made; the RED run accidentally reached the OCI query retry path before the guard was implemented, and GREEN prevents that path.
    - No OCIDs, stack IDs, prompts from real tenancies, plan output, or topology data were added.
  - Next targets:
    - Add malformed JSON envelope coverage.
    - Add handler dependency injection for success-path HTTP tests without live OCI.

- 2026-06-12 — AAG Batch 39 — Vite 8 audit remediation and build gate cleanup — STATUS: done.
  - Roadmap task advanced:
    - T19 CI/security gates: keep dependency audit clean while preserving static build output.
  - Target files modified:
    - `ocd/package.json`
    - `ocd/package-lock.json`
    - `ocd/packages/react/package.json`
    - `ocd/packages/desktop/package.json`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD / verification evidence:
    - During Batch 38 verification, `npm audit --audit-level=high` failed on the Vite/esbuild chain: `vite@7.3.5` resolved `esbuild@0.27.7`, and the advisory recommended moving to the patched Vite 8 line.
    - A transitive esbuild override did not change npm's resolved tree, so the dependency remediation moved the affected Vite toolchain packages to compatible patched releases.
  - Implemented:
    - Upgraded the root Vite override to `^8.0.16`.
    - Upgraded React workspace dev tooling to `vite@^8.0.16`, `@vitejs/plugin-react@^6.0.2`, `vite-plugin-dts@^5.0.2`, and `vitest@^4.1.8`.
    - Upgraded Desktop workspace Vite to `^8.0.16`.
    - Refreshed `package-lock.json` and installed tree; verified `vite@8.0.16` and `vitest@4.1.8`.
  - Verification: `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; focused HTTP boundary test ✓ (6/6); full `cd ocd && npm test` ✓ (57 files / 468 tests); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React facade typecheck ✓; `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Notes:
    - No `npm audit fix --force` was used.
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
  - Next targets:
    - Add malformed JSON envelope coverage.
    - Add handler dependency injection for success-path HTTP tests without live OCI.

- 2026-06-13 — AAG Batch 40 — TDD injectable web-server handler facade — STATUS: done.
  - Roadmap task advanced:
    - NW-01 Backend Boundary Schema Validation follow-up: success-path HTTP coverage without live OCI side effects.
  - Target files modified:
    - `ocd/packages/web-server/src/OciWebServerHttp.ts`
    - `ocd/packages/react/src/facade/__tests__/OciWebServerHttp.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: added a success-path `/api/oci/query` HTTP test using `createOciWebServer({ handlers: { queryTenancy } })`; focused run failed with HTTP 400 and a real OCI missing-profile error, proving the route still called the imported live handler.
    - GREEN: introduced a typed default handler facade and merged optional handler overrides per server instance.
  - Implemented:
    - Added `OciWebServerHandlers` and `handlers?: Partial<OciWebServerHandlers>` to `OciWebServerOptions`.
    - Routed every HTTP endpoint through the resolved handler facade while preserving the existing production defaults.
    - Added a success-path HTTP test that verifies validated request payloads are passed to an injected `queryTenancy` stub and return the standard `{ success: true, data }` envelope.
  - Verification: focused HTTP boundary test ✓ (7/7); full `cd ocd && npm test` ✓ (57 files / 469 tests); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React facade typecheck ✓; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓; `cd ocd && npm run build:pages` fixed in AAG Batch 41.
  - Notes:
    - No live Resource Manager, GenAI, git update, or Cap tenancy actions were made; the RED run reached the real `queryTenancy` missing-profile path, and GREEN prevents that for injected success-path tests.
    - No OCIDs, stack IDs, prompts from real tenancies, plan output, or topology data were added.
  - Next targets:
    - Add explicit malformed JSON envelope coverage.
    - Add injected success-path coverage for Resource Manager and GenAI route envelopes.

- 2026-06-13 — AAG Batch 41 — Vite 8 static Pages build typecheck split — STATUS: done.
  - Roadmap task advanced:
    - T19 CI/security gates: keep static Pages build clean after the Vite 8 dependency remediation.
  - Target files modified:
    - `ocd/packages/desktop/package.json`
    - `ocd/packages/desktop/tsconfig.web.json`
    - `ocd/packages/desktop/vite.web.config.mts`
    - `ocd/packages/desktop/vite.renderer.config.mts`
    - `ocd/package-lock.json`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD / verification evidence:
    - RETRY exposed that `cd ocd && npm run build:pages` failed under Vite 8 because the Desktop `tsconfig.json` used legacy `moduleResolution: node` for Vite config files and also compiled unrelated Electron main-process code with existing implicit-any debt.
    - A first split to `tsconfig.web.json` then exposed the obsolete `esbuild.jsx` Vite config typing, confirming the remaining breakage was on the web/Vite config surface.
  - Implemented:
    - Added a dedicated Desktop `tsconfig.web.json` for `src/main.tsx` and `vite.web.config.mts` using bundler module resolution and `noEmit`.
    - Changed `build:web` to typecheck with `tsconfig.web.json` before invoking the static Vite build.
    - Replaced Desktop Vite config `esbuild` JSX settings with `@vitejs/plugin-react`, matching the React workspace and Vite 8 config types.
    - Added `@vitejs/plugin-react` to the Desktop workspace dev dependencies and refreshed the lockfile.
  - Verification: `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings; full `cd ocd && npm test` ✓ (57 files / 469 tests); `cd ocd && npm run compile --workspace=packages/web-server` ✓; React facade typecheck ✓; `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities; `git diff --check` ✓; `scripts/check-redaction.sh` ✓.
  - Notes:
    - The Electron main-process `tsconfig.json` remains unchanged; this batch intentionally avoids masking its existing strictness debt.
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
  - Next targets:
    - Add explicit malformed JSON envelope coverage.
    - Add injected success-path coverage for Resource Manager and GenAI route envelopes.

- 2026-06-13 — AAG Batch 42 — NW-01/NW-02 HTTP trace envelope + malformed body boundary — STATUS: done.
  - Roadmap tasks advanced:
    - NW-01 Backend Request Trace Envelope.
    - NW-02 Malformed JSON and Content-Type Boundary Tests.
  - Workstation boundary:
    - Targeted files only: `ocd/packages/web-server/src/OciWebServerHttp.ts`,
      `ocd/packages/react/src/facade/__tests__/OciWebServerHttp.test.ts`,
      `SHARED_TASK_NOTES.remediation.md`.
    - Existing generated OCI stencils/resources, LZ/update work, Discovery/Resource Manager UI,
      Vite/toolchain changes, docs, CI/hooks, and classic parity files were left untouched.
  - TDD evidence:
    - RED focused suite failed on the intended behaviors: no `X-Request-Id` header/body on
      error envelopes, inbound request id not echoed, generated request id absent, and
      `Content-Type: text/plain` reached the injected `queryTenancy` handler with HTTP 200.
    - GREEN focused suite passed after implementation: 1 file / 11 tests.
  - Implemented:
    - Error envelopes now include `requestId`, and every JSON/OPTIONS response emits
      `X-Request-Id`.
    - Valid inbound `X-Request-Id` values are echoed; invalid/missing values get generated
      `ocd-...` ids.
    - CORS preflight allows and exposes `X-Request-Id` for local Vite origins.
    - Timed backend operation logs now include request id without adding request body or
      topology data to logs.
    - POST JSON routes now reject unsupported content types with HTTP 415 before reading,
      validating, or invoking backend handlers.
    - Malformed JSON and oversized bodies still fail before handlers execute and now return
      the traced error envelope.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/facade/__tests__/OciWebServerHttp.test.ts` ✓ 11/11.
    - `cd ocd && npm run compile --workspace=packages/web-server` ✓.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
    - `cd ocd && npm test` ✓ 57 files / 473 tests.
    - `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings.
    - `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
    - `git diff --check` ✓.
    - `scripts/check-redaction.sh` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.
  - Next targets:
    - Add injected success-path coverage for Resource Manager and GenAI route envelopes.
    - Thread `requestId` through the browser facade error object so UI toasts/dialogs can show
      a supportable correlation id.

- 2026-06-13 — AAG Batch 43 — Resource Manager/GenAI route contracts + facade request-id errors — STATUS: done.
  - Roadmap tasks advanced:
    - NW-01 Backend Request Trace Envelope follow-through into browser facade errors.
    - NW-02 route contract hardening for Resource Manager and GenAI success paths.
  - Target files modified:
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/facade/__tests__/OciApiFacade.staticBackend.test.ts`
    - `ocd/packages/react/src/facade/__tests__/OciWebServerHttp.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: focused facade/HTTP suite failed because web backend error envelopes were still
      converted to a plain `Error`, dropping `requestId` and HTTP status.
    - GREEN: focused facade/HTTP suite passed after implementation: 2 files / 27 tests.
  - Implemented:
    - Added exported `OciBackendRequestError` and `isOciBackendRequestError()` in
      `OciApiFacade.ts`.
    - `unwrap()` now preserves failed backend envelope message, HTTP status, and request id
      from either the JSON body or `X-Request-Id` response header.
    - Added facade coverage proving Resource Manager web backend failures expose
      `name`, `message`, `status`, and `requestId` to UI callers.
    - Added injected HTTP success-path coverage for Resource Manager `create-stack` and GenAI
      architecture generation routes, proving validated payloads can be exercised without live
      OCI, Resource Manager, or GenAI calls.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/facade/__tests__/OciWebServerHttp.test.ts src/facade/__tests__/OciApiFacade.staticBackend.test.ts` ✓ 27/27.
    - `cd ocd && npm run compile --workspace=packages/web-server` ✓.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
    - `git diff --check` ✓.
    - `cd ocd && npm test` ✓ 57 files / 476 tests.
    - `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings.
    - `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
    - `scripts/check-redaction.sh` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.
  - Next targets:
    - Surface `OciBackendRequestError.requestId` in query/discovery/resource-manager dialogs
      so users can copy a backend correlation id from failed operations.
    - Add contract tests for `update-stack`, `create-job`, and LZ add-on update route
      request-id behavior.

- 2026-06-13 — AAG Batch 44 — UI-facing backend correlation ids — STATUS: done.
  - Roadmap tasks advanced:
    - NW-01 trace envelope usability: failed backend operations now surface copyable request ids
      in the user-visible OCI error paths.
  - Target files modified:
    - `ocd/packages/react/src/facade/OciApiFacade.ts`
    - `ocd/packages/react/src/facade/__tests__/OciApiFacade.staticBackend.test.ts`
    - `ocd/packages/react/src/components/dialogs/OcdQueryDialog.tsx`
    - `ocd/packages/react/src/components/dialogs/OcdReferenceDataQueryDialog.tsx`
    - `ocd/packages/react/src/components/dialogs/OcdExportToResourceManagerDialog.tsx`
    - `ocd/packages/react/src/pages/OcdDiscovery.tsx`
    - `ocd/packages/react/src/resource-manager/OcdResourceManagerPlanReview.tsx`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: focused facade suite failed because `formatOciBackendError()` did not exist.
    - GREEN: focused facade suite passed after implementation: 1 file / 15 tests.
  - Implemented:
    - Added exported `formatOciBackendError()` so UI callers consistently render
      `message (Request ID: <id>)` for `OciBackendRequestError`.
    - Replaced ad hoc `${reason}` and plain `reason.message` paths in the OCI query,
      reference-data query, discovery workbench, Resource Manager export/apply, stack listing,
      and plan-review polling surfaces.
    - Backend-unavailable behavior remains unchanged except it now goes through the shared
      formatter where a message is displayed.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/facade/__tests__/OciApiFacade.staticBackend.test.ts` ✓ 15/15.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
    - `git diff --check` ✓.
    - `scripts/check-redaction.sh` ✓.
    - `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
    - `cd ocd && npm test` ✓ 57 files / 477 tests.
    - `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.
  - Next targets:
    - Add HTTP route contract tests for `update-stack`, `create-job`, and LZ add-on update
      request-id behavior.
    - Move remaining OCI dialog profile/region loading side effects out of render into
      `useEffect` to reduce duplicate calls under React StrictMode.

- 2026-06-13 — AAG Batch 45 — OCI dialog render-side-effect cleanup — STATUS: done.
  - Roadmap tasks advanced:
    - React robustness: moved remaining OCI profile/bootstrap async work out of render paths.
  - Target files modified:
    - `ocd/packages/react/src/components/dialogs/OcdQueryDialog.tsx`
    - `ocd/packages/react/src/components/dialogs/OcdReferenceDataQueryDialog.tsx`
    - `ocd/packages/react/src/components/dialogs/OcdExportToResourceManagerDialog.tsx`
    - `ocd/packages/react/src/components/dialogs/__tests__/OciDialogEffectBoundary.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: new source invariant test failed for all three dialogs because they called
      `OciApiFacade.loadOCIConfigProfileNames()` from render behind `if (!profilesLoaded)`.
    - GREEN: the invariant passed after moving bootstrap work into `useEffect` with
      cancellation guards.
  - Implemented:
    - Query, reference-data query, and Resource Manager dialogs now start profile loading from
      mount effects instead of render.
    - Each bootstrap effect ignores late async responses after unmount.
    - Existing backend-unavailable and request-id formatted error behavior is preserved.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/components/dialogs/__tests__/OciDialogEffectBoundary.test.ts` ✓ 3/3.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
    - `cd ocd && npm test` ✓ 58 files / 480 tests.
    - `git diff --check` ✓.
    - `scripts/check-redaction.sh` ✓.
    - `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
    - `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

- 2026-06-13 — AAG Batch 46 — Remaining HTTP route request-id contracts — STATUS: done.
  - Roadmap tasks advanced:
    - NW-01/NW-02 route contract coverage for Resource Manager update/apply and LZ add-on
      update behavior.
  - Target files modified:
    - `ocd/packages/react/src/facade/__tests__/OciWebServerHttp.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - Implemented:
    - Added injected HTTP success-path coverage for Resource Manager `update-stack`.
    - Added injected HTTP success-path coverage for Resource Manager `create-job` APPLY.
    - Added injected HTTP success-path coverage for Landing Zone add-on update, including
      trimmed `githubToken` propagation and echoed `X-Request-Id`.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/facade/__tests__/OciWebServerHttp.test.ts` ✓ 16/16.
    - `cd ocd && npm test` ✓ 58 files / 483 tests.
    - `git diff --check` ✓.
    - `scripts/check-redaction.sh` ✓.
  - Notes:
    - This was contract-test hardening only; production route behavior already satisfied the
      new contracts from Batch 42.
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.
  - Next targets:
    - Consider extracting the three dialog bootstrap patterns into a shared hook once a real
      component testing dependency is available.
    - Continue with live discovery drift refresh/provisioning-script reconciliation tasks from
      the product roadmap.

- 2026-06-13 — AAG Batch 47 — Discovery Resource Manager package drift digest — STATUS: done.
  - Roadmap tasks advanced:
    - Live discovery drift refresh/provisioning-script reconciliation.
    - Resource Manager PLAN safety: stale plans are blocked when discovery inputs changed.
  - Target files modified:
    - `ocd/packages/react/src/discovery/OcdDiscoveryProvisioning.ts`
    - `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`
    - `ocd/packages/react/src/resource-manager/OcdResourceManagerPlanRegistry.ts`
    - `ocd/packages/react/src/resource-manager/__tests__/OcdResourceManagerPlanRegistry.test.ts`
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: package digest assertions failed because discovery Resource Manager packages had no
      deterministic digest and recent plans could not be compared to current generated inputs.
    - GREEN: deterministic FNV-1a package digest added and persisted on discovery recent plans.
  - Implemented:
    - Added deterministic `packageDigest` generation from Resource Manager package files.
    - Added `isDiscoveryResourceManagerPlanCurrent()` to reject stale recent PLANs.
    - Persisted optional package digest in the recent Resource Manager plan registry.
    - Discovery LZ mapping view now displays the current provisioning package digest, stores the
      non-sensitive preview digest for discovery PLANs, and blocks auto-restore/review of stale
      recent PLANs when discovery inputs drift.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/discovery/__tests__/OcdDiscoveryMappers.test.ts src/resource-manager/__tests__/OcdResourceManagerPlanRegistry.test.ts` ✓ 15/15.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
    - `cd ocd && npm test` ✓ 58 files / 485 tests.
    - `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings.
    - `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
    - `scripts/check-redaction.sh` ✓.
    - `git diff --check` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.
  - Next targets:
    - Add explicit discovery freshness/drift state so inventory, topology, analytics, and LZ
      mapping can show when a live query is stale versus current.
    - Add stale-plan visibility to the recent-plan review surface.

- 2026-06-13 — AAG Batch 48 — Discovery freshness and drift state — STATUS: done.
  - Roadmap tasks advanced:
    - Live discovery drift UX: inventory, topology, analytics, and LZ mapping now share an
      explicit current/stale/refreshing/context state derived from the active live-query
      boundary.
  - Target files modified:
    - `ocd/packages/react/src/discovery/OcdDiscoveryState.ts`
    - `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryState.test.ts`
    - `ocd/packages/react/src/pages/OcdDiscovery.tsx`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: `evaluateDiscoveryFreshness()` and `buildDiscoveryFreshnessBadge()` tests failed
      because the helpers did not exist.
    - GREEN: helpers implemented and page wired to display freshness as a summary chip.
  - Implemented:
    - Added deterministic discovery freshness states: `sample`, `unavailable`, `context`,
      `refreshing`, `current`, and `stale`.
    - Added user-facing freshness badges that add signal without duplicating the sample source
      badge.
    - Tracked the last successful live discovery request separately from the last attempted
      auto-refresh key so changed profile/region/compartment selections can show
      `Drift pending refresh` until the current live query completes.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/discovery/__tests__/OcdDiscoveryState.test.ts` ✓ 7/7.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
    - `cd ocd && npm test` ✓ 58 files / 487 tests.
    - `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings.
    - `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
    - `scripts/check-redaction.sh` ✓.
    - `git diff --check` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.
  - Next targets:
    - Extend freshness into a visible stale-plan row in the Resource Manager review surface.
    - Add tests around auto-refresh cancellation so an older live discovery response cannot
      overwrite a newer request.

- 2026-06-13 — AAG Batch 49 — Recent Resource Manager PLAN review summary — STATUS: done.
  - Roadmap tasks advanced:
    - Resource Manager PLAN safety and stale-plan visibility.
  - Target files modified:
    - `ocd/packages/react/src/resource-manager/OcdResourceManagerPlanRegistry.ts`
    - `ocd/packages/react/src/resource-manager/__tests__/OcdResourceManagerPlanRegistry.test.ts`
    - `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: focused registry suite failed because `buildResourceManagerRecentPlanReviewSummary`
      was not implemented.
    - GREEN: shared summary helper added and wired into Discovery LZ mapping.
  - Implemented:
    - Added `missing`, `current`, and `stale` recent-plan review summary states.
    - Discovery plans with package-digest drift now use one shared message contract.
    - Discovery LZ mapping now shows the recent PLAN summary directly in the RM handoff status
      area instead of duplicating stale-plan wording.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/resource-manager/__tests__/OcdResourceManagerPlanRegistry.test.ts` ✓ 5/5.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

- 2026-06-13 — AAG Batch 50 — Live discovery stale-response guard — STATUS: done.
  - Roadmap tasks advanced:
    - Live discovery drift refresh correctness.
  - Target files modified:
    - `ocd/packages/react/src/discovery/OcdDiscoveryState.ts`
    - `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryState.test.ts`
    - `ocd/packages/react/src/pages/OcdDiscovery.tsx`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: focused discovery state suite failed because `shouldApplyDiscoveryResponse()` did
      not exist.
    - GREEN: response-boundary helper added and wired into success, error, and loading cleanup
      paths.
  - Implemented:
    - Live discovery now tracks the active request key separately from the last attempted
      auto-refresh key.
    - Older query responses cannot overwrite the current inventory/topology/analytics state.
    - Older query failures cannot replace the current status/error state.
    - Older query `finally` handlers cannot incorrectly clear the loading state for a newer
      request.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/discovery/__tests__/OcdDiscoveryState.test.ts` ✓ 8/8.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

- 2026-06-13 — AAG Batch 51 — Live discovery input invalidation — STATUS: done.
  - Roadmap tasks advanced:
    - Live discovery drift correctness during rapid profile/region/compartment changes.
  - Target files modified:
    - `ocd/packages/react/src/pages/OcdDiscovery.tsx`
    - `ocd/packages/react/src/pages/__tests__/OcdDiscoveryRequestBoundary.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: source-boundary test failed because changing profile, region, or compartment did not
      invalidate the active live discovery request boundary.
    - GREEN: invalidation helper added and called from all three selection-change paths.
  - Implemented:
    - `invalidateActiveDiscoveryRequest()` clears the active request key.
    - Profile changes, region changes, and compartment toggles now prevent any older live
      discovery response from applying after the visible context changed.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/pages/__tests__/OcdDiscoveryRequestBoundary.test.ts` ✓ 1/1.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

- 2026-06-13 — AAG Batch 52 — Profile context stale-response guard — STATUS: done.
  - Roadmap tasks advanced:
    - Live discovery profile/region/compartment loader correctness.
  - Target files modified:
    - `ocd/packages/react/src/pages/OcdDiscovery.tsx`
    - `ocd/packages/react/src/pages/__tests__/OcdDiscoveryRequestBoundary.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: page boundary test failed because profile context loading had no active response key.
    - GREEN: `activeProfileContextKey` added and success/error branches now ignore stale
      profile-load responses.
  - Implemented:
    - Older `listRegions` / `listTenancyCompartments` responses cannot overwrite region,
      compartment, snapshot, backend, status, or error state after a newer profile was selected.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/pages/__tests__/OcdDiscoveryRequestBoundary.test.ts` ✓ 2/2.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

- 2026-06-13 — AAG Batch 53 — Normalized discovery request keys — STATUS: done.
  - Roadmap tasks advanced:
    - Live discovery drift state precision.
  - Target files modified:
    - `ocd/packages/react/src/discovery/OcdDiscoveryState.ts`
    - `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryState.test.ts`
    - `ocd/packages/react/src/pages/OcdDiscovery.tsx`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: discovery state suite failed because `buildDiscoveryRequestKey()` did not exist.
    - GREEN: helper added and page switched from inline key construction to normalized helper.
  - Implemented:
    - Profile and region are trimmed before drift comparison.
    - Compartment IDs are trimmed, empty IDs are ignored, duplicates removed, and order sorted.
    - False stale-state transitions from whitespace or checkbox ordering are avoided.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/discovery/__tests__/OcdDiscoveryState.test.ts` ✓ 9/9.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

- 2026-06-13 — AAG Batch 54 — LZ add-on update outcome contract — STATUS: done.
  - Roadmap tasks advanced:
    - Sources & Updates auto-refresh semantics after backend add-on updates.
  - Target files modified:
    - `ocd/packages/react/src/landingzone/OcdLzUpdateJobClient.ts`
    - `ocd/packages/react/src/landingzone/__tests__/OcdLzUpdateJobClient.test.ts`
    - `ocd/packages/react/src/landingzone/ui/LzngSourcesPanel.tsx`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: focused LZ update job client suite failed because
      `summarizeLzAddonUpdateJobOutcome()` did not exist.
    - GREEN: outcome helper added and panel wired to use it.
  - Implemented:
    - Successful add-on backend jobs now summarize as `{ kind: 'updated',
      refreshSources: true }`.
    - Failed/cancelled jobs summarize as non-refreshing failures.
    - Sources panel now calls `onSourceUpdated` only from the shared success outcome.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/landingzone/__tests__/OcdLzUpdateJobClient.test.ts` ✓ 2/2.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

- 2026-06-13 — AAG Batch 55 — LZ update source pin override helper — STATUS: done.
  - Roadmap tasks advanced:
    - Source update banner correctness after backend add-on refresh.
  - Target files modified:
    - `ocd/packages/react/src/landingzone/useLzUpdateCheck.ts`
    - `ocd/packages/react/src/landingzone/__tests__/useLzUpdateCheck.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: focused hook-helper suite failed because `buildEffectiveLzUpdateSources()` did not
      exist.
    - GREEN: helper added and hook refactored to use it.
  - Implemented:
    - Backend-reported `pinnedRef` values override manifest pins for update checks.
    - Source definitions are copied immutably; the manifest input is not mutated.
    - Sources without backend pins retain manifest pins.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/landingzone/__tests__/useLzUpdateCheck.test.ts` ✓ 2/2.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

- 2026-06-13 — AAG Batch 56 — Force LZ checks after backend pin changes — STATUS: done.
  - Roadmap tasks advanced:
    - Update banner auto-clear after backend add-on updates.
  - Target files modified:
    - `ocd/packages/react/src/landingzone/useLzUpdateCheck.ts`
    - `ocd/packages/react/src/landingzone/__tests__/useLzUpdateCheck.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: focused hook-helper suite failed because `shouldForceLzUpdateCheck()` did not exist.
    - GREEN: force-policy helper added and hook wired to detect backend pin fingerprint changes.
  - Implemented:
    - Initial update checks may still use cache.
    - Explicit refreshes force bypass cache.
    - Backend-pinned ref changes now force bypass cache, so successful local add-on updates can
      clear stale update banners instead of waiting on cached status.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/landingzone/__tests__/useLzUpdateCheck.test.ts` ✓ 3/3.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

- 2026-06-13 — AAG Batch 57 — Force LZ checks after GitHub token changes — STATUS: done.
  - Roadmap tasks advanced:
    - Private GitHub add-on login UX and update-check correctness.
  - Target files modified:
    - `ocd/packages/react/src/landingzone/useLzUpdateCheck.ts`
    - `ocd/packages/react/src/landingzone/__tests__/useLzUpdateCheck.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: hook-helper suite failed because GitHub token changes were ignored by the force
      policy.
    - GREEN: force policy and hook fingerprint tracking now include token changes.
  - Implemented:
    - Adding or clearing the session GitHub token bypasses cached unauthenticated/private
      repository results.
    - Private project add-ons can be rechecked immediately after login.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/landingzone/__tests__/useLzUpdateCheck.test.ts` ✓ 3/3.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

- 2026-06-13 — AAG Batch 58 — Normalize LZ GitHub token handoff — STATUS: done.
  - Roadmap tasks advanced:
    - Private GitHub add-on login/update robustness.
  - Target files modified:
    - `ocd/packages/react/src/landingzone/OcdLzUpdateJobClient.ts`
    - `ocd/packages/react/src/landingzone/__tests__/OcdLzUpdateJobClient.test.ts`
    - `SHARED_TASK_NOTES.remediation.md`
  - TDD evidence:
    - RED: focused LZ update job client suite failed because `normalizeLzGithubToken()` did not
      exist.
    - GREEN: normalizer added and backend start-job call now uses it.
  - Implemented:
    - Empty GitHub tokens become `undefined`.
    - Leading/trailing whitespace is trimmed before backend update requests.
    - Token values are not logged, stored, or written to the remediation tracker.
  - Verification:
    - `cd ocd/packages/react && npm test -- --run src/landingzone/__tests__/OcdLzUpdateJobClient.test.ts` ✓ 3/3.
    - `cd ocd && npx tsc -b ./packages/react/tsconfig.lib.json --force` ✓.
    - Ten-batch final gate: `cd ocd && npm test` ✓ 61 files / 498 tests.
    - Ten-batch final gate: `cd ocd && npm run build:pages` ✓ with no Vite chunk/static-dynamic import warnings.
    - Ten-batch final gate: `cd ocd && npm audit --audit-level=high` ✓ 0 vulnerabilities.
    - Ten-batch final gate: `scripts/check-redaction.sh` ✓.
    - Ten-batch final gate: `git diff --check` ✓.
  - Notes:
    - No live OCI, Resource Manager, GenAI, git update, or Cap tenancy actions were made.
    - No OCIDs, stack IDs, private repo tokens, tenancy names, IPs, or topology data were added.

## Deferred / follow-ups (not in scope, recorded for later)

- 2026-06-11 UX issue from screenshot: `OcdDiscovery.tsx` in a static Pages build still shows live discovery controls even though the backend is unavailable; the region dropdown can be empty; the "0 OCI resources" summary conflicts with visible sample inventory; sample/live state is not visually separated enough. RESOLVED in AAG Batch 7.
- 2026-06-12 source update UX issue from screenshot: `LzngSourcesPanel.tsx` has an add-on manager update button, but each external source card should also expose a contextual update button when the backend can update that source. RESOLVED in AAG Batch 8.
- 2026-06-10: former deferred items promoted to Batches 7-12 above (fan-out limit,
  logger, cost UX, WASM probe, redaction hardening, lazy-loading, analytics stub).
- Vite 8 / rolldown migration: RESOLVED in AAG Batches 39 and 41. The workspace now uses
  Vite 8 with a dedicated desktop static-web `tsconfig.web.json`; `build:pages` is green
  and warning-clean.
- SHARED_TASK_NOTES.a2.md is stale (stops at iteration 8 / 238) — live catalog is 265
  entries (verified by codex 2026-06-10); next A2 batch candidates listed in codex output.
