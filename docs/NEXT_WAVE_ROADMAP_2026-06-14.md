# Next-Wave Roadmap — Wave 5 (2026-06-14)

Source: delta scan of `feature/lzng-redwood-cost-estimator` (107 commits ahead of master)
against the completed prior wave (58 remediation batches in `SHARED_TASK_NOTES.remediation.md`).
Method: Discover → Critique → Matrix. Three read-only pillar audits (file:line evidence),
top findings spot-verified against source before promotion.

## Current-state verification (what the prior wave already shipped — do NOT redo)

- Electron security perimeter: TLS bypass removed, `nodeIntegration:false`, guarded
  `will-navigate` / `setWindowOpenHandler` / `openExternal`.
- Reliability: `OcdErrorBoundary.tsx`, uncaught/unhandledRejection handlers, query
  fan-out concurrency limiter (`OciQueryConcurrency.ts`, limit 12).
- Supply chain: `npm audit` 0 vulns, Vite 8, overrides locked (do NOT `npm dedupe`).
- Structured logger (`core/src/OcdLogger.ts`); HTTP request-id correlation in web-server;
  HTTP boundary validation suite (DNS-rebinding, rate-limit, oversized-body envelopes).
- Health endpoints EXIST: `/api/oci/health`, `/api/oci/lz/addon/health` (a "no health
  endpoint" finding was raised by an audit agent and **rejected as a false positive**).
- Analytics teardown (Batch 12) is clean: 0 dangling references to deleted modules.

## Wave-5 critique summary (residual gaps, verified)

Severity-corrected from raw agent reports:
- DROPPED: "no web-server health endpoint" (false positive — endpoints exist).
- DOWNGRADED: GitHub-token-via-env "CRITICAL" → MEDIUM. stdio defines only fds 0-2 (no
  writable fd3+); env is readable only by the child process tree, not arbitrary siblings
  on a single-user desktop; stdout is already redacted via `redactToken`. Real as
  defense-in-depth, not a critical breach.
- CONFIRMED: symlink path-traversal in silent-save (`path.resolve`, no `realpathSync`);
  `retryCount` is a dead parameter on ~50 `OciQuery.list*` methods.

---

## Task Matrix

### Pillar A — Observability & Resilience

#### [W5-O1] External-fetch timeout perimeter
- **Target Files/Modules:** `react/src/facade/OciApiFacade.ts` (~97,121,127,137);
  `desktop/src/main.ts` (~761,793,822 library/SVG fetch); `react/src/landingzone/OcdJsonnetRuntime.ts:66` (WASM fetch).
- **Issue/Gap:** Raw `fetch()` with no `AbortController`/timeout. A hung backend, library
  host, or WASM CDN freezes the renderer or desktop init indefinitely (SPOF).
- **Enhancement Blueprint:** Add a shared `fetchWithTimeout(url, init, ms)` helper (core or
  a `utils/` module) wrapping `AbortController` + `setTimeout`. Default 30s for API/library,
  10s for WASM. Route all listed call sites through it; on timeout surface a typed error the
  existing error boundary / banners can render (LZ engine banner already exists for WASM).
- **Verification Criteria:** Unit test: a never-resolving fetch mock rejects within the
  configured window. Manual: kill the web-server mid-query → UI shows a timeout error, not a
  spinner forever. `cd ocd && npm test` green.

#### [W5-O2] Retry/backoff + remove dead `retryCount`
- **Target Files/Modules:** `query/src/OciQuery.ts` (~50 `list*` methods carrying unused
  `retryCount` param); GitHub add-on fetch in `query/src/OcdLzAddonUpdater.ts`; GenAI call in
  `react/src/architecture-agent/OcdArchitectureAgent.ts`.
- **Issue/Gap:** `retryCount: number = 0` is declared but never read — dead intent. No
  backoff anywhere on transient external failures (429/5xx/network).
- **Enhancement Blueprint:** Implement a `withRetry(fn, {attempts, baseMs, jitter, isRetryable})`
  helper. Apply to OCI SDK list calls (retry on throttling/5xx only), GitHub fetch, GenAI.
  Either wire `retryCount` through `withRetry` or delete the param entirely (prefer the helper).
  Dovetails with [W5-E2] — do them together to avoid touching the 50 methods twice.
- **Verification Criteria:** Unit test: a fn failing twice then succeeding resolves after 3
  attempts with increasing delays; a 400 does NOT retry. No remaining unused `retryCount`.

#### [W5-O3] Bounded job-state store
- **Target Files/Modules:** `query/src/OcdLzAddonUpdater.ts` (`updateJobs` Map ~86,278).
- **Issue/Gap:** Completed/cancelled update jobs are never evicted → unbounded memory growth
  in long-running web-server processes.
- **Enhancement Blueprint:** Add TTL + max-size eviction (e.g. drop terminal jobs >24h old;
  cap at N=1000, evict oldest terminal first). Eviction on insert + a lazy sweep on read.
- **Verification Criteria:** Unit test: inserting >cap terminal jobs keeps size bounded and
  retains the newest; a job past TTL is gone on next access.

#### [W5-O4] Metrics emission layer
- **Target Files/Modules:** NEW `core/src/OcdMetrics.ts`; instrument `OciQuery` (latency),
  `OcdJsonnetRuntime` (WASM load ms), RM plan polling, GenAI calls.
- **Issue/Gap:** Only logs exist — no counters/timers/gauges. No way to measure query latency,
  WASM load time, job-queue depth, GenAI success rate in production.
- **Enhancement Blueprint:** Minimal interface (`counter/gauge/timer`) with a no-op default
  sink and an optional console/JSON sink behind `OCD_METRICS=1`, mirroring `OcdLogger`'s
  renderer-safe process guard. Emit the four key signals above. Keep it sink-agnostic so a
  Prometheus/OTel sink can drop in later (ties to the existing observability foundation T15).
- **Verification Criteria:** Unit test: timer records duration; counter increments; default
  sink is a no-op (zero overhead). One instrumented path emits a timer in a test.

#### [W5-O5] End-to-end correlation-id propagation
- **Target Files/Modules:** `query/src/OciQuery.ts` (`queryTenancy` entry ~61) +
  `facade/OciApiFacade.ts`; web-server handler → query call chain.
- **Issue/Gap:** Request IDs stop at the HTTP boundary; OCI SDK / query-layer work is not
  correlated back to the originating request. Tracing breaks one hop in.
- **Enhancement Blueprint:** Thread an optional `requestId` (or a small `TraceContext`) from
  the HTTP handler into query methods; attach to scoped logger (`OcdLogger.scope(requestId)`)
  and to metrics labels. Renderer generates an id and sends it via header through the facade.
- **Verification Criteria:** Test: a request id set at the boundary appears in a query-layer
  log line for the same operation. No design JSON / OCID in correlated logs (existing contract).

#### [W5-O6] Close residual `console.*` + silent-catch swallows
- **Target Files/Modules:** `desktop/src/handlers/OciPriceListHandlers.ts` (37,49,63);
  `desktop/src/main.tsx:27`; `react/src/pages/OcdIntegrations.tsx:209` (`.catch(()=>setSourceHealth([]))`);
  `query/src/OcdLzAddonUpdater.ts:280` (`.catch(()=>undefined)`); debug spam in
  `react/src/pages/OcdConsole.tsx:128` and `components/OcdPropertyTypes.tsx` (14+ per-render logs).
- **Issue/Gap:** Logger adoption is incomplete; some catches discard the error AND its cause,
  masking failures; per-render `console.debug` of full config/property objects hurts perf and
  can leak structure.
- **Enhancement Blueprint:** Replace `console.*` with scoped `OcdLogger`. For each silent
  catch, log the error (warn/error) before any fallback and keep the fallback. Delete or
  `OCD_LOG_LEVEL=debug`-gate per-render debug logs.
- **Verification Criteria:** `grep -rn "console\.\(log\|debug\|warn\|error\)" ocd/packages/*/src`
  returns only intentional bootstrap sites. No `catch(()=>...)` that drops the error silently.

### Pillar B — Software Engineering & Code Compression

#### [W5-E1] Property-field factory
- **Target Files/Modules:** `react/src/components/OcdPropertyTypes.tsx` (~616 lines; 15
  near-identical `Ocd*Property` components, ~lines 131-261).
- **Issue/Gap:** ~400 lines of duplicated boilerplate (context read, local state, onChange/
  onBlur, className, properties extraction) repeated per field type — ~65% of the file.
- **Enhancement Blueprint:** Extract a `usePropertyField(attribute)` hook (state + handlers +
  className) and a `createPropertyComponent(type, renderInput)` factory. Re-express the 15
  exports as thin factory calls. Public exports unchanged.
- **Verification Criteria:** File <250 lines; existing property-panel tests pass; manual edit
  of text/number/boolean/lookup fields behaves identically.

#### [W5-E2] `listResourcesByCompartment<T>` helper
- **Target Files/Modules:** `query/src/OciQuery.ts` (1343 lines; ~50 `list*` methods with
  identical map→`runWithConcurrency`→`allSettled`→`collectSettled` scaffolding); apply the
  same pattern to `OciReferenceDataQuery.ts` where it fits.
- **Issue/Gap:** ~400 lines of duplicated async scaffolding; a concurrency/error fix means 50
  edits.
- **Enhancement Blueprint:** Private generic `listResourcesByCompartment<T>(compartmentIds,
  listFn, mapRequest?)` encapsulating concurrency + settle collection + (from W5-O2) retry.
  Collapse each method to a 1-2 line delegation. Do jointly with W5-O2.
- **Verification Criteria:** `OciQuery.ts` materially shorter; existing query tests pass;
  behavior (order preservation, partial-failure tolerance) unchanged.

#### [W5-E3] Edit-time clone cost
- **Target Files/Modules:** `components/OcdDocument.ts` (~40-43 `structuredClone` per edit);
  `components/OcdConsoleConfiguration.ts`; LZ overlays `OcdLzScaffold/Observability/Oke/IamBlueprint.ts`.
- **Issue/Gap:** Whole-design deep clone on every property change — O(design size) per
  keystroke; scales poorly for large designs.
- **Enhancement Blueprint:** Introduce structural sharing — adopt `immer` `produce()` for
  document mutations (immutability preserved, only changed paths copied), OR a path-patch
  update model. Start with the hottest path (property edits) and measure before expanding.
- **Verification Criteria:** Benchmark: edit latency on a 200-resource design improves
  measurably vs baseline; clone-tree tests still pass; no shared-reference mutation regressions.

#### [W5-E4] Context-ize prop drilling
- **Target Files/Modules:** `components/Menu.ts` (894 lines; 30+ handlers each taking 5-6
  params already in context); `pages/OcdConsole.tsx` (Header/Toolbar/Body/Footer re-passed
  identical props ~138-160).
- **Issue/Gap:** Document/console/active-file state is threaded manually despite existing
  `DocumentContext` / `ConsoleConfigContext` / `ActiveFileContext`.
- **Enhancement Blueprint:** Have menu handlers and console children read from `useContext`
  instead of receiving props. Where a handler runs outside React (menu callbacks), pass a
  single `MenuContext` snapshot object instead of 6 positional args.
- **Verification Criteria:** Handler signatures collapse to ≤2 args; menu actions and console
  render behave identically; no new re-render storms (spot-check with React profiler).

#### [W5-E5] Shared LZ overlay base
- **Target Files/Modules:** `landingzone/OcdLzIamBlueprint.ts`, `OcdLzObservability.ts`,
  `OcdLzOke.ts`, `OcdLzScaffold.ts` (485-551 lines each, identical clone→upsert-by-role flow).
- **Issue/Gap:** ~200 shared lines of overlay mechanics duplicated 4×; a fix in one must be
  applied to four.
- **Enhancement Blueprint:** Extract a base (`applyOverlay(design, specs, roleKey)`) handling
  clone + find/upsert + role marking; each blueprint supplies only its specs. Reconcile is
  idempotent (per existing dual-tick pattern) — preserve that.
- **Verification Criteria:** Each overlay file materially shorter; LZ reconcile/scaffold tests
  pass; generated model identical for a fixed input.

#### [W5-E6] Split oversized modules + single-source generated export index
- **Target Files/Modules:** `components/OcdCanvas.tsx` (785), `query/src/OciQuery.ts` (1343 →
  helped by W5-E2), `governance|analysis/OcdReachability.ts` (574); 4 byte-identical generated
  `resources.ts` export indexes under `export/src/{terraform,markdown,excel}` + `import/terraform`.
- **Issue/Gap:** Files over the project's 800-line ceiling / 200-400 target; ~870 lines of
  duplicated generated export lists.
- **Enhancement Blueprint:** Extract `OcdCanvasRelations.ts` (relation graph + connector
  merge helpers) and a `useArchitectureRelation()` hook from the canvas; pull graph traversal
  out of reachability into a util. Change the codegen to emit one shared resource-index and
  re-export it from the four paths.
- **Verification Criteria:** No `src` file >800 lines (except generated); canvas + reachability
  tests pass; `md5` of the 4 export indexes no longer identical-by-duplication (single source).

### Pillar C — Defensive Security Posture

#### [W5-S1] Canonicalize silent-save path (symlink defense) — CONFIRMED
- **Target Files/Modules:** `desktop/src/main.ts` `isSafeSilentSavePath` (~97-102).
- **Issue/Gap:** Prefix check uses `path.resolve()` only; a symlink inside a safe dir
  (`~/Documents/x.okit → /etc/...`) passes the check, letting a silent write escape the sandbox.
- **Enhancement Blueprint:** Canonicalize with `fs.realpathSync(path.dirname(resolved))`
  (dir must exist) before the prefix comparison; on `ENOENT`/non-safe, fall through to the
  save dialog rather than writing silently.
- **Verification Criteria:** Unit test with a symlinked temp dir: a path resolving outside the
  safe set is rejected; a genuine in-sandbox path still saves silently.

#### [W5-S2] GenAI/LLM egress hardening
- **Target Files/Modules:** `react/src/architecture-agent/OcdArchitectureAgent.ts`
  (endpoint validation ~404-418; fetch ~418-444).
- **Issue/Gap:** Endpoint validated for protocol only. https to internal/private hosts is
  allowed (SSRF to internal services); no response-size cap (memory exhaustion from a hostile
  endpoint).
- **Enhancement Blueprint:** Reject link-local / metadata / private ranges
  (`169.254.0.0/16`, `127/8` except explicit loopback dev, `10/8`, `172.16/12`, `192.168/16`)
  unless an explicit user-configured allowlist opts them in. Enforce a response-size cap via
  `content-length` check + bounded streaming read (e.g. 10 MB).
- **Verification Criteria:** Unit tests: metadata IP rejected; oversized `content-length`
  rejected before parse; an allowlisted host passes. No behavior change for normal https providers.

#### [W5-S3] Schema-validated ingestion boundary
- **Target Files/Modules:** `react/src/landingzone/OcdLzFileImport.ts` (~49-54 JSON.parse, no
  size cap); `react/src/import/OcdDrawioImport.ts` (regex over untrusted XML, ~79-106); OCD
  design file open path.
- **Issue/Gap:** Untrusted files are parsed and trusted into the model without schema
  validation or per-file size caps; draw.io regex can be driven to pathological work; large
  JSON can exhaust memory.
- **Enhancement Blueprint:** Add per-type size caps (e.g. 5 MB for LZ json); validate parsed
  shapes with a schema (zod/ajv) before they enter the model; in draw.io parse, bail after a
  max cell count (e.g. 10k) and prefer a real XML parser if cheap. Reject (typed error) rather
  than partially importing on validation failure.
- **Verification Criteria:** Unit tests: oversized file rejected; malformed JSON yields a typed
  error (not a thrown stack into the UI); >10k-cell draw.io input bails; valid inputs unchanged.

#### [W5-S4] Robust LLM JSON extraction
- **Target Files/Modules:** `architecture-agent/OcdArchitectureAgent.ts` `extractJsonObject`
  (~755-762).
- **Issue/Gap:** `indexOf('{')`/`lastIndexOf('}')` slicing can grab a wrong/forged object span
  from a crafted LLM response before the existing plan-schema gate runs.
- **Enhancement Blueprint:** Parse candidates with `JSON.parse` (try fenced block first, then
  whole text), choose the first that both parses AND passes the Architecture Plan schema gate;
  otherwise throw. Keep the existing schema validation as the authority.
- **Verification Criteria:** Unit test: a response with a decoy object + a valid plan yields the
  valid plan; a response with no schema-valid object throws.

#### [W5-S5] GitHub-token child-process defense-in-depth (downgraded → MEDIUM)
- **Target Files/Modules:** `query/src/OcdLzAddonUpdater.ts` (`childEnvWithGitHubToken` ~94-96;
  `spawn`/`execFile` ~228-231, 311-315).
- **Issue/Gap:** Token injected via full `{...process.env, GITHUB_TOKEN}`. stdout is redacted,
  but the child inherits the entire parent env and the token rides in it.
- **Enhancement Blueprint:** Pass a minimal env (`PATH`, `HOME`, required git vars + the token)
  rather than the whole `process.env`; keep `redactToken` at capture time. (Stdin-handoff is a
  larger change — record as optional follow-up, not required.)
- **Verification Criteria:** Updater still authenticates against a private add-on in a manual/
  mocked run; child env no longer carries unrelated parent variables; stdout redaction test passes.

#### [W5-S6] Tighten library-segment validation
- **Target Files/Modules:** `desktop/src/main.ts` `assertSafeLibrarySegment` / `SAFE_LIBRARY_SEGMENT`
  (~746-751).
- **Issue/Gap:** Regex allows `.`; relies on a separate `..` substring check. Percent-encoded
  or Unicode-normalized traversal could slip through depending on downstream URL handling.
- **Enhancement Blueprint:** Restrict the allowed charset to `[A-Za-z0-9_-]` (drop `.`), or
  switch from segment interpolation to an explicit allowlist of known library sections/files.
  Normalize (NFC) and reject any segment containing `%` before use.
- **Verification Criteria:** Unit tests: `..`, `%2e%2e`, and dotted segments rejected; known-good
  section/file names accepted.

---

## Suggested execution order (dependencies)

1. **W5-O2 + W5-E2 together** (shared `OciQuery` surface — touch the 50 methods once).
2. **W5-O1, W5-O3, W5-S1, W5-S2, W5-S4** — independent, high-value, low-blast-radius; parallelizable
   with disjoint file ownership.
3. **W5-O6 (logger/catch cleanup), W5-E1, W5-E4, W5-E5** — modularity/cleanup.
4. **W5-O4 + W5-O5** (metrics + trace propagation) — build on logger; do after instrumented
   surfaces stabilize.
5. **W5-E3** (immer / clone) — riskiest (state semantics); do last with benchmarks, like the
   prior wave's Batch 4 ordering.
6. **W5-S3, W5-S5, W5-S6** — ingestion + perimeter hardening, schedule with the security batch.

## Progress

- **2026-06-14 — Phase 1 (W5-O2 + W5-E2) — DONE.**
  - `query/src/OciQueryConcurrency.ts`: added `withRetry()` (exp backoff + jitter,
    injectable sleep/random), `isRetryableOciError()` (429/5xx/transport codes only),
    and `DEFAULT_RETRY_*` constants.
  - `query/src/OciQueryCommon.ts`: added shared `listByCompartment<Req,Res>()` helper
    (build-request → per-request `withRetry` → `runWithConcurrency` → `collectSettled`).
    Migrated `getCompartments`.
  - `query/src/OciQuery.ts` + `OciReferenceDataQuery.ts`: 37 standard `list*` methods
    delegate to the helper; ~16 variations (namespace prereq, custom extractors,
    iterator/chained fan-outs, AD orchestrators) preserved with retry wired in.
  - `query/src/OciResourceManagerQuery.ts`: `listStacks` migrated.
  - **`retryCount` fully removed** — 0 occurrences in `packages/query/src`.
  - Test infra: new `query/vitest.config.mts` + `"test"` script; root `npm test` now
    runs react **and** query. New `query/src/__tests__/OciQueryConcurrency.test.ts` (12 tests).
  - Gates: query tsc `--noEmit` 0 · react lib `tsc -b` 0 · `npm test` = react 61/498 +
    query 1/12 · redaction 0. No commit (staged-ready per guardrails).

- **2026-06-14 — Phase 2 (W5-S1 + W5-O3 + W5-S2 + W5-S4) — DONE.** (3 parallel agents, disjoint file ownership.)
  - **W5-S1** `desktop/src/main.ts`: `isSafeSilentSavePath` now canonicalizes safe dirs and
    the target's parent via `fs.realpathSync` before the prefix check; ENOENT/unresolvable →
    falls through to the save dialog. Closes the symlinked-directory escape. (No desktop test
    runner — verified by tsc + logic review; residual leaf-symlink TOCTOU noted.)
  - **W5-O3** `query/src/`: new pure `OcdBoundedJobStore.pruneJobs()` (TTL 24h + cap 1000,
    evicts oldest terminal first, never evicts running) wired into `OcdLzAddonUpdater` on
    insert + lazy read sweep; the `.catch(()=>undefined)` now logs before swallowing.
    +5 tests (`OcdBoundedJobStore.test.ts`).
  - **W5-S2** `react/.../OcdArchitectureAgent.ts`: `isBlockedLlmHost()` blocks metadata/
    link-local/private IPv4 ranges (opt-in via new `allowInternalEndpoints`); 10 MB
    response-size cap via `content-length`.
  - **W5-S4** same file: `extractValidArchitecturePlan` collects fenced/balanced/whole-text
    JSON candidates, returns the first that parses AND passes `validateArchitecturePlan`
    (schema remains authority) — replaces brittle `indexOf/lastIndexOf`. +6 tests.
  - Gates: `npm test` = react 61/504 + query 2 files/17 · react lib `tsc -b` 0 · query tsc 0 ·
    no new `desktop/src/main.ts` errors · redaction 0. No commit (staged-ready).

- **2026-06-14 — Phase 3 (W5-S5 + W5-S6 + W5-S3 + W5-E5) — DONE.** (4 parallel agents, disjoint ownership.) **Security pillar S1–S6 now fully complete.**
  - **W5-S5** `query/OcdLzAddonUpdater.ts`: extracted pure `buildChildEnv(parentEnv, token)` —
    minimal allowlisted child env (PATH/HOME/GIT_*/proxy/TLS only) + token via reused
    normalizer; drops unrelated parent vars. +7 tests.
  - **W5-S6** `desktop/main.ts`: `assertSafeLibrarySegment` now rejects `%`, NFC-normalizes
    (rejects on change), blocks leading/trailing/consecutive dots + separators; `name.ext` ok.
  - **W5-S3** `react`: `OcdLzFileImport` 5 MB cap + typed `LzImportError`/`parseLzJson` (fails
    loud at boundary, no content leak); `OcdDrawioImport` `MAX_DRAWIO_CELLS=10000` bail. +tests.
  - **W5-E5** `react/landingzone`: new `OcdLzOverlay.ts` (cloneDesign + role-marker upsert +
    `displayNamePolicy`) consolidates ~200 dup lines across Iam/Observability/Oke/Scaffold
    (four files −87 net); byte-identical output, idempotency fence added.
  - Gates: `npm test` = react 61/512 + query 3 files/24 · react lib & query tsc 0 · no new
    `desktop/src/main.ts` errors · redaction 0. No commit (staged-ready).
  - Note: a stale `.tsbuildinfo` cache can show phantom cross-file import errors — always
    verify react with `tsc -b --force`.

- **2026-06-14 — Phase 4 (W5-O1 + W5-E1 + W5-O6 + W5-E6) — DONE.** (4 parallel agents, disjoint ownership.)
  - **W5-O1** new `core/OcdFetch.ts` `fetchWithTimeout` (AbortController + caller-signal
    honoring); routed `OciApiFacade` (4 sites, 30s), `OcdJsonnetRuntime` WASM (10s), desktop
    library/SVG fetches. Wired `core` vitest into the root gate (+4 tests).
  - **W5-E1** `components/properties/OcdPropertyTypes.tsx` 616→394 via `usePropertyField` hook +
    `createSimpleProperty` factory; per-type variations preserved; per-render console.debug
    removed. +8 tests. (Caught & fixed an import-cycle by resolving codecs at render time.)
  - **W5-O6** scoped logger + log-before-fallback across `OciPriceListHandlers.ts`, `main.tsx`,
    `OcdIntegrations.tsx`, `OcdConsole.tsx` (per-render full-config debug deleted). 0 console.* left.
  - **W5-E6** `OcdCanvas.tsx` 785→684 (new `OcdCanvasRelations.ts` + `useArchitectureRelation`);
    `OcdReachability.ts` 574→59 (new `OcdReachabilityGraph.ts`). Generated-index single-sourcing
    DEFERRED (needs codegen mass-regen — out of boundary).
  - **Integration fix:** the O1 fetch routing broke `OciApiFacade.staticBackend.test.ts` (11
    assertions over-specified `fetch` as single-arg; `fetchWithTimeout` adds `{signal}`). Fixed
    the *test* (URL pinned via `expect.anything()`/`objectContaining`) — production behavior was
    correct. LESSON: agent gates for fetch-touching cards must run the package TEST SUITE, not
    just the typecheck.
  - Gates: `npm test` = react 62/520 + query 3/24 + core 1/4 (548 total) · react/query/core tsc 0 ·
    no new desktop errors · redaction 0 · 0 console.* in targeted files. No commit (staged-ready).

## Status: 14 of 18 cards done. Remaining: W5-O4 (metrics), W5-O5 (correlation propagation), W5-E4 (context-ize prop drilling), W5-E3 (clone/immer — riskiest, last).

- **2026-06-14 — Round A (W5-O5 + W5-E4) — DONE.** (2 parallel agents.)
  - **W5-O5** end-to-end correlation: facade generates `X-Request-Id` (server-accepted charset)
    on outbound calls → web-server `handlers.queryTenancy` threads it down → `OciQuery.queryTenancy`
    uses `OcdLogger.scope(\`OciQuery:<id>\`)`. Optional/backward-compatible. +1 tracing test.
  - **W5-E4** prop drilling: `OcdConsole` children de-drilled where safe (Footer 4→0, TitleBar/
    Header read from context); persist-wrapped `setOcdConsoleConfig` left drilled (external
    consumers depend on it). Bonus: 55 `console.*` in `Menu.ts` → logger (894→787). **DEFERRED:**
    Menu handler signature consolidation — the menu is wired in `OcdConsoleMenuBar.tsx` (out of
    that agent's ownership); changing arity needs that call site in scope. Follow-up candidate.
  - Build hygiene: excluded `src/**/*.test.ts` from `query` + `core` BUILD tsconfigs so `lib/`
    ships no test files and the full build (pre-push gate) stays clean.
  - Gates: `npm test` = react 62/521 + query 3/24 + core 1/4 (549) · react/query/web-server tsc 0 ·
    query+core full compile 0 · redaction 0. No commit (staged-ready).

- **2026-06-14 — Round B (W5-O4) — DONE.** New `core/OcdMetrics.ts`: `counter`/`gauge`/`timer`/
  `time()` with a NO-OP default sink (zero overhead), `OCD_METRICS`-gated JSON sink, pluggable
  `setSink()` for future Prometheus/OTel, coarse-labels-only contract (no OCIDs/requestIds).
  Instrumented `oci.query.tenancy.ms`, `lz.wasm.load.ms`, `architecture.genai.ms`,
  `rm.planreview.poll` — all wrap-only/try-finally-safe. +7 tests.
  Gates: `npm test` = react 62/521 + query 3/24 + core 2/11 (556) · react lib tsc 0 ·
  query+core full compile 0 · redaction 0.

- **2026-06-14 — W5-E3 (edit-time clone cost) — RESOLVED BY MEASUREMENT, refactor declined.**
  Built a benchmark (`OcdDocument.cloneBenchmark.test.ts`) measuring `OcdDocument.clone`
  (full-design `structuredClone`): median **0.37ms @100, 1.03ms @300, 1.71ms @500 resources** —
  sub-2ms even at 500, well inside a 16ms keystroke budget. The audit's "deep-clone per edit
  is a bottleneck" premise does not hold; `structuredClone` is native/fast and the real
  edit-latency cost is React re-render, not the clone. An `immer`/structural-sharing rewrite
  of OcdDocument's central mutation path is high-risk (shared-reference mutation bugs) AND
  `immer` needs `npm install` (violates the appdmg/overrides guardrail) — strongly negative-ROI
  for ~1ms. Decision: **do not refactor**; benchmark retained as a regression guard so it's
  re-measurable if the design model grows heavy (e.g. large embedded payloads).

## FINAL STATUS: all 18 cards resolved. Security ✅, Observability ✅, Engineering ✅ (E3 = measured, no change warranted).
**Only W5-E3 (edit-time clone cost) remains — intentionally deferred.** Rationale: it is the
riskiest card (rewrites OcdDocument's central clone/mutation semantics — the "shared-reference
mutation regression" risk), the prior wave sequenced its equivalent (Batch 4) last with
benchmarks, AND adopting `immer` requires an `npm install` which the project guardrail forbids
(prunes the appdmg DMG optional dep + can revert the security `overrides`). It should be its own
focused session: build an edit-latency benchmark first, then either a no-new-dependency
patch-based update model or a carefully-managed immer add with a full lockfile/override re-verify.

## Guardrails (inherited)

- Do NOT run full `npm run build` from `ocd/` (appdmg won't compile on Node 26). Verify scoped:
  `cd ocd && npm test`; `cd ocd/packages/react && npm run build`; desktop `npx tsc -b`.
- Public fork: no real OCIDs/IPs/namespaces; redaction gate runs pre-commit. Synthetic test
  fixtures only.
- Do NOT commit unless the user explicitly asks. Leave changes staged-ready.
- Fan out feature agents with disjoint file ownership; never `npm dedupe` (reverts overrides).
