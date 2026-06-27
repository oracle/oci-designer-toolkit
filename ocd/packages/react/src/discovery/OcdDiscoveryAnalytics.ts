import { DiscoveryDependency, DiscoveryRuntimeType, DiscoverySnapshot } from './OcdDiscoveryTypes'

export interface DiscoveryInventorySummary {
    applications: number
    computeAssets: number
    services: number
    databases: number
    dependencies: number
    assetsWithMetrics: number
    operatingSystems: Record<string, number>
}

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

const databaseRuntimes = new Set<DiscoveryRuntimeType>(['oracle-database', 'mysql'])

export const summarizeDiscoveryInventory = (snapshot: DiscoverySnapshot): DiscoveryInventorySummary => {
    const operatingSystems = snapshot.assets.reduce<Record<string, number>>((acc, asset) => ({
        ...acc,
        [asset.osFamily]: (acc[asset.osFamily] ?? 0) + 1
    }), {})
    const validAssetIds = new Set(snapshot.assets.map((asset) => asset.id))
    const assetsWithMetrics = new Set(snapshot.metrics
        .filter((metric) => validAssetIds.has(metric.assetId))
        .map((metric) => metric.assetId))
    return {
        applications: snapshot.applications.length,
        computeAssets: snapshot.assets.length,
        services: snapshot.services.length,
        databases: snapshot.services.filter((service) => databaseRuntimes.has(service.runtime)).length,
        dependencies: snapshot.dependencies.length,
        assetsWithMetrics: assetsWithMetrics.size,
        operatingSystems
    }
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
    const legacyCritical = snapshot.applications
        .filter((app) => (assetsByApplication[app.id] ?? []).some((asset) => asset.lifecycle !== 'current') || app.criticality === 'critical' || app.criticality === 'high')
        .map((app) => app.id)
    const legacyCriticalIds = new Set(legacyCritical)
    const lowRisk = snapshot.applications
        .filter((app) => !legacyCriticalIds.has(app.id) && app.criticality !== 'critical' && app.environment !== 'prod')
        .map((app) => app.id)
    const productionReplatform = snapshot.applications
        .filter((app) => !legacyCriticalIds.has(app.id) && app.environment === 'prod' && app.preferredDisposition === 'replatform')
        .map((app) => app.id)
    return [
        { name: 'Wave 1 - Low Risk', applicationIds: lowRisk, reason: 'Non-production or lower-criticality workloads validate discovery-to-design flow first.' },
        { name: 'Wave 2 - Production Replatform', applicationIds: productionReplatform, reason: 'Production services with container or managed-service targets follow after the low-risk wave.' },
        { name: 'Wave 3 - Legacy Critical', applicationIds: legacyCritical, reason: 'End-of-support, near-end-of-support, or high-criticality workloads need deeper validation before migration.' }
    ]
}

export const summarizeUtilization = (snapshot: DiscoverySnapshot): DiscoveryUtilizationSummary => {
    const validAssetIds = new Set(snapshot.assets.map((asset) => asset.id))
    const validMetrics = snapshot.metrics.filter((metric) => validAssetIds.has(metric.assetId))

    return {
        monthlyCostUsd: validMetrics.reduce((total, metric) => total + metric.monthlyCostUsd, 0),
        p95CpuHotAssets: validMetrics.filter((metric) => metric.p95CpuPercent >= 85).map((metric) => metric.assetId),
        p95MemoryHotAssets: validMetrics.filter((metric) => metric.p95MemoryPercent >= 90).map((metric) => metric.assetId)
    }
}
