/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdDesign } from "@ocd/model"
import { OcdTerraformImporter } from "@ocd/import"
import { OcdDesignerBrowserActions } from "../actions/OcdDesignBrowserActions"
import { adoptDesignIntoLandingZone } from "../landingzone/OcdLzFromDesign"

/*
** Facade exists so we can switch between Electron based and Web based which will require a web server
*/

/*
** Browser file picker + reader. Lets web-build features (e.g. Terraform import)
** work without Electron: the parser is dependency-free, only the native file
** dialog / fs read is Electron-specific.
*/
const pickAndReadTextFiles = (accept: string, multiple = true): Promise<{ canceled: boolean; filename: string; text: string }> =>
    new Promise((resolve, reject) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = accept
        input.multiple = multiple
        input.style.display = 'none'
        input.addEventListener('change', () => {
            const files = Array.from(input.files || [])
            if (files.length === 0) {
                resolve({ canceled: true, filename: '', text: '' })
            } else {
                // Concatenating multiple HCL .tf files is valid (Terraform treats all
                // .tf in a directory as one config). A read failure is surfaced as a
                // rejection — never silently swallowed as a "cancel".
                Promise.all(files.map((f) => f.text()))
                    .then((texts) => resolve({ canceled: false, filename: files[0].name, text: texts.join('\n') }))
                    .catch((err) => reject(err instanceof Error ? err : new Error('Failed to read selected file(s)')))
            }
            input.remove()
        })
        input.addEventListener('cancel', () => { resolve({ canceled: true, filename: '', text: '' }); input.remove() })
        document.body.appendChild(input)
        input.click()
    })

const LIBRARY_BASE_URL = '/library'
const SAFE_LIBRARY_SEGMENT = /^[A-Za-z0-9_.-]+$/

interface BrowserLibraryDesign {
    title: string
    description: string
    okitFile: string
    svgFile: string
    dataUri?: string
}

type BrowserLibraryIndex = Record<string, BrowserLibraryDesign[]>

const assertSafeLibrarySegment = (segment: string, label: string): string => {
    if (!SAFE_LIBRARY_SEGMENT.test(segment)) throw new Error(`Invalid library ${label}: ${segment}`)
    return segment
}

const libraryAssetUrl = (...segments: string[]): string => {
    const path = ['library', ...segments].join('/')
    if (typeof document === 'undefined' || !document.baseURI) return `${LIBRARY_BASE_URL}/${segments.join('/')}`
    return new URL(path, document.baseURI).toString()
}

const fetchJson = async <T>(url: string): Promise<T> => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Library fetch failed (${response.status})`)
    const contentType = response.headers.get('content-type') ?? ''
    if (
        contentType
        && !contentType.includes('application/json')
        && !contentType.includes('application/octet-stream')
        && !contentType.includes('text/plain')
    ) {
        throw new Error(`Library fetch returned unexpected content-type: ${contentType}`)
    }
    return (await response.json()) as T
}

const fetchText = async (url: string): Promise<string> => {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Library asset fetch failed (${response.status})`)
    return response.text()
}

const loadBrowserLibraryIndex = async (): Promise<BrowserLibraryIndex> => {
    const libraryIndex = await fetchJson<BrowserLibraryIndex>(libraryAssetUrl('referenceArchitectures.json'))
    const hydrated = await Promise.all(Object.entries(libraryIndex).map(async ([section, designs]) => {
        assertSafeLibrarySegment(section, 'section')
        const nextDesigns = await Promise.all(designs.map(async (design) => {
            assertSafeLibrarySegment(design.svgFile, 'svgFile')
            const svg = await fetchText(libraryAssetUrl(section, design.svgFile))
            return {
                ...design,
                dataUri: `data:image/svg+xml,${encodeURIComponent(svg)}`,
            }
        }))
        return [section, nextDesigns] as const
    }))
    return Object.fromEntries(hydrated)
}

const loadBrowserLibraryDesign = async (section: string, filename: string): Promise<{ canceled: boolean; filename: string; design: OcdDesign }> => {
    const safeSection = assertSafeLibrarySegment(section, 'section')
    const safeFilename = assertSafeLibrarySegment(filename, 'filename')
    const design = await fetchJson<OcdDesign>(libraryAssetUrl(safeSection, safeFilename))
    return { canceled: false, filename: safeFilename, design }
}

export namespace OcdDesignFacade {
    export const loadDesign = (filename: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadDesign(filename) : OcdDesignerBrowserActions.loadDesign(filename)
    }
    export const saveDesign = (design: OcdDesign, filename: string, suggestedFilename: string = ''): Promise<any> => {
        console.debug('OcdDesignFacade: saveDesign', filename, JSON.stringify(design, null, 2))
        return window.ocdAPI ? window.ocdAPI.saveDesign(JSON.stringify(design, null, 2), filename, suggestedFilename) : OcdDesignerBrowserActions.saveDesign(design, filename)
    }
    export const discardConfirmation = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.discardConfirmation() : OcdDesignerBrowserActions.discardConfirmation()
    }
    export const loadLibraryIndex = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadLibraryIndex() : loadBrowserLibraryIndex()
    }
    export const loadLibraryDesign = (section: string, filename: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadLibraryDesign(section, filename) : loadBrowserLibraryDesign(section, filename)
    }
    export const loadSvgCssFiles = (): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.loadSvgCssFiles() : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const exportTerraform = (design: OcdDesign, directory: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportTerraform(design, directory) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const exportToExcel = (design: OcdDesign, suggestedFilename: string = ''): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportToExcel(design, suggestedFilename) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const exportToMarkdown = (design: OcdDesign, css: string[], suggestedFilename: string = ''): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportToMarkdown(design, css, suggestedFilename) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const exportToSvg = (design: OcdDesign, css: string[], directory: string, suggestedFilename: string = ''): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportToSvg(design, css, directory, suggestedFilename) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const exportToTerraform = (design: OcdDesign, directory: string): Promise<any> => {
        return window.ocdAPI ? window.ocdAPI.exportToTerraform(design, directory) : Promise.reject(new Error('Currently Not Implemented'))
    }
    export const importFromTerraform = (): Promise<any> => {
        // Brownfield adoption: turn the imported design into an editable Landing
        // Zone wizard config (derives hub/spokes from the VCN topology) so existing
        // Terraform can be round-tripped through the LZNG wizard, not just viewed.
        const adopt = (result: any): any =>
            result && result.design && !result.canceled
                ? { ...result, design: adoptDesignIntoLandingZone(result.design) }
                : result
        if (window.ocdAPI) return window.ocdAPI.importFromTerraform().then(adopt)
        // Web path: pick .tf/.tf.json files in the browser and parse them with the
        // dependency-free importer (same one the Electron main process uses).
        return pickAndReadTextFiles('.tf').then(({ canceled, filename, text }) => {
            if (canceled || !text.trim()) return { canceled: true, filename: '', design: undefined }
            const importer = new OcdTerraformImporter()
            return adopt({ canceled: false, filename, design: importer.import(text) })
        })
    }
}
