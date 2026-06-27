/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Software & Ansible Provisioning page (blueprint phase 1/5 UI). Search the
** software catalogue, select packages, see prerequisites cross-checked against
** the current design, and preview/download the generated Ansible bundle. All
** logic lives in ../software/*; this component is presentational state + layout.
*/

import React, { useMemo, useState } from 'react'
import { ConsolePageProps } from '../types/Console'
import { OcdDocument } from '../components/OcdDocument'
import { buildSoftwareCatalog, searchSoftwareCatalog } from '../software/OcdSoftwareCatalog'
import { PrereqSeverity, validateSoftwarePrerequisites } from '../software/OcdSoftwarePrereqs'
import { buildAnsibleBundle } from '../software/OcdAnsibleBundle'
import { getAnsibleSelection, writeAnsibleSelection } from '../software/OcdAnsibleSelection'
import { DownloadFile, downloadTar, downloadTextFile } from '../landingzone/OcdLzDownloads'

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean =>
    a.size === b.size && [...a].every((id) => b.has(id))

const SEVERITY_META: Record<PrereqSeverity, { label: string; color: string }> = {
    blocker: { label: 'Blocker', color: '#c0392b' },
    warning: { label: 'Warning', color: '#b9770e' },
    manual: { label: 'Manual', color: '#2471a3' },
    ok: { label: 'OK', color: '#1e8449' },
}
const SEVERITY_ORDER: PrereqSeverity[] = ['blocker', 'warning', 'manual', 'ok']

const OcdSoftware = ({ ocdDocument, setOcdDocument }: ConsolePageProps): JSX.Element => {
    const design = ocdDocument.design
    // Add-on packages would be merged in here once their manifests are loaded;
    // seed-only catalogue for now (buildSoftwareCatalog([]) ).
    const catalog = useMemo(() => buildSoftwareCatalog(), [])
    const [query, setQuery] = useState('')
    // Seed the selection from what was persisted on the design (survives reload).
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set(getAnsibleSelection(design)))
    const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(() => new Set(getAnsibleSelection(design)))
    const [activeFile, setActiveFile] = useState('playbook.yml')

    const dirty = !sameSet(selectedIds, savedIds)
    const onSaveSelection = () => {
        writeAnsibleSelection(design, [...selectedIds])
        setOcdDocument(OcdDocument.clone(ocdDocument))
        setSavedIds(new Set(selectedIds))
    }

    const results = useMemo(() => searchSoftwareCatalog(query, catalog), [query, catalog])
    const selected = useMemo(() => catalog.filter((p) => selectedIds.has(p.id)), [catalog, selectedIds])
    const report = useMemo(() => validateSoftwarePrerequisites(design, selected), [design, selected])
    const bundle = useMemo(() => buildAnsibleBundle(design, selected), [design, selected])

    const toggle = (id: string) =>
        setSelectedIds((prev) => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })

    const onDownloadBundle = () => {
        const files: DownloadFile[] = Object.entries(bundle.files).map(([name, content]) => ({ name, content }))
        downloadTar('ansible-bundle.tar', files)
    }

    const counts = SEVERITY_ORDER.map((sev) => ({ sev, n: report.findings.filter((f) => f.severity === sev).length }))

    return (
        <div className='ocd-software-view' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', padding: '1.25rem', height: '100%', overflow: 'auto' }}>
            <section aria-labelledby='software-catalogue-heading' style={{ minWidth: 0 }}>
                <h2 id='software-catalogue-heading' style={{ margin: '0 0 .5rem' }}>Software Catalogue</h2>
                <p style={{ margin: '0 0 .75rem', opacity: .75 }}>Select software to provision with Ansible after Terraform apply.</p>
                <input
                    type='search'
                    value={query}
                    placeholder='Search by name, vendor, category, or tag…'
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label='Search software catalogue'
                    style={{ width: '100%', padding: '.5rem .625rem', marginBottom: '.75rem', boxSizing: 'border-box' }}
                />
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {results.map((pkg) => {
                        const checked = selectedIds.has(pkg.id)
                        return (
                            <li key={pkg.id}>
                                <label style={{ display: 'flex', gap: '.625rem', alignItems: 'flex-start', cursor: 'pointer', padding: '.625rem .75rem', border: `1px solid ${checked ? '#2471a3' : 'rgba(128,128,128,.35)'}`, borderRadius: 6, background: checked ? 'rgba(36,113,163,.08)' : 'transparent' }}>
                                    <input type='checkbox' checked={checked} onChange={() => toggle(pkg.id)} style={{ marginTop: '.2rem' }} />
                                    <span style={{ minWidth: 0 }}>
                                        <span style={{ fontWeight: 600 }}>{pkg.name}</span>
                                        <span style={{ opacity: .6, marginLeft: '.4rem', fontSize: '.8em' }}>{pkg.vendor}</span>
                                        {pkg.addonSource && <span style={{ marginLeft: '.4rem', fontSize: '.7em', padding: '0 .35rem', borderRadius: 999, background: 'rgba(36,113,163,.15)' }}>add-on</span>}
                                        <span style={{ display: 'block', opacity: .75, fontSize: '.85em' }}>{pkg.description}</span>
                                        <span style={{ display: 'block', opacity: .55, fontSize: '.72em', marginTop: '.2rem' }}>{pkg.category} · {pkg.tags.join(', ')}</span>
                                    </span>
                                </label>
                            </li>
                        )
                    })}
                    {results.length === 0 && <li style={{ opacity: .6 }}>No packages match “{query}”.</li>}
                </ul>
            </section>

            <section aria-labelledby='software-plan-heading' style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', margin: '0 0 .5rem' }}>
                    <h2 id='software-plan-heading' style={{ margin: 0 }}>Provisioning Plan</h2>
                    {dirty && <span title='Unsaved selection' style={{ color: '#b9770e', fontSize: '.8rem' }}>● unsaved</span>}
                    <button type='button' onClick={onSaveSelection} disabled={!dirty} style={{ marginLeft: 'auto', padding: '.35rem .7rem', cursor: dirty ? 'pointer' : 'default' }}>
                        Save to design
                    </button>
                </div>
                <p style={{ margin: '0 0 .75rem' }}>
                    <strong>{selected.length}</strong> selected ·{' '}
                    {counts.filter((c) => c.n > 0).map((c) => (
                        <span key={c.sev} style={{ color: SEVERITY_META[c.sev].color, marginRight: '.6rem' }}>{c.n} {SEVERITY_META[c.sev].label.toLowerCase()}</span>
                    ))}
                    {selected.length === 0 && <span style={{ opacity: .6 }}>nothing selected yet</span>}
                </p>

                {selected.length > 0 && (
                    <>
                        <h3 style={{ margin: '.5rem 0 .35rem', fontSize: '.95rem' }}>Prerequisites {report.installable ? '' : '— blocked'}</h3>
                        <ul style={{ listStyle: 'none', margin: '0 0 1rem', padding: 0, display: 'flex', flexDirection: 'column', gap: '.3rem', maxHeight: '11rem', overflow: 'auto' }}>
                            {report.findings.map((f, i) => (
                                <li key={i} style={{ fontSize: '.82rem', display: 'flex', gap: '.5rem' }}>
                                    <span style={{ color: SEVERITY_META[f.severity].color, fontWeight: 600, minWidth: '4.5rem' }}>{SEVERITY_META[f.severity].label}</span>
                                    <span>{f.message}</span>
                                </li>
                            ))}
                        </ul>

                        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.5rem', flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: '.95rem' }}>Ansible bundle</h3>
                            <button type='button' onClick={onDownloadBundle} style={{ marginLeft: 'auto', padding: '.4rem .75rem', cursor: 'pointer' }}>Download .tar</button>
                            <button type='button' onClick={() => downloadTextFile(activeFile, bundle.files[activeFile])} style={{ padding: '.4rem .75rem', cursor: 'pointer' }}>Download {activeFile}</button>
                        </div>
                        <div role='tablist' aria-label='Bundle files' style={{ display: 'flex', gap: '.25rem', marginBottom: '.4rem', flexWrap: 'wrap' }}>
                            {Object.keys(bundle.files).map((name) => (
                                <button key={name} role='tab' aria-selected={activeFile === name} onClick={() => setActiveFile(name)}
                                    style={{ padding: '.25rem .6rem', cursor: 'pointer', borderBottom: activeFile === name ? '2px solid #2471a3' : '2px solid transparent', fontWeight: activeFile === name ? 600 : 400 }}>
                                    {name}
                                </button>
                            ))}
                        </div>
                        <pre style={{ margin: 0, padding: '.75rem', background: 'rgba(128,128,128,.08)', borderRadius: 6, overflow: 'auto', maxHeight: '18rem', fontSize: '.78rem' }}>{bundle.files[activeFile]}</pre>
                    </>
                )}
            </section>
        </div>
    )
}

export default OcdSoftware
