/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Step 4 — Platform Templates. Attaches workload extensions (oke_simple, exacs,
** exacc) to an environment as a platform. Maps to:
**
**   environments.<env>.platforms.<platformName>: {
**     network: { vcn }          // when the extension's network_mode != forbidden
**     extension: { type, params }
**   }
**
** Per the registered extension contracts:
**   - oke_simple : network_mode required  (dedicated VCN mandatory)
**   - exacs      : network_mode optional  (dedicated VCN optional)
**   - exacc      : network_mode forbidden (no VCN; DB project compartments only)
**
** ExaCC/ExaCS DB extensions also accept `project_db_compartments` referencing the
** environment's projects (params.project_db_compartments).
*/

import React, { useState } from 'react'
import {
    EXTENSION_TEMPLATES,
    ExtensionType,
    LandingZoneConfig,
    LzEnvironment,
    PlatformExtension,
    findExtensionTemplate,
    isValidCidr,
} from '../OcdLzConfig'

export interface LzngTemplatesStepProps {
    config: LandingZoneConfig
    onChange: (next: LandingZoneConfig) => void
}

export function LzngTemplatesStep({ config, onChange }: LzngTemplatesStepProps): JSX.Element {
    const [selection, setSelection] = useState<Record<string, ExtensionType>>({})

    function updateEnvironment(index: number, patch: Partial<LzEnvironment>): void {
        const environments = config.environments.map((env, idx) => (idx === index ? { ...env, ...patch } : env))
        onChange({ ...config, environments })
    }

    function addPlatform(index: number): void {
        const env = config.environments[index]
        const type = (selection[env.name] || EXTENSION_TEMPLATES[0].type) as ExtensionType
        const template = findExtensionTemplate(type)
        if (!template) return
        let platformName = template.platformName
        let suffix = 2
        while (env.platforms.some((plat) => plat.platformName === platformName)) {
            platformName = `${template.platformName}${suffix}`
            suffix += 1
        }
        const platform: PlatformExtension = {
            platformName,
            type,
            vcn: template.networkMode === 'forbidden' ? '' : template.defaultVcn,
            projects: [],
        }
        updateEnvironment(index, { platforms: [...env.platforms, platform] })
    }

    function updatePlatform(envIndex: number, platIndex: number, patch: Partial<PlatformExtension>): void {
        const env = config.environments[envIndex]
        const platforms = env.platforms.map((plat, idx) => (idx === platIndex ? { ...plat, ...patch } : plat))
        updateEnvironment(envIndex, { platforms })
    }

    function removePlatform(envIndex: number, platIndex: number): void {
        const env = config.environments[envIndex]
        updateEnvironment(envIndex, { platforms: env.platforms.filter((_, idx) => idx !== platIndex) })
    }

    function togglePlatformProject(envIndex: number, platIndex: number, project: string): void {
        const plat = config.environments[envIndex].platforms[platIndex]
        const projects = plat.projects.includes(project)
            ? plat.projects.filter((proj) => proj !== project)
            : [...plat.projects, project]
        updatePlatform(envIndex, platIndex, { projects })
    }

    return (
        <>
            {config.environments.map((env, envIndex) => (
                <section className='ocd-lzng-card' key={`${env.name}-${envIndex}`}>
                    <div className='ocd-lzng-card-head'>
                        <h2 className='ocd-lzng-card-title'>{env.name}</h2>
                    </div>
                    <div className='ocd-lzng-card-body'>
                        {env.platforms.length === 0 && (
                            <p className='ocd-lzng-chips-empty'>No platform templates attached.</p>
                        )}

                        {env.platforms.map((plat, platIndex) => {
                            const template = findExtensionTemplate(plat.type)
                            const showVcn = template ? template.networkMode !== 'forbidden' : false
                            const vcnValid = !plat.vcn || isValidCidr(plat.vcn)
                            return (
                                <div className='ocd-lzng-subcard' key={`${plat.platformName}-${platIndex}`}>
                                    <div className='ocd-lzng-subcard-head'>
                                        <span className='ocd-lzng-subcard-title'>
                                            {template ? template.label : plat.type} · <code>{plat.platformName}</code>
                                        </span>
                                        <button
                                            type='button'
                                            className='ocd-lzng-btn ocd-lzng-btn-danger'
                                            onClick={() => removePlatform(envIndex, platIndex)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    {template && <p className='ocd-lzng-subcard-desc'>{template.adds}</p>}

                                    {showVcn && (
                                        <div className='ocd-lzng-field'>
                                            <label
                                                className='ocd-lzng-label'
                                                htmlFor={`lzng-plat-vcn-${envIndex}-${platIndex}`}
                                            >
                                                Platform VCN CIDR
                                                {template && template.networkMode === 'optional' ? ' (optional)' : ''}
                                            </label>
                                            <input
                                                id={`lzng-plat-vcn-${envIndex}-${platIndex}`}
                                                className={`ocd-lzng-input${plat.vcn && !vcnValid ? ' ocd-lzng-input-invalid' : ''}`}
                                                value={plat.vcn}
                                                placeholder={template ? template.defaultVcn : '10.0.80.0/21'}
                                                onChange={(event) =>
                                                    updatePlatform(envIndex, platIndex, { vcn: event.target.value })
                                                }
                                                aria-invalid={plat.vcn ? !vcnValid : undefined}
                                            />
                                            {plat.vcn && !vcnValid && (
                                                <span className='ocd-lzng-field-error'>Enter a valid CIDR.</span>
                                            )}
                                        </div>
                                    )}

                                    {(plat.type === 'exacc' || plat.type === 'exacs') && (
                                        <div className='ocd-lzng-field'>
                                            <span className='ocd-lzng-label'>DB project compartments</span>
                                            {env.projects.length === 0 ? (
                                                <span className='ocd-lzng-chips-empty'>
                                                    Add projects in the Projects step first.
                                                </span>
                                            ) : (
                                                <div className='ocd-lzng-checkrow'>
                                                    {env.projects.map((project) => (
                                                        <label className='ocd-lzng-check' key={project}>
                                                            <input
                                                                type='checkbox'
                                                                checked={plat.projects.includes(project)}
                                                                onChange={() =>
                                                                    togglePlatformProject(envIndex, platIndex, project)
                                                                }
                                                            />
                                                            <span>{project}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        <div className='ocd-lzng-inline-add'>
                            <select
                                className='ocd-lzng-select'
                                aria-label={`Platform template for ${env.name}`}
                                value={selection[env.name] || EXTENSION_TEMPLATES[0].type}
                                onChange={(event) =>
                                    setSelection((prev) => ({ ...prev, [env.name]: event.target.value as ExtensionType }))
                                }
                            >
                                {EXTENSION_TEMPLATES.map((template) => (
                                    <option key={template.type} value={template.type}>{template.label}</option>
                                ))}
                            </select>
                            <button
                                type='button'
                                className='ocd-lzng-btn ocd-lzng-btn-primary'
                                onClick={() => addPlatform(envIndex)}
                            >
                                Attach
                            </button>
                        </div>
                    </div>
                </section>
            ))}
        </>
    )
}
