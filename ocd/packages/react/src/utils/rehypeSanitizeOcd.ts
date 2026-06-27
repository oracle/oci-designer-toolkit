/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * rehypeSanitizeOcd — a zero-dependency rehype plugin that scrubs dangerous
 * HTML from the hast tree produced by `rehype-raw`. It exists because OCD
 * renders design-derived markdown (resource documentation + property values
 * embedded verbatim by the exporter) in the Electron renderer, where a crafted
 * `.okit` file could otherwise smuggle `<img src=x onerror=...>` or
 * `<script>` into a live `window.ocdAPI` IPC context (stored XSS).
 *
 * The markdown exporter legitimately emits raw `<pre>` and `<br>`, so we cannot
 * drop `rehype-raw`; instead we walk the tree and strip only the dangerous bits
 * while preserving formatting elements (pre, br, img, svg, table, ...).
 */

// Minimal structural typing for hast nodes — avoids a dependency on @types/hast.
interface HastNode {
    type: string
    tagName?: string
    properties?: Record<string, unknown>
    children?: HastNode[]
}

// Elements that can execute script, load remote content, or alter document
// behaviour. They are removed entirely (subtree dropped).
const FORBIDDEN_TAGS = new Set<string>([
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'link',
    'meta',
    'base',
    'form',
])

// Attributes whose values are treated as URLs; dangerous schemes are dropped.
const URL_PROPERTIES = new Set<string>([
    'href',
    'src',
    'xlinkHref', // hast camel-cases `xlink:href`
    'xlink:href',
    'action',
    'poster',
])

const DANGEROUS_URL_PREFIXES = ['javascript:', 'vbscript:', 'data:text/html']

const isDangerousUrl = (value: string): boolean => {
    // Browsers ignore ALL C0 control chars and spaces (tab, newline, NUL, ...)
    // when resolving a URL scheme, so `java\tscript:` is still executable. Strip
    // the full \x00-\x20 range — not just spaces — before matching the scheme.
    const normalized = value.replace(/[\x00-\x20]+/g, "").toLowerCase()
    return DANGEROUS_URL_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

const sanitizeProperties = (properties: Record<string, unknown>): Record<string, unknown> => {
    const cleaned: Record<string, unknown> = {}
    for (const [name, value] of Object.entries(properties)) {
        // Drop any event handler attribute (onerror, onClick, onload, ...).
        if (name.toLowerCase().startsWith('on')) continue
        // Drop dangerous URL schemes on URL-bearing attributes.
        if (URL_PROPERTIES.has(name) && typeof value === 'string' && isDangerousUrl(value)) continue
        cleaned[name] = value
    }
    return cleaned
}

const sanitizeChildren = (children: HastNode[]): HastNode[] => {
    const result: HastNode[] = []
    for (const child of children) {
        const sanitized = sanitizeNode(child)
        if (sanitized) result.push(sanitized)
    }
    return result
}

const sanitizeNode = (node: HastNode): HastNode | null => {
    if (node.type === 'element' && node.tagName && FORBIDDEN_TAGS.has(node.tagName.toLowerCase())) {
        return null
    }
    if (node.properties) {
        node.properties = sanitizeProperties(node.properties)
    }
    if (Array.isArray(node.children)) {
        node.children = sanitizeChildren(node.children)
    }
    return node
}

/**
 * Rehype plugin factory. Usage: `rehypePlugins={[rehypeRaw, rehypeSanitizeOcd, remarkGfm]}`
 * — it must run AFTER rehype-raw so the raw HTML has been parsed into hast nodes.
 */
export const rehypeSanitizeOcd = () => (tree: HastNode): void => {
    if (Array.isArray(tree.children)) {
        tree.children = sanitizeChildren(tree.children)
    }
}

export default rehypeSanitizeOcd

// Exported for unit testing of the leaf policy without a full tree walk.
export const __test__ = { isDangerousUrl, sanitizeProperties, FORBIDDEN_TAGS }
