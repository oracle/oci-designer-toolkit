/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { describe, expect, it } from 'vitest'
import { ociApiBackend } from '../OciApiFacade'
import type { OcdBackend, OciBackend } from '../OcdBackend'
import type { OcdElectronAPI } from '../OcdElectronAPI'

const expectedOciBackendKeys: Array<keyof OciBackend> = [
    'loadOCIConfigProfileNames',
    'loadOCIConfigProfile',
    'listRegions',
    'listTenancyCompartments',
    'queryTenancy',
    'queryDropdown',
    'queryDiscoverySnapshot',
    'generateArchitecturePlanWithGenAi',
    'generateArchitecturePlanFromImageWithGenAi',
    'listStacks',
    'createStack',
    'updateStack',
    'createJob',
    'getResourceManagerPlanReview',
    'updateLandingZoneAddon',
    'startLandingZoneAddonUpdateJob',
    'getLandingZoneAddonUpdateJob',
    'cancelLandingZoneAddonUpdateJob',
    'listLandingZoneAddonHealth',
    'getOciPriceList',
]

const expectOciBackend = (_backend: OciBackend): void => undefined
const expectOcdBackend = (_backend: OcdBackend): void => undefined

describe('OCD backend contracts', () => {
    it('keeps the web OCI facade aligned with the shared OCI backend contract', () => {
        expectOciBackend(ociApiBackend)

        expect(Object.keys(ociApiBackend).sort()).toEqual([...expectedOciBackendKeys].sort())
        expectedOciBackendKeys.forEach((key) => {
            expect(typeof ociApiBackend[key]).toBe('function')
        })
    })

    it('keeps the Electron preload API assignable to the full backend contract', () => {
        const electronApi = {} as OcdElectronAPI

        expectOcdBackend(electronApi)
        expect(true).toBe(true)
    })
})
