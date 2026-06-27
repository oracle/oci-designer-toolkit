# OCI LZ Designer — Consolidated Roadmap

Captures the larger, multi-phase work requested for the enhanced toolkit. Each phase is independently shippable. Status: ▢ todo · ◐ in progress · ✅ done.

## Already delivered (this branch)
- ✅ Oracle Redwood (Next-Gen) theme; live cost estimator (cetools pricing); modern 5-step Landing Zone Wizard (Foundation→Review) with live React-Flow diagram + real Operating-Entities jsonnet generation.
- ✅ OCI stencil palette restored (was commented out upstream); web Terraform import; Back-to-Designer exit; in-app LZ update notifications (GitHub) + `setup-lz`.
- ✅ Issue fixes (#434/#633/#563/#369/#452/#741/#543, etc.).
- ✅ **Landing Zone wizard promoted to hero entry point** (v0.4.5.1). The 15 px toolbar icon was replaced by a labeled primary red-pill button (`.ocd-lz-hero-cta`, text "Landing Zone Next-Gen") rendered in the console home area. E2E coverage added: `e2e/specs/lzng-hero-cta.spec.ts`.
- ✅ **Architecture template gallery** (v0.4.5.1). File ▸ **New from Template...** creates a fresh design from curated OCI starter architectures.
- ✅ **Upstream OKIT feature-sync banner** (v0.4.5.1). Landing Zone update checks now also surface upstream OKIT commits/resources that need manual fork curation.
- ✅ **Governance, remediation, and reachability** (v0.4.5.1-v0.4.5.3). The Governance page now reports posture findings, provides Terraform guidance, applies deterministic fixes safely, and includes network reachability checks.
- ✅ **Landing Zone plan/diff** (v0.4.5.3). Compare the current design against imported LZNG output with create/update/delete/no-op groups and semantic field diffs.
- ✅ **Enterprise IAM + Policy blueprint** (v0.4.5.4). One Designer add-on applies LZ groups, compartment-scoped policy bundles, and cost-tracking tag namespace/tags idempotently.
- ✅ **Node 26 and macOS DMG hardening** (v0.4.5.4). Pages/desktop CI is pinned to Node 26, and the macOS arm64 DMG path survives transient EDR locks.
- ✅ **A2 catalog curation resumed** (v0.4.5.5). Added ADM and AI Document/Language/Anomaly Detection resources and a codegen catalog guard test.
- ✅ **Discovery Workbench** (v0.4.5.6). Added a console page for application inventory, dependency topology, utilization/cost analytics, OCI target mapping, migration waves, Landing Zone recommendations, and Resource Analytics query views.
- ✅ **Discovery/migration catalog curation** (v0.4.5.6). Added Cloud Bridge, Cloud Migrations, Stack Monitoring, and Log Analytics resource surfaces with lookup override guards and generated import/export/model/property support.
- ✅ **Architecture Agent** (v0.4.5.8). Added a chat-driven OCI architecture generator with deterministic offline planning, optional user-provided OpenAI-compatible LLM calls, and direct handoff into the editable Designer canvas.

## Phase A — Stencils: full catalog + official icons (L3)
- ✅ A1. Auto-generate the OCI palette from ALL model resources — `OcdPalette.ts` from the model registry, grouped, using the `oci-*` icon classes; flags resources without an icon. (commit `6f6f5429`)
- ◐ A2. Full OCI service catalog. **Key finding:** the import is an explicit allow-list (`codegen/src/importer/data/OciResourceMap.ts`) with curated `resourceAttributes` per resource — a blind regen against the full provider schema yields near-empty skeletons (compartment + tags only), so "all services" is a *curation* effort, not a one-shot regen. Model now has **296 curated OCI resource mappings** from the local 727-resource OCI provider schema; **433 provider resources remain**. Latest batches: ADM knowledge base/vulnerability audit/remediation recipe/remediation run; AI Document project/model; AI Language model; AI Anomaly Detection private endpoint/data asset/anomaly job; Cloud Bridge agent/asset/environment/inventory/schedules; Cloud Migrations migration/asset/plan/replication/target assets; Stack Monitoring discovery/resource task/type; Log Analytics entity; Database Migration connection/job controls; Vulnerability Scanning container recipe/target; Health Checks HTTP/ping probes; License Manager configuration/license record/product license; Announcements subscription/filter group; and Analytics instance private access channel/vanity URL. Codegen import is deterministic. **Generator gotchas:** a curated attribute whose leaf name collides with reserved identifiers (`resources`, `resource`, `results`) produces invalid validator TS (TS2349), and nested leaves named `object` can collide with generated object-block helper names (`training_dataset.object` → `trainingDatasetObject`). Empty complex/list blocks should be dropped unless a usable editor/export shape is curated. These are caught by the full `tsc` build, not `build:pages`. Note: each service adds an eagerly-bundled property panel; keep bundle size under watch and revisit per-provider/panel splitting if the catalog approaches the full provider set.
- ✅ A3. Official Oracle icon set: vendored the official OCI architecture/diagram icons and mapped each resource → official SVG, with a documented refresh. (commits `6c339c69`, `1a2e43e2`; see `docs/oci-icons-refresh.md`)
- ✅ A4. Per-resource Terraform preview ('Terraform' properties tab via `@ocd/export` `getResourceTerraformHcl`) + resource relationships ('Relationships' tab: valid parents/children/connections from the model's `allowedParentTypes()`). Drag-to-connect now provides interactive canvas connection-drawing for FK-backed associations.
- ✅ A5. Link palette → LZ design: dropping non-LZ resources into an LZ-origin design now routes them to a workload/application/project compartment instead of the root, so generated Landing Zones can keep evolving in the Designer.

## Phase B — Cross-project mapping (single source of truth)
The connective tissue for stencils + cost + the LZ wizard. A generated canonical map per OCI resource:
`{ ocdModelType, ociTerraformType, displayName, oeLzngName, paletteGroup, iconClass, costSkus[] , shapeFamily? }`.
- ✅ B1. **Compute shapes → SKUs** (Image #5): map every VM/BM shape family (E2/E3/E4/E5/E6, A1, Standard2, DenseIO, Optimized3, x86/AMD/Intel/Ampere Generic, Micro, BM.*) to its OCPU + memory cetools part numbers, plus GPU + HPC shapes, so the cost estimator no longer uses one E5 rate for all shapes. Part numbers verified against the cetools API. (commits `9be8a63b`, `a0cb14e3`)
- ✅ B2. **All-services → SKUs**: cost SKU mapping extended beyond compute/block-volume (LB, object storage, logging, monitoring, streaming, DB, OKE, …) with verified cetools part numbers; usage-based (consumption) services flagged. (commit `30551de6`)
- ✅ B3. **Names mapped between the 2 projects**: OCD model resource names ↔ OE/LZNG (Operating Entities jsonnet) names ↔ Terraform types, so wizard output and designer model line up. Drives "Open generated LZ in Designer". (commit `00681066`)

## Phase C — Web discovery (import from OCI in the browser) ✅
Browsers cannot read `~/.oci/config` or call the OCI SDK (CORS). Needs a backend. (commit `2fc82ae3`)
- ✅ C1. Local `@ocd/web-server` exposes read-only OCI endpoints (`/api/oci/profiles`, `/profile`, `/regions`, `/compartments`, `/query`, `/dropdown`) plus Resource Manager stacks, reading `~/.oci/config` and calling the OCI SDK server-side.
- ✅ C2. `OciApiFacade` web paths wired to that service via the Vite dev-server `/api/oci` + `/api/pricing` proxy mounts.
- ✅ C3. Security: localhost bind + restricted CORS (commit `867b6d15`); no credentials in the browser. (Desktop discovery already works with a valid `~/.oci/config`.)

> Known deferred bug: upstream #586 — RM export emits an invalid route-distribution match-criteria statement. Separate from this roadmap; track independently.

## Recommended sequence
✅ Done: B1 → A1 → B3 → A3 → B2 → C → A4/A5 → D1/D2/D3 → D4/D5/D6 → E1/E2/E3 → F1. **Remaining:** A2 (full-schema service catalog curation). Quality follow-ups (not original roadmap): keep bundle size under watch as the curated catalog grows, keep Playwright coverage on primary LZ/governance/discovery/agent flows, and re-run the redaction gate before pushes.

## Phase D — Enterprise entry-point lanes ✅

These lanes landed across v0.4.5.1 through v0.4.5.4 and are documented in the current changelog.

### D1. Architecture Template Gallery ✅
A curated library of OCI reference architecture templates surfaced as a picker inside the Designer. Selecting a template seeds a fresh `OcdDesign`, auto-arranges it, and drops the user onto the canvas.

### D2. Upstream OKIT Feature-Sync Banner ✅
Extends the existing "OCI Landing Zone updates available" notification pattern to cover upstream OKIT changes. The banner links to the GitHub compare view and guides the manual curation path for new upstream resources/features.

### D3. Governance & Compliance Overlay ✅
The Governance page evaluates posture risks across network exposure, public resources, tags, budgets, compartment segmentation, and database/LB placement. Findings include severity, summaries, copyable Terraform guidance, and safe one-click fixes where deterministic.

### D4. Network Reachability Analysis ✅
`analysis/OcdReachability.ts` walks subnets, route tables, gateways, databases, and security lists to identify missing egress, dangling route targets, public DB placement, and internet-reachable databases. Findings are merged into the Governance page.

### D5. Landing Zone Plan / Diff ✅
`landingzone/plan/OcdLzPlan.ts` compares a live design to imported LZNG output and renders create/update/delete/no-op groups with field-level semantic diffs.

### D6. Enterprise IAM + Policy Blueprint ✅
`landingzone/OcdLzIamBlueprint.ts` applies enterprise groups, compartment-scoped policy bundles, and an `lz-governance` tag namespace with cost-tracking tags. The add-on is idempotent and leaves all generated resources editable in the model.

## Phase E — Discovery Workbench and LZNG integration ✅

### E1. Application-Centric Discovery Views ✅
`discovery/` adds typed snapshots, deterministic sample data, inventory summaries,
service dependency topology, utilization and cost rollups, risk counters, and a
console page with Inventory, Topology, Analytics, Landing Zone Mapping, and
Resource Analytics tabs.

### E2. Resource Analytics Integration ✅
`OciApiFacade`, `@ocd/web-server`, and Electron IPC expose read-only discovery
snapshot and Resource Analytics query paths. SQL validation lives in `@ocd/core`
and accepts SELECT-only queries while rejecting semicolons and mutation/admin
keywords outside quoted strings.

### E3. Discovery-to-Landing-Zone Recommendations ✅
`OcdDiscoveryLzRecommendations.ts` turns the discovered estate into Landing Zone
seed recommendations: workload compartments, observability/OKE/IAM overlays, and
migration phases based on applications, runtimes, owners, environments, and
dispositions.

## Phase F — Architecture Agent ✅

### F1. Chat-to-Design Architecture Agent ✅
`architecture-agent/` adds a structured planning layer for chat-driven OCI
design creation. It can use deterministic local plans for offline operation or a
user-provided OpenAI-compatible chat-completions endpoint. Generated plans are
normalized, converted to real `OcdDesign` resources through model factories, and
applied directly to the Designer canvas.

### F2. Agentic Zero Trust UX and Controls ✅
The agent now includes a Redwood-style Zero Trust flow, reusable prompt
templates, plan metrics, control/evidence panels, and a deterministic Agentic
Zero Trust architecture that maps policy-gated execution to editable OCI
resources such as API Gateway, Functions, Dynamic Groups, IAM policies, Vault,
Data Safe, Cloud Guard, Logging Analytics, and Service Connector.

## Notes
- Discovery, canvas drag/connect, and OCI SDK calls are Electron-runtime (fs + SDK + no CORS) unless routed through the localhost `@ocd/web-server`. The web preview covers the wizard, palette, Terraform import, and deterministic Discovery Workbench sample data.
- No OCIDs/secrets committed; vendored OCID-bearing data is fetched via `npm run setup-lz` (see no-ocids rule).
