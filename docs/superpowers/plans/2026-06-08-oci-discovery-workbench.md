# OCI Discovery Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an OCI Discovery Workbench that imports application-centric inventory, maps dependencies and utilization to OCI targets, integrates Oracle Resource Analytics, and feeds Landing Zone Next-Gen design recommendations.

**Execution status (2026-06-08):** Completed and staged. The implementation now includes the Discovery Workbench UI, Resource Analytics facade/web-server/desktop integration, Landing Zone recommendation mapping, discovery-focused OCI catalog curation, documentation updates, and Playwright coverage. Final verification covered focused discovery/codegen Vitest, core/model/react/web-server/desktop builds, Pages build, full Playwright E2E, cached diff checks, and redaction gates.

**Architecture:** Add a focused `discovery/` feature area under `@ocd/react` with typed snapshot models, pure analytics/mapping functions, and a new console page reachable from the toolbar/menu. Reuse the existing read-only local `/api/oci` backend and `OciApiFacade` for live OCI data, then enrich it with Resource Analytics import/query shapes and LZ recommendation output. Curate the OCI resource catalog in small codegen batches so Cloud Bridge, Cloud Migrations, Stack Monitoring, Log Analytics, and Management Agent resources can appear on the canvas and in exports.

**Tech Stack:** React, TypeScript, Vitest, Playwright, Node `http` web-server, `@ocd/query`, OCI SDK, OCD codegen/import/export packages.

---

## Assessment

### Current Designer Catalog Gap

The raw OCI Terraform provider schema has 727 resources and the generated designer schema has 248 resources, leaving 479 raw provider resources outside the curated designer surface. The highest missing families by raw provider prefix are:

| Family | Missing Count |
|---|---:|
| `identity` | 57 |
| `data_safe` | 53 |
| `os` | 29 |
| `core` | 27 |
| `database_management` | 25 |
| `network` | 13 |
| `stack_monitoring` | 12 |
| `database_autonomous` | 10 |
| `database_external` | 9 |
| `dataintegration` | 9 |
| `log_analytics` | 9 |
| `cloud_bridge` | 8 |
| `cloud_guard` | 8 |
| `devops` | 8 |
| `opsi` | 7 |
| `apm` | 5 |
| `cloud_migrations` | 5 |
| `jms` | 5 |

Discovery and migration planning should prioritize these missing OCI resources:

- `oci_cloud_bridge_agent`
- `oci_cloud_bridge_agent_dependency`
- `oci_cloud_bridge_agent_plugin`
- `oci_cloud_bridge_asset`
- `oci_cloud_bridge_asset_source`
- `oci_cloud_bridge_discovery_schedule`
- `oci_cloud_bridge_environment`
- `oci_cloud_bridge_inventory`
- `oci_cloud_migrations_migration`
- `oci_cloud_migrations_migration_asset`
- `oci_cloud_migrations_migration_plan`
- `oci_cloud_migrations_replication_schedule`
- `oci_cloud_migrations_target_asset`
- `oci_stack_monitoring_discovery_job`
- `oci_stack_monitoring_monitored_resource_task`
- `oci_stack_monitoring_monitored_resource_type`
- `oci_log_analytics_log_analytics_entity`
- `oci_jms_fleet`
- `oci_management_agent_management_agent_install_key`

### Landing Zone Next-Gen Gap

The current LZ Next-Gen integration generates and imports OCI Landing Zone JSON, opens it in the designer, supports plan/diff, and adds observability, OKE, and IAM overlays. It does not yet have an application-centric discovery model, service dependency graph, port/protocol communication matrix, utilization-aware target sizing, migration wave grouping, Resource Analytics import, Cloud Bridge inventory import, or an explicit "discovered estate to Landing Zone" recommendation page.

### Discovery Workbench Capability Target

The new workbench should surface:

- Application inventory grouped by business application, environment, OS family, runtime, database, and owner tag.
- Server-to-server and application-to-application dependencies with port/protocol evidence.
- Utilization analytics for CPU, memory, storage, network, IOPS, and observed cost.
- OCI target mapping for compute, OKE, load balancing, database, cache, streaming, queueing, observability, and security services.
- Migration wave and disposition analysis with `rehost`, `replatform`, `refactor`, `retire`, and `retain`.
- Resource Analytics inventory, relationship, SQL, graph, and dashboard integration.
- LZ Next-Gen seed recommendations for compartments, workload groups, OKE overlays, observability overlays, IAM groups, and migration phases.

## File Structure

- Create `ocd/packages/react/src/discovery/OcdDiscoveryTypes.ts` for snapshot, asset, service, dependency, metric, target mapping, and recommendation types.
- Create `ocd/packages/react/src/discovery/OcdDiscoverySampleData.ts` for deterministic non-sensitive demo data used by UI and E2E tests.
- Create `ocd/packages/react/src/discovery/OcdDiscoveryMappers.ts` for technology-to-OCI mapping and LZ seed mapping.
- Create `ocd/packages/react/src/discovery/OcdDiscoveryAnalytics.ts` for inventory summaries, dependency edges, migration waves, utilization rollups, and risk counts.
- Create `ocd/packages/react/src/discovery/OcdResourceAnalytics.ts` for Resource Analytics row normalization and snapshot merge logic.
- Create `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryAnalytics.test.ts`.
- Create `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`.
- Create `ocd/packages/react/src/discovery/__tests__/OcdResourceAnalytics.test.ts`.
- Create `ocd/packages/react/src/pages/OcdDiscovery.tsx` for the new console page.
- Create `ocd/packages/react/src/discovery/ui/OcdDiscoveryInventoryView.tsx`.
- Create `ocd/packages/react/src/discovery/ui/OcdDiscoveryTopologyView.tsx`.
- Create `ocd/packages/react/src/discovery/ui/OcdDiscoveryAnalyticsView.tsx`.
- Create `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`.
- Create `ocd/packages/react/src/discovery/ui/OcdDiscoveryResourceAnalyticsView.tsx`.
- Modify `ocd/packages/react/src/pages/OcdConsole.tsx` to lazy-load `OcdDiscovery`, add the toolbar action, and add the `discovery` page switch.
- Modify `ocd/packages/react/src/components/OcdConsoleMenuBar.tsx` to add a View menu item for Discovery.
- Modify `ocd/packages/react/src/data/OcdSvgCssData.ts` for Discovery Workbench layout and icon CSS.
- Modify `ocd/packages/react/src/facade/OciApiFacade.ts` to add `queryDiscoverySnapshot()` and `queryResourceAnalytics()`.
- Modify `ocd/packages/web-server/src/handlers.ts` to add read-only discovery and Resource Analytics handlers.
- Modify `ocd/packages/web-server/src/server.ts` to expose `/api/oci/discovery/snapshot` and `/api/oci/resource-analytics/query`.
- Modify `ocd/packages/desktop/src/main.ts` to mirror the Electron IPC discovery endpoints.
- Modify `ocd/packages/codegen/src/importer/data/OciResourceMap.ts` to curate the discovery-focused OCI resource batch.
- Modify `ocd/packages/codegen/tests/OciResourceMap.test.ts` to pin the new catalog entries.
- Create `e2e/specs/discovery-workbench.spec.ts` for browser smoke coverage.
- Modify `README.md`, `docs/ARCHITECTURE.md`, `docs/oci-lz-designer-roadmap.md`, and `CHANGELOG.md` after the implementation is complete.

## Tasks

### Task 1: Discovery Snapshot Types And Sample Estate

**Files:**
- Create: `ocd/packages/react/src/discovery/OcdDiscoveryTypes.ts`
- Create: `ocd/packages/react/src/discovery/OcdDiscoverySampleData.ts`
- Test: `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryAnalytics.test.ts`

- [ ] **Step 1: Write the failing analytics fixture test**

```ts
import { describe, expect, it } from 'vitest'
import { discoverySampleSnapshot } from '../OcdDiscoverySampleData'
import { summarizeDiscoveryInventory } from '../OcdDiscoveryAnalytics'

describe('summarizeDiscoveryInventory', () => {
    it('counts applications, compute assets, services, databases, dependencies, and metrics coverage', () => {
        const summary = summarizeDiscoveryInventory(discoverySampleSnapshot)

        expect(summary.applications).toBe(3)
        expect(summary.computeAssets).toBe(6)
        expect(summary.services).toBe(9)
        expect(summary.databases).toBe(2)
        expect(summary.dependencies).toBe(8)
        expect(summary.assetsWithMetrics).toBe(6)
        expect(summary.operatingSystems).toEqual({
            linux: 4,
            windows: 1,
            unix: 1
        })
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ocd && npx vitest run packages/react/src/discovery/__tests__/OcdDiscoveryAnalytics.test.ts`

Expected: FAIL with an import error for `../OcdDiscoverySampleData` or `../OcdDiscoveryAnalytics`.

- [ ] **Step 3: Add the discovery domain types**

```ts
export type DiscoveryDisposition = 'rehost' | 'replatform' | 'refactor' | 'retire' | 'retain'
export type DiscoveryCriticality = 'critical' | 'high' | 'medium' | 'low'
export type DiscoveryOsFamily = 'linux' | 'windows' | 'unix'
export type DiscoveryRuntimeType =
    | 'apache'
    | 'nginx'
    | 'tomcat'
    | 'weblogic'
    | 'springboot'
    | 'iis'
    | 'oracle-database'
    | 'mysql'
    | 'redis'
    | 'kafka'
    | 'rabbitmq'
    | 'unknown'

export interface DiscoveryApplication {
    id: string
    name: string
    environment: 'dev' | 'test' | 'stage' | 'prod'
    owner: string
    criticality: DiscoveryCriticality
    preferredDisposition: DiscoveryDisposition
}

export interface DiscoveryComputeAsset {
    id: string
    applicationId: string
    hostName: string
    osFamily: DiscoveryOsFamily
    osName: string
    cpuCores: number
    memoryGb: number
    storageGb: number
    virtualization: 'physical' | 'vmware' | 'kvm' | 'cloud' | 'unknown'
    lifecycle: 'current' | 'near-end-of-support' | 'end-of-support'
}

export interface DiscoveryService {
    id: string
    assetId: string
    applicationId: string
    runtime: DiscoveryRuntimeType
    displayName: string
    version: string
    port: number
    protocol: 'tcp' | 'udp' | 'http' | 'https'
}

export interface DiscoveryDependency {
    id: string
    sourceServiceId: string
    targetServiceId: string
    port: number
    protocol: 'tcp' | 'udp' | 'http' | 'https'
    observedConnectionsPerHour: number
}

export interface DiscoveryMetricSample {
    assetId: string
    avgCpuPercent: number
    p95CpuPercent: number
    avgMemoryPercent: number
    p95MemoryPercent: number
    avgNetworkMbps: number
    p95NetworkMbps: number
    avgIops: number
    p95Iops: number
    monthlyCostUsd: number
}

export interface DiscoverySnapshot {
    id: string
    generatedAt: string
    source: 'sample' | 'oci-query' | 'resource-analytics' | 'imported'
    applications: DiscoveryApplication[]
    assets: DiscoveryComputeAsset[]
    services: DiscoveryService[]
    dependencies: DiscoveryDependency[]
    metrics: DiscoveryMetricSample[]
}
```

- [ ] **Step 4: Add deterministic sample data**

```ts
import { DiscoverySnapshot } from './OcdDiscoveryTypes'

export const discoverySampleSnapshot: DiscoverySnapshot = {
    id: 'sample-oci-discovery',
    generatedAt: '2026-06-08T00:00:00.000Z',
    source: 'sample',
    applications: [
        { id: 'app-shop', name: 'Retail Shop', environment: 'prod', owner: 'Commerce', criticality: 'critical', preferredDisposition: 'replatform' },
        { id: 'app-billing', name: 'Billing', environment: 'prod', owner: 'Finance', criticality: 'high', preferredDisposition: 'rehost' },
        { id: 'app-reporting', name: 'Reporting', environment: 'stage', owner: 'Analytics', criticality: 'medium', preferredDisposition: 'refactor' }
    ],
    assets: [
        { id: 'asset-shop-web-1', applicationId: 'app-shop', hostName: 'shop-web-1', osFamily: 'linux', osName: 'Oracle Linux 8', cpuCores: 4, memoryGb: 16, storageGb: 120, virtualization: 'vmware', lifecycle: 'current' },
        { id: 'asset-shop-web-2', applicationId: 'app-shop', hostName: 'shop-web-2', osFamily: 'linux', osName: 'Oracle Linux 8', cpuCores: 4, memoryGb: 16, storageGb: 120, virtualization: 'vmware', lifecycle: 'current' },
        { id: 'asset-shop-db-1', applicationId: 'app-shop', hostName: 'shop-db-1', osFamily: 'linux', osName: 'Oracle Linux 8', cpuCores: 8, memoryGb: 64, storageGb: 2048, virtualization: 'physical', lifecycle: 'near-end-of-support' },
        { id: 'asset-billing-app-1', applicationId: 'app-billing', hostName: 'billing-app-1', osFamily: 'windows', osName: 'Windows Server 2019', cpuCores: 4, memoryGb: 32, storageGb: 250, virtualization: 'vmware', lifecycle: 'current' },
        { id: 'asset-billing-db-1', applicationId: 'app-billing', hostName: 'billing-db-1', osFamily: 'unix', osName: 'Solaris 11', cpuCores: 12, memoryGb: 96, storageGb: 4096, virtualization: 'physical', lifecycle: 'end-of-support' },
        { id: 'asset-reporting-1', applicationId: 'app-reporting', hostName: 'reporting-1', osFamily: 'linux', osName: 'Ubuntu 22.04', cpuCores: 2, memoryGb: 8, storageGb: 500, virtualization: 'cloud', lifecycle: 'current' }
    ],
    services: [
        { id: 'svc-shop-nginx-1', assetId: 'asset-shop-web-1', applicationId: 'app-shop', runtime: 'nginx', displayName: 'Shop Nginx A', version: '1.24', port: 443, protocol: 'https' },
        { id: 'svc-shop-nginx-2', assetId: 'asset-shop-web-2', applicationId: 'app-shop', runtime: 'nginx', displayName: 'Shop Nginx B', version: '1.24', port: 443, protocol: 'https' },
        { id: 'svc-shop-api-1', assetId: 'asset-shop-web-1', applicationId: 'app-shop', runtime: 'springboot', displayName: 'Shop API A', version: '3.2', port: 8080, protocol: 'http' },
        { id: 'svc-shop-api-2', assetId: 'asset-shop-web-2', applicationId: 'app-shop', runtime: 'springboot', displayName: 'Shop API B', version: '3.2', port: 8080, protocol: 'http' },
        { id: 'svc-shop-db', assetId: 'asset-shop-db-1', applicationId: 'app-shop', runtime: 'oracle-database', displayName: 'Shop Oracle Database', version: '19c', port: 1521, protocol: 'tcp' },
        { id: 'svc-billing-iis', assetId: 'asset-billing-app-1', applicationId: 'app-billing', runtime: 'iis', displayName: 'Billing IIS', version: '10', port: 443, protocol: 'https' },
        { id: 'svc-billing-db', assetId: 'asset-billing-db-1', applicationId: 'app-billing', runtime: 'oracle-database', displayName: 'Billing Oracle Database', version: '12.2', port: 1521, protocol: 'tcp' },
        { id: 'svc-reporting-kafka', assetId: 'asset-reporting-1', applicationId: 'app-reporting', runtime: 'kafka', displayName: 'Reporting Kafka', version: '3.7', port: 9092, protocol: 'tcp' },
        { id: 'svc-reporting-redis', assetId: 'asset-reporting-1', applicationId: 'app-reporting', runtime: 'redis', displayName: 'Reporting Redis', version: '7.2', port: 6379, protocol: 'tcp' }
    ],
    dependencies: [
        { id: 'dep-shop-edge-a', sourceServiceId: 'svc-shop-nginx-1', targetServiceId: 'svc-shop-api-1', port: 8080, protocol: 'http', observedConnectionsPerHour: 48000 },
        { id: 'dep-shop-edge-b', sourceServiceId: 'svc-shop-nginx-2', targetServiceId: 'svc-shop-api-2', port: 8080, protocol: 'http', observedConnectionsPerHour: 47000 },
        { id: 'dep-shop-api-db-a', sourceServiceId: 'svc-shop-api-1', targetServiceId: 'svc-shop-db', port: 1521, protocol: 'tcp', observedConnectionsPerHour: 21000 },
        { id: 'dep-shop-api-db-b', sourceServiceId: 'svc-shop-api-2', targetServiceId: 'svc-shop-db', port: 1521, protocol: 'tcp', observedConnectionsPerHour: 20500 },
        { id: 'dep-billing-db', sourceServiceId: 'svc-billing-iis', targetServiceId: 'svc-billing-db', port: 1521, protocol: 'tcp', observedConnectionsPerHour: 9000 },
        { id: 'dep-shop-kafka', sourceServiceId: 'svc-shop-api-1', targetServiceId: 'svc-reporting-kafka', port: 9092, protocol: 'tcp', observedConnectionsPerHour: 6000 },
        { id: 'dep-billing-kafka', sourceServiceId: 'svc-billing-iis', targetServiceId: 'svc-reporting-kafka', port: 9092, protocol: 'tcp', observedConnectionsPerHour: 3000 },
        { id: 'dep-reporting-cache', sourceServiceId: 'svc-reporting-kafka', targetServiceId: 'svc-reporting-redis', port: 6379, protocol: 'tcp', observedConnectionsPerHour: 2500 }
    ],
    metrics: [
        { assetId: 'asset-shop-web-1', avgCpuPercent: 42, p95CpuPercent: 71, avgMemoryPercent: 58, p95MemoryPercent: 75, avgNetworkMbps: 120, p95NetworkMbps: 220, avgIops: 500, p95Iops: 900, monthlyCostUsd: 420 },
        { assetId: 'asset-shop-web-2', avgCpuPercent: 39, p95CpuPercent: 68, avgMemoryPercent: 54, p95MemoryPercent: 72, avgNetworkMbps: 118, p95NetworkMbps: 210, avgIops: 470, p95Iops: 860, monthlyCostUsd: 420 },
        { assetId: 'asset-shop-db-1', avgCpuPercent: 61, p95CpuPercent: 88, avgMemoryPercent: 72, p95MemoryPercent: 91, avgNetworkMbps: 80, p95NetworkMbps: 160, avgIops: 6200, p95Iops: 11000, monthlyCostUsd: 1800 },
        { assetId: 'asset-billing-app-1', avgCpuPercent: 33, p95CpuPercent: 64, avgMemoryPercent: 49, p95MemoryPercent: 70, avgNetworkMbps: 45, p95NetworkMbps: 85, avgIops: 300, p95Iops: 700, monthlyCostUsd: 520 },
        { assetId: 'asset-billing-db-1', avgCpuPercent: 67, p95CpuPercent: 92, avgMemoryPercent: 76, p95MemoryPercent: 94, avgNetworkMbps: 65, p95NetworkMbps: 130, avgIops: 7300, p95Iops: 12500, monthlyCostUsd: 2600 },
        { assetId: 'asset-reporting-1', avgCpuPercent: 24, p95CpuPercent: 52, avgMemoryPercent: 44, p95MemoryPercent: 69, avgNetworkMbps: 55, p95NetworkMbps: 105, avgIops: 900, p95Iops: 1800, monthlyCostUsd: 260 }
    ]
}
```

- [ ] **Step 5: Add the minimal summary implementation**

```ts
import { DiscoverySnapshot } from './OcdDiscoveryTypes'

export interface DiscoveryInventorySummary {
    applications: number
    computeAssets: number
    services: number
    databases: number
    dependencies: number
    assetsWithMetrics: number
    operatingSystems: Record<string, number>
}

export const summarizeDiscoveryInventory = (snapshot: DiscoverySnapshot): DiscoveryInventorySummary => {
    const operatingSystems = snapshot.assets.reduce<Record<string, number>>((acc, asset) => ({
        ...acc,
        [asset.osFamily]: (acc[asset.osFamily] ?? 0) + 1
    }), {})
    return {
        applications: snapshot.applications.length,
        computeAssets: snapshot.assets.length,
        services: snapshot.services.length,
        databases: snapshot.services.filter((service) => service.runtime.includes('database')).length,
        dependencies: snapshot.dependencies.length,
        assetsWithMetrics: new Set(snapshot.metrics.map((metric) => metric.assetId)).size,
        operatingSystems
    }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd ocd && npx vitest run packages/react/src/discovery/__tests__/OcdDiscoveryAnalytics.test.ts`

Expected: PASS with 1 test.

- [ ] **Step 7: Commit**

```bash
git add ocd/packages/react/src/discovery
git commit -m "feat: add discovery snapshot model"
```

### Task 2: Technology To OCI Target Mapping

**Files:**
- Modify: `ocd/packages/react/src/discovery/OcdDiscoveryTypes.ts`
- Create: `ocd/packages/react/src/discovery/OcdDiscoveryMappers.ts`
- Test: `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`

- [ ] **Step 1: Write the failing mapper tests**

```ts
import { describe, expect, it } from 'vitest'
import { discoverySampleSnapshot } from '../OcdDiscoverySampleData'
import { mapDiscoveryServicesToOciTargets } from '../OcdDiscoveryMappers'

describe('mapDiscoveryServicesToOciTargets', () => {
    it('maps runtimes to OCI target services and migration dispositions', () => {
        const targets = mapDiscoveryServicesToOciTargets(discoverySampleSnapshot)

        expect(targets.find((target) => target.serviceId === 'svc-shop-api-1')).toMatchObject({
            targetResourceType: 'oci_containerengine_cluster',
            targetService: 'OKE',
            disposition: 'replatform'
        })
        expect(targets.find((target) => target.serviceId === 'svc-shop-db')).toMatchObject({
            targetResourceType: 'oci_database_autonomous_database',
            targetService: 'Autonomous Database',
            disposition: 'replatform'
        })
        expect(targets.find((target) => target.serviceId === 'svc-reporting-kafka')).toMatchObject({
            targetResourceType: 'oci_streaming_stream',
            targetService: 'Streaming',
            disposition: 'refactor'
        })
        expect(targets.find((target) => target.serviceId === 'svc-reporting-redis')).toMatchObject({
            targetResourceType: 'oci_redis_redis_cluster',
            targetService: 'OCI Cache with Redis',
            disposition: 'replatform'
        })
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ocd && npx vitest run packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`

Expected: FAIL with an import error for `../OcdDiscoveryMappers`.

- [ ] **Step 3: Extend the target mapping types**

```ts
export interface DiscoveryOciTargetMapping {
    serviceId: string
    applicationId: string
    sourceRuntime: DiscoveryRuntimeType
    targetService: string
    targetResourceType: string
    disposition: DiscoveryDisposition
    confidence: 'high' | 'medium' | 'low'
    rationale: string
}
```

- [ ] **Step 4: Add the pure mapping implementation**

```ts
import { DiscoveryOciTargetMapping, DiscoveryRuntimeType, DiscoverySnapshot } from './OcdDiscoveryTypes'

const runtimeTargets: Record<DiscoveryRuntimeType, Omit<DiscoveryOciTargetMapping, 'serviceId' | 'applicationId' | 'sourceRuntime'>> = {
    apache: { targetService: 'Load Balancer + Compute', targetResourceType: 'oci_core_instance', disposition: 'rehost', confidence: 'medium', rationale: 'Apache can move as-is to Compute or front OKE workloads with Load Balancer.' },
    nginx: { targetService: 'Load Balancer + OKE', targetResourceType: 'oci_load_balancer_load_balancer', disposition: 'replatform', confidence: 'high', rationale: 'Nginx edge tiers map cleanly to OCI Load Balancer and container ingress patterns.' },
    tomcat: { targetService: 'OKE', targetResourceType: 'oci_containerengine_cluster', disposition: 'replatform', confidence: 'high', rationale: 'Tomcat applications are strong candidates for container migration to OKE.' },
    weblogic: { targetService: 'WebLogic on OCI', targetResourceType: 'oci_core_instance', disposition: 'rehost', confidence: 'medium', rationale: 'WebLogic can move to OCI Compute-backed WebLogic patterns before deeper modernization.' },
    springboot: { targetService: 'OKE', targetResourceType: 'oci_containerengine_cluster', disposition: 'replatform', confidence: 'high', rationale: 'Spring Boot services are strong candidates for OKE deployment.' },
    iis: { targetService: 'Compute', targetResourceType: 'oci_core_instance', disposition: 'rehost', confidence: 'medium', rationale: 'IIS workloads commonly move first to Windows Compute before application refactoring.' },
    'oracle-database': { targetService: 'Autonomous Database', targetResourceType: 'oci_database_autonomous_database', disposition: 'replatform', confidence: 'medium', rationale: 'Oracle databases should be assessed for Autonomous Database, Base Database, or Exadata based on compatibility and performance.' },
    mysql: { targetService: 'MySQL HeatWave', targetResourceType: 'oci_mysql_mysql_db_system', disposition: 'replatform', confidence: 'high', rationale: 'MySQL workloads map to MySQL HeatWave for managed database operations.' },
    redis: { targetService: 'OCI Cache with Redis', targetResourceType: 'oci_redis_redis_cluster', disposition: 'replatform', confidence: 'high', rationale: 'Redis cache workloads map to managed Redis clusters.' },
    kafka: { targetService: 'Streaming', targetResourceType: 'oci_streaming_stream', disposition: 'refactor', confidence: 'medium', rationale: 'Kafka topics and producers can be assessed for OCI Streaming migration.' },
    rabbitmq: { targetService: 'Queue', targetResourceType: 'oci_queue_queue', disposition: 'refactor', confidence: 'medium', rationale: 'Queueing workloads should be assessed for OCI Queue when protocol semantics fit.' },
    unknown: { targetService: 'Compute', targetResourceType: 'oci_core_instance', disposition: 'retain', confidence: 'low', rationale: 'Unknown services require manual classification before target selection.' }
}

export const mapDiscoveryServicesToOciTargets = (snapshot: DiscoverySnapshot): DiscoveryOciTargetMapping[] =>
    snapshot.services.map((service) => ({
        serviceId: service.id,
        applicationId: service.applicationId,
        sourceRuntime: service.runtime,
        ...runtimeTargets[service.runtime]
    }))
```

- [ ] **Step 5: Run mapper tests**

Run: `cd ocd && npx vitest run packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`

Expected: PASS with 1 test.

- [ ] **Step 6: Commit**

```bash
git add ocd/packages/react/src/discovery
git commit -m "feat: map discovered services to OCI targets"
```

### Task 3: Dependency Graph, Waves, And Utilization Analytics

**Files:**
- Modify: `ocd/packages/react/src/discovery/OcdDiscoveryAnalytics.ts`
- Test: `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryAnalytics.test.ts`

- [ ] **Step 1: Extend analytics tests**

```ts
import { buildDependencyEdges, buildMigrationWaves, summarizeUtilization } from '../OcdDiscoveryAnalytics'

it('builds dependency edges with application and service names', () => {
    const edges = buildDependencyEdges(discoverySampleSnapshot)

    expect(edges[0]).toMatchObject({
        id: 'dep-shop-edge-a',
        sourceApplication: 'Retail Shop',
        targetApplication: 'Retail Shop',
        sourceService: 'Shop Nginx A',
        targetService: 'Shop API A',
        port: 8080,
        protocol: 'http'
    })
    expect(edges).toHaveLength(8)
})

it('groups migration waves by criticality, lifecycle, and disposition', () => {
    const waves = buildMigrationWaves(discoverySampleSnapshot)

    expect(waves.map((wave) => wave.name)).toEqual(['Wave 1 - Low Risk', 'Wave 2 - Production Replatform', 'Wave 3 - Legacy Critical'])
    expect(waves[0].applicationIds).toEqual(['app-reporting'])
    expect(waves[2].applicationIds).toEqual(['app-shop', 'app-billing'])
})

it('summarizes utilization and cost', () => {
    const utilization = summarizeUtilization(discoverySampleSnapshot)

    expect(utilization.monthlyCostUsd).toBe(6020)
    expect(utilization.p95CpuHotAssets).toEqual(['asset-shop-db-1', 'asset-billing-db-1'])
    expect(utilization.p95MemoryHotAssets).toEqual(['asset-shop-db-1', 'asset-billing-db-1'])
})
```

- [ ] **Step 2: Run analytics tests to verify failure**

Run: `cd ocd && npx vitest run packages/react/src/discovery/__tests__/OcdDiscoveryAnalytics.test.ts`

Expected: FAIL with missing exports for `buildDependencyEdges`, `buildMigrationWaves`, and `summarizeUtilization`.

- [ ] **Step 3: Add the analytics implementation**

```ts
import { DiscoveryDependency, DiscoverySnapshot } from './OcdDiscoveryTypes'

export interface DiscoveryDependencyEdge {
    id: string
    sourceApplication: string
    targetApplication: string
    sourceService: string
    targetService: string
    port: number
    protocol: DiscoveryDependency['protocol']
    observedConnectionsPerHour: number
}

export interface DiscoveryMigrationWave {
    name: string
    applicationIds: string[]
    reason: string
}

export interface DiscoveryUtilizationSummary {
    monthlyCostUsd: number
    p95CpuHotAssets: string[]
    p95MemoryHotAssets: string[]
}

export const buildDependencyEdges = (snapshot: DiscoverySnapshot): DiscoveryDependencyEdge[] => {
    const services = new Map(snapshot.services.map((service) => [service.id, service]))
    const applications = new Map(snapshot.applications.map((application) => [application.id, application]))
    return snapshot.dependencies.map((dependency) => {
        const sourceService = services.get(dependency.sourceServiceId)
        const targetService = services.get(dependency.targetServiceId)
        return {
            id: dependency.id,
            sourceApplication: applications.get(sourceService?.applicationId ?? '')?.name ?? 'Unknown',
            targetApplication: applications.get(targetService?.applicationId ?? '')?.name ?? 'Unknown',
            sourceService: sourceService?.displayName ?? 'Unknown',
            targetService: targetService?.displayName ?? 'Unknown',
            port: dependency.port,
            protocol: dependency.protocol,
            observedConnectionsPerHour: dependency.observedConnectionsPerHour
        }
    })
}

export const buildMigrationWaves = (snapshot: DiscoverySnapshot): DiscoveryMigrationWave[] => {
    const assetsByApplication = snapshot.assets.reduce<Record<string, typeof snapshot.assets>>((acc, asset) => ({
        ...acc,
        [asset.applicationId]: [...(acc[asset.applicationId] ?? []), asset]
    }), {})
    const lowRisk = snapshot.applications.filter((app) => app.criticality !== 'critical' && app.environment !== 'prod').map((app) => app.id)
    const productionReplatform = snapshot.applications
        .filter((app) => app.environment === 'prod' && app.preferredDisposition === 'replatform')
        .map((app) => app.id)
    const legacyCritical = snapshot.applications
        .filter((app) => (assetsByApplication[app.id] ?? []).some((asset) => asset.lifecycle !== 'current') || app.criticality === 'high')
        .map((app) => app.id)
    return [
        { name: 'Wave 1 - Low Risk', applicationIds: lowRisk, reason: 'Non-production or lower-criticality workloads validate discovery-to-design flow first.' },
        { name: 'Wave 2 - Production Replatform', applicationIds: productionReplatform, reason: 'Production services with container or managed-service targets follow after the low-risk wave.' },
        { name: 'Wave 3 - Legacy Critical', applicationIds: legacyCritical, reason: 'End-of-support, near-end-of-support, or high-criticality workloads need deeper validation before migration.' }
    ].filter((wave) => wave.applicationIds.length > 0)
}

export const summarizeUtilization = (snapshot: DiscoverySnapshot): DiscoveryUtilizationSummary => ({
    monthlyCostUsd: snapshot.metrics.reduce((total, metric) => total + metric.monthlyCostUsd, 0),
    p95CpuHotAssets: snapshot.metrics.filter((metric) => metric.p95CpuPercent >= 85).map((metric) => metric.assetId),
    p95MemoryHotAssets: snapshot.metrics.filter((metric) => metric.p95MemoryPercent >= 90).map((metric) => metric.assetId)
})
```

- [ ] **Step 4: Run analytics tests**

Run: `cd ocd && npx vitest run packages/react/src/discovery/__tests__/OcdDiscoveryAnalytics.test.ts`

Expected: PASS with 4 tests.

- [ ] **Step 5: Commit**

```bash
git add ocd/packages/react/src/discovery
git commit -m "feat: add discovery analytics"
```

### Task 4: Resource Analytics Import Normalizer

**Files:**
- Create: `ocd/packages/react/src/discovery/OcdResourceAnalytics.ts`
- Test: `ocd/packages/react/src/discovery/__tests__/OcdResourceAnalytics.test.ts`

- [ ] **Step 1: Write the failing Resource Analytics tests**

```ts
import { describe, expect, it } from 'vitest'
import { normalizeResourceAnalyticsRows } from '../OcdResourceAnalytics'

describe('normalizeResourceAnalyticsRows', () => {
    it('converts Resource Analytics rows into discovery assets and metric samples', () => {
        const snapshot = normalizeResourceAnalyticsRows([
            {
                resource_id: 'resource.compute.shop-web-1',
                resource_name: 'shop-web-1',
                resource_type: 'Instance',
                compartment_path: 'prod/applications/shop',
                region_name: 'eu-frankfurt-1',
                lifecycle_state: 'RUNNING',
                shape: 'VM.Standard.E5.Flex',
                cpu_core_count: 4,
                memory_gb: 16,
                storage_gb: 120,
                avg_cpu_percent: 42,
                p95_cpu_percent: 71,
                avg_memory_percent: 58,
                p95_memory_percent: 75,
                avg_network_mbps: 120,
                p95_network_mbps: 220,
                avg_iops: 500,
                p95_iops: 900,
                monthly_cost_usd: 420,
                application_name: 'Retail Shop',
                environment_name: 'prod',
                owner_name: 'Commerce'
            }
        ])

        expect(snapshot.source).toBe('resource-analytics')
        expect(snapshot.applications[0]).toMatchObject({ name: 'Retail Shop', environment: 'prod', owner: 'Commerce' })
        expect(snapshot.assets[0]).toMatchObject({ hostName: 'shop-web-1', cpuCores: 4, memoryGb: 16, storageGb: 120 })
        expect(snapshot.metrics[0]).toMatchObject({ assetId: 'resource.compute.shop-web-1', monthlyCostUsd: 420 })
    })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ocd && npx vitest run packages/react/src/discovery/__tests__/OcdResourceAnalytics.test.ts`

Expected: FAIL with an import error for `../OcdResourceAnalytics`.

- [ ] **Step 3: Add Resource Analytics row types and normalizer**

```ts
import { DiscoveryApplication, DiscoveryComputeAsset, DiscoveryMetricSample, DiscoverySnapshot } from './OcdDiscoveryTypes'

export interface ResourceAnalyticsRow {
    resource_id: string
    resource_name: string
    resource_type: string
    compartment_path: string
    region_name: string
    lifecycle_state: string
    shape: string
    cpu_core_count: number
    memory_gb: number
    storage_gb: number
    avg_cpu_percent: number
    p95_cpu_percent: number
    avg_memory_percent: number
    p95_memory_percent: number
    avg_network_mbps: number
    p95_network_mbps: number
    avg_iops: number
    p95_iops: number
    monthly_cost_usd: number
    application_name: string
    environment_name: 'dev' | 'test' | 'stage' | 'prod'
    owner_name: string
}

export const normalizeResourceAnalyticsRows = (rows: ResourceAnalyticsRow[]): DiscoverySnapshot => {
    const applicationsByName = new Map<string, DiscoveryApplication>()
    const assets: DiscoveryComputeAsset[] = []
    const metrics: DiscoveryMetricSample[] = []
    rows.forEach((row) => {
        const applicationId = `ra-app-${row.application_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
        if (!applicationsByName.has(applicationId)) {
            applicationsByName.set(applicationId, {
                id: applicationId,
                name: row.application_name,
                environment: row.environment_name,
                owner: row.owner_name,
                criticality: row.environment_name === 'prod' ? 'high' : 'medium',
                preferredDisposition: 'replatform'
            })
        }
        assets.push({
            id: row.resource_id,
            applicationId,
            hostName: row.resource_name,
            osFamily: 'linux',
            osName: row.shape,
            cpuCores: row.cpu_core_count,
            memoryGb: row.memory_gb,
            storageGb: row.storage_gb,
            virtualization: 'cloud',
            lifecycle: row.lifecycle_state === 'RUNNING' ? 'current' : 'near-end-of-support'
        })
        metrics.push({
            assetId: row.resource_id,
            avgCpuPercent: row.avg_cpu_percent,
            p95CpuPercent: row.p95_cpu_percent,
            avgMemoryPercent: row.avg_memory_percent,
            p95MemoryPercent: row.p95_memory_percent,
            avgNetworkMbps: row.avg_network_mbps,
            p95NetworkMbps: row.p95_network_mbps,
            avgIops: row.avg_iops,
            p95Iops: row.p95_iops,
            monthlyCostUsd: row.monthly_cost_usd
        })
    })
    return {
        id: 'resource-analytics-import',
        generatedAt: new Date().toISOString(),
        source: 'resource-analytics',
        applications: Array.from(applicationsByName.values()),
        assets,
        services: [],
        dependencies: [],
        metrics
    }
}
```

- [ ] **Step 4: Run Resource Analytics tests**

Run: `cd ocd && npx vitest run packages/react/src/discovery/__tests__/OcdResourceAnalytics.test.ts`

Expected: PASS with 1 test.

- [ ] **Step 5: Commit**

```bash
git add ocd/packages/react/src/discovery
git commit -m "feat: normalize resource analytics discovery rows"
```

### Task 5: Discovery Workbench Page And Menu

**Files:**
- Create: `ocd/packages/react/src/pages/OcdDiscovery.tsx`
- Create: `ocd/packages/react/src/discovery/ui/OcdDiscoveryInventoryView.tsx`
- Create: `ocd/packages/react/src/discovery/ui/OcdDiscoveryTopologyView.tsx`
- Create: `ocd/packages/react/src/discovery/ui/OcdDiscoveryAnalyticsView.tsx`
- Create: `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`
- Create: `ocd/packages/react/src/discovery/ui/OcdDiscoveryResourceAnalyticsView.tsx`
- Modify: `ocd/packages/react/src/pages/OcdConsole.tsx`
- Modify: `ocd/packages/react/src/components/OcdConsoleMenuBar.tsx`
- Modify: `ocd/packages/react/src/data/OcdSvgCssData.ts`

- [ ] **Step 1: Add the page shell**

```tsx
import React, { useMemo, useState } from 'react'
import { ConsolePageProps } from '../types/Console'
import { discoverySampleSnapshot } from '../discovery/OcdDiscoverySampleData'
import { summarizeDiscoveryInventory, summarizeUtilization } from '../discovery/OcdDiscoveryAnalytics'
import { mapDiscoveryServicesToOciTargets } from '../discovery/OcdDiscoveryMappers'
import { OcdDiscoveryInventoryView } from '../discovery/ui/OcdDiscoveryInventoryView'
import { OcdDiscoveryTopologyView } from '../discovery/ui/OcdDiscoveryTopologyView'
import { OcdDiscoveryAnalyticsView } from '../discovery/ui/OcdDiscoveryAnalyticsView'
import { OcdDiscoveryLzMappingView } from '../discovery/ui/OcdDiscoveryLzMappingView'
import { OcdDiscoveryResourceAnalyticsView } from '../discovery/ui/OcdDiscoveryResourceAnalyticsView'

type DiscoveryTab = 'inventory' | 'topology' | 'analytics' | 'lz-mapping' | 'resource-analytics'

const tabs: Array<{ id: DiscoveryTab; label: string }> = [
    { id: 'inventory', label: 'Inventory' },
    { id: 'topology', label: 'Topology' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'lz-mapping', label: 'LZ Mapping' },
    { id: 'resource-analytics', label: 'Resource Analytics' }
]

const OcdDiscovery = ({ ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const [activeTab, setActiveTab] = useState<DiscoveryTab>('inventory')
    const snapshot = discoverySampleSnapshot
    const summary = useMemo(() => summarizeDiscoveryInventory(snapshot), [snapshot])
    const utilization = useMemo(() => summarizeUtilization(snapshot), [snapshot])
    const targets = useMemo(() => mapDiscoveryServicesToOciTargets(snapshot), [snapshot])

    return (
        <main className='ocd-discovery-page'>
            <header className='ocd-discovery-header'>
                <div>
                    <h1>OCI Discovery Workbench</h1>
                    <p>Applications, dependencies, utilization, Resource Analytics, and Landing Zone recommendations.</p>
                </div>
                <div className='ocd-discovery-kpis'>
                    <span>{summary.applications} apps</span>
                    <span>{summary.computeAssets} assets</span>
                    <span>{summary.dependencies} dependencies</span>
                    <span>${utilization.monthlyCostUsd.toLocaleString()} monthly</span>
                </div>
            </header>
            <nav className='ocd-discovery-tabs' aria-label='Discovery views'>
                {tabs.map((tab) => (
                    <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
                ))}
            </nav>
            {activeTab === 'inventory' && <OcdDiscoveryInventoryView snapshot={snapshot} summary={summary} />}
            {activeTab === 'topology' && <OcdDiscoveryTopologyView snapshot={snapshot} />}
            {activeTab === 'analytics' && <OcdDiscoveryAnalyticsView snapshot={snapshot} utilization={utilization} />}
            {activeTab === 'lz-mapping' && <OcdDiscoveryLzMappingView snapshot={snapshot} targets={targets} ocdDocument={ocdDocument} setOcdDocument={setOcdDocument} />}
            {activeTab === 'resource-analytics' && <OcdDiscoveryResourceAnalyticsView />}
        </main>
    )
}

export default OcdDiscovery
```

- [ ] **Step 2: Add the Inventory view**

```tsx
import React from 'react'
import { DiscoveryInventorySummary } from '../OcdDiscoveryAnalytics'
import { DiscoverySnapshot } from '../OcdDiscoveryTypes'

export const OcdDiscoveryInventoryView = ({ snapshot, summary }: { snapshot: DiscoverySnapshot; summary: DiscoveryInventorySummary }): JSX.Element => (
    <section className='ocd-discovery-section'>
        <div className='ocd-discovery-grid'>
            {snapshot.applications.map((application) => (
                <article className='ocd-discovery-card' key={application.id}>
                    <h2>{application.name}</h2>
                    <p>{application.environment} · {application.owner} · {application.criticality}</p>
                    <strong>{snapshot.assets.filter((asset) => asset.applicationId === application.id).length} assets</strong>
                </article>
            ))}
        </div>
        <table className='ocd-discovery-table'>
            <thead><tr><th>Host</th><th>OS</th><th>CPU</th><th>Memory</th><th>Storage</th><th>Lifecycle</th></tr></thead>
            <tbody>
                {snapshot.assets.map((asset) => (
                    <tr key={asset.id}><td>{asset.hostName}</td><td>{asset.osName}</td><td>{asset.cpuCores}</td><td>{asset.memoryGb} GB</td><td>{asset.storageGb} GB</td><td>{asset.lifecycle}</td></tr>
                ))}
            </tbody>
        </table>
        <p className='ocd-discovery-note'>{summary.services} services discovered across {summary.computeAssets} compute assets.</p>
    </section>
)
```

- [ ] **Step 3: Add the Topology view**

```tsx
import React from 'react'
import { buildDependencyEdges } from '../OcdDiscoveryAnalytics'
import { DiscoverySnapshot } from '../OcdDiscoveryTypes'

export const OcdDiscoveryTopologyView = ({ snapshot }: { snapshot: DiscoverySnapshot }): JSX.Element => {
    const edges = buildDependencyEdges(snapshot)
    return (
        <section className='ocd-discovery-section'>
            <table className='ocd-discovery-table'>
                <thead><tr><th>Source App</th><th>Source Service</th><th>Target App</th><th>Target Service</th><th>Port</th><th>Connections/hr</th></tr></thead>
                <tbody>
                    {edges.map((edge) => (
                        <tr key={edge.id}>
                            <td>{edge.sourceApplication}</td><td>{edge.sourceService}</td><td>{edge.targetApplication}</td><td>{edge.targetService}</td><td>{edge.port}/{edge.protocol}</td><td>{edge.observedConnectionsPerHour.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    )
}
```

- [ ] **Step 4: Add Analytics, LZ Mapping, and Resource Analytics views**

```tsx
export const OcdDiscoveryAnalyticsView = ({ utilization }: { snapshot: DiscoverySnapshot; utilization: DiscoveryUtilizationSummary }): JSX.Element => (
    <section className='ocd-discovery-section'>
        <div className='ocd-discovery-grid'>
            <article className='ocd-discovery-card'><h2>Monthly Cost</h2><strong>${utilization.monthlyCostUsd.toLocaleString()}</strong></article>
            <article className='ocd-discovery-card'><h2>CPU Hot Assets</h2><strong>{utilization.p95CpuHotAssets.length}</strong></article>
            <article className='ocd-discovery-card'><h2>Memory Hot Assets</h2><strong>{utilization.p95MemoryHotAssets.length}</strong></article>
        </div>
    </section>
)

export const OcdDiscoveryLzMappingView = ({ targets }: { snapshot: DiscoverySnapshot; targets: DiscoveryOciTargetMapping[]; ocdDocument: OcdDocument; setOcdDocument: (document: OcdDocument) => void }): JSX.Element => (
    <section className='ocd-discovery-section'>
        <table className='ocd-discovery-table'>
            <thead><tr><th>Source Runtime</th><th>OCI Target</th><th>Resource Type</th><th>Disposition</th><th>Confidence</th></tr></thead>
            <tbody>
                {targets.map((target) => (
                    <tr key={target.serviceId}><td>{target.sourceRuntime}</td><td>{target.targetService}</td><td>{target.targetResourceType}</td><td>{target.disposition}</td><td>{target.confidence}</td></tr>
                ))}
            </tbody>
        </table>
    </section>
)

export const OcdDiscoveryResourceAnalyticsView = (): JSX.Element => (
    <section className='ocd-discovery-section'>
        <h2>Resource Analytics Integration</h2>
        <p>Use SQL-backed inventory rows, relationship views, and graph exports to enrich the workbench with near-real-time OCI topology.</p>
        <pre>{`SELECT resource_id, resource_name, resource_type, compartment_path, region_name FROM RESOURCE_DIM_V FETCH FIRST 50 ROWS ONLY`}</pre>
    </section>
)
```

- [ ] **Step 5: Wire the console page**

Add lazy import near the existing LZ lazy import:

```tsx
const OcdDiscovery = React.lazy(() => import('./OcdDiscovery'))
```

Add a toolbar handler in `OcdConsoleToolbar`:

```tsx
const onDiscoveryClick = () => {
    ocdConsoleConfig.config.displayPage = 'discovery'
    setOcdConsoleConfig(OcdConsoleConfig.clone(ocdConsoleConfig))
}
```

Add the toolbar action near the Landing Zone CTA:

```tsx
<button className='ocd-discovery-cta' title='Open OCI Discovery Workbench' onClick={onDiscoveryClick}>
    <span className='ocd-discovery-cta-icon' aria-hidden></span>
    <span className='ocd-discovery-cta-label'>Discovery</span>
</button>
```

Add the page switch:

```tsx
case 'discovery':
    DisplayPage = OcdDiscovery
    break;
```

- [ ] **Step 6: Add CSS**

```css
.ocd-discovery-page { display: flex; flex-direction: column; gap: 16px; padding: 20px; overflow: auto; }
.ocd-discovery-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.ocd-discovery-header h1 { margin: 0; font-size: 28px; font-weight: 700; }
.ocd-discovery-header p { margin: 6px 0 0; color: #5f5a56; }
.ocd-discovery-kpis { display: flex; flex-wrap: wrap; gap: 8px; }
.ocd-discovery-kpis span { border: 1px solid #d9d3ce; border-radius: 6px; padding: 6px 10px; background: #fff; }
.ocd-discovery-tabs { display: flex; gap: 8px; border-bottom: 1px solid #d9d3ce; }
.ocd-discovery-tabs button { border: 0; border-bottom: 3px solid transparent; background: transparent; padding: 10px 12px; cursor: pointer; }
.ocd-discovery-tabs button.active { border-bottom-color: #c74634; color: #8f2d20; font-weight: 700; }
.ocd-discovery-section { display: flex; flex-direction: column; gap: 16px; }
.ocd-discovery-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.ocd-discovery-card { border: 1px solid #d9d3ce; border-radius: 8px; background: #fff; padding: 12px; }
.ocd-discovery-card h2 { margin: 0 0 6px; font-size: 16px; }
.ocd-discovery-table { width: 100%; border-collapse: collapse; background: #fff; }
.ocd-discovery-table th, .ocd-discovery-table td { border-bottom: 1px solid #e6e0dc; padding: 8px 10px; text-align: left; }
.ocd-discovery-note { color: #5f5a56; }
.ocd-discovery-cta { display: inline-flex; align-items: center; gap: 8px; min-height: 32px; border: 1px solid #d9d3ce; border-radius: 6px; background: #fff; color: #312d2a; cursor: pointer; }
```

- [ ] **Step 7: Run build check**

Run: `cd ocd && npm run build --workspace=packages/react`

Expected: PASS with a compiled `@ocd/react` package.

- [ ] **Step 8: Commit**

```bash
git add ocd/packages/react/src/pages/OcdConsole.tsx ocd/packages/react/src/pages/OcdDiscovery.tsx ocd/packages/react/src/discovery ocd/packages/react/src/data/OcdSvgCssData.ts ocd/packages/react/src/components/OcdConsoleMenuBar.tsx
git commit -m "feat: add OCI discovery workbench page"
```

### Task 6: Resource Analytics Backend And Facade

**Files:**
- Modify: `ocd/packages/react/src/facade/OciApiFacade.ts`
- Modify: `ocd/packages/web-server/src/handlers.ts`
- Modify: `ocd/packages/web-server/src/server.ts`
- Modify: `ocd/packages/desktop/src/main.ts`
- Test: `ocd/packages/react/src/discovery/__tests__/OcdResourceAnalytics.test.ts`

- [ ] **Step 1: Add facade contracts**

```ts
export interface ResourceAnalyticsQueryRequest {
    profile: string
    region: string
    sql: string
}

export interface ResourceAnalyticsQueryResult {
    rows: Record<string, unknown>[]
}
```

Add facade methods:

```ts
export const queryDiscoverySnapshot = (profile: string = 'DEFAULT', region: string = 'uk-london-1'): Promise<any> => {
    if (window.ocdAPI) return window.ocdAPI.queryDiscoverySnapshot(profile, region)
    return webPost<any>('/discovery/snapshot', { profile, region })
}

export const queryResourceAnalytics = (profile: string = 'DEFAULT', region: string = 'uk-london-1', sql: string): Promise<ResourceAnalyticsQueryResult> => {
    if (window.ocdAPI) return window.ocdAPI.queryResourceAnalytics(profile, region, sql)
    return webPost<ResourceAnalyticsQueryResult>('/resource-analytics/query', { profile, region, sql })
}
```

- [ ] **Step 2: Add backend handler methods**

```ts
export interface ResourceAnalyticsQueryRequest {
    profile: string
    region: string
    sql: string
}

const validateResourceAnalyticsSql = (sql: string): string => {
    const trimmed = sql.trim()
    if (!trimmed.toLowerCase().startsWith('select ')) throw new Error('Resource Analytics query must be read-only SELECT SQL')
    if (/(;|insert |update |delete |merge |drop |alter |grant |revoke )/i.test(trimmed)) throw new Error('Resource Analytics query contains a disallowed statement')
    return trimmed
}

export const queryDiscoverySnapshot = async (request: { profile: string; region: string }): Promise<unknown> => {
    const query = new OciQuery(request.profile, request.region)
    const compartments = await query.withTimeout(query.listTenancyCompartments(), 'listTenancyCompartments')
    return { source: 'oci-query', compartments }
}

export const queryResourceAnalytics = async (request: ResourceAnalyticsQueryRequest): Promise<unknown> => {
    const sql = validateResourceAnalyticsSql(request.sql)
    return { rows: [], sql }
}
```

The `rows: []` response is the local-server contract stub. Replace the body with an OCI SDK or database client query only after credentials, wallet location, and network policy are reviewed in a separate security pass.

- [ ] **Step 3: Add server routes**

```ts
if (method === 'POST' && pathname === '/api/oci/discovery/snapshot') {
    const body = await parseJsonBody<{ profile?: string; region?: string }>(req)
    const result = await queryDiscoverySnapshot({
        profile: body.profile ?? 'DEFAULT',
        region: body.region ?? ''
    })
    sendOk(res, result)
    return
}
if (method === 'POST' && pathname === '/api/oci/resource-analytics/query') {
    const body = await parseJsonBody<{ profile?: string; region?: string; sql?: string }>(req)
    const result = await queryResourceAnalytics({
        profile: body.profile ?? 'DEFAULT',
        region: body.region ?? '',
        sql: body.sql ?? ''
    })
    sendOk(res, result)
    return
}
```

- [ ] **Step 4: Add UI call site in Resource Analytics view**

```tsx
const DEFAULT_RESOURCE_ANALYTICS_SQL = 'SELECT resource_id, resource_name, resource_type, compartment_path, region_name FROM RESOURCE_DIM_V FETCH FIRST 50 ROWS ONLY'
```

Use `OciApiFacade.queryResourceAnalytics('DEFAULT', 'uk-london-1', DEFAULT_RESOURCE_ANALYTICS_SQL)` behind a "Load Resource Analytics" button and render the returned row count.

- [ ] **Step 5: Run build and web-server tests**

Run: `cd ocd && npm run build --workspace=packages/web-server && npm run build --workspace=packages/react`

Expected: PASS for both packages.

- [ ] **Step 6: Commit**

```bash
git add ocd/packages/react/src/facade/OciApiFacade.ts ocd/packages/web-server/src/handlers.ts ocd/packages/web-server/src/server.ts ocd/packages/desktop/src/main.ts ocd/packages/react/src/discovery
git commit -m "feat: add resource analytics discovery API"
```

### Task 7: Landing Zone Discovery Recommendations

**Files:**
- Create: `ocd/packages/react/src/discovery/OcdDiscoveryLzRecommendations.ts`
- Test: `ocd/packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`
- Modify: `ocd/packages/react/src/discovery/ui/OcdDiscoveryLzMappingView.tsx`

- [ ] **Step 1: Add failing LZ recommendation test**

```ts
import { buildLandingZoneDiscoveryRecommendations } from '../OcdDiscoveryLzRecommendations'

it('builds Landing Zone recommendations from discovery evidence', () => {
    const recommendations = buildLandingZoneDiscoveryRecommendations(discoverySampleSnapshot)

    expect(recommendations.compartments).toEqual(['prod-commerce', 'prod-finance', 'stage-analytics'])
    expect(recommendations.overlays).toEqual(['observability', 'oke', 'iam-blueprint'])
    expect(recommendations.migrationWaves.map((wave) => wave.name)).toEqual(['Wave 1 - Low Risk', 'Wave 2 - Production Replatform', 'Wave 3 - Legacy Critical'])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ocd && npx vitest run packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`

Expected: FAIL with missing `../OcdDiscoveryLzRecommendations`.

- [ ] **Step 3: Add recommendation implementation**

```ts
import { buildMigrationWaves } from './OcdDiscoveryAnalytics'
import { DiscoverySnapshot } from './OcdDiscoveryTypes'

export interface LandingZoneDiscoveryRecommendations {
    compartments: string[]
    overlays: Array<'observability' | 'oke' | 'iam-blueprint'>
    migrationWaves: ReturnType<typeof buildMigrationWaves>
}

export const buildLandingZoneDiscoveryRecommendations = (snapshot: DiscoverySnapshot): LandingZoneDiscoveryRecommendations => {
    const compartments = snapshot.applications.map((application) =>
        `${application.environment}-${application.owner.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    )
    const hasContainerCandidate = snapshot.services.some((service) => ['springboot', 'tomcat', 'nginx'].includes(service.runtime))
    const overlays: LandingZoneDiscoveryRecommendations['overlays'] = [
        'observability',
        ...(hasContainerCandidate ? ['oke' as const] : []),
        'iam-blueprint'
    ]
    return {
        compartments: Array.from(new Set(compartments)),
        overlays,
        migrationWaves: buildMigrationWaves(snapshot)
    }
}
```

- [ ] **Step 4: Render recommendations in LZ Mapping**

```tsx
const recommendations = buildLandingZoneDiscoveryRecommendations(snapshot)
```

Render `recommendations.compartments`, `recommendations.overlays`, and `recommendations.migrationWaves` above the target mapping table.

- [ ] **Step 5: Run tests**

Run: `cd ocd && npx vitest run packages/react/src/discovery/__tests__/OcdDiscoveryMappers.test.ts`

Expected: PASS with all mapper and recommendation tests.

- [ ] **Step 6: Commit**

```bash
git add ocd/packages/react/src/discovery
git commit -m "feat: recommend landing zone from discovery"
```

### Task 8: Discovery-Focused OCI Catalog Curation

**Files:**
- Modify: `ocd/packages/codegen/src/importer/data/OciResourceMap.ts`
- Modify: `ocd/packages/codegen/tests/OciResourceMap.test.ts`
- Generated: `ocd/packages/codegen-cli/schema/oci-schema.json`
- Generated: `ocd/packages/model/src/provider/oci/resources/*`
- Generated: `ocd/packages/model/src/validator/provider/oci/resources/*`
- Generated: `ocd/packages/react/src/components/properties/provider/oci/resources/*`
- Generated: `ocd/packages/react/src/components/tabular/provider/oci/resources/*`
- Generated: `ocd/packages/import/src/terraform/provider/oci/resources/*`
- Generated: `ocd/packages/export/src/terraform/provider/oci/resources/*`
- Generated: `ocd/packages/export/src/markdown/provider/oci/resources/*`
- Generated: `ocd/packages/export/src/excel/provider/oci/resources/*`

- [ ] **Step 1: Add failing resource map coverage**

```ts
it('includes discovery and migration resource families', () => {
    const terraformResources = [
        'oci_cloud_bridge_agent',
        'oci_cloud_bridge_agent_dependency',
        'oci_cloud_bridge_agent_plugin',
        'oci_cloud_bridge_asset',
        'oci_cloud_bridge_asset_source',
        'oci_cloud_bridge_discovery_schedule',
        'oci_cloud_bridge_environment',
        'oci_cloud_bridge_inventory',
        'oci_cloud_migrations_migration',
        'oci_cloud_migrations_migration_asset',
        'oci_cloud_migrations_migration_plan',
        'oci_cloud_migrations_replication_schedule',
        'oci_cloud_migrations_target_asset',
        'oci_stack_monitoring_discovery_job',
        'oci_stack_monitoring_monitored_resource_task',
        'oci_stack_monitoring_monitored_resource_type',
        'oci_log_analytics_log_analytics_entity',
        'oci_jms_fleet',
        'oci_management_agent_management_agent_install_key'
    ]

    terraformResources.forEach((terraformResource) => {
        expect(resourceMap.find((entry) => entry.terraformResource === terraformResource)).toBeDefined()
    })
})
```

- [ ] **Step 2: Run map test to verify failure**

Run: `cd ocd && npx vitest run packages/codegen/tests/OciResourceMap.test.ts`

Expected: FAIL for the first uncataloged discovery resource.

- [ ] **Step 3: Add the curation entries**

Add entries with deterministic model names:

```ts
{ terraformResource: 'oci_cloud_bridge_agent', ocdResource: 'OciCloudBridgeAgent' },
{ terraformResource: 'oci_cloud_bridge_agent_dependency', ocdResource: 'OciCloudBridgeAgentDependency' },
{ terraformResource: 'oci_cloud_bridge_agent_plugin', ocdResource: 'OciCloudBridgeAgentPlugin' },
{ terraformResource: 'oci_cloud_bridge_asset', ocdResource: 'OciCloudBridgeAsset' },
{ terraformResource: 'oci_cloud_bridge_asset_source', ocdResource: 'OciCloudBridgeAssetSource' },
{ terraformResource: 'oci_cloud_bridge_discovery_schedule', ocdResource: 'OciCloudBridgeDiscoverySchedule' },
{ terraformResource: 'oci_cloud_bridge_environment', ocdResource: 'OciCloudBridgeEnvironment' },
{ terraformResource: 'oci_cloud_bridge_inventory', ocdResource: 'OciCloudBridgeInventory' },
{ terraformResource: 'oci_cloud_migrations_migration', ocdResource: 'OciCloudMigrationsMigration' },
{ terraformResource: 'oci_cloud_migrations_migration_asset', ocdResource: 'OciCloudMigrationsMigrationAsset' },
{ terraformResource: 'oci_cloud_migrations_migration_plan', ocdResource: 'OciCloudMigrationsMigrationPlan' },
{ terraformResource: 'oci_cloud_migrations_replication_schedule', ocdResource: 'OciCloudMigrationsReplicationSchedule' },
{ terraformResource: 'oci_cloud_migrations_target_asset', ocdResource: 'OciCloudMigrationsTargetAsset' },
{ terraformResource: 'oci_stack_monitoring_discovery_job', ocdResource: 'OciStackMonitoringDiscoveryJob' },
{ terraformResource: 'oci_stack_monitoring_monitored_resource_task', ocdResource: 'OciStackMonitoringMonitoredResourceTask' },
{ terraformResource: 'oci_stack_monitoring_monitored_resource_type', ocdResource: 'OciStackMonitoringMonitoredResourceType' },
{ terraformResource: 'oci_log_analytics_log_analytics_entity', ocdResource: 'OciLogAnalyticsLogAnalyticsEntity' },
{ terraformResource: 'oci_jms_fleet', ocdResource: 'OciJmsFleet' },
{ terraformResource: 'oci_management_agent_management_agent_install_key', ocdResource: 'OciManagementAgentManagementAgentInstallKey' }
```

- [ ] **Step 4: Run resource map tests**

Run: `cd ocd && npx vitest run packages/codegen/tests/OciResourceMap.test.ts`

Expected: PASS.

- [ ] **Step 5: Regenerate OCI resources**

Run: `cd ocd && npm run generate --workspace=packages/codegen-cli`

Expected: generated model, validator, React properties, tabular, import, and export files for the 19 resource entries.

- [ ] **Step 6: Build generated packages**

Run: `cd ocd && npm run build --workspace=packages/model && npm run build --workspace=packages/react`

Expected: PASS for generated model and React code.

- [ ] **Step 7: Commit**

```bash
git add ocd/packages/codegen/src/importer/data/OciResourceMap.ts ocd/packages/codegen/tests/OciResourceMap.test.ts ocd/packages/codegen-cli/schema/oci-schema.json ocd/packages/model/src ocd/packages/react/src/components ocd/packages/import/src ocd/packages/export/src
git commit -m "feat: add OCI discovery resource catalog"
```

### Task 9: Discovery E2E Coverage

**Files:**
- Create: `e2e/specs/discovery-workbench.spec.ts`

- [ ] **Step 1: Add Playwright smoke test**

```ts
import { expect, test } from '@playwright/test'

test.describe('OCI Discovery Workbench', () => {
    test('opens from toolbar and renders all discovery tabs', async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: /discovery/i }).click()

        await expect(page.getByRole('heading', { name: 'OCI Discovery Workbench' })).toBeVisible()
        await expect(page.getByText('3 apps')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Inventory' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Topology' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Analytics' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'LZ Mapping' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Resource Analytics' })).toBeVisible()

        await page.getByRole('button', { name: 'Topology' }).click()
        await expect(page.getByText('Shop Nginx A')).toBeVisible()

        await page.getByRole('button', { name: 'LZ Mapping' }).click()
        await expect(page.getByText('Autonomous Database')).toBeVisible()

        await page.getByRole('button', { name: 'Resource Analytics' }).click()
        await expect(page.getByText('RESOURCE_DIM_V')).toBeVisible()
    })
})
```

- [ ] **Step 2: Run E2E test**

Run: `cd ocd && npx playwright test e2e/specs/discovery-workbench.spec.ts`

Expected: PASS with 1 test.

- [ ] **Step 3: Commit**

```bash
git add e2e/specs/discovery-workbench.spec.ts
git commit -m "test: cover discovery workbench"
```

### Task 10: Documentation, Final Checks, And Redaction Gate

**Files:**
- Modify: `README.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/oci-lz-designer-roadmap.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update README feature list**

Add a fork feature bullet:

```md
> - **OCI Discovery Workbench** — application inventory, dependency topology, utilization analytics, OCI target recommendations, Resource Analytics integration, and Landing Zone Next-Gen mapping.
```

- [ ] **Step 2: Update architecture docs**

Add a section:

```md
## OCI Discovery Workbench

The Discovery Workbench is a React feature area under `packages/react/src/discovery/`.
It keeps snapshot normalization, analytics, target mapping, Resource Analytics import, and LZ recommendations as pure TypeScript modules with Vitest coverage.
Live OCI data continues to flow through the existing loopback-only `@ocd/web-server` and Electron IPC paths so credentials never enter the browser.
```

- [ ] **Step 3: Update roadmap**

Add a phase:

```md
## Phase E — Discovery-to-Landing-Zone design

- Discovery Workbench page with Inventory, Topology, Analytics, LZ Mapping, and Resource Analytics views.
- OCI catalog curation for Cloud Bridge, Cloud Migrations, Stack Monitoring, Log Analytics, JMS, and Management Agent resources.
- Discovery evidence mapped to Landing Zone compartments, overlays, migration waves, and OCI target services.
```

- [ ] **Step 4: Update changelog**

Add an unreleased entry:

```md
#### OCI Discovery Workbench
- Added a Discovery page for application inventory, dependency topology, Resource Analytics import, OCI target mapping, and Landing Zone recommendations.
- Expanded the curated OCI catalog with discovery and migration resource families.
```

- [ ] **Step 5: Run unit and build verification**

```bash
cd ocd
npx vitest run packages/react/src/discovery packages/codegen/tests/OciResourceMap.test.ts
npm run build --workspace=packages/model
npm run build --workspace=packages/react
OCD_PAGES_BASE=/ npm run build:pages
npx playwright test
```

Expected: all commands exit 0.

- [ ] **Step 6: Run staged diff hygiene checks**

```bash
git diff --cached --check
scripts/check-redaction.sh
```

Expected: both commands exit 0 and `scripts/check-redaction.sh` does not print a `[redaction-gate] BLOCKED` line.

- [ ] **Step 7: Commit**

```bash
git add README.md docs/ARCHITECTURE.md docs/oci-lz-designer-roadmap.md CHANGELOG.md
git commit -m "docs: document discovery workbench"
```

## Self-Review

- Spec coverage: The plan covers missing OCI components, LZ Next-Gen discovery gaps, the new Discovery menu/page, application and service dependency analytics, Resource Analytics integration, and discovery-to-LZ mapping.
- Placeholder scan: The plan avoids unresolved placeholder language, deferred implementation wording, and source names for private product-discovery references.
- Type consistency: `DiscoverySnapshot`, `DiscoveryOciTargetMapping`, `ResourceAnalyticsRow`, and `LandingZoneDiscoveryRecommendations` are defined before downstream tasks use them.
