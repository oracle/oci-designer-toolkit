import { describe, expect, it } from 'vitest'
import {
    okitClassicCapabilities,
    okitClassicDesktopViews,
    okitClassicImportExportCapabilities,
    summarizeClassicParity
} from '../OcdClassicCapabilities'

describe('okitClassicCapabilities', () => {
    it('tracks the Classic 0.70 desktop views', () => {
        expect(okitClassicDesktopViews.map((view) => view.capability)).toEqual([
            'Freeform visual design canvas',
            'Documentation view',
            'Variables view',
            'Common Tags view',
            'Markdown view',
            'Tabular view',
            'Terraform view'
        ])
    })

    it('tracks import/export and query parity surfaces', () => {
        expect(okitClassicImportExportCapabilities.map((capability) => capability.id)).toEqual([
            'image-export',
            'markdown-export',
            'terraform-export',
            'resource-manager-export',
            'excel-export',
            'portable-json',
            'oci-query-import',
            'terraform-import'
        ])
    })

    it('summarizes parity status without dropping capabilities', () => {
        const summary = summarizeClassicParity()

        expect(okitClassicCapabilities).toHaveLength(15)
        expect(summary.available + summary.enhanced + summary.partial + summary.planned).toBe(15)
        expect(summary.enhanced).toBeGreaterThan(summary.partial)
    })
})
