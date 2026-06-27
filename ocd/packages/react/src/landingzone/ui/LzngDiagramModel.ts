/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Pure helper that derives the live network-diagram model from the full Landing
** Zone config. The model progressively reflects the wizard:
**
**   Region container
**     └─ Hub VCN (+ subnets per hub kind)
**     └─ per-environment spoke VCNs
**          └─ project nodes
**          └─ platform/extension compartments (+ optional dedicated VCN)
**
** Consumed by both the React-Flow view and the drawio exporter so the two stay
** in sync. No React, no side effects.
*/

import {
    HUB_KIND_OPTIONS,
    LandingZoneConfig,
    findExtensionTemplate,
} from '../OcdLzConfig'
import { findRegion } from '../OcdLzRegions'

export interface LzngDiagramPlatformNode {
    id: string
    name: string
    vcn: string
}

export interface LzngDiagramEnvNode {
    id: string
    name: string
    secure: boolean
    spokeVcn: string
    projects: string[]
    platforms: LzngDiagramPlatformNode[]
}

export interface LzngDiagramModel {
    regionLabel: string
    hubLabel: string
    hubVcn: string
    hubSubnets: string[]
    environments: LzngDiagramEnvNode[]
}

export function buildDiagramModel(config: LandingZoneConfig): LzngDiagramModel {
    const region = findRegion(config.realm, config.region)
    const shortName = config.regionShortName || region?.shortName || ''
    const regionLabel = `OCI Region · ${config.region || 'region'}${shortName ? ` (${shortName})` : ''} — ${config.realm || 'oc1'}`
    const hubOption = HUB_KIND_OPTIONS.find((opt) => opt.id === config.hubKind)
    return {
        regionLabel,
        hubLabel: `Hub VCN · ${config.hubKind}`,
        hubVcn: config.hubVcn,
        hubSubnets: hubOption ? hubOption.subnets : [],
        environments: config.environments.map((env, index): LzngDiagramEnvNode => ({
            id: `env-${index}-${env.name}`,
            name: env.name,
            secure: env.securityZone,
            spokeVcn: env.spokeVcn,
            projects: env.projects,
            platforms: env.platforms.map((plat, platIndex): LzngDiagramPlatformNode => {
                const template = findExtensionTemplate(plat.type)
                const hasNetwork = template ? template.networkMode !== 'forbidden' && Boolean(plat.vcn) : Boolean(plat.vcn)
                return {
                    id: `env-${index}-${env.name}-plat-${platIndex}-${plat.platformName}`,
                    name: `${plat.platformName} (${plat.type})`,
                    vcn: hasNetwork ? plat.vcn : 'no VCN',
                }
            }),
        })),
    }
}
