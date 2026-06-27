/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Step 5 — Review. Runs the Operating Entities jsonnet generation for the full
** wizard config and renders:
**
**   - the IAM compartment diagram from the generated iam.json (React-Flow), the
**     One-OE structure tenancy -> LZ -> envs -> cmp-lz-<env>-{network,platform,
**     projects,security} + Shared
**   - a list of every generated JSON file with an individual Download button plus
**     a Download all (tar)
**   - the serialized config.jsonnet read-only
**
** If the OE sources are not installed, the parent surfaces the friendly
** "run npm run setup-lz" notice; this component reports the failure upward via
** onError so the parent owns that messaging.
*/

import React, { useEffect, useState } from 'react'
import { LandingZoneConfig, serializeLandingZoneConfig } from '../OcdLzConfig'
import { GeneratedFile, GeneratedResult, generateLandingZone } from '../OcdLzGenerator'
import { findGeneratedFile } from '../OcdLzCompartmentDiagram'
import { downloadTar, downloadTextFile } from '../OcdLzDownloads'
import { LzngIamDiagram } from './LzngIamDiagram'

export interface LzngReviewStepProps {
    config: LandingZoneConfig
    title: string
    onError: (message: string) => void
    /**
     * Opens the generated Landing Zone on the OCD drag-drop canvas. Receives the
     * already-generated OE files so the bridge does not have to regenerate.
     */
    onOpenInDesigner?: (files: GeneratedFile[]) => void
}

function formatBytes(size: number): string {
    if (size < 1024) return `${size} B`
    return `${(size / 1024).toFixed(1)} KB`
}

export function LzngReviewStep({ config, title, onError, onOpenInDesigner }: LzngReviewStepProps): JSX.Element {
    const [result, setResult] = useState<GeneratedResult | null>(null)
    const [busy, setBusy] = useState(false)

    let configJsonnet = ''
    let configError = ''
    try {
        configJsonnet = serializeLandingZoneConfig(config)
    } catch (err: unknown) {
        configError = err instanceof Error ? err.message : String(err)
    }

    useEffect(() => {
        let cancelled = false
        if (configError) {
            setResult(null)
            return
        }
        setBusy(true)
        generateLandingZone(config)
            .then((generated) => {
                if (!cancelled) setResult(generated)
            })
            .catch((err: unknown) => {
                if (cancelled) return
                setResult(null)
                onError(err instanceof Error ? err.message : String(err))
            })
            .finally(() => {
                if (!cancelled) setBusy(false)
            })
        return () => {
            cancelled = true
        }
        // configJsonnet captures all config inputs that affect generation.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [configJsonnet])

    const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'landing-zone'
    const iamJson = result ? findGeneratedFile(result.files, 'iam.json') : null

    function downloadAll(): void {
        if (!result) return
        downloadTar(`${slug}-landing-zone.tar`, [
            { name: 'config.jsonnet', content: result.configJsonnet },
            ...result.files,
        ])
    }

    function downloadOne(file: GeneratedFile): void {
        downloadTextFile(file.name, file.content)
    }

    if (configError) {
        return (
            <section className='ocd-lzng-card'>
                <div className='ocd-lzng-card-head'>
                    <h2 className='ocd-lzng-card-title'>Review</h2>
                </div>
                <div className='ocd-lzng-card-body'>
                    <p className='ocd-lzng-field-error'>{configError}</p>
                </div>
            </section>
        )
    }

    return (
        <>
            <section className='ocd-lzng-card ocd-lzng-iam-card'>
                <div className='ocd-lzng-card-head'>
                    <h2 className='ocd-lzng-card-title'>IAM Compartments</h2>
                </div>
                <div className='ocd-lzng-card-body'>
                    {busy && <p className='ocd-lzng-placeholder'>Generating Operating Entities…</p>}
                    {!busy && iamJson && (
                        <div className='ocd-lzng-iam-canvas'>
                            <LzngIamDiagram iamJson={iamJson} />
                        </div>
                    )}
                    {!busy && !iamJson && !configError && (
                        <p className='ocd-lzng-placeholder'>No iam.json was generated.</p>
                    )}
                </div>
            </section>

            <section className='ocd-lzng-card'>
                <div className='ocd-lzng-card-head'>
                    <h2 className='ocd-lzng-card-title'>Generated Files</h2>
                    <div className='ocd-lzng-review-actions'>
                        {onOpenInDesigner && (
                            <button
                                type='button'
                                className='ocd-lzng-btn ocd-lzng-btn-open-designer'
                                disabled={!result || result.files.length === 0}
                                onClick={() => result && onOpenInDesigner(result.files)}
                                title='Open the generated Landing Zone on the drag-drop canvas'
                            >
                                Open in Designer
                            </button>
                        )}
                        <button
                            type='button'
                            className='ocd-lzng-btn ocd-lzng-btn-primary'
                            disabled={!result || result.files.length === 0}
                            onClick={downloadAll}
                        >
                            Download all (tar)
                        </button>
                    </div>
                </div>
                <div className='ocd-lzng-card-body'>
                    {!result && !busy && <p className='ocd-lzng-placeholder'>Nothing generated yet.</p>}
                    {result && (
                        <ul className='ocd-lzng-file-list'>
                            {result.files.map((file) => (
                                <li className='ocd-lzng-file-row' key={file.name}>
                                    <span className='ocd-lzng-file-name'>{file.name}</span>
                                    <span className='ocd-lzng-file-size'>{formatBytes(file.size)}</span>
                                    <button
                                        type='button'
                                        className='ocd-lzng-btn'
                                        onClick={() => downloadOne(file)}
                                    >
                                        Download
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section className='ocd-lzng-card'>
                <div className='ocd-lzng-card-head'>
                    <h2 className='ocd-lzng-card-title'>config.jsonnet</h2>
                </div>
                <div className='ocd-lzng-card-body'>
                    <pre className='ocd-lzng-pre' data-testid='lzng-config-jsonnet'>{configJsonnet}</pre>
                </div>
            </section>
        </>
    )
}
