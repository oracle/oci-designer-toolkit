/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { buildCompartmentDiagram, findGeneratedFile } from '../OcdLzCompartmentDiagram'

describe('OcdLzCompartmentDiagram', () => {
    it('extracts shared and environment boxes from iam.json content', () => {
        const diagram = buildCompartmentDiagram(JSON.stringify({
            compartments_configuration: {
                compartments: {
                    ROOT: {
                        name: 'cmp-landingzone',
                        description: 'Landing Zone',
                        children: {
                            NETWORK: { name: 'cmp-lz-network', description: 'Shared Network' },
                            SECURITY: { name: 'cmp-lz-security', description: 'Shared Security' },
                            PLATFORM: { name: 'cmp-lz-platform', description: 'Shared Platform' },
                            PROD: {
                                name: 'cmp-lz-prod',
                                children: {
                                    PROD_NETWORK: { name: 'cmp-lz-prod-network' },
                                },
                            },
                        },
                    },
                },
            },
        }))

        expect(diagram.root?.name).toBe('cmp-landingzone')
        expect(diagram.shared.map((node) => node.name)).toEqual([
            'cmp-lz-network',
            'cmp-lz-security',
            'cmp-lz-platform',
        ])
        expect(diagram.environments.map((node) => node.name)).toEqual(['cmp-lz-prod'])
        expect(diagram.environments[0].children.map((node) => node.name)).toEqual(['cmp-lz-prod-network'])
    })

    it('finds generated files by name', () => {
        expect(findGeneratedFile([
            { name: 'iam.json', content: '{"ok":true}', size: 11 },
        ], 'iam.json')).toBe('{"ok":true}')
        expect(findGeneratedFile([], 'iam.json')).toBe(null)
    })
})
