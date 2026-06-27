# Landing Zone Wizard — Implementation Blueprint (WS3)

Embed the "Landing Zone Next Gen" (LZNG) jsonnet-WASM Operating-Entities (OE) generator into OCD as a new "Landing Zone Wizard" page. Source app (reference, read-only): `/Users/abirzu/dev/landing-zone-next-gen`. Target: `/Users/abirzu/dev/oci-designer-toolkit-fork/ocd`.

## Verified facts (authoritative)
- jsonnet runs via **Go-WASM**: `3rd/go-jsonnet/libjsonnet.wasm` (7.69 MB) + Go `wasm_exec.js` (17 KB) exposing global `window.jsonnet_evaluate_snippet(filename, code, files, extStrs, extCodes, tlaStrs, tlaCodes) => Promise<string>` (7 args). Source: `src-lzng/services/jsonnetWasm.js`, `3rd/go-jsonnet/main.go`.
- OE jsonnet vendored from `oci-landing-zones/oci-landing-zone-operating-entities`, **commit `917f56214282b2d301d95dbce799e79fb0cd94d0`**, UPL-1.0. 146 `gen/**/*.{jsonnet,libsonnet}` files (~796 KB). Entry: `/gen/landing_zone_multi.jsonnet`, a `function(config)` invoked via `tlaCodes:{config:<jsonnet>}`. Output: `{ "iam.json":{…}, "network.json":{…}, … }`.
- The memory importer resolves relative imports against the importing file's dir, so the files map must contain BOTH `/gen/x` and gen-relative `x` keys (LZNG's `oeJsonnetFiles.js` does this) + a `addOc19RealmConstants` overlay on `constants.libsonnet`.
- Diagram reads `iam.json` → `compartments_configuration.compartments` (`compartmentDiagram.js`).
- **OCD React = 18.3.1** (LZNG = 19). LZNG uses only `useState/useEffect/useReducer/useContext/useMemo/useCallback` → safe port to 18. Do NOT bring `@types/react@19`.
- `@ocd/react` builds as a **Vite library** (`build.lib`, ES, `src/**` glob, externals react/jsx-runtime); desktop consumes the built `dist`. So assets must survive a **double-bundle** (react lib → desktop renderer) and Electron **asar**.
- No CSP is set today. `WebAssembly.instantiate(bytes)` works. If CSP added later, needs `script-src 'wasm-unsafe-eval'`.

## Decisions
1. **Vendor (copy), do not submodule.** Copy `gen/**` into the react package; retain `LICENSE.txt` + record upstream SHA above. Submodules aren't in packaged builds.
2. **Bundle OE jsonnet as a GENERATED `.ts` string map** (`Record<string,string>`), same pattern as `OciPriceListSnapshot.ts`. Avoids `import.meta.glob` surviving the lib re-bundle. Ship a generator script.
3. **WASM:** copy `libjsonnet.wasm` to `packages/desktop/public/` via the desktop `prebuild` step (Vite copies `public/` verbatim → deterministic runtime path under `file://`). Resolve at runtime with `new URL('libjsonnet.wasm', …)`; keep the `instantiateStreaming`→`arrayBuffer()` fallback (asar `file://` MIME). Set `asar.unpack: '**/*.wasm'` in forge config.
4. **wasm_exec.js → `wasmExec.ts`** vendored, self-installing `globalThis.Go` on import, `// @ts-nocheck`, byte-faithful to the version matching the .wasm. No `document.createElement('script')`.
5. New self-contained `packages/react/src/landingzone/` dir (mirrors `cost/`). Page `pages/OcdLandingZone.tsx`. New `displayPage: 'landingzone'`.
6. **Reuse Redwood-NG theme.** Drop LZNG inline styles (legacy blue `#1976d2`); use `ocd-lz-*` classNames (theme agent styles them under `.ocd-console-redwood-ng-theme` later). No react-router.

## Files to CREATE (paths under ocd/)
- `packages/react/src/landingzone/wasm/libjsonnet.wasm` (copy from LZNG `3rd/go-jsonnet/`)
- `packages/react/src/landingzone/wasm/wasmExec.ts` (vendored wasm_exec.js, `// @ts-nocheck`, self-installs `globalThis.Go`)
- `packages/react/src/landingzone/oe/gen/**` (146 files, copy of submodule `gen/`)
- `packages/react/src/landingzone/oe/LICENSE.txt` (UPL-1.0 + `# upstream: oci-landing-zone-operating-entities @ 917f56214282b2d301d95dbce799e79fb0cd94d0`)
- `packages/react/src/landingzone/oe/OcdLandingZoneJsonnetSources.ts` (GENERATED `export const OE_JSONNET_SOURCES: Record<string,string>` keyed by gen-relative path; header "GENERATED — DO NOT EDIT")
- `scripts/generate_lz_jsonnet_sources.mjs` (walks `oe/gen/**`, emits the above)
- `packages/react/src/landingzone/OcdJsonnetWasm.ts` — `const WASM_URL = new URL('wasm/libjsonnet.wasm', import.meta.url).href` (adjust to whatever resolves to the public copy); `import './wasm/wasmExec'`; `ensureJsonnetWasm(): Promise<JsonnetEvaluate>`; `evaluateJsonnet({filename,code,files,tlaCodes}): Promise<string>`. Type the 7-arg evaluate fn. Keep streaming/arrayBuffer fallback.
- `packages/react/src/landingzone/OcdOeJsonnetFiles.ts` — `getOperatingEntitiesJsonnetFiles(): Record<string,string>` (emits both `/gen/x` and `x` keys; applies `addOc19RealmConstants` to `constants.libsonnet`); port `addOc19RealmConstants`.
- `packages/react/src/landingzone/OcdLzRegions.ts` — typed port of `regions.js`: `REALM_OPTIONS`, `getRegionsForRealm`, `getDefaultRegionForRealm`, `findRegion`; `interface Realm{id;label}`, `interface Region{id;shortName}`.
- `packages/react/src/landingzone/OcdLzStep1Config.ts` — port of `step1Config.js`: `DEFAULT_STEP1`, `Step1State`/`Environment` types, `normalizeStep1`, `validateStep1(): {value:Step1State;errors:string[]}`, `serializeStep1Config`. Keep jsonnet builder template literals byte-identical to preserve output.
- `packages/react/src/landingzone/OcdLzGenerator.ts` — `generateLandingZoneFiles(step1, evaluate?): Promise<GeneratedResult>`; `GeneratedFile{name;content;size}`, `GeneratedResult{configJsonnet;files;generatedAt;renderer}`.
- `packages/react/src/landingzone/OcdLzCompartmentDiagram.ts` — `buildCompartmentDiagram`, `findGeneratedFile`; `DiagramNode`, `CompartmentDiagram{root;shared;environments}`.
- `packages/react/src/landingzone/OcdLzDownloads.ts` — `buildTarBytes`, `downloadTextFile`, `downloadTar` (typed `Uint8Array`).
- `packages/react/src/landingzone/OcdLzWizardContext.tsx` — typed `WizardProvider`, `useWizard`, `WizardContextValue`; localStorage key `ocd.lz.wizard.draft`; plain function components (no `React.FC`).
- `packages/react/src/pages/OcdLandingZone.tsx` — default export `({ ocdDocument, setOcdDocument, ocdConsoleConfig, setOcdConsoleConfig }: ConsolePageProps): JSX.Element`. Port `WizardShell.jsx`'s WizardBody + DiagramPanel; classNames `ocd-lz-*` (no inline styles, no router). Accept `ocdDocument` (unused in v1; reserved for stretch "Send to Designer").
- `packages/react/src/landingzone/__tests__/*.test.ts` — port LZNG vitest specs (step1Config/regions/compartmentDiagram/oeJsonnetFiles/generator).

## Files to MODIFY (mirror the BoM-page wiring exactly)
- `packages/react/src/components/OcdConsoleConfiguration.ts` — add `'landingzone'` to the `displayPage` union.
- `packages/react/src/pages/OcdConsole.tsx` — (a) `import OcdLandingZone from './OcdLandingZone'`; (b) in `OcdConsoleToolbar` add `onLandingZoneClick` mirroring `onEstimateClick`; (c) toolbar icon `<div className='landing-zone ocd-console-toolbar-icon' title='Landing Zone Wizard' onClick={onLandingZoneClick} aria-hidden></div>` near the `cost-estimate` icon; (d) `case 'landingzone': DisplayPage = OcdLandingZone; break;` in the `OcdConsoleBody` switch.
- `packages/react/src/css/theme.css` — add `.landing-zone { background-image: url(<data-uri icon>) }` mirroring `.cost-estimate`.
- `packages/react/vite.config.ts` — `assetsInclude: ['**/*.wasm']`.
- `packages/desktop/vite.renderer.config.mts` — `assetsInclude: ['**/*.wasm']`, `build:{ target:'esnext' }`.
- `packages/desktop/forge.config.ts` — `asar: { unpack: '**/*.wasm' }` (was `asar:true`).
- `packages/desktop/electron-builder.config.js` — add `"asarUnpack": ["**/*.wasm"]`.
- `packages/desktop/package.json` — extend `prebuild` to copy `libjsonnet.wasm` into `packages/desktop/public/` (mirror the CSS copy step).
- root `package.json` — add `"generate-lz-jsonnet": "node scripts/generate_lz_jsonnet_sources.mjs"`.

## Data flow
input → WizardContext (localStorage `ocd.lz.wizard.draft`) → `validateStep1`/`serializeStep1Config` → `config.jsonnet` → `generateLandingZoneFiles` → `getOperatingEntitiesJsonnetFiles()` + `evaluateJsonnet({filename:'/gen/landing_zone_multi.jsonnet', code, files, tlaCodes:{config}})` → `ensureJsonnetWasm()` (globalThis.Go + instantiate wasm) → JSON → `GeneratedFile[]` → page renders DiagramPanel (`buildCompartmentDiagram(findGeneratedFile(files,'iam.json'))`) + download (tar). Stretch (note only): map `iam.json` compartments → `OciCompartment` model.

## Build order
1. Vendor assets (wasm, wasmExec.ts, oe/gen + LICENSE, SHA). 2. Generator → `OcdLandingZoneJsonnetSources.ts`. 3. Build configs (vite ×2, forge, electron-builder, desktop prebuild). 4. Services (TS ports). 5. Context. 6. Page. 7. Wire-in (config union + 4 OcdConsole edits + icon CSS). 8. Tests. 9. Hand `ocd-lz-*` class list to theme agent. 10. Docs (provenance + regen command).

## Verify
```
cd ocd && node scripts/generate_lz_jsonnet_sources.mjs
npm run build --workspace=packages/react        # dist builds; grep dist for inlined OE strings; ls dist for wasm handling
npm run build --workspace=packages/query        # unaffected, sanity
npx tsc -b packages/desktop                       # IPC/types compile
npm run desktop --workspace=packages/desktop      # dev run: click Landing Zone icon → Generate → diagram renders → Download tar has iam.json/network.json
```
Packaged-DMG verification (asar wasm path) is a FOLLOW-UP: `npm run make-macos-arm64 --workspace=packages/desktop`.

## Risks
- **Double-bundle of wasm** (lib→desktop): the `desktop/public/` copy is the deterministic fallback if `new URL(...,import.meta.url)` doesn't survive lib mode. Verify resolved URL in DevTools.
- **asar + file://**: `instantiateStreaming` fails on MIME → `arrayBuffer()` fallback mandatory; `asar.unpack:'**/*.wasm'` mandatory; only provable in packaged build.
- **React 18 vs 19**: safe (no 19-only APIs); don't copy 19 types.
- **Bundle +8 MB**: acceptable for desktop; optional `React.lazy` for the page.
- **wasm_exec.js/.wasm version pairing**: copy both from the SAME LZNG snapshot or it silently breaks.
- **Licensing**: OE is UPL-1.0; retain LICENSE/notice. (react source files carry GPL-3.0 headers — keep OE notice intact; do not relicense.)
