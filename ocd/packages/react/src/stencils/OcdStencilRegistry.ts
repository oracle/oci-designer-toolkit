/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Runtime custom-stencil registry. Pure, side-effect-free transforms plus a small
** set of DOM-touching helpers (guarded with `typeof document` so the pure parts
** are unit-testable under the `node` vitest environment).
**
** A user imports a JSON manifest (single object OR array). Each manifest becomes:
**   - a palette provider block      (manifestToPaletteProvider)
**   - a model instance on drop      (newCustomResourceInstance)
**   - a runtime CSS icon rule       (injectStencilCss / hydrateStencilCss)
** Nothing here is wired into any Terraform/exporter path — custom stencils are
** generic, provider-agnostic shapes.
*/

import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { CustomResource, OcdDesign } from '@ocd/model'

// ---------------------------------------------------------------------------
// Schema (zod)
// ---------------------------------------------------------------------------

// Class must start with `custom-` and contain only CSS-class-safe characters.
// The class is interpolated into a CSS selector at icon-injection time, so the
// character allow-list also guards against CSS-selector injection.
const CUSTOM_CLASS_RE = /^custom-[a-zA-Z0-9-]+$/

const propertyTypeSchema = z.enum(['string', 'number', 'boolean'])

const propertySchema = z.object({
    key: z.string().min(1, 'property.key is required'),
    label: z.string().min(1, 'property.label is required'),
    type: propertyTypeSchema,
    default: z.union([z.string(), z.number(), z.boolean()]).optional(),
})

const manifestSchema = z.object({
    provider: z.literal('custom'),
    class: z.string().regex(CUSTOM_CLASS_RE, "stencil 'class' must start with 'custom-' and use only letters, digits and hyphens"),
    title: z.string().min(1, "stencil 'title' is required"),
    container: z.boolean().optional().default(false),
    svgIcon: z.string().min(1, "stencil 'svgIcon' (data-URI or raw <svg>) is required"),
    properties: z.array(propertySchema).optional().default([]),
})

export type CustomStencilPropertyType = z.infer<typeof propertyTypeSchema>
export type CustomStencilProperty = z.infer<typeof propertySchema>
export type CustomStencilManifest = z.infer<typeof manifestSchema>

export interface CustomPaletteResource {
    title: string
    class: string
    container: boolean
    provider?: string
}

export interface CustomPaletteProvider {
    title: string
    provider: 'custom'
    class: string
    groups: { title: string; class: string; resources: CustomPaletteResource[] }[]
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate a parsed JSON value (single manifest object OR an array of them) into
 * a list of CustomStencilManifest. Throws an Error with a clear, aggregated
 * message on any invalid entry.
 */
export function validateStencilManifest(json: unknown): CustomStencilManifest[] {
    const candidates = Array.isArray(json) ? json : [json]
    if (candidates.length === 0) throw new Error('Stencil manifest file contained no stencils.')
    const result = z.array(manifestSchema).safeParse(candidates)
    if (!result.success) {
        const messages = result.error.issues.map((issue) => {
            const path = issue.path.join('.')
            return path ? `${path}: ${issue.message}` : issue.message
        })
        throw new Error(`Invalid stencil manifest: ${messages.join('; ')}`)
    }
    return result.data
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

/**
 * Build a single 'custom' palette provider block (the shape OcdProviderPalette
 * renders) from one or more manifests.
 */
export function manifestToPaletteProvider(manifests: CustomStencilManifest[]): CustomPaletteProvider {
    return {
        title: 'Custom',
        provider: 'custom',
        class: 'custom-provider',
        groups: [
            {
                title: 'Custom Stencils',
                class: 'custom-group',
                resources: manifests.map((m) => ({ title: m.title, class: m.class, container: m.container })),
            },
        ],
    }
}

// ---------------------------------------------------------------------------
// Model instance
// ---------------------------------------------------------------------------

const defaultForType = (type: CustomStencilPropertyType): string | number | boolean => {
    if (type === 'number') return 0
    if (type === 'boolean') return false
    return ''
}

/**
 * Mint a runtime model instance for a dropped custom stencil. Each manifest
 * property is stored as a TOP-LEVEL field (so OcdTextProperty bound to
 * resource[key] resolves directly) seeded with its declared default.
 */
export function newCustomResourceInstance(manifest: CustomStencilManifest, compartmentId: string): CustomResource {
    const propertyFields: Record<string, string | number | boolean> = {}
    manifest.properties.forEach((p) => {
        propertyFields[p.key] = p.default !== undefined ? p.default : defaultForType(p.type)
    })
    return {
        provider: 'custom',
        locked: false,
        editLocked: false,
        terraformResourceName: '',
        okitReference: `okit-${uuidv4()}`,
        resourceType: manifest.class,
        resourceTypeName: manifest.title,
        id: `okit.custom.${uuidv4()}`,
        class: manifest.class,
        displayName: manifest.title,
        compartmentId,
        parentId: '',
        documentation: '',
        ...propertyFields,
    }
}

// ---------------------------------------------------------------------------
// Icon CSS injection (DOM-guarded)
// ---------------------------------------------------------------------------

const utf8ToBase64 = (str: string): string => {
    if (typeof Buffer !== 'undefined') return Buffer.from(str, 'utf-8').toString('base64')
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    bytes.forEach((b) => (binary += String.fromCharCode(b)))
    // eslint-disable-next-line no-undef
    return btoa(binary)
}

/** Accept either a data-URI or a raw `<svg>...</svg>` string; return a data-URI. */
export function svgIconToDataUri(svgIcon: string): string {
    const trimmed = svgIcon.trim()
    if (trimmed.startsWith('data:')) return trimmed
    return `data:image/svg+xml;base64,${utf8ToBase64(trimmed)}`
}

/**
 * Create/replace a `<style id="custom-stencil-<class>">` element so the stencil's
 * icon renders on both the palette tile and the canvas. Idempotent and a no-op
 * outside a DOM (node/tests).
 */
export function injectStencilCss(manifest: CustomStencilManifest): void {
    if (typeof document === 'undefined') return
    const styleId = `custom-stencil-${manifest.class}`
    const dataUri = svgIconToDataUri(manifest.svgIcon)
    const css =
        `.${manifest.class} { background-image: url("${dataUri}"); background-repeat: no-repeat; background-position: center; background-size: contain; }\n` +
        `.${manifest.class}-background-colour { background-color: transparent; fill: transparent; }`
    let style = document.getElementById(styleId) as HTMLStyleElement | null
    if (!style) {
        style = document.createElement('style')
        style.id = styleId
        document.head.appendChild(style)
    }
    style.textContent = css
}

/**
 * Inject icon CSS for every stencil stored on a design's
 * userDefined.customStencils map. Idempotent; no-op outside a DOM.
 */
export function hydrateStencilCss(design: OcdDesign): void {
    if (typeof document === 'undefined') return
    const stencils = design?.userDefined?.customStencils as Record<string, unknown> | undefined
    if (!stencils) return
    Object.values(stencils).forEach((manifest) => {
        const m = manifest as Partial<CustomStencilManifest>
        if (m && typeof m.class === 'string' && typeof m.svgIcon === 'string') {
            try {
                injectStencilCss(m as CustomStencilManifest)
            } catch {
                // A single malformed stored manifest must never break hydration.
            }
        }
    })
}
