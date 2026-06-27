/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { DEFAULT_STEP1 } from '../OcdLzStep1Config'
import { generateLandingZoneFiles } from '../OcdLzGenerator'
import { EvaluateJsonnetArgs } from '../OcdJsonnetWasm'

describe('OcdLzGenerator', () => {
    it('passes config as TLA code and turns multi output into files', async () => {
        const calls: EvaluateJsonnetArgs[] = []
        const fakeEvaluate = async (args: EvaluateJsonnetArgs): Promise<string> => {
            calls.push(args)
            return JSON.stringify({
                'network.json': { ok: true },
                'iam.json': { groups: {} },
            })
        }

        const result = await generateLandingZoneFiles(DEFAULT_STEP1, fakeEvaluate)

        expect(calls[0].filename).toBe('/gen/landing_zone_multi.jsonnet')
        expect(calls[0].tlaCodes?.config).toContain("region_short_name: 'fra'")
        expect(result.renderer).toBe('go-jsonnet-wasm')
        expect(result.files.map((file) => file.name)).toEqual(['iam.json', 'network.json'])
        expect(result.files[0].content).toBe('{\n  "groups": {}\n}\n')
    })
})
