/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Step 2 — Hub Network. Selects the hub kind (hub_a/b/c/e, each with a one-line
** firewall-topology description derived from the OE subnet orders) and the hub
** VCN CIDR (validated). Maps to config.hub.kind + config.hub.network.vcn. The
** derived per-kind subnet list is shown read-only (the OE generator auto-derives
** the subnet CIDRs as /24s from the VCN).
*/

import React from 'react'
import {
    HUB_KIND_OPTIONS,
    HubKind,
    LandingZoneConfig,
    isValidCidr,
} from '../OcdLzConfig'

export interface LzngHubStepProps {
    config: LandingZoneConfig
    onChange: (next: LandingZoneConfig) => void
}

export function LzngHubStep({ config, onChange }: LzngHubStepProps): JSX.Element {
    const selected = HUB_KIND_OPTIONS.find((opt) => opt.id === config.hubKind)
    const hubVcnValid = isValidCidr(config.hubVcn)

    function updateHubKind(kind: HubKind): void {
        onChange({ ...config, hubKind: kind })
    }

    function updateHubVcn(vcn: string): void {
        onChange({ ...config, hubVcn: vcn })
    }

    return (
        <>
            <section className='ocd-lzng-card'>
                <div className='ocd-lzng-card-head'>
                    <h2 className='ocd-lzng-card-title'>Hub Topology</h2>
                </div>
                <div className='ocd-lzng-card-body'>
                    <fieldset className='ocd-lzng-fieldset'>
                        <legend className='ocd-lzng-label'>Hub kind</legend>
                        <div className='ocd-lzng-option-list' role='radiogroup' aria-label='Hub kind'>
                            {HUB_KIND_OPTIONS.map((opt) => {
                                const isActive = opt.id === config.hubKind
                                return (
                                    <label
                                        key={opt.id}
                                        className={`ocd-lzng-option${isActive ? ' ocd-lzng-option-active' : ''}`}
                                    >
                                        <input
                                            type='radio'
                                            name='lzng-hub-kind'
                                            className='ocd-lzng-option-radio'
                                            value={opt.id}
                                            checked={isActive}
                                            onChange={() => updateHubKind(opt.id)}
                                        />
                                        <span className='ocd-lzng-option-text'>
                                            <span className='ocd-lzng-option-title'>{opt.label}</span>
                                            <span className='ocd-lzng-option-desc'>{opt.description}</span>
                                            <span className='ocd-lzng-option-meta'>Subnets: {opt.subnets.join(' · ')}</span>
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                    </fieldset>
                </div>
            </section>

            <section className='ocd-lzng-card'>
                <div className='ocd-lzng-card-head'>
                    <h2 className='ocd-lzng-card-title'>Hub VCN</h2>
                </div>
                <div className='ocd-lzng-card-body'>
                    <div className='ocd-lzng-field'>
                        <label className='ocd-lzng-label' htmlFor='lzng-hub-vcn'>Hub VCN CIDR</label>
                        <input
                            id='lzng-hub-vcn'
                            className={`ocd-lzng-input${config.hubVcn && !hubVcnValid ? ' ocd-lzng-input-invalid' : ''}`}
                            value={config.hubVcn}
                            placeholder='10.100.0.0/21'
                            onChange={(event) => updateHubVcn(event.target.value)}
                            aria-invalid={config.hubVcn ? !hubVcnValid : undefined}
                        />
                        {config.hubVcn && !hubVcnValid && (
                            <span className='ocd-lzng-field-error'>Enter a valid CIDR (e.g. 10.100.0.0/21).</span>
                        )}
                    </div>
                    {selected && hubVcnValid && (
                        <p className='ocd-lzng-help'>
                            {selected.label.split(' — ')[0]} hub VCN <code>{config.hubVcn}</code> hosts subnets{' '}
                            {selected.subnets.join(', ')}. The Operating Entities generator auto-derives each subnet as a
                            /24 from this VCN.
                        </p>
                    )}
                </div>
            </section>
        </>
    )
}
