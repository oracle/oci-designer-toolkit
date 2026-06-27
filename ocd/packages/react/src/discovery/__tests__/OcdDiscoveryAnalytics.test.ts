import { describe, expect, it } from 'vitest'
import { discoverySampleSnapshot } from '../OcdDiscoverySampleData'
import {
    buildDependencyEdges,
    buildMigrationWaves,
    summarizeDiscoveryInventory,
    summarizeUtilization
} from '../OcdDiscoveryAnalytics'

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

    it('counts mysql services as databases', () => {
        const snapshot = {
            ...discoverySampleSnapshot,
            services: discoverySampleSnapshot.services.map((service) => service.id === 'svc-billing-db'
                ? {
                    ...service,
                    runtime: 'mysql' as const
                }
                : service)
        }

        const summary = summarizeDiscoveryInventory(snapshot)

        expect(summary.databases).toBe(2)
    })

    it('does not count metrics for unknown asset IDs', () => {
        const snapshot = {
            ...discoverySampleSnapshot,
            metrics: [
                ...discoverySampleSnapshot.metrics,
                {
                    ...discoverySampleSnapshot.metrics[0],
                    assetId: 'asset-unknown'
                }
            ]
        }

        const summary = summarizeDiscoveryInventory(snapshot)

        expect(summary.assetsWithMetrics).toBe(6)
    })
})

describe('buildDependencyEdges', () => {
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
})

describe('buildMigrationWaves', () => {
    it('groups migration waves by criticality, lifecycle, and disposition', () => {
        const waves = buildMigrationWaves(discoverySampleSnapshot)

        expect(waves.map((wave) => wave.name)).toEqual(['Wave 1 - Low Risk', 'Wave 2 - Production Replatform', 'Wave 3 - Legacy Critical'])
        expect(waves[0].applicationIds).toEqual(['app-reporting'])
        expect(waves[2].applicationIds).toEqual(['app-shop', 'app-billing'])
    })

    it('assigns each application to at most one migration wave', () => {
        const waves = buildMigrationWaves(discoverySampleSnapshot)
        const applicationIds = waves.flatMap((wave) => wave.applicationIds)

        expect(applicationIds).toHaveLength(new Set(applicationIds).size)
    })

    it('assigns current production critical retain applications to the legacy critical wave', () => {
        const snapshot = {
            ...discoverySampleSnapshot,
            applications: [
                ...discoverySampleSnapshot.applications,
                {
                    id: 'app-critical-retain',
                    name: 'Critical Retain',
                    environment: 'prod' as const,
                    owner: 'Core Operations',
                    criticality: 'critical' as const,
                    preferredDisposition: 'retain' as const
                }
            ],
            assets: [
                ...discoverySampleSnapshot.assets,
                {
                    id: 'asset-critical-retain-1',
                    applicationId: 'app-critical-retain',
                    hostName: 'critical-retain-1',
                    osFamily: 'linux' as const,
                    osName: 'Enterprise Linux 8',
                    cpuCores: 4,
                    memoryGb: 16,
                    storageGb: 128,
                    virtualization: 'vmware' as const,
                    lifecycle: 'current' as const
                }
            ]
        }

        const waves = buildMigrationWaves(snapshot)

        expect(waves[2].applicationIds).toContain('app-critical-retain')
    })
})

describe('summarizeUtilization', () => {
    it('summarizes utilization and cost', () => {
        const utilization = summarizeUtilization(discoverySampleSnapshot)

        expect(utilization.monthlyCostUsd).toBe(6020)
        expect(utilization.p95CpuHotAssets).toEqual(['asset-shop-db-1', 'asset-billing-db-1'])
        expect(utilization.p95MemoryHotAssets).toEqual(['asset-shop-db-1', 'asset-billing-db-1'])
    })

    it('ignores utilization metrics for unknown asset IDs', () => {
        const snapshot = {
            ...discoverySampleSnapshot,
            metrics: [
                ...discoverySampleSnapshot.metrics,
                {
                    ...discoverySampleSnapshot.metrics[0],
                    assetId: 'asset-unknown',
                    p95CpuPercent: 99,
                    p95MemoryPercent: 99,
                    monthlyCostUsd: 9999
                }
            ]
        }

        const utilization = summarizeUtilization(snapshot)

        expect(utilization.monthlyCostUsd).toBe(6020)
        expect(utilization.p95CpuHotAssets).toEqual(['asset-shop-db-1', 'asset-billing-db-1'])
        expect(utilization.p95MemoryHotAssets).toEqual(['asset-shop-db-1', 'asset-billing-db-1'])
    })
})
