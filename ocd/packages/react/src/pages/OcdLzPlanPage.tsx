/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Landing Zone Plan / Diff page.
**
** Container that compares the current design (base) against an imported
** Landing Zone (target) and renders a terraform-plan-style create/update/
** delete/no-op summary. The user picks the LZNG JSON output to compare with;
** the heavy lifting is the pure diffDesigns() engine + presentational panel.
*/

import React, { useState } from 'react'
import { ConsolePageProps } from '../types/Console'
import { buildDesignFromLzUpload } from '../landingzone/OcdLzFileImport'
import { diffDesigns, summarizePlan, PlanEntry, PlanSummary } from '../landingzone/plan/OcdLzPlan'
import { OcdLzPlanPanel } from '../landingzone/plan/OcdLzPlanPanel'

const OcdLzPlanPage = ({ ocdDocument }: ConsolePageProps): JSX.Element => {
    const [entries, setEntries] = useState<PlanEntry[] | null>(null)
    const [summary, setSummary] = useState<PlanSummary | null>(null)
    const [targetLabel, setTargetLabel] = useState('Imported Landing Zone')
    const [error, setError] = useState<string | null>(null)

    const pickFiles = async (): Promise<{ name: string; content: string }[]> => {
        const options = {
            multiple: true,
            types: [{ description: 'Landing Zone JSON (iam.json, network.json, …)', accept: { 'application/json': ['.json'] } }],
        }
        // @ts-expect-error - File System Access API (Chromium / Electron renderer); not in lib.dom yet
        const handles = await window.showOpenFilePicker(options)
        return Promise.all(
            handles.map(async (handle: { getFile: () => Promise<File> }) => {
                const file = await handle.getFile()
                return { name: file.name, content: await file.text() }
            }),
        )
    }

    const onLoadComparison = () => {
        setError(null)
        pickFiles()
            .then((uploads) => {
                const { design: targetDesign } = buildDesignFromLzUpload(uploads)
                const planEntries = diffDesigns(ocdDocument.design, targetDesign)
                setEntries(planEntries)
                setSummary(summarizePlan(planEntries))
                setTargetLabel(uploads.length === 1 ? uploads[0].name : `${uploads.length} LZ files`)
            })
            .catch((reason: unknown) => {
                if (reason instanceof DOMException && reason.name === 'AbortError') return // user dismissed picker
                setError(reason instanceof Error ? reason.message : String(reason))
            })
    }

    return (
        <div className='ocd-plan-view'>
            <div className='ocd-plan-toolbar'>
                <button className='ocd-plan-load-btn' onClick={onLoadComparison}>
                    Load Landing Zone files to compare…
                </button>
                <span className='ocd-plan-toolbar-hint'>
                    Compares the current design against a generated/imported Landing Zone (iam.json / network.json …).
                </span>
            </div>
            {error && <div className='ocd-plan-error'>{error}</div>}
            {entries === null && !error && (
                <div className='ocd-plan-empty'>
                    No comparison loaded yet. Use <strong>Load Landing Zone files to compare…</strong> to see what an
                    imported Landing Zone would create, update, or delete relative to the current design.
                </div>
            )}
            {entries !== null && (
                <OcdLzPlanPanel
                    entries={entries}
                    summary={summary ?? undefined}
                    baseLabel='Current design'
                    targetLabel={targetLabel}
                />
            )}
        </div>
    )
}

export default OcdLzPlanPage
