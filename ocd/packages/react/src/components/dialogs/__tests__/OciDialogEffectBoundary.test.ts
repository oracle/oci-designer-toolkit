import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sourceRoot = resolve(__dirname, '..')

const dialogSources = [
    'OcdExportToResourceManagerDialog.tsx',
    'OcdQueryDialog.tsx',
    'OcdReferenceDataQueryDialog.tsx',
]

describe('OCI dialog effect boundaries', () => {
    it.each(dialogSources)('does not load OCI profile data from render in %s', (filename) => {
        const source = readFileSync(resolve(sourceRoot, filename), 'utf-8')

        expect(source).not.toContain('if (!profilesLoaded) OciApiFacade.loadOCIConfigProfileNames()')
    })
})
