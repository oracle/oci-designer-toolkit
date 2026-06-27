import { buildMigrationWaves, DiscoveryMigrationWave } from './OcdDiscoveryAnalytics'
import { DiscoverySnapshot } from './OcdDiscoveryTypes'

export interface DiscoveryLzRecommendations {
    compartments: string[]
    overlays: string[]
    migrationWaves: DiscoveryMigrationWave[]
}

const slug = (value: string): string => value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const recommendDiscoveryLandingZone = (snapshot: DiscoverySnapshot): DiscoveryLzRecommendations => {
    const compartments = Array.from(new Set(snapshot.applications.map((application) => {
        const environment = slug(application.environment)
        const owner = slug(application.owner)
        return [environment, owner].filter((part) => part.length > 0).join('-')
    }))).filter((compartment) => compartment.length > 0)

    const targetRuntimes = new Set(snapshot.services.map((service) => service.runtime))
    const overlays = [
        'observability',
        ...(targetRuntimes.has('springboot') || targetRuntimes.has('tomcat') || targetRuntimes.has('nginx') ? ['oke'] : []),
        ...(snapshot.applications.some((application) => application.environment === 'prod') ? ['iam-blueprint'] : [])
    ]

    return {
        compartments,
        overlays: Array.from(new Set(overlays)),
        migrationWaves: buildMigrationWaves(snapshot)
    }
}
