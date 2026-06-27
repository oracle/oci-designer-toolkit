/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Maps OCD model resource types (singular snake_case keys, e.g. 'instance',
** 'volume', 'load_balancer') to the public Oracle list-pricing part numbers and
** the math that converts a resource into a monthly cost.
**
** Resource items are loosely typed (they come from arbitrary design JSON) so we
** use `any` for the per-item attribute access and narrow defensively with
** helper accessors. Verified part numbers are inlined; mappings whose SKU could
** not be confirmed against the live API use '' and render as "not costed".
*/

import type {
    CostAssumptions,
    CostConfidence,
    CostEstimateResult,
    CostLineItemResult,
    PriceMap
} from './OcdCostTypes'
import { resolveShapeSkus } from './OcdComputeShapeSkus'

/*
** ---- Verified part numbers ----
** All SKUs below were verified live against the public Oracle Cloud Cost
** Estimator Tools API
**   (https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/?currencyCode=USD)
** on 2026-06-04. Keep in sync with scripts/generate_oci_price_snapshot.py.
** DO NOT invent part numbers: services without a verified design-time SKU are
** left unmapped (rendered "not costed") or modelled as free / usage-based.
*/
// Storage - Block Volume
const SKU_BLOCK_VOLUME_STORAGE = 'B91961' // GB Capacity Per Month
const SKU_BLOCK_VOLUME_PERFORMANCE = 'B91962' // Performance Units Per GB Per Month
// Storage - File Storage
const SKU_FILE_STORAGE = 'B89057' // File Storage - Storage (GB Capacity Per Month)
// Load Balancer (flexible LB base + bandwidth, both list at $0)
const SKU_LB_BASE = 'B93030' // Load Balancer
const SKU_LB_BANDWIDTH = 'B93031' // Mbps Per Hour
// Object Storage (standard tier lists at $0 / first tier)
const SKU_OBJECT_STORAGE = 'B91628' // GB Capacity Per Month
const SKU_OBJECT_STORAGE_REQUESTS = 'B91627' // 10,000 Requests per Month
// Autonomous Database (ECPU compute model + storage)
const SKU_ADB_ECPU = 'B95702' // Oracle Autonomous AI Transaction Processing - ECPU (ECPU Per Hour)
const SKU_ADB_STORAGE = 'B95754' // Oracle Autonomous AI Database Storage (GB Capacity Per Month)
// Base Database Service (DB System VM, OCPU model)
const SKU_BASEDB_STANDARD_OCPU = 'B90569' // Oracle Base Database Service - Standard (OCPU Per Hour)
const SKU_BASEDB_ENTERPRISE_OCPU = 'B90570' // Oracle Base Database Service - Enterprise (OCPU Per Hour)
const SKU_BASEDB_STORAGE = 'B111584' // Oracle Base Database Service - Database Storage (GB Capacity Per Month)
// MySQL Database System (ECPU + storage)
const SKU_MYSQL_ECPU = 'B108030' // MySQL Database - ECPU (ECPU Per Hour)
const SKU_MYSQL_STORAGE = 'B92426' // MySQL Database - Storage (GB Capacity Per Month)
// OKE (enhanced cluster hourly fee; basic cluster is free)
const SKU_OKE_ENHANCED_CLUSTER = 'B96545' // OCI Kubernetes Engine - Enhanced Cluster (Cluster Per Hour)
// Security - Key Management (key versions, list 0 for software keys)
const SKU_KMS_KEY_VERSIONS = 'B92092' // Key Management Service - Key Versions (Key Version Per Month)
// Networking - DNS (usage-based: per 1,000,000 queries; queries not derivable from the design)
const SKU_DNS_QUERIES = 'B88525' // Networking - DNS (1,000,000 Queries)
// Logging - Storage (usage-based: GB Log Storage Per Month; first tier list 0)
const SKU_LOGGING_STORAGE = 'B92593' // OCI - Logging - Storage (GB Log Storage Per Month)
// Monitoring - Ingestion (usage-based: Million Datapoints; first tier list 0)
const SKU_MONITORING_INGESTION = 'B90925' // Monitoring - Ingestion (Million Datapoints)
// Notifications - HTTPS Delivery (usage-based: Million Delivery Operations; first tier list 0)
const SKU_NOTIFICATIONS_HTTPS = 'B90940' // Notifications - HTTPS Delivery (Million Delivery Operations)
// Oracle Functions - Invocations (usage-based: 1MIL Invocations; first tier list 0)
const SKU_FUNCTIONS_INVOCATIONS = 'B90618' // Oracle Functions - Invocations (1MIL Function Invocations)
// Streaming - PUT or GET (usage-based: GB of Data Transferred; volume not in design)
const SKU_STREAMING_PUTGET = 'B90938' // Streaming - PUT or GET (Gigabytes of Data Transferred)
// OCI Queue (usage-based: 1,000,000 Requests; request volume not in design)
const SKU_QUEUE_REQUESTS = 'B95697' // OCI Queue (1,000,000 Requests)
// API Gateway (usage-based: 1,000,000 API Calls Per Month; call volume not in design)
const SKU_API_GATEWAY_CALLS = 'B92072' // API Gateway - 1,000,000 API Calls Per Month
// Web Application Firewall - Requests (usage-based: 1M Incoming Requests Per Month)
const SKU_WAF_REQUESTS = 'B94277' // Web Application Firewall - Requests (1,000,000 Incoming Requests Per Month)
/*
** Usage-based / serverless services the toolkit does NOT yet model as distinct
** resource types, so they have no design-time quantity and are not in the cost
** table. Their part numbers are verified and recorded here as follow-ups so they
** can be wired up when the model adds the resources:
**   - Networking DNS:            B88525 (1,000,000 Queries)
**   - Logging - Storage:         B92593 (GB Log Storage Per Month, list 0)
**   - Monitoring - Ingestion:    B90925 (Million Datapoints, list 0)
**   - Notifications - HTTPS:     B90940 (Million Delivery Operations, list 0)
**   - Streaming - Storage:       B90939 (GB Per Hour)
**   - Streaming - PUT/GET:       B90938 (GB Transferred)
**   - Functions - Invocations:   B90618 (1MIL Invocations, list 0)
**   - Functions - Execution:     B90617 (10,000 GB Memory-Seconds, list 0)
**   - API Gateway - API Calls:   B92072 (1,000,000 API Calls Per Month)
*/

// Default flex sizing when a design omits shapeConfig.
const DEFAULT_OCPUS = 1
const DEFAULT_MEMORY_GBS = 16
const DEFAULT_VOLUME_GBS = 50
const DEFAULT_BOOT_VOLUME_GBS = 50
const DEFAULT_VPUS_PER_GB = 10
const DEFAULT_FILE_STORAGE_GBS = 100
const DEFAULT_ADB_ECPUS = 2
const DEFAULT_ADB_STORAGE_TBS = 1
const GBS_PER_TB = 1024
const DEFAULT_DB_CPU_CORES = 1
const DEFAULT_DB_STORAGE_GBS = 256
const DEFAULT_DB_NODE_COUNT = 1
const DEFAULT_MYSQL_ECPUS = 2
const DEFAULT_MYSQL_STORAGE_GBS = 50
const DEFAULT_NODE_POOL_SIZE = 3
const ENTERPRISE_EDITIONS = new Set(['ENTERPRISE_EDITION', 'ENTERPRISE_EDITION_HIGH_PERFORMANCE', 'ENTERPRISE_EDITION_EXTREME_PERFORMANCE'])

// Hourly metrics (compute, ECPU, cluster) are billed across the month; storage
// metrics are flat monthly. ECPU/cluster/node share the same hourly handling as
// OCPU. monthly-tb converts a TB quantity to GB (callers may bill per-GB SKUs).
type MetricKind =
    | 'hourly-ocpu'
    | 'hourly-memory'
    | 'hourly-gpu'
    | 'hourly-ecpu'
    | 'hourly-cluster'
    | 'monthly-gb'
    | 'monthly-perf-unit'
    | 'flat'

interface CostComponent {
    partNumber: string
    kind: MetricKind
}

interface ResourceCostMapping {
    label: string
    confidence: CostConfidence
    components: CostComponent[]
    // Compute the billable quantity for a metric kind from a single resource item.
    quantity: (item: any, kind: MetricKind) => number
    // Optional per-item resolver. When present, it overrides `components` and
    // `confidence` for that specific item (used by compute instances, whose SKUs
    // depend on the instance shape). Returns the components to bill, the
    // per-item billable quantities, and the per-line confidence + note.
    resolveItem?: (item: any) => ItemCostResolution
    note?: string
}

interface ItemCostResolution {
    components: CostComponent[]
    quantity: (item: any, kind: MetricKind) => number
    confidence: CostConfidence
    note?: string
}

// ---- Helper accessors (defensive against loosely typed design items) ----
const num = (value: unknown, fallback: number): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback

// OCPUs / memory for a Flex instance come from shapeConfig; non-Flex shapes
// carry ocpus / memoryInGBs on the item itself (from the shape catalog).
const instanceOcpus = (item: any): number =>
    num(item?.shapeConfig?.ocpus, num(item?.ocpus, DEFAULT_OCPUS))
const instanceMemory = (item: any): number =>
    num(item?.shapeConfig?.memoryInGBs, num(item?.memoryInGBs, DEFAULT_MEMORY_GBS))

// Map a SKU confidence (verified/approximate) to the line-item CostConfidence.
const shapeConfidenceToCost = (c: 'verified' | 'approximate'): CostConfidence =>
    c === 'verified' ? 'confident' : 'approximate'

// Parse a numeric value that the design may carry as a string (some generated
// model attributes, e.g. boot volume sizeInGbs, are strings).
const numOrStr = (value: unknown, fallback: number): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) return parsed
    }
    return fallback
}

/*
** Per-DB-System cost resolution: Base Database Service bills per OCPU per hour at
** a rate that depends on the database edition (Standard vs Enterprise), plus
** monthly database storage. node_count multiplies the OCPU charge (RAC nodes).
*/
const resolveDbSystemCost = (item: any): ItemCostResolution => {
    const edition = typeof item?.databaseEdition === 'string' ? item.databaseEdition : ''
    const isEnterprise = ENTERPRISE_EDITIONS.has(edition)
    const ocpuSku = isEnterprise ? SKU_BASEDB_ENTERPRISE_OCPU : SKU_BASEDB_STANDARD_OCPU
    const note = isEnterprise
        ? 'Base Database Service Enterprise OCPU + database storage at list rate.'
        : 'Base Database Service Standard OCPU + database storage at list rate.'
    return {
        components: [
            { partNumber: ocpuSku, kind: 'hourly-ocpu' },
            { partNumber: SKU_BASEDB_STORAGE, kind: 'monthly-gb' }
        ],
        quantity: (it, kind) => {
            const nodes = num(it?.nodeCount, DEFAULT_DB_NODE_COUNT)
            if (kind === 'hourly-ocpu') return num(it?.cpuCoreCount, DEFAULT_DB_CPU_CORES) * nodes
            return num(it?.dataStorageSizeInGBs, DEFAULT_DB_STORAGE_GBS)
        },
        confidence: 'approximate',
        note
    }
}

/*
** Per-instance cost resolution: pick the OCPU + memory SKUs for the instance's
** shape family (resolveShapeSkus), then bill the OCPUs/memory of that instance.
** Always-free shapes (Micro) resolve to a zero-cost line.
*/
const resolveInstanceCost = (item: any): ItemCostResolution => {
    const shape = typeof item?.shape === 'string' ? item.shape : ''
    const skus = resolveShapeSkus(shape)

    // GPU shapes bill an all-in per-GPU rate (OCPU/memory included). Bill the GPU
    // SKU scaled by the shape's GPU count.
    if (skus.gpuSku && skus.gpuSku.length > 0) {
        const gpuCount = num(skus.gpuCount, 1)
        const note = `Costed with ${shape || 'shape'} all-in per-GPU list rate (family ${skus.familyKey}; ${gpuCount} GPU(s), OCPU/memory included).`
        return {
            components: [{ partNumber: skus.gpuSku, kind: 'hourly-gpu' }],
            quantity: (_it, kind) => (kind === 'hourly-gpu' ? gpuCount : 0),
            confidence: shapeConfidenceToCost(skus.confidence),
            note: skus.note ? `${note} ${skus.note}` : note
        }
    }

    if (skus.alwaysFree || skus.ocpuSku.length === 0) {
        return {
            components: [],
            quantity: () => 0,
            confidence: 'confident',
            note: skus.note ?? 'Always-free shape; no charge.'
        }
    }

    const components: CostComponent[] = [{ partNumber: skus.ocpuSku, kind: 'hourly-ocpu' }]
    if (skus.memSku && skus.memSku.length > 0) {
        components.push({ partNumber: skus.memSku, kind: 'hourly-memory' })
    }

    const note = skus.memSku
        ? `Costed with ${shape || 'shape'} OCPU + memory list rates (family ${skus.familyKey}).`
        : `Costed with ${shape || 'shape'} bundled OCPU list rate (family ${skus.familyKey}; memory included).`

    return {
        components,
        quantity: (it, kind) => (kind === 'hourly-ocpu' ? instanceOcpus(it) : instanceMemory(it)),
        confidence: shapeConfidenceToCost(skus.confidence),
        note: skus.note ? `${note} ${skus.note}` : note
    }
}

/*
** Per-node-pool cost resolution: OKE worker nodes are billed as compute. Resolve
** the OCPU/memory SKUs for the node shape family (resolveShapeSkus) and bill the
** per-node OCPUs/memory scaled by the node-pool size. Always-free worker shapes
** (Ampere A1 free tier / Micro) resolve to a zero-cost line.
*/
const resolveNodePoolCost = (item: any): ItemCostResolution => {
    const shape = typeof item?.nodeShape === 'string' ? item.nodeShape : ''
    const skus = resolveShapeSkus(shape)
    const size = num(item?.size, DEFAULT_NODE_POOL_SIZE)

    // GPU worker shapes bill an all-in per-GPU rate (OCPU/memory included),
    // scaled by GPU count and node-pool size.
    if (skus.gpuSku && skus.gpuSku.length > 0) {
        const gpuCount = num(skus.gpuCount, 1)
        return {
            components: [{ partNumber: skus.gpuSku, kind: 'hourly-gpu' }],
            quantity: (it, kind) =>
                kind === 'hourly-gpu' ? gpuCount * num(it?.size, DEFAULT_NODE_POOL_SIZE) : 0,
            confidence: shapeConfidenceToCost(skus.confidence),
            note: `OKE worker nodes costed with ${shape || 'shape'} all-in per-GPU list rate (family ${skus.familyKey}; ${gpuCount} GPU(s)/node, ${size} node(s)).`
        }
    }

    if (skus.alwaysFree || skus.ocpuSku.length === 0) {
        return {
            components: [],
            quantity: () => 0,
            confidence: 'confident',
            note: skus.note ?? 'Always-free worker shape; no charge.'
        }
    }

    const components: CostComponent[] = [{ partNumber: skus.ocpuSku, kind: 'hourly-ocpu' }]
    if (skus.memSku && skus.memSku.length > 0) {
        components.push({ partNumber: skus.memSku, kind: 'hourly-memory' })
    }

    return {
        components,
        quantity: (it, kind) => {
            const nodes = num(it?.size, DEFAULT_NODE_POOL_SIZE)
            if (kind === 'hourly-ocpu') return num(it?.nodeShapeConfig?.ocpus, DEFAULT_OCPUS) * nodes
            return num(it?.nodeShapeConfig?.memoryInGbs, DEFAULT_MEMORY_GBS) * nodes
        },
        confidence: shapeConfidenceToCost(skus.confidence),
        note: `OKE worker nodes costed with ${shape || 'shape'} compute list rates (family ${skus.familyKey}), ${size} node(s).`
    }
}

// ---- Resource type -> cost mapping table ----
export const OCI_RESOURCE_COST_MAPPINGS: Record<string, ResourceCostMapping> = {
    instance: {
        label: 'Compute Instance',
        confidence: 'approximate',
        note: 'Per-shape OCPU + memory list rates resolved from the shape family.',
        components: [],
        quantity: (item, kind) => (kind === 'hourly-ocpu' ? instanceOcpus(item) : instanceMemory(item)),
        resolveItem: resolveInstanceCost
    },
    volume: {
        label: 'Block Volume',
        confidence: 'confident',
        note: 'Block volume storage (and Balanced 10 VPU/GB performance) at list rate.',
        components: [
            { partNumber: SKU_BLOCK_VOLUME_STORAGE, kind: 'monthly-gb' },
            { partNumber: SKU_BLOCK_VOLUME_PERFORMANCE, kind: 'monthly-perf-unit' }
        ],
        quantity: (item, kind) => {
            const sizeGbs = num(item?.sizeInGBs, DEFAULT_VOLUME_GBS)
            if (kind === 'monthly-gb') return sizeGbs
            // Performance units billed per GB scaled by VPUs/GB.
            return sizeGbs * num(item?.vpusPerGB, DEFAULT_VPUS_PER_GB)
        }
    },
    boot_volume: {
        label: 'Boot Volume',
        confidence: 'approximate',
        note: 'Boot volumes priced with the Block Volume storage rate; size defaults to 50GB when unspecified.',
        components: [{ partNumber: SKU_BLOCK_VOLUME_STORAGE, kind: 'monthly-gb' }],
        quantity: (item) => num(item?.sizeInGBs, DEFAULT_BOOT_VOLUME_GBS)
    },
    load_balancer: {
        label: 'Load Balancer',
        confidence: 'approximate',
        note: 'Flexible Load Balancer base + bandwidth; list base rate is 0, bandwidth billed by Mbps shape.',
        components: [
            { partNumber: SKU_LB_BASE, kind: 'flat' },
            { partNumber: SKU_LB_BANDWIDTH, kind: 'flat' }
        ],
        quantity: () => 1
    },
    network_load_balancer: {
        label: 'Network Load Balancer',
        confidence: 'confident',
        note: 'Network Load Balancer has no per-instance charge (list rate 0).',
        components: [{ partNumber: SKU_LB_BASE, kind: 'flat' }],
        quantity: () => 1
    },
    bucket: {
        label: 'Object Storage Bucket',
        confidence: 'approximate',
        note: 'Object Storage standard tier; usage-based — requires assumptions (storage GB / requests not derivable from the design).',
        components: [
            { partNumber: SKU_OBJECT_STORAGE, kind: 'monthly-gb' },
            { partNumber: SKU_OBJECT_STORAGE_REQUESTS, kind: 'flat' }
        ],
        // No size attribute on a bucket resource, so billable quantity is 0
        // (storage is pay-per-use). The mapping still resolves the SKU so the
        // line renders as a costed-but-zero entry rather than "not costed".
        quantity: () => 0
    },
    file_system: {
        label: 'File Storage',
        confidence: 'approximate',
        note: 'File Storage billed per GB stored; size is not in the design so usage-based — requires assumptions (defaults to 100GB).',
        components: [{ partNumber: SKU_FILE_STORAGE, kind: 'monthly-gb' }],
        // File systems have no design-time size attribute; bill 0 by default and
        // surface the SKU as a usage-based, costed-but-zero line.
        quantity: () => 0
    },
    autonomous_database: {
        label: 'Autonomous Database',
        confidence: 'approximate',
        note: 'Autonomous Database (ECPU compute model) + storage at list rate; free-tier instances cost 0.',
        components: [
            { partNumber: SKU_ADB_ECPU, kind: 'hourly-ecpu' },
            { partNumber: SKU_ADB_STORAGE, kind: 'monthly-gb' }
        ],
        quantity: (item, kind) => {
            if (item?.isFreeTier === true) return 0
            if (kind === 'hourly-ecpu') return num(item?.cpuCoreCount, DEFAULT_ADB_ECPUS)
            // dataStorageSizeInTbs -> GB for the per-GB storage SKU.
            return num(item?.dataStorageSizeInTbs, DEFAULT_ADB_STORAGE_TBS) * GBS_PER_TB
        }
    },
    db_system: {
        label: 'Database System',
        confidence: 'approximate',
        note: 'Base Database Service OCPU (edition-dependent) + database storage at list rate.',
        components: [],
        quantity: (item, kind) =>
            kind === 'hourly-ocpu'
                ? num(item?.cpuCoreCount, DEFAULT_DB_CPU_CORES) * num(item?.nodeCount, DEFAULT_DB_NODE_COUNT)
                : num(item?.dataStorageSizeInGBs, DEFAULT_DB_STORAGE_GBS),
        resolveItem: resolveDbSystemCost
    },
    mysql_db_system: {
        label: 'MySQL Database System',
        confidence: 'approximate',
        note: 'MySQL HeatWave Database ECPU + storage at list rate.',
        components: [
            { partNumber: SKU_MYSQL_ECPU, kind: 'hourly-ecpu' },
            { partNumber: SKU_MYSQL_STORAGE, kind: 'monthly-gb' }
        ],
        quantity: (item, kind) =>
            kind === 'hourly-ecpu'
                ? DEFAULT_MYSQL_ECPUS
                : numOrStr(item?.dataStorageSizeInGb, DEFAULT_MYSQL_STORAGE_GBS)
    },
    oke_cluster: {
        label: 'OKE Cluster',
        confidence: 'approximate',
        note: 'OKE enhanced cluster management fee (Cluster Per Hour); basic clusters are free. Worker nodes are costed as compute instances.',
        components: [{ partNumber: SKU_OKE_ENHANCED_CLUSTER, kind: 'hourly-cluster' }],
        // Treat clusters as enhanced (the management fee); basic clusters would
        // be 0. One management fee per cluster.
        quantity: (item, kind) => {
            if (kind !== 'hourly-cluster') return 0
            const type = typeof item?.type === 'string' ? item.type.toUpperCase() : ''
            return type === 'BASIC_CLUSTER' ? 0 : 1
        }
    },
    oke_node_pool: {
        label: 'OKE Node Pool (worker compute)',
        confidence: 'approximate',
        note: 'OKE worker nodes billed as compute: per-node OCPU + memory for the node shape, scaled by node-pool size.',
        components: [],
        quantity: (item, kind) => {
            const size = num(item?.size, DEFAULT_NODE_POOL_SIZE)
            if (kind === 'hourly-ocpu') return num(item?.nodeShapeConfig?.ocpus, DEFAULT_OCPUS) * size
            return num(item?.nodeShapeConfig?.memoryInGbs, DEFAULT_MEMORY_GBS) * size
        },
        resolveItem: resolveNodePoolCost
    },
    vault: {
        label: 'Vault / Key Management',
        confidence: 'approximate',
        note: 'KMS software-backed key versions list at 0; private/HSM vaults are usage-based — requires assumptions.',
        components: [{ partNumber: SKU_KMS_KEY_VERSIONS, kind: 'flat' }],
        quantity: () => 0
    },
    key: {
        label: 'Vault Key',
        confidence: 'approximate',
        note: 'KMS software-backed key versions list at 0; HSM-protected keys are usage-based — requires assumptions.',
        components: [{ partNumber: SKU_KMS_KEY_VERSIONS, kind: 'flat' }],
        quantity: () => 0
    },
    dns_zone: {
        label: 'DNS Zone',
        confidence: 'approximate',
        note: 'Networking DNS billed per 1,000,000 queries; query volume is not derivable from the design so usage-based — requires assumptions.',
        components: [{ partNumber: SKU_DNS_QUERIES, kind: 'flat' }],
        // No query-volume attribute on a DNS zone resource, so billable quantity
        // is 0 (pay-per-use). The mapping still resolves the SKU so the line
        // renders as a costed-but-zero entry rather than "not costed".
        quantity: () => 0
    },
    log_group: {
        label: 'Log Group',
        confidence: 'approximate',
        note: 'OCI Logging billed per GB log storage per month (first tier lists at 0); ingested volume is not in the design so usage-based — requires assumptions.',
        components: [{ partNumber: SKU_LOGGING_STORAGE, kind: 'monthly-gb' }],
        // Log groups have no design-time storage attribute; bill 0 and surface
        // the SKU as a usage-based, costed-but-zero line.
        quantity: () => 0
    },
    monitoring_alarm: {
        label: 'Monitoring Alarm',
        confidence: 'approximate',
        note: 'Monitoring ingestion billed per million datapoints (first tier lists at 0); datapoint volume is not in the design so usage-based — requires assumptions.',
        components: [{ partNumber: SKU_MONITORING_INGESTION, kind: 'flat' }],
        quantity: () => 0
    },
    notification_topic: {
        label: 'Notification Topic',
        confidence: 'approximate',
        note: 'Notifications HTTPS delivery billed per million delivery operations (first tier lists at 0); delivery volume is not in the design so usage-based — requires assumptions.',
        components: [{ partNumber: SKU_NOTIFICATIONS_HTTPS, kind: 'flat' }],
        quantity: () => 0
    },
    functions_application: {
        label: 'Functions Application',
        confidence: 'approximate',
        note: 'Oracle Functions billed per 1M invocations (first tier lists at 0); invocation volume is not in the design so usage-based — requires assumptions.',
        components: [{ partNumber: SKU_FUNCTIONS_INVOCATIONS, kind: 'flat' }],
        quantity: () => 0
    },
    streaming_stream: {
        label: 'Streaming Stream',
        confidence: 'approximate',
        note: 'OCI Streaming billed per GB of data transferred (PUT/GET) plus storage; transfer volume is not in the design so usage-based — requires assumptions.',
        components: [{ partNumber: SKU_STREAMING_PUTGET, kind: 'flat' }],
        quantity: () => 0
    },
    queue: {
        label: 'Queue',
        confidence: 'approximate',
        note: 'OCI Queue billed per 1,000,000 requests; request volume is not in the design so usage-based — requires assumptions.',
        components: [{ partNumber: SKU_QUEUE_REQUESTS, kind: 'flat' }],
        quantity: () => 0
    },
    api_gateway: {
        label: 'API Gateway',
        confidence: 'approximate',
        note: 'API Gateway billed per 1,000,000 API calls per month; call volume is not in the design so usage-based — requires assumptions.',
        components: [{ partNumber: SKU_API_GATEWAY_CALLS, kind: 'flat' }],
        quantity: () => 0
    },
    web_app_firewall: {
        label: 'Web Application Firewall',
        confidence: 'approximate',
        note: 'Web Application Firewall billed per 1,000,000 incoming requests per month; request volume is not in the design so usage-based — requires assumptions.',
        components: [{ partNumber: SKU_WAF_REQUESTS, kind: 'flat' }],
        quantity: () => 0
    }
}

// Resource types that are always free of charge in OCI. Listed so the BOM page
// can show them as "no charge" rather than "not costed / unknown".
export const FREE_RESOURCE_TYPES: ReadonlySet<string> = new Set([
    'vcn',
    'subnet',
    'route_table',
    'security_list',
    'internet_gateway',
    'nat_gateway',
    'service_gateway',
    'local_peering_gateway',
    'dhcp_options',
    'network_security_group',
    'drg',
    'drg_attachment',
    'compartment',
    'dynamic_group',
    'group',
    'user',
    'user_group_membership',
    'policy',
    'bastion',
    'cpe',
    'ipsec',
    'remote_peering_connection',
    'drg_route_table',
    'drg_route_distribution',
    'mount_target',
    'file_system_export',
    'file_system_export_set',
    'secret',
    // Events Rule, Service Connector Hub and Budgets have no direct OCI charge
    // (you pay only for the downstream services they drive / measure).
    'events_rule',
    'service_connector',
    'budget',
    // API Deployment is billed via its parent API Gateway (per-call), not as a
    // separate line item — no standalone charge.
    'api_deployment'
])

const round2 = (value: number): number => Math.round(value * 100) / 100

const metricUnitsPerMonth = (kind: MetricKind, hoursPerMonth: number): number => {
    switch (kind) {
        case 'hourly-ocpu':
        case 'hourly-memory':
        case 'hourly-gpu':
        case 'hourly-ecpu':
        case 'hourly-cluster':
        case 'flat': // flat (per-hour) SKUs such as LB base/bandwidth bill hourly
            return hoursPerMonth
        case 'monthly-gb':
        case 'monthly-perf-unit':
            return 1
        default:
            return 1
    }
}

/*
** Collect every part number a design's resources require, so the price-fetch
** layer knows which SKUs to load. Includes static component SKUs AND the
** per-shape SKUs resolved by mappings with a `resolveItem` (compute instances).
*/
export function collectRequiredPartNumbers(resources: Record<string, any[]>): string[] {
    const parts = new Set<string>()
    for (const [resourceType, items] of Object.entries(resources)) {
        const list = Array.isArray(items) ? items : []
        if (list.length === 0) continue
        const mapping = OCI_RESOURCE_COST_MAPPINGS[resourceType]
        if (!mapping) continue
        for (const component of mapping.components) {
            if (component.partNumber.length > 0) parts.add(component.partNumber)
        }
        if (mapping.resolveItem) {
            for (const item of list) {
                for (const component of mapping.resolveItem(item).components) {
                    if (component.partNumber.length > 0) parts.add(component.partNumber)
                }
            }
        }
    }
    return Array.from(parts)
}

/*
** Pure function. Walks the design resources and produces a monthly cost
** estimate from the supplied price map. Resource types not in the mapping table
** and not in FREE_RESOURCE_TYPES are reported as notCosted. Mapped SKUs missing
** from the price map are reported in missingParts and treated as 0 for that
** component.
*/
export function estimateMonthlyCost(
    resources: Record<string, any[]>,
    priceMap: PriceMap,
    assumptions: CostAssumptions
): CostEstimateResult {
    const hoursPerMonth = assumptions.hoursPerMonth || 744
    const lineItems: CostLineItemResult[] = []
    const notCosted: CostLineItemResult[] = []
    const missingPartsSet = new Set<string>()

    for (const [resourceType, items] of Object.entries(resources)) {
        const count = Array.isArray(items) ? items.length : 0
        if (count === 0) continue

        const mapping = OCI_RESOURCE_COST_MAPPINGS[resourceType]

        if (!mapping) {
            const label = resourceType.replace(/_/g, ' ')
            if (FREE_RESOURCE_TYPES.has(resourceType)) {
                lineItems.push({
                    resourceType,
                    label,
                    count,
                    partNumbers: [],
                    monthlyCost: 0,
                    confidence: 'confident',
                    note: 'No charge for this resource type.'
                })
            } else {
                notCosted.push({
                    resourceType,
                    label,
                    count,
                    partNumbers: [],
                    monthlyCost: 0,
                    confidence: 'not-costed',
                    note: 'No pricing mapping available for this resource type.'
                })
            }
            continue
        }

        // Per-item resolver path (compute instances): each item may have a
        // different SKU set / confidence depending on its shape.
        if (mapping.resolveItem) {
            let lineTotal = 0
            const usedParts: string[] = []
            const noteSet = new Set<string>()
            // Track the weakest per-item confidence to report at line level.
            let lineConfidence: CostConfidence = 'confident'
            const weaken = (c: CostConfidence): void => {
                if (c === 'approximate' && lineConfidence === 'confident') lineConfidence = 'approximate'
            }

            for (const item of items as any[]) {
                const resolution = mapping.resolveItem(item)
                weaken(resolution.confidence)
                if (resolution.note) noteSet.add(resolution.note)
                for (const component of resolution.components) {
                    if (component.partNumber.length === 0) continue
                    const entry = priceMap[component.partNumber]
                    if (!entry) {
                        missingPartsSet.add(component.partNumber)
                        continue
                    }
                    if (!usedParts.includes(component.partNumber)) usedParts.push(component.partNumber)
                    const quantity = resolution.quantity(item, component.kind)
                    const unitsPerMonth = metricUnitsPerMonth(component.kind, hoursPerMonth)
                    lineTotal += entry.unitPrice * quantity * unitsPerMonth
                }
            }

            lineItems.push({
                resourceType,
                label: mapping.label,
                count,
                partNumbers: usedParts,
                monthlyCost: round2(lineTotal),
                confidence: lineConfidence,
                note: noteSet.size > 0 ? Array.from(noteSet).join(' ') : mapping.note
            })
            continue
        }

        // Mappings with no resolvable SKU at all -> not costed.
        const resolvableComponents = mapping.components.filter((c) => c.partNumber.length > 0)
        if (resolvableComponents.length === 0) {
            notCosted.push({
                resourceType,
                label: mapping.label,
                count,
                partNumbers: [],
                monthlyCost: 0,
                confidence: 'not-costed',
                note: mapping.note ?? 'No verified part number for this resource type.'
            })
            continue
        }

        let lineTotal = 0
        const usedParts: string[] = []
        for (const item of items as any[]) {
            for (const component of resolvableComponents) {
                const entry = priceMap[component.partNumber]
                if (!entry) {
                    missingPartsSet.add(component.partNumber)
                    continue
                }
                if (!usedParts.includes(component.partNumber)) usedParts.push(component.partNumber)
                const quantity = mapping.quantity(item, component.kind)
                const unitsPerMonth = metricUnitsPerMonth(component.kind, hoursPerMonth)
                lineTotal += entry.unitPrice * quantity * unitsPerMonth
            }
        }

        lineItems.push({
            resourceType,
            label: mapping.label,
            count,
            partNumbers: usedParts,
            monthlyCost: round2(lineTotal),
            confidence: mapping.confidence,
            note: mapping.note
        })
    }

    const totalMonthly = round2(lineItems.reduce((sum, li) => sum + li.monthlyCost, 0))

    return {
        currency: assumptions.currency,
        totalMonthly,
        lineItems: lineItems.sort((a, b) => a.label.localeCompare(b.label)),
        notCosted: notCosted.sort((a, b) => a.label.localeCompare(b.label)),
        missingParts: Array.from(missingPartsSet).sort(),
        assumptions
    }
}
