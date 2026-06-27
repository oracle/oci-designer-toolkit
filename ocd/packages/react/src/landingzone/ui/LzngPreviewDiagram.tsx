/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Lightweight, structural compartment-structure preview for wizard steps 1-4.
**
** This panel is titled "Preview from generated iam.json" but it does NOT run the
** jsonnet generator. A real Landing Zone expands into hundreds of resources, so
** rendering the full diagram on every keystroke is wasteful. Instead this builds
** a cheap, instant One-OE compartment skeleton directly from the wizard config
** (config.environments) using nested styled <div>s. It updates live as the user
** edits and never blocks the UI.
**
** Structure (One-OE naming):
**   OCI Region (outer)
**     └─ OCI Tenancy - Operating Entity (dashed)
**          └─ cmp-landingzone (dotted red)
**               ├─ cmp-lz-network   (shared, yellow)
**               ├─ cmp-lz-security  (shared, yellow)
**               └─ cmp-lz-<env>     (one per environment; green when its
**                                    security zone is on, else neutral)
**
** Per-step focus annotates/expands only the subset the step configures:
**   1 Foundation -> the canonical structure above
**   2 Hub        -> highlights cmp-lz-network with the hub VCN kind + CIDR
**   3 Projects   -> shows cmp-lz-<env>-projects with the project names
**   4 Templates  -> shows cmp-lz-<env>-platform with attached template names
**
** The full generated diagram (from real iam.json) lives in the Review step only
** (LzngIamDiagram).
*/

import React from 'react'
import { LandingZoneConfig, HUB_KIND_OPTIONS, LzEnvironment } from '../OcdLzConfig'

export type LzngPreviewFocus = 'foundation' | 'hub' | 'projects' | 'templates'

export interface LzngPreviewDiagramProps {
    config: LandingZoneConfig
    focus: LzngPreviewFocus
}

function hubLabel(config: LandingZoneConfig): string {
    const option = HUB_KIND_OPTIONS.find((opt) => opt.id === config.hubKind)
    return option ? option.label.split(' — ')[0] : config.hubKind
}

function envCompartmentName(env: LzEnvironment): string {
    return `cmp-lz-${env.name}`
}

interface ChipsProps {
    items: string[]
    emptyText: string
}

function Chips({ items, emptyText }: ChipsProps): JSX.Element {
    if (items.length === 0) {
        return <span className='ocd-lzng-prev-empty'>{emptyText}</span>
    }
    return (
        <span className='ocd-lzng-prev-chips'>
            {items.map((item) => (
                <span className='ocd-lzng-prev-chip' key={item}>{item}</span>
            ))}
        </span>
    )
}

interface EnvBoxProps {
    env: LzEnvironment
    focus: LzngPreviewFocus
}

function EnvBox({ env, focus }: EnvBoxProps): JSX.Element {
    const secure = env.securityZone
    const className = `ocd-lzng-prev-cmp ocd-lzng-prev-env${secure ? ' ocd-lzng-prev-env-secure' : ''}`
    const platformNames = env.platforms.map((plat) => plat.platformName || plat.type)
    return (
        <div className={className}>
            <div className='ocd-lzng-prev-cmp-head'>
                <span className='ocd-lzng-prev-cmp-name'>{envCompartmentName(env)}</span>
                {secure && <span className='ocd-lzng-prev-tag ocd-lzng-prev-tag-secure'>Security Zone</span>}
            </div>
            {focus === 'projects' && (
                <div className='ocd-lzng-prev-sub'>
                    <span className='ocd-lzng-prev-sub-name'>{envCompartmentName(env)}-projects</span>
                    <Chips items={env.projects} emptyText='no projects' />
                </div>
            )}
            {focus === 'templates' && (
                <div className='ocd-lzng-prev-sub'>
                    <span className='ocd-lzng-prev-sub-name'>{envCompartmentName(env)}-platform</span>
                    <Chips items={platformNames} emptyText='no platform templates' />
                </div>
            )}
        </div>
    )
}

export function LzngPreviewDiagram({ config, focus }: LzngPreviewDiagramProps): JSX.Element {
    const hubFocused = focus === 'hub'
    const networkClassName = `ocd-lzng-prev-cmp ocd-lzng-prev-shared${hubFocused ? ' ocd-lzng-prev-shared-focus' : ''}`
    return (
        <div className='ocd-lzng-prev' role='img' aria-label='Compartment structure preview' data-testid='lzng-preview-diagram'>
            <div className='ocd-lzng-prev-region'>
                <span className='ocd-lzng-prev-region-name'>OCI Region — {config.region || 'unset'}</span>
                <div className='ocd-lzng-prev-tenancy'>
                    <span className='ocd-lzng-prev-tenancy-name'>OCI Tenancy — Operating Entity</span>
                    <div className='ocd-lzng-prev-lz'>
                        <span className='ocd-lzng-prev-lz-name'>cmp-landingzone</span>
                        <div className='ocd-lzng-prev-grid'>
                            <div className={networkClassName}>
                                <div className='ocd-lzng-prev-cmp-head'>
                                    <span className='ocd-lzng-prev-cmp-name'>cmp-lz-network</span>
                                    {hubFocused && <span className='ocd-lzng-prev-tag'>Hub</span>}
                                </div>
                                {hubFocused && (
                                    <div className='ocd-lzng-prev-sub'>
                                        <span className='ocd-lzng-prev-sub-name'>{hubLabel(config)}</span>
                                        <Chips items={config.hubVcn ? [config.hubVcn] : []} emptyText='no VCN' />
                                    </div>
                                )}
                            </div>
                            <div className='ocd-lzng-prev-cmp ocd-lzng-prev-shared'>
                                <div className='ocd-lzng-prev-cmp-head'>
                                    <span className='ocd-lzng-prev-cmp-name'>cmp-lz-security</span>
                                </div>
                            </div>
                            {config.environments.map((env) => (
                                <EnvBox key={env.name} env={env} focus={focus} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
