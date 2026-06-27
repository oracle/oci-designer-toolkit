/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { LzSource, OCI_LZ_SOURCES } from './OcdLzSources'
import { LzUpdateStatus } from './OcdLzUpdateCheck'

export interface LzProjectAddonDescriptor {
    key: string
    label: string
    repo: string
    localSubdir: string
    pinnedRef: string
    setupCommand: string
    updateCommand: string
    installed: boolean | null
    updateAvailable: boolean
    unavailable: boolean
}

const DEFAULT_ADDON_ROOT = 'external/lz-addons'

export function isProjectAddonSource(source: LzSource): boolean {
    return source.role === 'project-addon'
}

export function canUpdateSourceFromBackend(source: LzSource | undefined): source is LzSource {
    return Boolean(
        source
        && isProjectAddonSource(source)
        && source.setup?.install?.mode === 'git-checkout'
    )
}

export function resolveProjectAddonLocalSubdir(source: LzSource): string {
    return source.setup?.localSubdir || `${DEFAULT_ADDON_ROOT}/${source.key}`
}

export function buildProjectAddonSetupCommand(source: LzSource): string {
    return `npm run setup-lz:latest -- --source ${source.key} --install`
}

export function buildProjectAddonUpdateCommand(source: LzSource): string {
    return `npm run setup-lz:latest -- --source ${source.key} --install`
}

export function buildProjectAddonDescriptors(
    sources: LzSource[] = OCI_LZ_SOURCES,
    statuses: LzUpdateStatus[] = [],
): LzProjectAddonDescriptor[] {
    const statusByKey = new Map(statuses.map((status) => [status.key, status]))
    return sources
        .filter(canUpdateSourceFromBackend)
        .map((source) => {
            const status = statusByKey.get(source.key)
            return {
                key: source.key,
                label: source.label,
                repo: source.repo,
                localSubdir: resolveProjectAddonLocalSubdir(source),
                pinnedRef: source.pinnedRef,
                setupCommand: buildProjectAddonSetupCommand(source),
                updateCommand: buildProjectAddonUpdateCommand(source),
                installed: null,
                updateAvailable: Boolean(status?.updateAvailable && !status.unavailable),
                unavailable: Boolean(status?.unavailable),
            }
        })
}
