# OCD — Project Extraction Pack

> Context pack extracted from this repository (OCI Designer Toolkit Next Gen fork).
> Note: this project uses **Vite + React 18 + Electron**, not Next.js. Code snippets
> below are the React/TypeScript equivalents; the console page switch maps cleanly
> to Next.js route segments if porting.

---

## 1. PROJECT CONTEXT

**oci-designer-toolkit-next-gen (OCD)** — enhanced fork of Oracle's OKIT, evolved into
a Next-Gen OCI architecture design platform (v0.4.5.x).

### Purpose & key features

- **Drag-and-drop OCI Architecture Designer** — freeform SVG canvas, multi-page views,
  properties panel, compartment layers, connection visualization.
- **Landing Zone Wizard** — renders OCI Operating-Entities Landing Zone JSON via
  jsonnet-WASM (`libjsonnet.wasm`); opens result directly on canvas. Overlays:
  Realm/Region/AD/FD scaffold, Database Observability (DBM + OPSI), OKE-native
  (VCN-native CNI + Workload Identity), Enterprise IAM & Policy blueprints.
- **Cost Estimation** — real OCI pricing from the public list-pricing API (cetools),
  compute shape → SKU mapping, multi-currency, bundled snapshot fallback.
- **Discovery Workbench** — inventory, dependency topology, utilization/cost rollups,
  OCI target mapping, migration waves, LZ recommendations.
- **Governance & Security Analysis** — public exposure, weak segmentation, missing
  tags/budgets, database placement risk, network reachability (dangling routes,
  internet-accessible databases).
- **Architecture Agent** — BYO-LLM chat-driven design generation with local
  deterministic planner fallback; applies generated designs to canvas.
- **Import/Export** — Terraform, Markdown, Excel, SVG, Resource Manager export;
  OCI query, Terraform, draw.io import. OKIT Classic 0.70 parity.
- **Dual delivery** — Electron desktop (macOS DMG / Windows MSI / Linux RPM+deb)
  and static web build (GitHub Pages) backed by a localhost Node web-server.

### Target users

Cloud architects (LZ design), DevOps (Terraform/RM round-trip), security teams
(governance/reachability), migration teams (discovery → waves), cost analysts.

### Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Desktop | Electron 32+ / Electron Forge |
| Web backend | Node.js stdlib `http` only (no express) |
| LZ rendering | jsonnet-WASM |
| OCI access | OCI SDK (read-only queries) |
| Export | ExcelJS, SVG, Markdown, Terraform |
| Tests | Vitest (JS), pytest (`scripts/tests`), Playwright (E2E) |
| Styling | CSS custom-property themes (Redwood, Redwood NG, OCI, Azure, Google) |
| Tooling | Python scripts (LZ gen/validate, price snapshots), Node v26 |

---

## 2. TEXT ARCHITECTURE

### Monorepo layout (`ocd/packages/*`, npm workspaces)

| Package | Responsibility |
|---|---|
| `@ocd/core` | Shared utils (`OcdUtils`), resource allow-list map, SQL validation |
| `@ocd/model` | Single source of truth: `OcdDesign`, `OcdResource`, generated per-provider resource classes (279+ OCI types), validators, palette, auto-layout |
| `@ocd/codegen` | Codegen engine: TF provider schema → TS resource classes, properties UIs, terraform/markdown/excel templates |
| `@ocd/codegen-cli` | CLI driver for codegen (`schema/oci-schema.json` etc.) |
| `@ocd/parser` | Terraform lexer + recursive-descent parser (.tf → JSON AST) |
| `@ocd/query` | OCI SDK discovery: `OciQuery`, `OciPriceListQuery`, RM stacks (read-only) |
| `@ocd/import` | Terraform + OKIT Classic JSON → `OcdDesign` |
| `@ocd/export` | Terraform / Markdown / Excel / SVG / Resource Manager exporters |
| `@ocd/react` | Bulk of the code — console, canvas, all pages, dialogs, contexts, themes |
| `@ocd/web-server` | Localhost backend (127.0.0.1:5050), read-only OCI endpoints, CORS-locked to :5173, DNS-rebinding defense |
| `desktop` | Electron main + renderer shell, IPC handlers, Vite configs, Forge packaging |
| `@ocd/cli` | `ocd.js export|import|query|parse` |

### Dependency edges (simplified)

```
@ocd/core ← @ocd/model ← {@ocd/import, @ocd/export, @ocd/query} ← @ocd/react ← desktop
@ocd/parser → @ocd/import          @ocd/query → @ocd/web-server, @ocd/cli
oci-sdk → @ocd/query (peer)
```

### Build flow

```
npm run setup-lz                      # vendor upstream OE LZ sources (required)
npm run compile  → npm run generate   # codegen: TF schema → model/properties/export
npm run build                         # tsc + vite per workspace (react dist first)
npm run desktop                       # Electron dev
npm run web                           # Vite dev server :5173
npm run build:pages                   # static web build (web-dist/)
```

### Runtime architecture

- **Desktop**: Electron main (`desktop/src/main.ts`) owns IPC channels (design CRUD,
  OCI query, config, price list, analytics SQL) and config at `~/.ocd/*.json`.
  Renderer (`desktop/src/main.tsx`) mounts `<OcdConsole/>` from `@ocd/react`.
- **Web**: static Vite build + `@ocd/web-server` on loopback for OCI discovery
  (`POST /profiles|/compartments|/query|/resource-analytics`).
- **Python** (`scripts/`): LZ library generation, price snapshots, validation,
  cost estimate reports; tested via pytest.

### Key entry points

- Root app: `ocd/packages/react/src/pages/OcdConsole.tsx`
- Pages: `OcdDesigner.tsx`, `OcdLandingZone.tsx`, `OcdLzPlanPage.tsx`,
  `OcdArchitectureAgent.tsx`, `OcdDiscovery.tsx`, `OcdValidation.tsx`
- Canvas: `ocd/packages/react/src/components/OcdCanvas.tsx`
- LZ engine: `ocd/packages/react/src/landingzone/` (`OcdLzToModel.ts`, overlays,
  `plan/OcdLzPlan.ts`, `wizard/Lzng*Steps.tsx`)
- Cost: `ocd/packages/react/src/cost/` (`OcdCostEstimator.ts`, `OcdResourcePriceMap.ts`)
- Governance: `ocd/packages/react/src/governance/OcdGovernanceChecks.ts`
- Reachability: `ocd/packages/react/src/analysis/OcdReachability.ts`
- Electron main: `ocd/packages/desktop/src/main.ts`
- Web server: `ocd/packages/web-server/src/server.ts`

### Component hierarchy (UI)

```
<OcdConsole>                     tab router + contexts (console, theme, cache, active file)
 ├─ <OcdConsoleMenuBar>          menus + toolbar
 ├─ <OcdDesigner>                palette | SVG canvas (pages, layers) | properties
 ├─ <OcdLandingZone>             LZ wizard (steps + live preview diagram)
 ├─ <OcdLzPlanPage>              plan / semantic diff
 ├─ <OcdArchitectureAgent>       chat-driven generation
 ├─ <OcdDiscovery>               discovery workbench
 ├─ <OcdValidation>              governance + reachability
 └─ export tabs                  Terraform / Markdown / Tabular / BoM
```

---

## 3. CODE SNIPPETS (React/TS — Vite, not Next.js)

### 3.1 Console page switch — `ocd/packages/react/src/pages/OcdConsole.tsx`

Config-driven view routing with lazy-loaded pages under `React.Suspense`
(equivalent of Next.js route segments).

```tsx
const OcdConsoleBody = ({ ocdConsoleConfig, setOcdConsoleConfig, ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    let DisplayPage: React.ComponentType<ConsolePageProps> = OcdDesigner
    switch (ocdConsoleConfig.config.displayPage) {
        case 'bom':         DisplayPage = OcdBom; break
        case 'designer':    DisplayPage = OcdDesigner; break
        case 'discovery':   DisplayPage = OcdDiscovery; break
        case 'landingzone': DisplayPage = OcdLandingZone; break
        case 'validation':  DisplayPage = OcdValidation; break
        case 'governance':  DisplayPage = OcdGovernance; break
        case 'plan':        DisplayPage = OcdLzPlanPage; break
    }
    return (
        <div className='ocd-console-body ocd-console-body-theme'>
            <React.Suspense fallback={<div className='ocd-console-loading' aria-busy='true'>Loading…</div>}>
                <DisplayPage ocdConsoleConfig={ocdConsoleConfig} setOcdConsoleConfig={setOcdConsoleConfig}
                             ocdDocument={ocdDocument} setOcdDocument={setOcdDocument}
                             key={`${ocdConsoleConfig.config.displayPage}-page`} />
            </React.Suspense>
        </div>
    )
}
```

### 3.2 LZ wizard flow — `ocd/packages/react/src/pages/OcdLandingZone.tsx`

Context-persisted wizard state; jsonnet generation + tar download.

```tsx
function WizardBody({ onExit, onOpenInDesigner }: WizardBodyProps): JSX.Element {
    const { data, setField } = useWizard()
    const [config, setConfig] = useState<LandingZoneConfig>(() => upgradeConfig(data.config ?? data.step1))

    function commitConfig(next: LandingZoneConfig): void {
        const normalized = normalizeConfig(next)
        setConfig(normalized)
        setField('config', normalized)
    }

    async function downloadJson(): Promise<void> {
        if (validation.errors.length > 0) { setNotice({ kind: 'error', text: validation.errors.join(' ') }); return }
        const generated = await generateLandingZone(validation.value)
        downloadTar(`${slugify(title)}-landing-zone.tar`, [
            { name: 'config.jsonnet', content: generated.configJsonnet },
            ...generated.files,
        ])
    }
    // renderLeft() switches wizard steps; <LzngPreviewDiagram config={config}/> gives live preview
}
```

### 3.3 Cost pricing hook (live + snapshot fallback) — `ocd/packages/react/src/cost/useOciPriceList.ts`

```ts
export function useOciPriceList(partNumbers: string[], currency: string): UseOciPriceListResult {
    const snapshot = useMemo<PriceMap>(() => getSnapshotPriceMap(currency), [currency])
    const partsKey = useMemo(() => Array.from(new Set(partNumbers)).sort().join(','), [partNumbers])
    const [priceMap, setPriceMap] = useState<PriceMap>(snapshot)
    const [source, setSource] = useState<PriceListSource>('snapshot')

    useEffect(() => {
        let cancelled = false
        OciApiFacade.getOciPriceList(partsKey.split(','), currency)
            .then((live: PriceMap) => {
                if (cancelled) return
                if (live && Object.keys(live).length > 0) {
                    setPriceMap({ ...snapshot, ...live }); setSource('live')
                } else { setPriceMap(snapshot) }
            })
            .catch(() => { if (!cancelled) setPriceMap(snapshot) })
        return () => { cancelled = true }
    }, [partsKey, currency, snapshot])

    return { priceMap, loading, error, source }
}
```

### 3.4 SVG canvas rendering — `ocd/packages/react/src/components/OcdCanvas.tsx`

```tsx
export const OcdCanvas = ({ dragData, setDragData, ocdConsoleConfig, ocdDocument, setOcdDocument }: CanvasProps): JSX.Element => {
    const page: OcdViewPage = ocdDocument.getActivePage()
    const visibleLayers = page.layers.filter((l: OcdViewLayer) => l.visible).map((l: OcdViewLayer) => l.id)
    const visibleResourceIds = ocdDocument.getResources()
        .filter((r: any) => visibleLayers.includes(r.compartmentId))
        .map((r: any) => r.id)
    const transformMatrix = page.transform   // zoom/pan

    return (
        <svg className='ocd-canvas' onClick={onClick}>
            {visibleResourceIds.map((resourceId: string) => (
                <OcdResourceSvg key={resourceId} resourceId={resourceId} />
            ))}
        </svg>
    )
}
```

### 3.5 Redwood design tokens — `ocd/packages/react/src/css/ocd-redwood-theme.css`

```css
:root {
    --redwood-theme-console-background-colour: #ffffff;
    --redwood-theme-properties-panel-background-colour: #ffffff;
    --redwood-theme-active-tab-background-colour: #d1d1d4;
    --redwood-theme-dialog-border-colour: #131243;
    --redwood-theme-dialog-highlight-colour: #e6e8f4;
}
.ocd-designer-active-tab-redwood-theme { background-color: var(--redwood-theme-active-tab-background-colour); }
.ocd-properties-panel-redwood-theme   { background-color: var(--redwood-theme-properties-panel-background-colour); }
```

---

## 4. DATA SCHEMAS

### 4.1 Top-level design document — `ocd/packages/model/src/OcdDesign.ts`

```ts
export interface OcdDesign {
    metadata: OcdMetadata
    model: { oci: OciModel, aws?: AwsModel, azure: AzureModel, google: GoogleModel, general: GeneralModel }
    view: OcdView                       // pages, coords, layers, connectors
    userDefined: OcdUserDefined
}

export interface OcdMetadata {
    ocdVersion: string
    ocdSchemaVersion: string
    ocdModelId: string
    platform: 'oci' | 'pca' | 'edge'
    title: string
    documentation: string
    created: string
    updated: string
    separateIdentity: boolean
}

export interface OcdBaseModel { vars: OcdVariable[]; resources: OcdResources }
export interface OcdView { id: string; pages: OcdViewPage[] }
```

### 4.2 Base resource — `ocd/packages/model/src/OcdResource.ts`

```ts
export interface OcdResource extends Record<string, any> {
    provider: string
    locked: boolean
    editLocked: boolean
    terraformResourceName: string
    okitReference: string
    resourceType: string
    resourceTypeName: string
    id: string
    documentation?: string
}
```

### 4.3 Representative generated resources — `ocd/packages/model/src/provider/oci/resources/generated/`

```ts
export namespace OciVcn {
    export interface OciVcn extends OciResource {
        cidrBlocks?: string[]
        dnsLabel?: string
        ipv6cidrBlocks?: string[]
        isIpv6enabled?: boolean
    }
}

export namespace OciInstance {
    export interface OciInstance extends OciResource {
        availabilityDomain: string
        faultDomain?: string
        shape?: string
        agentConfig?: AgentConfig.AgentConfig
        createVnicDetails?: CreateVnicDetails.CreateVnicDetails
        shapeConfig?: ShapeConfig.ShapeConfig
        sourceDetails?: SourceDetails.SourceDetails
    }
}
```

### 4.4 Codegen input schema — `ocd/packages/codegen/src/types/OcdSchema.ts`

```ts
export type OcdSchemaAttribute = {
    provider: string; key: string; name: string
    type: string; subtype: string; required: boolean
    label: string; id: string
    staticLookup: boolean; cacheLookup: boolean; lookup: boolean
    lookupResource: string; lookupResourceElement: string
    conditional: boolean; condition: Record<string, any>
    default: string | number | boolean
    attributes?: OcdSchemaAttributes
}
export type OcdSchemaResource = { tf_resource: string; type: string; subtype: string; attributes: OcdSchemaAttributes }
export interface OcdSchema extends Record<string, OcdSchemaResource> {}
```

### 4.5 Landing Zone wizard config — `ocd/packages/react/src/landingzone/OcdLzStep1Config.ts`

```ts
export interface Step1State {
    region: string
    regionShortName: string
    realm: string
    environments: Environment[]
}
export interface Environment { name: string; securityZone: boolean }
// serializeStep1Config() → jsonnet for the OE generator:
// { region, region_short_name, realm, security_targets: ['prod'],
//   hub: { kind: 'hub_a', network: { vcn: '10.100.0.0/21' } },
//   environments: { prod: {}, preprod: {}, dev: {} } }
```

### 4.6 Cost estimation types — `ocd/packages/react/src/cost/OcdCostTypes.ts`

```ts
export type CostConfidence = 'confident' | 'approximate' | 'not-costed'
export interface CostLineItemResult {
    resourceType: string; label: string; count: number
    partNumbers: string[]; monthlyCost: number
    confidence: CostConfidence; note?: string
}
export interface CostEstimateResult {
    currency: string; totalMonthly: number
    lineItems: CostLineItemResult[]; notCosted: CostLineItemResult[]
    missingParts: string[]; assumptions: CostAssumptions
}
export const HOURS_PER_MONTH = 744   // OCI 31-day billing month
```

### 4.7 Cost estimate JSON (LZ profiles) — `ocd/library/oci/ObservabilityLandingZone*CostEstimate.json`

```json
{
  "schema_version": "oci.okit.cost_estimate.v1",
  "currency": "USD",
  "profile": "free-first",
  "line_items": [
    { "id": "logging.log_group", "label": "Logging log group baseline", "enabled": true, "estimated_usd": 0 }
  ],
  "monthly_estimate": { "estimated_usd": 0, "confidence": "low", "basis": "Template assumptions." },
  "usage_api": { "recommended": true, "query_template": "ocd/library/oci/...UsageApiQuery.json" }
}
```

### 4.8 Template metadata JSON — `examples/observability-landing-zone/*/okit-data.json`

```json
{
  "schema_version": "oci.okit.template_data.v1",
  "profile": "full-enterprise",
  "resource_counts": { "compartment": 6, "vcn": 1, "subnet": 1, "route_table": 1, "security_list": 1, "service_gateway": 1 },
  "variable_bindings": {
    "alarm_cpu_threshold": {
      "normalized_model_path": "services.alarms_dashboards.alarm_cpu_threshold",
      "terraform_variable": "var.alarm_cpu_threshold",
      "tfvars_key": "alarm_cpu_threshold"
    }
  }
}
```

---

## 5. IMAGES / DIAGRAMS INVENTORY

Totals: **424 raster images + 223 SVGs + 10 draw.io diagrams** (excluding node_modules).

| Purpose | Count | Location |
|---|---|---|
| OCI resource stencil icons | 111 SVG | `okitclassic/okitserver/static/okit/palette/svg/` |
| Reference architecture SVGs | 5 | `ocd/library/oci/`, `ocd/library/c3/`, `ocd/library/pca/` |
| LZ blueprints (editable draw.io) | 5 | `baselines/oci-landing-zones/.../design/*.drawio`, `addons/oci-observability-end-to-end/drawio/` |
| UI control SVGs | 23 | `ocd/packages/react/src/components/svg/` |
| OKIT Classic doc screenshots | 41 PNG | `okitclassic/documentation/images/` |
| LZ baseline diagrams/screens | 376 | `baselines/oci-landing-zones/*/images/` (git-ignored vendored) |
| Desktop app screenshots | 5 PNG | `ocd/images/` |

Notable individual diagrams:

- `ocd/library/oci/ObservabilityLandingZoneEnterprise.svg` (+ `.drawio`, `.okit`)
- `ocd/library/oci/ObservabilityLandingZoneFreeFirst.svg`
- `baselines/.../OCI_Open_LZ_Multi-OE-Blueprint.drawio` (generic v1/v2, 8–13K lines)
- `baselines/terraform-oci-core-landingzone/images/arch-network-layered-v150.svg`
- `docs/ARCHITECTURE.md` — text/ASCII architecture flows (no mermaid in repo)

---

## 6. DATA FLOW EXAMPLE — import → render → edit

```
File → Import .okit JSON
  → OcdTerraformImporter.import(content) → OcdDesign { model, view, userDefined }
  → OcdConsole setOcdDocument(design) → React re-render
  → <OcdCanvas> renders visible resources per layer → <OcdResourceSvg> per resource
  → <OcdProperties> dynamic form on selection → onChange → setOcdDocument(updated)
  → desktop: IPC persist | web: localhost web-server endpoint
```
