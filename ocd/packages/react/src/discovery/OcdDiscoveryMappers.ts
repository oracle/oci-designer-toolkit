import type { OcdDesign, OcdResource } from '@ocd/model'
import type { ArchitecturePlan } from '../architecture-agent/OcdArchitectureAgent'
import {
    DiscoveryApplication,
    DiscoveryOciResourceSummary,
    DiscoveryOciTargetMapping,
    DiscoveryRuntimeType,
    DiscoveryService,
    DiscoverySnapshot
} from './OcdDiscoveryTypes'

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

const redactedIdentifierPattern = /ocid1\.[a-z0-9_.-]+/gi

const safeDisplayName = (value: unknown, fallback: string): string => {
    const text = typeof value === 'string' && value.trim() ? value.trim() : fallback
    return text.replace(redactedIdentifierPattern, '<OCI_RESOURCE_ID>')
}

const getDesignOciResourceEntries = (design: OcdDesign): Array<[string, OcdResource[]]> =>
    Object.entries(design.model?.oci?.resources ?? {})
        .filter(([, resources]) => Array.isArray(resources)) as Array<[string, OcdResource[]]>

const getResourceCompartmentId = (resource: OcdResource): string | undefined => {
    const value = (resource as Record<string, unknown>).compartmentId
    return typeof value === 'string' && value.trim() ? value : undefined
}

const truncate = (value: string, maxLength = 160): string =>
    value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`

const runtimeByOciResourceType: Record<string, DiscoveryRuntimeType> = {
    autonomous_database: 'oracle-database',
    db_system: 'oracle-database',
    mysql_db_system: 'mysql',
    redis_cluster: 'redis',
    streaming_stream: 'kafka',
    queue: 'rabbitmq',
    load_balancer: 'nginx',
    network_load_balancer: 'nginx',
    oke_cluster: 'springboot',
    instance: 'unknown',
}

const portByRuntime: Record<DiscoveryRuntimeType, number> = {
    apache: 80,
    nginx: 80,
    tomcat: 8080,
    weblogic: 7001,
    springboot: 8080,
    iis: 80,
    'oracle-database': 1521,
    mysql: 3306,
    redis: 6379,
    kafka: 9092,
    rabbitmq: 5672,
    unknown: 0,
}

const normalizeResourceType = (resourceType: string): string => resourceType.replace(/^oci_/, '')

interface DiscoveryCompartmentInput {
    id?: string
    displayName?: string
    name?: string
}

export const mapCompartmentsToDiscoverySnapshot = (
    compartments: readonly DiscoveryCompartmentInput[],
    selectedCompartmentIds: readonly string[] = [],
    options: { id?: string; generatedAt?: string } = {},
): DiscoverySnapshot => {
    const selected = selectedCompartmentIds.length > 0
        ? compartments.filter((compartment) => compartment.id && selectedCompartmentIds.includes(compartment.id))
        : compartments
    const generatedAt = options.generatedAt ?? new Date().toISOString()
    const applications: DiscoveryApplication[] = selected.map((compartment, index) => ({
        id: `oci-compartment-${index + 1}`,
        name: safeDisplayName(compartment.displayName || compartment.name, `Compartment ${index + 1}`),
        environment: 'prod',
        owner: 'OCI',
        criticality: 'medium',
        preferredDisposition: 'retain',
    }))

    return {
        id: options.id ?? `oci-context-${generatedAt}`,
        generatedAt,
        source: 'oci-query',
        applications,
        assets: [],
        services: [],
        dependencies: [],
        metrics: [],
        ociResources: [],
    }
}

export const summarizeOciDesignResources = (design: OcdDesign): DiscoveryOciResourceSummary[] => {
    const compartments = design.model?.oci?.resources?.compartment ?? []
    const compartmentNames = new Map(compartments.map((compartment, index) => [
        compartment.id,
        safeDisplayName(compartment.displayName || (compartment as Record<string, unknown>).name, `Compartment ${index + 1}`),
    ]))
    return (
    getDesignOciResourceEntries(design).flatMap(([resourceType, resources]) =>
        resources.map((resource, index) => ({
            resourceType: normalizeResourceType(resourceType),
            displayName: safeDisplayName(resource.displayName, `${resourceType} ${index + 1}`),
            compartmentId: getResourceCompartmentId(resource),
            compartmentName: compartmentNames.get(getResourceCompartmentId(resource) ?? '') ?? undefined,
        }))
    )
    )
}

export const mapOciDesignToDiscoverySnapshot = (
    design: OcdDesign,
    options: { id?: string; generatedAt?: string } = {}
): DiscoverySnapshot => {
    const generatedAt = options.generatedAt ?? new Date().toISOString()
    const ociResources = summarizeOciDesignResources(design)
    const compartments = design.model?.oci?.resources?.compartment ?? []
    const applications = mapCompartmentsToDiscoverySnapshot(compartments, [], { generatedAt }).applications
    const fallbackApplication = applications[0] ?? {
        id: 'oci-inventory',
        name: 'OCI Inventory',
        environment: 'prod' as const,
        owner: 'OCI',
        criticality: 'medium' as const,
        preferredDisposition: 'retain' as const,
    }
    const applicationByCompartmentId = new Map(compartments.map((compartment, index) => [
        compartment.id,
        applications[index]?.id ?? fallbackApplication.id,
    ]))
    const applicationForResource = (resource: DiscoveryOciResourceSummary): string =>
        resource.compartmentId && applicationByCompartmentId.has(resource.compartmentId)
            ? applicationByCompartmentId.get(resource.compartmentId) ?? fallbackApplication.id
            : fallbackApplication.id
    const computeResources = design.model?.oci?.resources?.instance ?? []
    const assets = computeResources.map((resource, index) => ({
        id: `oci-compute-${index + 1}`,
        applicationId: applicationByCompartmentId.get(getResourceCompartmentId(resource) ?? '') ?? fallbackApplication.id,
        hostName: safeDisplayName(resource.displayName, `Compute ${index + 1}`),
        osFamily: 'linux' as const,
        osName: 'OCI Compute',
        cpuCores: 0,
        memoryGb: 0,
        storageGb: 0,
        virtualization: 'cloud' as const,
        lifecycle: 'current' as const,
    }))
    const resourceAnchorAssetId = 'oci-managed-services'
    const services: DiscoveryService[] = ociResources
        .filter((resource) => resource.resourceType !== 'compartment')
        .map((resource, index) => {
            const runtime = runtimeByOciResourceType[resource.resourceType] ?? 'unknown'
            const applicationId = applicationForResource(resource)
            return {
                id: `oci-service-${index + 1}`,
                assetId: assets.find((asset) => asset.applicationId === applicationId)?.id ?? resourceAnchorAssetId,
                applicationId,
                runtime,
                displayName: `${resource.resourceType}: ${resource.displayName}`,
                version: 'oci',
                port: portByRuntime[runtime],
                protocol: runtime === 'nginx' ? 'http' : 'tcp',
            }
        })

    return {
        id: options.id ?? `oci-discovery-${generatedAt}`,
        generatedAt,
        source: 'oci-query',
        applications: applications.length > 0 ? applications : [fallbackApplication],
        assets,
        services,
        dependencies: [],
        metrics: [],
        ociResources,
    }
}

export const buildDiscoveryRelationshipBrief = (snapshot: DiscoverySnapshot, limit = 8): string[] => {
    const applicationById = new Map(snapshot.applications.map((application) => [application.id, application]))
    const serviceById = new Map(snapshot.services.map((service) => [service.id, service]))
    return snapshot.dependencies.slice(0, limit).flatMap((dependency) => {
        const sourceService = serviceById.get(dependency.sourceServiceId)
        const targetService = serviceById.get(dependency.targetServiceId)
        if (!sourceService || !targetService) return []
        const sourceApplication = applicationById.get(sourceService.applicationId)
        const targetApplication = applicationById.get(targetService.applicationId)
        const source = `${safeDisplayName(sourceApplication?.name, 'Unknown app')} / ${safeDisplayName(sourceService.displayName, 'Unknown service')}`
        const target = `${safeDisplayName(targetApplication?.name, 'Unknown app')} / ${safeDisplayName(targetService.displayName, 'Unknown service')}`
        return truncate(`${source} -> ${target} over ${dependency.protocol}/${dependency.port} (${dependency.observedConnectionsPerHour} connections/hour)`)
    })
}

export const buildDiscoveryArchitecturePrompt = (snapshot: DiscoverySnapshot): string => {
    const summary = [
        `${snapshot.applications.length} applications`,
        `${snapshot.assets.length} compute assets`,
        `${snapshot.services.length} services`,
        `${snapshot.dependencies.length} dependencies`,
        `${snapshot.ociResources?.length ?? 0} OCI resources`,
    ].join(', ')
    const resourceTypes = Array.from(new Set((snapshot.ociResources ?? []).map((resource) => resource.resourceType))).sort()
    const targetTypes = Array.from(new Set(mapDiscoveryServicesToOciTargets(snapshot).map((target) => target.targetService))).sort()
    const relationships = buildDiscoveryRelationshipBrief(snapshot, 8)

    return [
        'Create an editable OCI architecture from this discovery snapshot.',
        `Discovery summary: ${summary}.`,
        resourceTypes.length > 0 ? `Existing OCI resource types: ${resourceTypes.join(', ')}.` : 'No existing OCI resource type inventory was provided.',
        targetTypes.length > 0 ? `Recommended target services: ${targetTypes.join(', ')}.` : 'Classify workloads conservatively and keep deployment behind plan-first review.',
        relationships.length > 0 ? `Top observed dependencies:\n- ${relationships.join('\n- ')}` : 'No observed service dependency list was provided.',
        'Preserve network isolation, private application tiers, logging, monitoring, budget guardrails, and Resource Manager plan-before-apply controls.',
    ].join('\n')
}

export const buildArchitecturePlanFromDiscoverySnapshot = (snapshot: DiscoverySnapshot): ArchitecturePlan => {
    const targets = mapDiscoveryServicesToOciTargets(snapshot)
    const needsOke = targets.some((target) => target.targetService === 'OKE')
    const needsLoadBalancer = targets.some((target) => target.targetService.includes('Load Balancer'))
    const needsDatabase = targets.some((target) => ['Autonomous Database', 'MySQL HeatWave'].includes(target.targetService))
    const computeCount = Math.max(1, snapshot.assets.length || (snapshot.ociResources ?? []).filter((resource) => resource.resourceType === 'instance').length)
    const relationshipAssumptions = buildDiscoveryRelationshipBrief(snapshot, 5)
        .map((relationship) => `Observed dependency: ${relationship}. Preserve this path with explicit routing and security rules.`)

    return {
        title: 'Discovery-Based OCI Architecture',
        summary: `Architecture scaffold generated from ${snapshot.source} discovery with ${snapshot.applications.length} applications and ${snapshot.ociResources?.length ?? 0} OCI resources.`,
        assumptions: [
            'Discovery output is treated as planning input; generated Terraform must be reviewed with Resource Manager PLAN before apply.',
            'CIDR ranges are placeholders for design validation and must be reconciled with tenancy network allocations.',
            ...relationshipAssumptions,
        ],
        resources: [
            { kind: 'vcn', displayName: 'Discovery Migration VCN', cidrBlock: '10.80.0.0/16' },
            { kind: 'subnet', displayName: 'Public Load Balancer Subnet', cidrBlock: '10.80.1.0/24', tier: 'load-balancer', public: true },
            { kind: 'subnet', displayName: 'Private App Subnet', cidrBlock: '10.80.2.0/24', tier: 'app', public: false },
            { kind: 'subnet', displayName: 'Private Database Subnet', cidrBlock: '10.80.3.0/24', tier: 'database', public: false },
            { kind: 'internet_gateway', displayName: 'Discovery Internet Gateway' },
            { kind: 'nat_gateway', displayName: 'Discovery NAT Gateway' },
            { kind: 'service_gateway', displayName: 'Discovery Service Gateway' },
            ...(needsLoadBalancer ? [{ kind: 'load_balancer' as const, displayName: 'Discovery Load Balancer' }] : []),
            ...(needsOke ? [
                { kind: 'oke_cluster' as const, displayName: 'Discovery OKE Cluster' },
                { kind: 'oke_node_pool' as const, displayName: 'Discovery Private Node Pool' },
            ] : [{ kind: 'instance' as const, displayName: 'Discovery Application Server', count: computeCount }]),
            ...(needsDatabase ? [{ kind: 'db_system' as const, displayName: 'Discovery Database System' }] : []),
            { kind: 'log_group', displayName: 'Discovery Log Group' },
            { kind: 'monitoring_alarm', displayName: 'Discovery Health Alarm' },
            { kind: 'budget', displayName: 'Discovery Budget Guardrail' },
        ],
    }
}
