/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Landing Zone Wizard IAM compartment diagram panel. Renders the compartment
** model derived from iam.json (root, shared infra, per-environment boxes).
** Styling is delegated to the Redwood-NG theme via `ocd-lz-*` classNames.
*/

import React from 'react'
import { buildCompartmentDiagram, CompartmentDiagram, DiagramNode, findGeneratedFile } from './OcdLzCompartmentDiagram'
import { GeneratedResult } from './OcdLzGenerator'

function CompartmentBox({ node, kind }: { node: DiagramNode; kind: 'shared' | 'environment' }): JSX.Element {
    return (
        <div className={`ocd-lz-compartment-box ocd-lz-compartment-box-${kind}`}>{node.name}</div>
    )
}

export function OcdLzDiagramPanel({ result }: { result: GeneratedResult | null }): JSX.Element {
    const iamContent = result ? findGeneratedFile(result.files, 'iam.json') : null
    let diagram: CompartmentDiagram | null = null
    let error: string | null = null
    if (iamContent) {
        try {
            diagram = buildCompartmentDiagram(iamContent)
        } catch (err: unknown) {
            error = err instanceof Error ? err.message : String(err)
        }
    }

    return (
        <section className='ocd-lz-panel ocd-lz-diagram-panel'>
            <div className='ocd-lz-panel-title'>IAM Compartment Diagram</div>
            {!result && (
                <div className='ocd-lz-empty'>Generate JSONs to build the diagram from iam.json compartment_configuration.</div>
            )}
            {error && <div className='ocd-lz-error'>{error}</div>}
            {diagram?.root && (
                <div className='ocd-lz-diagram-canvas'>
                    <div className='ocd-lz-region-box'>
                        <div className='ocd-lz-diagram-label'>OCI Region</div>
                        <div className='ocd-lz-tenancy-box'>
                            <div className='ocd-lz-tenancy-label'>OCI Tenancy - Operating Entity</div>
                            <div className='ocd-lz-landingzone-box'>
                                <div className='ocd-lz-zone-label'>{diagram.root.name}</div>
                                <div className='ocd-lz-zone-rows'>
                                    <div className='ocd-lz-shared-column'>
                                        {diagram.shared.map((node) => (
                                            <CompartmentBox key={node.key} node={node} kind='shared' />
                                        ))}
                                    </div>
                                    <div className='ocd-lz-env-column'>
                                        {diagram.environments.map((node) => (
                                            <CompartmentBox key={node.key} node={node} kind='environment' />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default OcdLzDiagramPanel
