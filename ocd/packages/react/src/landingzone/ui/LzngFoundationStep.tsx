/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Foundation (Step 1) form. Captures realm / region / region-short-name and the
** environment list with a per-environment security-zone toggle. Operates on the
** full LandingZoneConfig but only touches the foundation-level fields; spoke
** VCNs, projects and platforms (steps 3-4) are preserved across edits. New
** environments are seeded with a default spoke VCN and one project. All edits are
** immutable and bubble up via onChange so the parent can drive the live diagram.
*/

import React, { useState } from 'react'
import { LzngToggle } from './LzngToggle'
import {
    LandingZoneConfig,
    LzEnvironment,
    defaultSpokeVcn,
} from '../OcdLzConfig'
import {
    findRegion,
    getDefaultRegionForRealm,
    getRegionsForRealm,
    REALM_OPTIONS,
} from '../OcdLzRegions'

export interface LzngFoundationStepProps {
    config: LandingZoneConfig
    onChange: (next: LandingZoneConfig) => void
}

export function LzngFoundationStep({ config, onChange }: LzngFoundationStepProps): JSX.Element {
    const [newEnvName, setNewEnvName] = useState('')
    const [newEnvSecure, setNewEnvSecure] = useState(false)

    const regionOptions = getRegionsForRealm(config.realm)

    function updateRealm(realm: string): void {
        const defaultRegion = getDefaultRegionForRealm(realm)
        onChange({
            ...config,
            realm,
            region: defaultRegion?.id || '',
            regionShortName: defaultRegion?.shortName || '',
        })
    }

    function updateRegion(regionId: string): void {
        const region = findRegion(config.realm, regionId)
        onChange({ ...config, region: regionId, regionShortName: region?.shortName || config.regionShortName })
    }

    function updateEnvironment(index: number, patch: Partial<LzEnvironment>): void {
        const environments = config.environments.map((env, idx) => (idx === index ? { ...env, ...patch } : env))
        onChange({ ...config, environments })
    }

    function deleteEnvironment(index: number): void {
        onChange({ ...config, environments: config.environments.filter((_, idx) => idx !== index) })
    }

    function addEnvironment(): void {
        const name = newEnvName.trim()
        if (!name) return
        const next: LzEnvironment = {
            name,
            securityZone: newEnvSecure,
            spokeVcn: defaultSpokeVcn(config.environments.length),
            projects: ['proj1'],
            platforms: [],
        }
        onChange({ ...config, environments: [...config.environments, next] })
        setNewEnvName('')
        setNewEnvSecure(false)
    }

    return (
        <>
            <section className='ocd-lzng-card'>
                <div className='ocd-lzng-card-head'>
                    <h2 className='ocd-lzng-card-title'>Foundation</h2>
                </div>
                <div className='ocd-lzng-card-body'>
                    <div className='ocd-lzng-field-row'>
                        <div className='ocd-lzng-field'>
                            <label className='ocd-lzng-label' htmlFor='lzng-realm'>Realm</label>
                            <select
                                id='lzng-realm'
                                className='ocd-lzng-select'
                                value={config.realm}
                                onChange={(event) => updateRealm(event.target.value)}
                            >
                                {REALM_OPTIONS.map((realm) => (
                                    <option key={realm.id} value={realm.id}>{realm.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className='ocd-lzng-field'>
                            <label className='ocd-lzng-label' htmlFor='lzng-region'>Region</label>
                            <select
                                id='lzng-region'
                                className='ocd-lzng-select'
                                value={config.region}
                                onChange={(event) => updateRegion(event.target.value)}
                            >
                                {regionOptions.map((region) => (
                                    <option key={region.id} value={region.id}>
                                        {region.id} ({region.shortName.toUpperCase()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className='ocd-lzng-field'>
                        <label className='ocd-lzng-label' htmlFor='lzng-region-short'>Region short name</label>
                        <input
                            id='lzng-region-short'
                            className='ocd-lzng-input'
                            value={config.regionShortName}
                            onChange={(event) => onChange({ ...config, regionShortName: event.target.value })}
                        />
                    </div>
                </div>
            </section>

            <section className='ocd-lzng-card'>
                <div className='ocd-lzng-card-head'>
                    <h2 className='ocd-lzng-card-title'>Environments</h2>
                </div>
                <div className='ocd-lzng-card-body'>
                    <table className='ocd-lzng-env-table'>
                        <thead>
                            <tr>
                                <th scope='col'>Name</th>
                                <th scope='col' className='ocd-lzng-col-sz'>Security Zone</th>
                                <th scope='col' className='ocd-lzng-col-actions'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {config.environments.map((env, index) => (
                                <tr key={`${env.name}-${index}`}>
                                    <td>
                                        <input
                                            aria-label={`Environment ${index + 1} name`}
                                            className='ocd-lzng-input'
                                            value={env.name}
                                            onChange={(event) => updateEnvironment(index, { name: event.target.value })}
                                        />
                                    </td>
                                    <td className='ocd-lzng-col-sz'>
                                        <LzngToggle
                                            checked={env.securityZone}
                                            onChange={(next) => updateEnvironment(index, { securityZone: next })}
                                            label={`Security zone for ${env.name || 'environment'}`}
                                        />
                                    </td>
                                    <td className='ocd-lzng-col-actions'>
                                        <button
                                            type='button'
                                            className='ocd-lzng-btn ocd-lzng-btn-danger'
                                            onClick={() => deleteEnvironment(index)}
                                        >
                                            Del
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            <tr className='ocd-lzng-env-add-row'>
                                <td>
                                    <input
                                        aria-label='New environment name'
                                        className='ocd-lzng-input'
                                        placeholder='Add environment…'
                                        value={newEnvName}
                                        onChange={(event) => setNewEnvName(event.target.value)}
                                        onKeyDown={(event) => { if (event.key === 'Enter') addEnvironment() }}
                                    />
                                </td>
                                <td className='ocd-lzng-col-sz'>
                                    <LzngToggle
                                        checked={newEnvSecure}
                                        onChange={setNewEnvSecure}
                                        label='Security zone for new environment'
                                    />
                                </td>
                                <td className='ocd-lzng-col-actions'>
                                    <button
                                        type='button'
                                        className='ocd-lzng-btn ocd-lzng-btn-primary'
                                        onClick={addEnvironment}
                                    >
                                        Add
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p className='ocd-lzng-help'>
                        Set the hub topology and VCN in the Hub Network step. Security-zone selections are emitted as
                        config.security_targets. Spoke VCNs and projects are configured in the Projects step.
                    </p>
                </div>
            </section>
        </>
    )
}
