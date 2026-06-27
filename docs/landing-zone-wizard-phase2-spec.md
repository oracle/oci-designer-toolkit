# Modern Landing Zone Wizard — Phase 2 Build Spec

Wire the remaining wizard steps (Hub Network, Projects, Platform Templates, Review) to real fields, the One-OE config schema, the OE jsonnet generation, and the live React-Flow diagram. Builds on Phase 1 (`ocd/packages/react/src/pages/OcdLandingZone.tsx` + `landingzone/ui/*` + `ocd-lzng.css`). Keep everything self-styled under `.ocd-lzng`, theme-independent. `@xyflow/react` v12 is installed.

## Learn the EXACT OE config schema first (read these — vendored, populated via setup-lz)
Under `ocd/packages/react/src/landingzone/oe/gen/`:
- `config.libsonnet` (normalize: hub kinds = hub_a/hub_b/hub_c/hub_e with subnet orders; spoke subnet names web/app/db/infra; required hub.network.vcn; environments object; security_targets must be subset of env names).
- `landing_zone.libsonnet` (orchestrator: hub dispatch, spoke VCN per env, projects, extensions). `render_context.libsonnet` (`from_raw_config` — shows how config → spoke_envs, extension_entries, platforms). `extensions.libsonnet`, `platforms.libsonnet`.
- `extension_registry`: `oke_simple`, `exacc`, `exacs` (workload extensions). Read `workload-extensions/{oke/simple,exacc,exacs}/*.libsonnet` to learn how a config references an extension (the per-env or per-project key, e.g. `environments.<env>.projects[].extensions` or a top-level `platforms`/`extensions` list — VERIFY the real key).
- Find a complete example config: search `oe/gen` and the upstream `tests/gen/testdata` (if present locally) for a `*.libsonnet`/`*.jsonnet` config object passed to `landing_zone_multi.jsonnet` with environments + network + projects + extensions. Mirror that exact shape.
The wizard's serialized config MUST be accepted by `landing_zone_multi.jsonnet` — match the schema precisely; do not invent keys.

## Confirmed base config (Phase 1)
```
{ region, region_short_name, realm, hub:{ kind:'hub_a', network:{ vcn:'10.100.0.0/21' } },
  environments:{ prod:{}, preprod:{}, dev:{} }, security_targets:[...] }
```

## Steps to build
### Step 2 — Hub Network
- Fields: hub **kind** selector (hub_a/hub_b/hub_c/hub_e) with a one-line description of each (firewall topology, from the subnet orders in config.libsonnet: hub_a = fw-dmz/lb/fw-int/mgmt/mon/dns; hub_b = lb/fw/mgmt/mon/dns; hub_c = untrust/trust/lb/mgmt/mon/dns; hub_e = lb/mgmt/mon/dns). Hub **VCN CIDR** input (validate CIDR). Optionally allow editing hub subnet CIDRs (auto /24 derived otherwise).
- Diagram: render the Hub VCN with its subnets (derived from the selected kind) inside the region container.

### Step 3 — Projects
- Per-environment **spoke network** VCN CIDR (`environments.<env>.network.vcn`) and a list of **projects** (named workload projects) per environment (maps to the One-OE `cmp-lz-<env>-projects` + project compartments). Use the real config key discovered above.
- Diagram: each environment shows its spoke VCN + project nodes.

### Step 4 — Platform Templates
- Select **workload extensions / platform templates** (OKE simple, ExaCC, ExaCS) and attach them to an environment/project per the OE schema. Show what each adds (compartments/VCNs).
- Diagram: platform/extension compartments/VCNs appear under the target environment.

### Step 5 — Review
- Run `generateLandingZoneFiles(config)` (jsonnet OE generation) and render:
  - The **IAM compartment diagram** from the generated `iam.json` (the One-OE structure: tenancy → LZ → environments → `cmp-lz-<env>-{network,platform,projects,security}` + Shared) using React-Flow.
  - A **list of generated JSON files** (network.json, iam.json, governance.json, security_*, observability_*, plus extension outputs) each individually downloadable, and a "Download all (tar)".
  - The serialized `config.jsonnet` read-only.
- If OE sources absent → the friendly "run npm run setup-lz" notice (already handled).

## Config model + serialization
Extend the Phase 1 config (currently `OcdLzStep1Config`) into a fuller `LandingZoneConfig` (new module e.g. `landingzone/OcdLzConfig.ts`, or extend Step1Config) covering hub.kind/vcn, per-env network.vcn + projects, and platform extensions. Update `serializeStep1Config` (or a new `serializeLandingZoneConfig`) to emit a config object/jsonnet that `landing_zone_multi.jsonnet` accepts. Keep backward compat with Phase 1 Foundation. Validate the serialized shape against the OE schema (a testdata example is the ground truth).

## Live diagram evolution
The React-Flow `LzngNetworkDiagram` should progressively reflect the config: Region → Hub VCN (+subnets) → per-env spoke VCNs → projects → platform compartments, approaching the One-OE blueprint (`cmp-lz-<env>-{network,platform,projects,security}`, Shared, WE PROJECTS). On the Review step, prefer rendering from the actual generated `iam.json`/`network.json` for fidelity. Keep zoom Controls + MiniMap. Extend the `.drawio` export to match.

## Constraints
- Self-styled `.ocd-lzng` only; build green (`cd ocd && npm run build --workspace=packages/react`); dev server at :5173 serves. Plain function components, explicit types, no console.log, GPL-3.0 headers, accessible. Keep `OcdLandingZone.tsx` lean (extract per-step components under `landingzone/ui/`).
- Do NOT commit OE sources / OcdLandingZoneJsonnetSources (git-ignored, skip-worktree). Do NOT touch cost/* or unrelated areas.

## Verify
- Build passes; each step renders styled; navigating Foundation→…→Review keeps the diagram; Review generation produces real JSONs (or the setup-lz notice) and the IAM compartment diagram renders. Report exact OE config keys used (with file evidence), files changed, and anything still stubbed.
