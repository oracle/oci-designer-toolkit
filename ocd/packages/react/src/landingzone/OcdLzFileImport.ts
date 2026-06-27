/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * Import pre-generated OCI Landing Zone Next Gen (LZNG) output files
 * (iam.json, network.json, …) and rebuild them into an editable OCD design.
 *
 * This is the UPLOAD counterpart to the wizard's "Open in Designer" handoff:
 * both funnel through {@link buildOcdDesignFromLz}. Here the files come from a
 * user file-picker rather than the in-browser jsonnet-WASM generator, so there
 * is no wizard `LandingZoneConfig` — the scaffold / observability / OKE overlays
 * are therefore not applied. The resulting design is still flagged
 * `lzOrigin = true`, so dropping further (non-LZ) stencils onto it routes them
 * through the LZ placement resolver exactly like a wizard-generated design.
 *
 * The functions here are intentionally pure (no DOM, no file-picker) so they can
 * be unit-tested; the file-picker wiring lives in the Designer menu.
 */

import { GeneratedFile } from './OcdLzGenerator'
import { buildOcdDesignFromLz, OcdLzToModelResult } from './OcdLzToModel'
import { adoptDesignIntoLandingZone } from './OcdLzFromDesign'

/** A raw uploaded file: a name (possibly a full path) and its text content. */
export interface LzUploadFile {
    name: string
    content: string
}

/**
 * Per-file size cap for untrusted uploads. Real LZNG output files (iam.json,
 * network.json, …) are a few KB to low hundreds of KB; this bounds worst-case
 * parse time/memory and stops a hostile or accidental multi-megabyte upload from
 * stalling the UI. Enforced at the ingestion boundary ({@link toGeneratedFiles}).
 */
export const MAX_LZ_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Typed error for ingestion-boundary validation failures (size cap exceeded or
 * malformed JSON). Lets the caller surface an actionable, user-safe message
 * instead of leaking a raw `SyntaxError` stack from `JSON.parse`.
 */
export class LzImportError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'LzImportError'
    }
}

/**
 * Parse untrusted `.json` upload content, converting any parser failure into a
 * typed, user-safe {@link LzImportError}. The file name (already reduced to its
 * base name by the caller) is named in the message; the file *contents* are never
 * logged or echoed, so malformed/hostile payloads cannot leak into UI or logs.
 */
export function parseLzJson<T = unknown>(content: string, fileName: string): T {
    try {
        return JSON.parse(content) as T
    } catch {
        throw new LzImportError(`Invalid JSON in ${fileName}`)
    }
}

/**
 * Reject an upload whose content exceeds {@link MAX_LZ_UPLOAD_BYTES}. Throws a
 * typed error naming the file and the limit so nothing is partially imported.
 */
function assertWithinSizeCap(file: LzUploadFile): void {
    const length = file.content.length
    if (length > MAX_LZ_UPLOAD_BYTES) {
        throw new LzImportError(
            `Upload "${lzFileBaseName(file.name)}" is ${length} bytes, ` +
                `exceeding the ${MAX_LZ_UPLOAD_BYTES}-byte (5 MB) limit.`,
        )
    }
}

/**
 * OE/LZNG output file names the bridge can currently turn into model resources.
 * (Other generated files such as governance.json are accepted in the upload but
 * are not yet mapped — they are ignored, not rejected.)
 */
export const RECOGNISED_LZ_FILES = ['iam.json', 'network.json'] as const

/** Strip any directory prefix from an uploaded file path (handles / and \). */
export function lzFileBaseName(path: string): string {
    const parts = path.split(/[\\/]/)
    return parts[parts.length - 1] || path
}

/**
 * Convert raw uploaded files into the `GeneratedFile[]` shape the LZ→model
 * bridge expects. Non-JSON uploads are dropped; names are reduced to their
 * base name so `foo/bar/iam.json` matches the bridge's `iam.json` lookup.
 *
 * This is the untrusted-input ingestion boundary: every upload is size-capped
 * ({@link MAX_LZ_UPLOAD_BYTES}) and every retained `.json` file is parse-validated
 * up front via {@link parseLzJson}. A malformed file therefore fails here with a
 * typed, actionable error rather than being silently swallowed downstream (the
 * model bridge's parser returns `null` on bad JSON, so the resource would just
 * vanish from the import with no signal to the user).
 *
 * @throws {LzImportError} when an upload exceeds the size cap or a `.json` file
 *         cannot be parsed. Nothing is partially imported.
 */
export function toGeneratedFiles(uploads: ReadonlyArray<LzUploadFile>): GeneratedFile[] {
    uploads.forEach(assertWithinSizeCap)
    const jsonFiles = uploads
        .map((u) => ({ name: lzFileBaseName(u.name), content: u.content }))
        .filter((u) => u.name.toLowerCase().endsWith('.json'))
    jsonFiles.forEach((u) => parseLzJson(u.content, u.name))
    return jsonFiles.map((u) => ({ name: u.name, content: u.content, size: u.content.length }))
}

/** True if the uploaded set contains at least one file the bridge can map. */
export function hasRecognisedLzFiles(files: ReadonlyArray<GeneratedFile>): boolean {
    const recognised = RECOGNISED_LZ_FILES as readonly string[]
    return files.some((f) => recognised.includes(f.name.toLowerCase()))
}

/**
 * Build an OCD design from uploaded LZNG files.
 *
 * @throws Error when no recognised Landing Zone file (iam.json / network.json)
 *         is present, so the caller can surface an actionable message.
 */
export function buildDesignFromLzUpload(
    uploads: ReadonlyArray<LzUploadFile>,
    title = 'Imported Landing Zone',
): OcdLzToModelResult {
    const files = toGeneratedFiles(uploads)
    if (!hasRecognisedLzFiles(files)) {
        throw new Error(
            'No recognised Landing Zone files found. Select the generated LZ output (at least iam.json or network.json).',
        )
    }
    const result = buildOcdDesignFromLz(files, title)
    // Generated LZ JSON is LZ-origin but carries no wizard config, so derive one
    // from its topology — that makes the imported design editable in the wizard
    // and eligible for scaffold reconcile, the same as a wizard-authored design.
    return { ...result, design: adoptDesignIntoLandingZone(result.design) }
}
