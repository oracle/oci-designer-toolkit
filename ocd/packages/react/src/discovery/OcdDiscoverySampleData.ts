import { DiscoverySnapshot } from './OcdDiscoveryTypes'

export const discoverySampleSnapshot: DiscoverySnapshot = {
    id: 'sample-discovery-snapshot',
    generatedAt: '2026-06-08T00:00:00.000Z',
    source: 'sample',
    applications: [
        {
            id: 'app-shop',
            name: 'Retail Shop',
            environment: 'prod',
            owner: 'Commerce',
            criticality: 'critical',
            preferredDisposition: 'replatform'
        },
        {
            id: 'app-billing',
            name: 'Billing',
            environment: 'prod',
            owner: 'Finance',
            criticality: 'high',
            preferredDisposition: 'rehost'
        },
        {
            id: 'app-reporting',
            name: 'Reporting',
            environment: 'stage',
            owner: 'Analytics',
            criticality: 'medium',
            preferredDisposition: 'refactor'
        }
    ],
    assets: [
        {
            id: 'asset-shop-web-1',
            applicationId: 'app-shop',
            hostName: 'shop-web-1',
            osFamily: 'linux',
            osName: 'Enterprise Linux 8',
            cpuCores: 8,
            memoryGb: 32,
            storageGb: 256,
            virtualization: 'vmware',
            lifecycle: 'current'
        },
        {
            id: 'asset-shop-web-2',
            applicationId: 'app-shop',
            hostName: 'shop-web-2',
            osFamily: 'linux',
            osName: 'Enterprise Linux 8',
            cpuCores: 8,
            memoryGb: 32,
            storageGb: 256,
            virtualization: 'vmware',
            lifecycle: 'current'
        },
        {
            id: 'asset-shop-db-1',
            applicationId: 'app-shop',
            hostName: 'shop-db-1',
            osFamily: 'linux',
            osName: 'Enterprise Linux 7',
            cpuCores: 16,
            memoryGb: 96,
            storageGb: 2048,
            virtualization: 'vmware',
            lifecycle: 'near-end-of-support'
        },
        {
            id: 'asset-billing-app-1',
            applicationId: 'app-billing',
            hostName: 'billing-app-1',
            osFamily: 'windows',
            osName: 'Server 2019',
            cpuCores: 8,
            memoryGb: 32,
            storageGb: 512,
            virtualization: 'vmware',
            lifecycle: 'current'
        },
        {
            id: 'asset-billing-db-1',
            applicationId: 'app-billing',
            hostName: 'billing-db-1',
            osFamily: 'linux',
            osName: 'Enterprise Linux 7',
            cpuCores: 12,
            memoryGb: 64,
            storageGb: 1536,
            virtualization: 'vmware',
            lifecycle: 'near-end-of-support'
        },
        {
            id: 'asset-reporting-1',
            applicationId: 'app-reporting',
            hostName: 'reporting-1',
            osFamily: 'unix',
            osName: 'Commercial Unix 11',
            cpuCores: 8,
            memoryGb: 48,
            storageGb: 768,
            virtualization: 'physical',
            lifecycle: 'current'
        }
    ],
    services: [
        {
            id: 'svc-shop-nginx-1',
            assetId: 'asset-shop-web-1',
            applicationId: 'app-shop',
            runtime: 'nginx',
            displayName: 'Shop Nginx A',
            version: '1.24',
            port: 443,
            protocol: 'https'
        },
        {
            id: 'svc-shop-nginx-2',
            assetId: 'asset-shop-web-2',
            applicationId: 'app-shop',
            runtime: 'nginx',
            displayName: 'Shop Nginx B',
            version: '1.24',
            port: 443,
            protocol: 'https'
        },
        {
            id: 'svc-shop-api-1',
            assetId: 'asset-shop-web-1',
            applicationId: 'app-shop',
            runtime: 'springboot',
            displayName: 'Shop API A',
            version: '3.2',
            port: 8080,
            protocol: 'http'
        },
        {
            id: 'svc-shop-api-2',
            assetId: 'asset-shop-web-2',
            applicationId: 'app-shop',
            runtime: 'springboot',
            displayName: 'Shop API B',
            version: '3.2',
            port: 8080,
            protocol: 'http'
        },
        {
            id: 'svc-shop-db',
            assetId: 'asset-shop-db-1',
            applicationId: 'app-shop',
            runtime: 'oracle-database',
            displayName: 'Shop Oracle Database',
            version: '19c',
            port: 1521,
            protocol: 'tcp'
        },
        {
            id: 'svc-billing-iis',
            assetId: 'asset-billing-app-1',
            applicationId: 'app-billing',
            runtime: 'iis',
            displayName: 'Billing IIS',
            version: '10',
            port: 443,
            protocol: 'https'
        },
        {
            id: 'svc-billing-db',
            assetId: 'asset-billing-db-1',
            applicationId: 'app-billing',
            runtime: 'oracle-database',
            displayName: 'Billing Oracle Database',
            version: '19c',
            port: 1521,
            protocol: 'tcp'
        },
        {
            id: 'svc-reporting-kafka',
            assetId: 'asset-reporting-1',
            applicationId: 'app-reporting',
            runtime: 'kafka',
            displayName: 'Reporting Kafka',
            version: '3.6',
            port: 9092,
            protocol: 'tcp'
        },
        {
            id: 'svc-reporting-redis',
            assetId: 'asset-reporting-1',
            applicationId: 'app-reporting',
            runtime: 'redis',
            displayName: 'Reporting Redis',
            version: '7.0',
            port: 6379,
            protocol: 'tcp'
        }
    ],
    dependencies: [
        {
            id: 'dep-shop-edge-a',
            sourceServiceId: 'svc-shop-nginx-1',
            targetServiceId: 'svc-shop-api-1',
            port: 8080,
            protocol: 'http',
            observedConnectionsPerHour: 3200
        },
        {
            id: 'dep-shop-edge-b',
            sourceServiceId: 'svc-shop-nginx-2',
            targetServiceId: 'svc-shop-api-2',
            port: 8080,
            protocol: 'http',
            observedConnectionsPerHour: 3100
        },
        {
            id: 'dep-shop-api-a-to-db',
            sourceServiceId: 'svc-shop-api-1',
            targetServiceId: 'svc-shop-db',
            port: 1521,
            protocol: 'tcp',
            observedConnectionsPerHour: 1800
        },
        {
            id: 'dep-shop-api-b-to-db',
            sourceServiceId: 'svc-shop-api-2',
            targetServiceId: 'svc-shop-db',
            port: 1521,
            protocol: 'tcp',
            observedConnectionsPerHour: 1750
        },
        {
            id: 'dep-shop-api-to-billing',
            sourceServiceId: 'svc-shop-api-1',
            targetServiceId: 'svc-billing-iis',
            port: 443,
            protocol: 'https',
            observedConnectionsPerHour: 950
        },
        {
            id: 'dep-billing-iis-to-db',
            sourceServiceId: 'svc-billing-iis',
            targetServiceId: 'svc-billing-db',
            port: 1521,
            protocol: 'tcp',
            observedConnectionsPerHour: 1400
        },
        {
            id: 'dep-billing-to-reporting-kafka',
            sourceServiceId: 'svc-billing-iis',
            targetServiceId: 'svc-reporting-kafka',
            port: 9092,
            protocol: 'tcp',
            observedConnectionsPerHour: 760
        },
        {
            id: 'dep-reporting-kafka-to-redis',
            sourceServiceId: 'svc-reporting-kafka',
            targetServiceId: 'svc-reporting-redis',
            port: 6379,
            protocol: 'tcp',
            observedConnectionsPerHour: 1200
        }
    ],
    metrics: [
        {
            assetId: 'asset-shop-web-1',
            avgCpuPercent: 28,
            p95CpuPercent: 63,
            avgMemoryPercent: 41,
            p95MemoryPercent: 72,
            avgNetworkMbps: 140,
            p95NetworkMbps: 310,
            avgIops: 220,
            p95Iops: 640,
            monthlyCostUsd: 720
        },
        {
            assetId: 'asset-shop-web-2',
            avgCpuPercent: 30,
            p95CpuPercent: 66,
            avgMemoryPercent: 43,
            p95MemoryPercent: 74,
            avgNetworkMbps: 138,
            p95NetworkMbps: 305,
            avgIops: 225,
            p95Iops: 650,
            monthlyCostUsd: 740
        },
        {
            assetId: 'asset-shop-db-1',
            avgCpuPercent: 64,
            p95CpuPercent: 88,
            avgMemoryPercent: 76,
            p95MemoryPercent: 92,
            avgNetworkMbps: 120,
            p95NetworkMbps: 280,
            avgIops: 1800,
            p95Iops: 4200,
            monthlyCostUsd: 1560
        },
        {
            assetId: 'asset-billing-app-1',
            avgCpuPercent: 39,
            p95CpuPercent: 74,
            avgMemoryPercent: 55,
            p95MemoryPercent: 80,
            avgNetworkMbps: 180,
            p95NetworkMbps: 390,
            avgIops: 520,
            p95Iops: 1400,
            monthlyCostUsd: 900
        },
        {
            assetId: 'asset-billing-db-1',
            avgCpuPercent: 67,
            p95CpuPercent: 91,
            avgMemoryPercent: 78,
            p95MemoryPercent: 94,
            avgNetworkMbps: 105,
            p95NetworkMbps: 260,
            avgIops: 1500,
            p95Iops: 3600,
            monthlyCostUsd: 1380
        },
        {
            assetId: 'asset-reporting-1',
            avgCpuPercent: 44,
            p95CpuPercent: 79,
            avgMemoryPercent: 68,
            p95MemoryPercent: 86,
            avgNetworkMbps: 160,
            p95NetworkMbps: 340,
            avgIops: 820,
            p95Iops: 1900,
            monthlyCostUsd: 720
        }
    ]
}
