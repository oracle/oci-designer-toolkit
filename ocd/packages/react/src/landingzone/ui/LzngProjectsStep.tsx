/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Step 3 — Projects. For each environment, captures the spoke
** `shared_project_network.network.vcn` CIDR and a list of named workload
** projects. Maps to:
**
**   environments.<env>.shared_project_network.network.vcn   (spoke VCN)
**   environments.<env>.projects.<name>: {}                   (project compartments)
**
** Clearing the spoke VCN turns the environment into a hub-only (no-spoke) env;
** the OE topology then excludes it from spoke ordering. Each project becomes a
** cmp-lz-<env>-projects child compartment in the generated iam.json.
*/

import React, { useState } from 'react'
import { LandingZoneConfig, LzEnvironment, isValidCidr } from '../OcdLzConfig'

export interface LzngProjectsStepProps {
    config: LandingZoneConfig
    onChange: (next: LandingZoneConfig) => void
}

export function LzngProjectsStep({ config, onChange }: LzngProjectsStepProps): JSX.Element {
    const [draftProject, setDraftProject] = useState<Record<string, string>>({})

    function updateEnvironment(index: number, patch: Partial<LzEnvironment>): void {
        const environments = config.environments.map((env, idx) => (idx === index ? { ...env, ...patch } : env))
        onChange({ ...config, environments })
    }

    function addProject(index: number): void {
        const env = config.environments[index]
        const name = (draftProject[env.name] || '').trim()
        if (!name || env.projects.includes(name)) return
        updateEnvironment(index, { projects: [...env.projects, name] })
        setDraftProject((prev) => ({ ...prev, [env.name]: '' }))
    }

    function removeProject(index: number, project: string): void {
        const env = config.environments[index]
        updateEnvironment(index, {
            projects: env.projects.filter((proj) => proj !== project),
            platforms: env.platforms.map((plat) => ({
                ...plat,
                projects: plat.projects.filter((proj) => proj !== project),
            })),
        })
    }

    return (
        <>
            {config.environments.map((env, index) => {
                const spokeValid = !env.spokeVcn || isValidCidr(env.spokeVcn)
                return (
                    <section className='ocd-lzng-card' key={`${env.name}-${index}`}>
                        <div className='ocd-lzng-card-head'>
                            <h2 className='ocd-lzng-card-title'>
                                {env.name}{env.securityZone ? ' · security zone' : ''}
                            </h2>
                        </div>
                        <div className='ocd-lzng-card-body'>
                            <div className='ocd-lzng-field'>
                                <label className='ocd-lzng-label' htmlFor={`lzng-spoke-${index}`}>
                                    Spoke VCN CIDR
                                </label>
                                <input
                                    id={`lzng-spoke-${index}`}
                                    className={`ocd-lzng-input${env.spokeVcn && !spokeValid ? ' ocd-lzng-input-invalid' : ''}`}
                                    value={env.spokeVcn}
                                    placeholder='10.0.64.0/21 (leave blank for hub-only)'
                                    onChange={(event) => updateEnvironment(index, { spokeVcn: event.target.value })}
                                    aria-invalid={env.spokeVcn ? !spokeValid : undefined}
                                />
                                {env.spokeVcn && !spokeValid && (
                                    <span className='ocd-lzng-field-error'>Enter a valid CIDR or leave blank.</span>
                                )}
                            </div>

                            <div className='ocd-lzng-field'>
                                <span className='ocd-lzng-label'>Projects</span>
                                <div className='ocd-lzng-chips'>
                                    {env.projects.length === 0 && (
                                        <span className='ocd-lzng-chips-empty'>No projects yet.</span>
                                    )}
                                    {env.projects.map((project) => (
                                        <span className='ocd-lzng-chip' key={project}>
                                            {project}
                                            <button
                                                type='button'
                                                className='ocd-lzng-chip-x'
                                                aria-label={`Remove project ${project}`}
                                                onClick={() => removeProject(index, project)}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className='ocd-lzng-inline-add'>
                                    <input
                                        className='ocd-lzng-input'
                                        aria-label={`New project for ${env.name}`}
                                        placeholder='Add project…'
                                        value={draftProject[env.name] || ''}
                                        onChange={(event) =>
                                            setDraftProject((prev) => ({ ...prev, [env.name]: event.target.value }))
                                        }
                                        onKeyDown={(event) => { if (event.key === 'Enter') addProject(index) }}
                                    />
                                    <button
                                        type='button'
                                        className='ocd-lzng-btn ocd-lzng-btn-primary'
                                        onClick={() => addProject(index)}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )
            })}
            <p className='ocd-lzng-help'>
                Each environment with a spoke VCN produces a spoke network category and a{' '}
                <code>cmp-lz-&lt;env&gt;-projects</code> compartment holding one child per project.
            </p>
        </>
    )
}
