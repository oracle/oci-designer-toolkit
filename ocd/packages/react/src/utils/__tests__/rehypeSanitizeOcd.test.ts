/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { rehypeSanitizeOcd, __test__ } from '../rehypeSanitizeOcd'

const { isDangerousUrl } = __test__

// Minimal hast element factory.
const el = (tagName: string, properties: Record<string, unknown> = {}, children: any[] = []) => ({
    type: 'element', tagName, properties, children,
})

describe('rehypeSanitizeOcd', () => {
    it('flags javascript:, vbscript: and data:text/html — including control-char-obfuscated schemes', () => {
        expect(isDangerousUrl('javascript:alert(1)')).toBe(true)
        expect(isDangerousUrl('JAVASCRIPT:alert(1)')).toBe(true)
        expect(isDangerousUrl('java\tscript:alert(1)')).toBe(true)   // tab between scheme chars
        expect(isDangerousUrl('  javascript:alert(1)')).toBe(true)   // leading whitespace
        expect(isDangerousUrl('vbscript:msgbox(1)')).toBe(true)
        expect(isDangerousUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(true)
    })

    it('allows safe URLs and data:image URIs', () => {
        expect(isDangerousUrl('https://example.com')).toBe(false)
        expect(isDangerousUrl('/local/path')).toBe(false)
        expect(isDangerousUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(false)
    })

    it('strips on* event handlers but keeps benign attributes', () => {
        const tree = { type: 'root', children: [el('img', { src: 'x', onError: 'steal()', onClick: 'x()', alt: 'ok' })] }
        rehypeSanitizeOcd()(tree as any)
        const img = (tree.children[0] as any).properties
        expect(img.onError).toBeUndefined()
        expect(img.onClick).toBeUndefined()
        expect(img.src).toBe('x')
        expect(img.alt).toBe('ok')
    })

    it('drops dangerous-scheme href/src attributes but keeps the element', () => {
        const tree = { type: 'root', children: [el('a', { href: 'javascript:alert(1)' }, [{ type: 'text', value: 'click' }])] }
        rehypeSanitizeOcd()(tree as any)
        const a = tree.children[0] as any
        expect(a.tagName).toBe('a')              // element preserved
        expect(a.properties.href).toBeUndefined() // dangerous href removed
    })

    it('removes forbidden elements (script/style/iframe) entirely', () => {
        const tree = { type: 'root', children: [
            el('script', {}, [{ type: 'text', value: 'evil()' }]),
            el('pre', {}, [{ type: 'text', value: 'keep' }]),
            el('iframe', { src: 'https://evil' }),
        ] }
        rehypeSanitizeOcd()(tree as any)
        const tags = tree.children.map((c: any) => c.tagName)
        expect(tags).toEqual(['pre'])            // script + iframe dropped, pre kept
    })

    it('recurses into nested children', () => {
        const tree = { type: 'root', children: [
            el('div', {}, [el('span', { onmouseover: 'x()' }, [el('script', {})])]),
        ] }
        rehypeSanitizeOcd()(tree as any)
        const span = (tree.children[0] as any).children[0]
        expect(span.properties.onmouseover).toBeUndefined()
        expect(span.children.length).toBe(0)     // nested script removed
    })

    it('preserves formatting elements the exporter emits (pre, br)', () => {
        const tree = { type: 'root', children: [el('pre', {}, [el('br', {})])] }
        rehypeSanitizeOcd()(tree as any)
        expect((tree.children[0] as any).tagName).toBe('pre')
        expect((tree.children[0] as any).children[0].tagName).toBe('br')
    })
})
