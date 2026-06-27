# Architecture — oci-designer-toolkit-next-gen (enhanced fork, v0.4.5.8)

This document describes the architecture of the enhanced fork. It complements the
upstream OKIT design and focuses on what this fork adds: the Landing Zone wizard,
the designer overlays (Realm/AD/FD scaffold, Database Observability, OKE-native,
Enterprise IAM + Policy), governance and reachability analysis, Landing Zone
plan/diff, cost estimation, web discovery, Discovery Workbench, Resource
Analytics integration, the Architecture Agent, and the build/test gates.

## 1. Monorepo layout

The app lives under `ocd/` as an npm-workspaces monorepo (TypeScript). Key
packages:

| Package | Role |
|---|---|
| `@ocd/model` | Core design model: `OcdDesign` (model + view), `OciResource`, generated provider resources, validator. The **single source of truth** for resource types and the strict `tsc` gate. |
| `@ocd/core` | Shared utilities (`OcdUtils`) and shared validation helpers such as guarded Resource Analytics SQL validation. |
| `@ocd/codegen` + `@ocd/codegen-cli` | Code generation from the OCI/Azure/Google Terraform provider schemas → model/properties/terraform/validator/excel/markdown/tabular wrappers. Driven by a curated allow-list (`OciResourceMap.ts`). |
| `@ocd/import` / `@ocd/export` | Terraform/Excel/Markdown import and export. |
| `@ocd/query` | OCI SDK discovery (server/desktop side). |
| `@ocd/react` | All UI: the console, canvas, palette, properties, the LZ wizard, Architecture Agent, Discovery Workbench, cost estimator, governance/plan pages, template gallery, update banners, and the overlays. The bulk of the fork's code. |
| `@ocd/desktop` | The app shell: Electron build (`electron-forge`) **and** the static web build (`vite.web.config.mts` → `web-dist/` for GitHub Pages). |
| `@ocd/web-server` | A localhost backend exposing read-only OCI endpoints for the browser build. |

## 2. The design model (`@ocd/model` `OcdDesign`)

- **Model** (`design.model.<provider>.resources.<type>[]`) — the actual resources
  and their fields, including FK fields (`vcnId`, `subnetId`, `securityListIds[]`)
  that drive associations.
- **View** (`design.view.pages[].coords[]`) — `OcdViewCoords` placed on the canvas.
  Nesting is via `coords.coords[]` with `container: true`; a coord's `ocid` points
  at its model resource `id`, `pgid`/`pocid` at its parent coord/resource.
- **Layers** — one per compartment; gate connector visibility (resource *rendering*
  uses the full `page.coords`, unfiltered).
- Associations are **derived from model FK fields** (`OciResource.getAssociationIds`)
  and rendered when a coord's `showConnections` is true (default).

## 3. Landing Zone wizard → designer bridge → overlays

```
LZ Wizard (Lzng* steps, OcdLzConfig)
   │  generate (jsonnet-WASM, in-browser; OE Operating-Entities sources via `npm run setup-lz`)
   ▼
OE JSON (iam.json + network.json + observability.json)
   │  buildOcdDesignFromLz(files, title, config)   [OcdLzToModel.ts]
   ▼
OcdDesign  (compartments, VCNs, subnets, gateways, …; userDefined.lzConfig + lzOrigin)
   │  on "Open in Designer":
   │    1. overlays add model resources  →  2. autoLayout  →  3. scaffold frames
   ▼
Designer canvas
```

Designer-side **overlays** are pure, immutable, and idempotent (keyed by a
`userDefined.<marker>` role, never by regenerated `id`/`okitReference`). Each is a
no-op unless its wizard tick is on and the design is `lzOrigin`:

| Overlay | Module | Adds |
|---|---|---|
| Realm/AD/FD scaffold | `OcdLzScaffold.ts` (`reconcileLzScaffold`, `addRealmAdFdFrames`) | Nested Realm > Region > AD > FD view-only `GeneralRectangle` frames (region-driven AD count from `OcdLzADData.ts`). Also addable to any design via the **Add Frames** toolbar action. |
| Database Observability | `OcdLzObservability.ts` | DBM private endpoint, OPSI private endpoint, OPSI Database Insight (wired to the OPSI PE), Management Agent. |
| OKE-native | `OcdLzOke.ts` | VCN-native CNI subnets (dedicated /20 pod subnet), enhanced OKE cluster + node pool, Workload Identity dynamic group + policy, NSG, Vault + Key. |
| Enterprise IAM + Policy | `OcdLzIamBlueprint.ts` (`applyIamBlueprintOverlay`) | Enterprise groups, compartment-scoped policy bundles, and an `lz-governance` tag namespace with cost-tracking tags. |

The **dual-tick reconcile** (`OcdLzReconcile.ts`): a wizard tick records intent on
the design; a designer "LZ sync" tick enables live reconcile. When both are on, the
`setOcdDocument` wrapper in `OcdConsole.tsx` re-applies the scaffold on every edit —
safe because the reconcile is idempotent (same-reference return on no change).

Why overlays instead of extending the OE jsonnet: AD/FD are infrastructure domains
(not IAM compartments) and the observability/OKE topologies are designer concerns;
keeping them as decoupled, testable designer overlays avoids coupling to the
vendored upstream Operating-Entities generator.

## 4. Landing Zone imports, updates, and plan/diff

- **LZNG file import** (`OcdLzFileImport.ts`) reads generated Landing Zone output
  files (`iam.json`, `network.json`, `observability.json`, etc.) and rebuilds an
  editable `lzOrigin` design. `OcdLzObservabilityBridge.ts` maps observability
  events, notification topics, service connectors, log groups, and logs.
- **Landing Zone update checks** (`OcdLzUpdateCheck.ts`, `OcdLzUpdatePlan.ts`,
  `useLzUpdateCheck.ts`) compare vendored OE source pins against upstream releases
  and render the guided update banner.
- **Upstream OKIT sync checks** (`upstream/OcdUpstreamCheck.ts`) call unauthenticated
  GitHub REST with a six-hour cache and graceful rate-limit degradation. The banner
  links to compare output and the manual curation path for new upstream resources.
- **Plan/diff** (`landingzone/plan/OcdLzPlan.ts`) compares the current design to an
  imported LZ output by resource type and display name, with id fallback. Volatile
  generated fields (`id`, `ocid`, `okitReference`, `region`, and uuid-style `*Id`
  / `*Ids` cross-references) are ignored so the page shows semantic create/update/
  delete/no-op changes.

## 5. Architecture templates and draw.io import

- **Template gallery** (`landingzone/templates/OcdArchitectureTemplates.ts`,
  `OcdTemplateGallery.tsx`) creates fresh `OcdDesign` documents from curated
  starter architectures and routes users directly to the Designer.
- **draw.io import** parses uncompressed `.drawio` / `.xml` diagrams, maps shapes
  to OCI model resources, converts edges/container nesting into associations, and
  auto-arranges the result. Compressed draw.io files must be re-exported as
  uncompressed XML.

## 6. Drag-to-connect (`OcdConnect.ts`)

"Connect mode" (toolbar toggle, `ocdConsoleConfig.config.connectMode`) changes the
canvas drag-end: dropping resource A onto B calls `connectResources(design, A, B)`,
which resolves A's `<targetType>Id` / `<targetType>Ids` FK field and sets it to B.
The association then renders via the existing connector layer. Pure + unit-tested;
default reparenting behaviour is unchanged when connect mode is off.

## 7. Governance, remediation, and reachability

- **Governance checks** (`governance/OcdGovernanceChecks.ts`) evaluate the design
  for public subnets, broad ingress, public buckets, public instances, missing
  budget/tag controls, shallow compartment segmentation, and database/LB placement
  risks. Findings are grouped by severity in `OcdGovernancePanel.tsx`.
- **Remediation** is attached to each finding. Deterministic fixes are applied
  immutably (`applyRemediation`) and clear on re-evaluation; guidance-only cases
  include a summary plus copyable Terraform snippets.
- **Reachability analysis** (`analysis/OcdReachability.ts`) walks subnets, route
  tables, gateways, databases, and security lists to flag missing egress, dangling
  route targets, public database placement, and internet-reachable databases. Its
  findings reuse the same `GovernanceFinding` shape and are displayed on the
  Governance page.

## 8. Cost estimation

`@ocd/react/src/cost`: `OcdResourcePriceMap` (all-costable-service SKUs) +
`OcdComputeShapeSkus` (per-shape OCPU/memory/GPU part numbers). Prices come from
Oracle's public `cetools` list-pricing API (`/api/pricing` proxy in dev/web-server;
direct in Electron), filtered locally per currency; a bundled snapshot is the
offline fallback. `estimateMonthlyCost` is a pure walk over the design resources.

## 9. Discovery Workbench and Resource Analytics

`@ocd/react/src/discovery` is a focused feature area for application-centric
estate analysis. It keeps the data model and analytics pure so the same snapshot
can be rendered from deterministic sample data, a browser/web-server query, or
desktop IPC:

- `OcdDiscoveryTypes.ts` defines applications, compute assets, services,
  dependencies, utilization samples, OCI target mappings, and recommendations.
- `OcdDiscoveryAnalytics.ts` summarizes inventory, dependency edges, risk counts,
  migration waves, utilization, and monthly-cost rollups.
- `OcdDiscoveryMappers.ts` maps runtimes/databases/messaging tiers to OCI target
  services for compute, OKE, load balancing, database, cache, streaming, queueing,
  observability, and security.
- `OcdDiscoveryLzRecommendations.ts` derives Landing Zone seed recommendations:
  workload compartments, observability/OKE/IAM overlays, and migration phases.
- `OcdResourceAnalytics.ts` normalizes Resource Analytics rows and merges them
  into discovery snapshots.

The console exposes the workbench as a first-class page with Inventory, Topology,
Analytics, Landing Zone Mapping, and Resource Analytics tabs. The Resource
Analytics query path is read-only and SQL-guarded in `@ocd/core`, then reused by
the web-server and Electron desktop handlers.

Discovery-focused OCI resources are curated through the normal codegen path rather
than hand-written. The latest batch adds Cloud Bridge, Cloud Migrations, Stack
Monitoring, and Log Analytics model/properties/import/export/validator surfaces
with explicit lookup overrides for generated editor dropdowns.

## 10. Architecture Agent

`@ocd/react/src/architecture-agent` adds a chat-driven design path for users who
want to describe an architecture and immediately continue editing it on the
canvas:

- `buildArchitectureAgentPrompt` creates a strict JSON prompt with the supported
  OCI resource kinds.
- `callOpenAiCompatibleArchitectureAgent` calls any OpenAI-compatible
  chat-completions endpoint supplied in the UI. The endpoint, model, and API key
  are runtime-only inputs; API keys are not persisted by the app.
- `parseArchitecturePlanResponse` accepts strict JSON and fenced JSON responses,
  then normalizes unsupported or missing fields.
- `createArchitecturePlanFromPrompt` provides an offline deterministic fallback
  for three-tier, OKE, hub-spoke, and Agentic Zero Trust requests.
- `buildDesignFromArchitecturePlan` converts the plan into real model resources
  using `OciModelResources` factories and stores provenance in
  `design.userDefined.architectureAgent`.

Provider defaults are resolved by
`@ocd/react/src/architecture-agent/OcdArchitectureAgentConfig.ts`.
Browser-visible defaults use `VITE_` variables:

- `VITE_OCD_ARCHITECT_PROVIDER`: `local`, `openai`, or `oci-genai`.
- `VITE_OCD_ARCHITECT_OPENAI_ENDPOINT` and
  `VITE_OCD_ARCHITECT_OPENAI_MODEL`: preselect the OpenAI-compatible provider.
  API keys remain runtime-only UI input and are not read from `VITE_` variables.
- `VITE_OCD_ARCHITECT_OCI_PROFILE`, `VITE_OCD_ARCHITECT_OCI_REGION`,
  `VITE_OCD_ARCHITECT_OCI_COMPARTMENT_ID`, and
  `VITE_OCD_ARCHITECT_OCI_MODEL_ID`: preselect the OCI GenAI provider. The model
  defaults to `cohere.command-a-03-2025`.
- `VITE_OCD_ARCHITECT_TEMPERATURE` and `VITE_OCD_ARCHITECT_MAX_TOKENS`: shared
  model tuning defaults.

The local web backend and desktop bridge also accept backend-only OCI GenAI
defaults: `OCD_ARCHITECT_OCI_PROFILE`, `OCD_ARCHITECT_OCI_REGION`,
`OCD_ARCHITECT_OCI_COMPARTMENT_ID`, and `OCD_ARCHITECT_OCI_MODEL_ID`. These do
not carry credentials; OCI authentication continues to come from the selected
OCI SDK profile.

Agentic Zero Trust plans map the reasoning -> policy -> scoped-execution pattern
to editable OCI resources where the designer model supports them: API Gateway,
Functions, Web Application Firewall, Dynamic Groups, IAM policies, Vault, Data
Safe, Cloud Guard, Logging Analytics, Service Connector, logging, monitoring,
and budgets. ZPR and Security Zones remain documented assumptions until editable
model resources are available for those services.

The console exposes the feature as **AI Architect** in the toolbar and as
**View -> Architecture Agent**. Applying a plan replaces the active document with
the generated design, runs the existing auto-layout path, and returns the user to
the Designer.

## 11. Web vs Desktop runtime

- **Electron desktop**: OCI discovery, Terraform import, and pricing route through
  the Electron main process (IPC). Discovery Workbench and Resource Analytics use
  the same IPC/facade pattern. Full functionality.
- **Static web (GitHub Pages)**: no backend. The wizard (jsonnet-WASM), palette,
  OE generation, cost snapshot, scaffold/overlays, and Terraform/LZNG/draw.io
  imports work client-side. OCI discovery and live pricing proxy calls require the
  `@ocd/web-server` backend (`npm run web-server`) or the desktop app. Discovery
  Workbench can still render its deterministic sample snapshot without the backend.
  The Architecture Agent also works client-side: local planning is offline, while
  BYO-LLM calls require the user-provided endpoint to allow browser access.

## 12. Build & test gates (important)

- **Two-level build.** The Electron renderer consumes the **prebuilt** `@ocd/react/dist`,
  so source edits need `npm run build --workspace=packages/react` to take effect.
  The static web build (`vite.web.config.mts`) **aliases `@ocd/react` to source**,
  so it reflects edits directly and splits vendors out of the entry chunk.
- **Strict gate = the full `npm run build`** (`tsc -b` across all workspaces, incl.
  `@ocd/model`'s `tsc -p tsconfig-cjs.json`). This catches generated-code type
  errors that `build:pages` (Vite-only) and Vitest do not — e.g. a curated
  attribute named `resources`/`resource`/`results` collides with the generator's
  reserved parameter.
- **Tests**: `cd ocd && npm test` (Vitest coverage for Landing Zone generation,
  imports, overlays, governance, reachability, plan/diff, IAM blueprint,
  discovery analytics, Resource Analytics, Architecture Agent, and codegen
  catalog guards). E2E: `npm run test:e2e` (Playwright wizard smoke, hero CTA,
  Discovery Workbench, Classic parity, and Architecture Agent flows; skips
  gracefully where OE generation is unavailable headless).
- **Codegen catalog** is curated in batches (`OciResourceMap.ts` + curated
  `resourceAttributes`); a blind full regen yields empty skeletons. Generation is
  deterministic.
- **Node 26 CI / desktop packaging.** GitHub Pages and desktop workflows are pinned
  to Node 26. macOS arm64 DMG builds keep `appdmg` optional and patch its detach
  retry path via `patch-package` so transient EDR locks on the mounted image do not
  fail the build.

## 13. Security

No OCIDs, tenancy names, public IPs, or secrets are committed. OCID-bearing OE
reference data is fetched locally via `npm run setup-lz` (git-ignored `baselines/`).
A pre-commit redaction gate (`.githooks/pre-commit`) scans staged diffs.
