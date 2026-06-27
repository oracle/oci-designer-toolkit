# Modern Landing Zone Wizard — Build Spec (Phase 1)

Rebuild the OCD "Landing Zone Wizard" page (`OcdLandingZone.tsx`) into a modern, self-styled, 5-step product UI matching the deployed "Landing Zone Next Gen" (LZNG) look. Phase 1 = full modern shell + **Foundation step fully working end-to-end** + live React-Flow network diagram; steps 2–5 scaffolded with working navigation.

## Target visual (the design to match)
A polished single-page wizard rendered inside OCD's console body. Top to bottom:

1. **Dark app header bar** (full width, near-black `#1e1b1a`/`--oracle-bark`): left = a small red square logo + "**Oracle Cloud Infrastructure**" (bold white) + a thin divider + "Landing Zone Next Gen" (muted). Right = a small segmented group of 4 ghost icon-buttons (layout toggles: split-panel, list, diagram, code `</>`); the split-panel one is active (red). These can toggle the left/right panel visibility (split = both, list = form only, diagram = diagram only, code = JSON view). Functional but simple.
2. **Page title row** (on `--oracle-bg #F5F5F5`): left = "**Untitled Landing Zone**" (large bold) + subtitle "Step 1 of 5 — Foundation. The diagram and JSON build up as you go." Right = three buttons: "Download .drawio", "Download JSON" (white/outlined), "Reset" (white/outlined). Title is editable on click (sets the LZ name).
3. **Stepper**: a horizontal row of 5 step "pills" — `1 Foundation` (active = solid Redwood red `#C74634`, white text), `2 Hub Network`, `3 Projects`, `4 Platform Templates`, `5 Review` (inactive = white card, 1px border, numbered circle). Clicking a pill navigates. Each pill is a rounded card with a top red accent border when active.
4. **Two-column body** (grid, ~`minmax(420px, 560px) 1fr`, gap 24px):
   - **Left = step content cards** (white, 1px `--oracle-border`, ~10px radius, red top-accent strip, 20–24px padding). For Foundation:
     - Card "**Foundation**": REALM `<select>` (OC1 — Commercial, etc.) and REGION `<select>` (eu-frankfurt-1 (FRA), …) side by side; "REGION SHORT NAME" text input below (e.g. `fra`). Uppercase small bold labels.
     - Card "**Environments**": a table with columns NAME | SECURITY ZONE | ACTIONS. Each row: name `<input>`, a **toggle switch** (On = green `--oracle-success`, Off = grey) for security zone, and a red "Del" button. Below: "ADD ENVIRONMENT" row — name input + toggle + red "Add" button. Default environments: prod (SZ on), preprod (off), dev (off).
   - **Right = "Network Diagram" card** (white, red top-accent): header "Network Diagram" + a "Collapse ›" button. Body = a **React-Flow** canvas on a dotted-grid background with: a zoom toolbar (top-left: `+` `−` `103%` `50% 100% 150% 200% 300%` fit-to-view, reset), a **MiniMap** (bottom-right), and nodes: an outer dashed container labeled "OCI Region · eu-frankfurt-1 (fra) — oc1" containing a red-tinted "**Hub VCN**" node and one node per environment (prod = green-tinted when its security zone is On; others = white). The diagram updates **live** as Foundation fields change.

Palette/type = Oracle Redwood (already defined): `--oracle-red #C74634`, `--oracle-red-dark #A63D2E`, `--oracle-bark #312D2A`, `--oracle-bg #F5F5F5`, `--oracle-white`, `--oracle-border #E0E0E0`, `--oracle-success #2e7d32`, `--oracle-text-muted #5C5C5C`; font `'Segoe UI', system-ui`. WCAG 2.2 AA.

## CRITICAL: self-styled, theme-independent
The current page renders unstyled because its classes were scoped under `.ocd-console-redwood-ng-theme`. The new wizard must look correct **regardless of the selected OCD theme**. Give it its OWN stylesheet scoped under a single root class (e.g. `.ocd-lzng`) on the page's outer div, imported by the page (or added to `ocd.css`/a new `ocd-lzng.css` imported in `desktop/src/main.tsx`). Do NOT depend on the theme dropdown. Use the `--oracle-*` tokens (define them in the wizard's own `:root`/`.ocd-lzng` scope so they exist even without the redwood-ng theme loaded).

## Data model (confirmed)
```
{ region:'eu-frankfurt-1', region_short_name:'fra', realm:'oc1',
  hub:{ kind:'hub_a', network:{ vcn:'10.100.0.0/21' } },
  environments:{ prod:{}, preprod:{}, dev:{} } }
```
Security-zone selections are emitted as `config.security_targets` (array of env names with SZ on). Hub fixed to `hub_a`, VCN `10.100.0.0/21` for now.

## Reuse existing (do NOT rewrite these services)
Under `ocd/packages/react/src/landingzone/`:
- `OcdLzRegions.ts` (REALM_OPTIONS, getRegionsForRealm, …), `OcdLzStep1Config.ts` (DEFAULT_STEP1, normalizeStep1, validateStep1, serializeStep1Config), `OcdLzGenerator.ts` (`generateLandingZoneFiles(step1)` → OE JSONs via jsonnet-WASM), `OcdLzCompartmentDiagram.ts`, `OcdLzDownloads.ts` (downloadTar/downloadTextFile), `OcdLzWizardContext.tsx`, `OcdJsonnetWasm.ts`, `OcdOeJsonnetFiles.ts` (throws a friendly "run npm run setup-lz" error if OE sources absent — handle in UI).

## End-to-end wiring (Phase 1)
- **Live diagram**: build React-Flow nodes/edges directly from the Foundation config (Region container → Hub VCN + env nodes), updating on every change. Fast, no jsonnet needed for the live view.
- **Download JSON**: run `generateLandingZoneFiles(step1)` (jsonnet OE generation) → download the OE JSON set (tar) AND/OR the config JSON. If OE sources aren't installed, catch the error and show a clear inline notice: "Run `npm run setup-lz` to enable Landing Zone generation."
- **Download .drawio**: export the current diagram as drawio XML (a simple generator producing mxGraph XML for the region/hub/env boxes is fine; or reuse OcdLzDownloads patterns).
- **Reset**: clear wizard state (confirm dialog) back to DEFAULT_STEP1.
- **Title editable**: stores the LZ name (used in downloads filename).

## Steps 2–5 (scaffold only this phase)
Stepper navigates to each; render a placeholder card per step ("Hub Network", "Projects", "Platform Templates", "Review") with a short "Coming next" note and a Back/Next footer. Foundation is the only fully-built step. Review step may show the serialized config JSON read-only. Keep the diagram visible across steps.

## Files
- Rewrite: `ocd/packages/react/src/pages/OcdLandingZone.tsx` (the page + stepper + shell; keep <300 lines by extracting step/diagram components into `landingzone/ui/`).
- New: `ocd/packages/react/src/landingzone/ui/` — `LzngHeader.tsx`, `LzngStepper.tsx`, `LzngFoundationStep.tsx`, `LzngNetworkDiagram.tsx` (React-Flow), `LzngToggle.tsx`, plus step stubs.
- New: a `.drawio` exporter helper if not reusing existing.
- New CSS: `ocd/packages/react/src/css/ocd-lzng.css` scoped under `.ocd-lzng`; import it in `ocd/packages/desktop/src/main.tsx` (and it gets copied to desktop/src/css by prebuild — note the gitignore for desktop/src/css copies). Also `import '@xyflow/react/dist/style.css'` (React-Flow base CSS) in the page or main.tsx.
- `@xyflow/react@12` is already installed in `packages/react`.

## Verify
- `cd ocd && npm run build --workspace=packages/react` passes.
- The page renders styled in the running web dev server (`npm run web`) under the DEFAULT theme (self-styled). Foundation edits update the React-Flow diagram live. Download JSON triggers OE generation (or the setup-lz notice). No console errors.
- Keep it accessible: labels, focus rings, toggle has role/aria, stepper buttons are buttons.

## Out of scope (later phases)
Full Hub Network/Projects/Platform-Templates step logic; terraform-oci-core-landingzone Terraform emission; AI/YOLO modes; importing from OCI.
