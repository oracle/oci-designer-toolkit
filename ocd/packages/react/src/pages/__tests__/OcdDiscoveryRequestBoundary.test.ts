import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), '../OcdDiscovery.tsx')
const source = readFileSync(sourcePath, 'utf8')

describe('OcdDiscovery live request boundary', () => {
    it('invalidates in-flight live discovery when profile, region, or compartments change', () => {
        const invalidationCallCount = source.match(/invalidateActiveDiscoveryRequest\(\)/g)?.length ?? 0

        expect(source).toContain('const invalidateActiveDiscoveryRequest = useCallback(() => {')
        expect(source).toContain("activeDiscoveryRequestKey.current = ''")
        expect(invalidationCallCount).toBeGreaterThanOrEqual(3)
    })

    it('guards profile context responses so older profile loads cannot overwrite a newer profile', () => {
        expect(source).toContain("const activeProfileContextKey = useRef('')")
        expect(source).toContain('activeProfileContextKey.current = profile')
        expect(source).toContain('responseRequestKey: profile')
    })
})
