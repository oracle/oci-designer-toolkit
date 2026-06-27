/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import {
    lzFileBaseName,
    toGeneratedFiles,
    hasRecognisedLzFiles,
    buildDesignFromLzUpload,
    parseLzJson,
    LzImportError,
    MAX_LZ_UPLOAD_BYTES,
} from '../OcdLzFileImport'
import { LZ_ORIGIN_KEY } from '../OcdLzToModel'

// A minimal but structurally-valid iam.json the bridge can map.
const IAM_JSON = JSON.stringify({
    compartments_configuration: {
        compartments: {
            'CMP-LANDINGZONE': {
                name: 'cmp-landingzone',
                description: 'Root LZ compartment',
                children: {
                    'CMP-NETWORK': { name: 'cmp-lz-prod-network', description: 'Network' },
                    'CMP-SECURITY': { name: 'cmp-lz-prod-security', description: 'Security' },
                },
            },
        },
    },
})

describe('lzFileBaseName', () => {
    it('strips a posix directory prefix', () => {
        expect(lzFileBaseName('out/gen/iam.json')).toBe('iam.json')
    })
    it('strips a windows directory prefix', () => {
        expect(lzFileBaseName('C:\\out\\network.json')).toBe('network.json')
    })
    it('returns a bare name unchanged', () => {
        expect(lzFileBaseName('iam.json')).toBe('iam.json')
    })
})

describe('toGeneratedFiles', () => {
    it('maps uploads to GeneratedFile with base names and byte sizes', () => {
        const files = toGeneratedFiles([{ name: 'gen/iam.json', content: '{}' }])
        expect(files).toEqual([{ name: 'iam.json', content: '{}', size: 2 }])
    })

    it('drops non-JSON uploads', () => {
        const files = toGeneratedFiles([
            { name: 'iam.json', content: '{}' },
            { name: 'README.md', content: '# notes' },
            { name: 'config.jsonnet', content: '{}' },
        ])
        expect(files.map((f) => f.name)).toEqual(['iam.json'])
    })

    it('rejects an upload over the size cap (named file + limit, typed error)', () => {
        const huge = 'x'.repeat(MAX_LZ_UPLOAD_BYTES + 1)
        let thrown: unknown
        try {
            toGeneratedFiles([{ name: 'dir/network.json', content: huge }])
        } catch (e) {
            thrown = e
        }
        expect(thrown).toBeInstanceOf(LzImportError)
        expect((thrown as Error).message).toContain('network.json')
        expect((thrown as Error).message).toMatch(/limit/)
    })

    it('surfaces a typed Invalid JSON error (not a raw SyntaxError) for malformed .json', () => {
        let thrown: unknown
        try {
            toGeneratedFiles([{ name: 'iam.json', content: '{ not: valid json' }])
        } catch (e) {
            thrown = e
        }
        expect(thrown).toBeInstanceOf(LzImportError)
        expect(thrown).not.toBeInstanceOf(SyntaxError)
        expect((thrown as Error).message).toBe('Invalid JSON in iam.json')
    })
})

describe('parseLzJson', () => {
    it('parses valid JSON', () => {
        expect(parseLzJson<{ a: number }>('{"a":1}', 'iam.json')).toEqual({ a: 1 })
    })

    it('throws a typed Invalid JSON error naming the file, never the contents', () => {
        let thrown: unknown
        try {
            parseLzJson('not json', 'network.json')
        } catch (e) {
            thrown = e
        }
        expect(thrown).toBeInstanceOf(LzImportError)
        expect((thrown as Error).message).toBe('Invalid JSON in network.json')
        // The (untrusted) content must not be echoed into the message.
        expect((thrown as Error).message).not.toContain('not json')
    })
})

describe('hasRecognisedLzFiles', () => {
    it('is true when iam.json is present', () => {
        expect(hasRecognisedLzFiles([{ name: 'iam.json', content: '{}', size: 2 }])).toBe(true)
    })
    it('is true when network.json is present (case-insensitive)', () => {
        expect(hasRecognisedLzFiles([{ name: 'Network.json', content: '{}', size: 2 }])).toBe(true)
    })
    it('is false when only unmapped files are present', () => {
        expect(hasRecognisedLzFiles([{ name: 'governance.json', content: '{}', size: 2 }])).toBe(false)
    })
})

describe('buildDesignFromLzUpload', () => {
    it('throws a useful error when no recognised file is present', () => {
        expect(() => buildDesignFromLzUpload([{ name: 'governance.json', content: '{}' }])).toThrow(
            /No recognised Landing Zone files/,
        )
    })

    it('builds an lzOrigin design with compartments from iam.json', () => {
        const result = buildDesignFromLzUpload([{ name: 'iam.json', content: IAM_JSON }], 'My Imported LZ')
        expect(result.design.userDefined[LZ_ORIGIN_KEY]).toBe(true)
        expect(result.design.metadata.title).toBe('My Imported LZ')
        // 1 root + 2 children
        expect(result.counts.compartment).toBe(3)
        expect(result.topCompartmentIds.length).toBe(1)
        const names = (result.design.model.oci.resources.compartment ?? []).map((c: { displayName: string }) => c.displayName)
        expect(names).toContain('cmp-lz-prod-network')
        expect(names).toContain('cmp-lz-prod-security')
    })

    it('ignores a full directory path on the uploaded file name', () => {
        const result = buildDesignFromLzUpload([{ name: 'some/dir/iam.json', content: IAM_JSON }])
        expect(result.counts.compartment).toBe(3)
    })

    it('rejects an over-cap upload before doing any import work', () => {
        const huge = 'x'.repeat(MAX_LZ_UPLOAD_BYTES + 1)
        expect(() => buildDesignFromLzUpload([{ name: 'iam.json', content: huge }])).toThrow(LzImportError)
    })
})
