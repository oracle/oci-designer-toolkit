/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    consumeWizardSeed,
    lzConfigToWizardSeed,
    stageWizardSeed,
    WizardState,
    WIZARD_SEED_KEY,
} from '../OcdLzWizardContext'
import { DEFAULT_CONFIG, LandingZoneConfig } from '../OcdLzConfig'
import { LZ_CONFIG_KEY } from '../OcdLzToModel'
import { LZ_SCAFFOLD_ENABLED_KEY } from '../OcdLzReconcile'
import { LZ_OBSERVABILITY_ENABLED_KEY } from '../OcdLzObservability'
import { LZ_OKE_NATIVE_ENABLED_KEY } from '../OcdLzOke'

const sampleConfig: LandingZoneConfig = {
    ...DEFAULT_CONFIG,
    region: 'us-ashburn-1',
    regionShortName: 'iad',
    realm: 'oc1',
    environments: [
        { name: 'prod', securityZone: true, spokeVcn: '10.0.64.0/21', projects: ['app'], platforms: [] },
        { name: 'dev', securityZone: false, spokeVcn: '10.0.128.0/21', projects: ['app'], platforms: [] },
    ],
}

function makeLocalStorage(): Storage {
    const map = new Map<string, string>()
    return {
        get length() {
            return map.size
        },
        getItem: (key: string) => (map.has(key) ? (map.get(key) as string) : null),
        setItem: (key: string, value: string) => {
            map.set(key, String(value))
        },
        removeItem: (key: string) => {
            map.delete(key)
        },
        clear: () => map.clear(),
        key: (index: number) => Array.from(map.keys())[index] ?? null,
    } as Storage
}

describe('lzConfigToWizardSeed', () => {
    it('produces a seed whose state matches the saved config + toggles + title', () => {
        const design = {
            metadata: { title: 'My Landing Zone' },
            userDefined: {
                [LZ_CONFIG_KEY]: sampleConfig,
                [LZ_SCAFFOLD_ENABLED_KEY]: true,
                [LZ_OBSERVABILITY_ENABLED_KEY]: true,
                [LZ_OKE_NATIVE_ENABLED_KEY]: false,
            },
        }

        const seed = lzConfigToWizardSeed(design)

        expect(seed).not.toBeNull()
        const data = (seed as WizardState).data
        const config = data.config as LandingZoneConfig
        expect(config.region).toBe('us-ashburn-1')
        expect(config.realm).toBe('oc1')
        expect(config.environments.map((env) => env.name)).toEqual(['prod', 'dev'])
        expect(config).toEqual(sampleConfig)
        expect(data.scaffoldEnabled).toBe(true)
        expect(data.observabilityEnabled).toBe(true)
        expect(data.okeNativeEnabled).toBe(false)
        expect(data.title).toBe('My Landing Zone')
    })

    it('defaults all add-on toggles to false and omits title when not stored', () => {
        const design = { userDefined: { [LZ_CONFIG_KEY]: sampleConfig } }

        const seed = lzConfigToWizardSeed(design)

        expect(seed).not.toBeNull()
        const data = (seed as WizardState).data
        expect(data.scaffoldEnabled).toBe(false)
        expect(data.observabilityEnabled).toBe(false)
        expect(data.okeNativeEnabled).toBe(false)
        expect('title' in data).toBe(false)
    })

    it('returns null for a non-LZ design (menu item disabled)', () => {
        expect(lzConfigToWizardSeed({ userDefined: {} })).toBeNull()
        expect(lzConfigToWizardSeed({})).toBeNull()
        expect(lzConfigToWizardSeed(null)).toBeNull()
        expect(lzConfigToWizardSeed(undefined)).toBeNull()
    })
})

describe('stageWizardSeed / consumeWizardSeed (one-shot)', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('round-trips a staged seed and clears it after a single consume', () => {
        vi.stubGlobal('window', { localStorage: makeLocalStorage() })
        const seed = lzConfigToWizardSeed({ userDefined: { [LZ_CONFIG_KEY]: sampleConfig } })

        stageWizardSeed(seed)
        expect((window as Window).localStorage.getItem(WIZARD_SEED_KEY)).not.toBeNull()

        const first = consumeWizardSeed()
        expect(first).toEqual(seed)

        // One-shot: a second consume (e.g. on reload) yields nothing.
        expect(consumeWizardSeed()).toBeNull()
        expect((window as Window).localStorage.getItem(WIZARD_SEED_KEY)).toBeNull()
    })

    it('staging a null seed is a no-op', () => {
        vi.stubGlobal('window', { localStorage: makeLocalStorage() })

        stageWizardSeed(null)

        expect(consumeWizardSeed()).toBeNull()
    })

    it('consume returns null when no DOM storage is available', () => {
        expect(consumeWizardSeed()).toBeNull()
    })
})
