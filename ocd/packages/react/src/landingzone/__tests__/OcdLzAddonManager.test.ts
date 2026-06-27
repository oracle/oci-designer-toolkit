/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import {
    buildProjectAddonDescriptors,
    buildProjectAddonSetupCommand,
    canUpdateSourceFromBackend,
    resolveProjectAddonLocalSubdir,
} from '../OcdLzAddonManager'
import { LzSource } from '../OcdLzSources'

const addonSource: LzSource = {
    key: 'landing-zone-next-gen',
    label: 'Landing Zone Next Gen',
    repo: 'iwanhoogendoorn/landing-zone-next-gen',
    kind: 'commit',
    pinnedRef: '9'.repeat(40),
    role: 'project-addon',
    setup: {
        localSubdir: 'external/lz-addons/landing-zone-next-gen',
        gitIgnored: true,
        install: {
            mode: 'git-checkout',
        },
    },
}

describe('OcdLzAddonManager', () => {
    it('allows backend updates only for installable project add-ons', () => {
        expect(canUpdateSourceFromBackend(addonSource)).toBe(true)
        expect(canUpdateSourceFromBackend({
            ...addonSource,
            role: 'reference',
        })).toBe(false)
        expect(canUpdateSourceFromBackend({
            ...addonSource,
            setup: {
                localSubdir: 'external/lz-addons/missing-mode',
            },
        })).toBe(false)
        expect(canUpdateSourceFromBackend(undefined)).toBe(false)
    })

    it('resolves explicit local checkout directories for project add-ons', () => {
        expect(resolveProjectAddonLocalSubdir(addonSource)).toBe('external/lz-addons/landing-zone-next-gen')
    })

    it('falls back to the external add-on root when localSubdir is not declared', () => {
        expect(resolveProjectAddonLocalSubdir({
            ...addonSource,
            key: 'future-addon',
            setup: undefined,
        })).toBe('external/lz-addons/future-addon')
    })

    it('builds a safe setup command that delegates to setup_landing_zone.mjs', () => {
        expect(buildProjectAddonSetupCommand(addonSource)).toBe(
            'npm run setup-lz:latest -- --source landing-zone-next-gen --install',
        )
    })

    it('describes project add-ons with update and availability status', () => {
        const descriptors = buildProjectAddonDescriptors([
            addonSource,
            {
                ...addonSource,
                key: 'reference-only',
                role: 'reference',
            },
        ], [
            {
                key: 'landing-zone-next-gen',
                label: 'Landing Zone Next Gen',
                repo: 'iwanhoogendoorn/landing-zone-next-gen',
                kind: 'commit',
                current: addonSource.pinnedRef,
                latest: 'a'.repeat(40),
                latestShort: 'a'.repeat(12),
                updateAvailable: true,
                url: 'https://github.com/iwanhoogendoorn/landing-zone-next-gen/commit/example',
                date: '2026-06-11T00:00:00Z',
                role: 'project-addon',
            },
        ])

        expect(descriptors).toEqual([
            expect.objectContaining({
                key: 'landing-zone-next-gen',
                localSubdir: 'external/lz-addons/landing-zone-next-gen',
                setupCommand: 'npm run setup-lz:latest -- --source landing-zone-next-gen --install',
                updateCommand: 'npm run setup-lz:latest -- --source landing-zone-next-gen --install',
                updateAvailable: true,
                unavailable: false,
            }),
        ])
    })
})
