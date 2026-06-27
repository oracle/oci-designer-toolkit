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

export interface DiscoveryOciResourceSummary {
    resourceType: string
    displayName: string
    compartmentId?: string
    compartmentName?: string
}

export interface DiscoverySnapshot {
    id: string
    generatedAt: string
    source: 'sample' | 'oci-query' | 'imported'
    applications: DiscoveryApplication[]
    assets: DiscoveryComputeAsset[]
    services: DiscoveryService[]
    dependencies: DiscoveryDependency[]
    metrics: DiscoveryMetricSample[]
    ociResources?: DiscoveryOciResourceSummary[]
}
