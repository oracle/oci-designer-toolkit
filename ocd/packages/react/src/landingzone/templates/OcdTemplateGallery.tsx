/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** OcdTemplateGallery
**
** Presentational dialog that lists the curated architecture templates as cards.
** The parent is responsible for creating a new document from the chosen template
** via the `onSelect` callback — this component stays purely presentational.
**
** Props:
**   onSelect(templateId) — called when the user clicks "Use Template"
**   onClose()            — called when the user dismisses the dialog
*/

import React, { useState } from 'react'
import { ocdArchitectureTemplates, OcdArchitectureTemplate } from './OcdArchitectureTemplates'

// ---------------------------------------------------------------------------
// Props interface
// ---------------------------------------------------------------------------

export interface OcdTemplateGalleryProps {
    onSelect: (templateId: string) => void
    onClose: () => void
}

// ---------------------------------------------------------------------------
// Sub-component: TemplateCard
// ---------------------------------------------------------------------------

interface TemplateCardProps {
    template: OcdArchitectureTemplate
    isSelected: boolean
    onHighlight: (id: string) => void
    onUse: (id: string) => void
}

function TemplateCard({ template, isSelected, onHighlight, onUse }: TemplateCardProps): JSX.Element {
    const cardClass = isSelected
        ? 'ocd-template-card ocd-template-card-selected'
        : 'ocd-template-card'

    const onCardClick = () => onHighlight(template.id)
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onHighlight(template.id)
        }
    }
    const onUseClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        onUse(template.id)
    }

    return (
        <div
            className={cardClass}
            onClick={onCardClick}
            onKeyDown={onKeyDown}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`Select template: ${template.title}`}
        >
            <div className="ocd-template-card-header">
                <span className="ocd-template-card-title">{template.title}</span>
            </div>
            <p className="ocd-template-card-description">{template.description}</p>
            <div className="ocd-template-card-tags">
                {template.tags.map((tag) => (
                    <span key={tag} className="ocd-template-tag">{tag}</span>
                ))}
            </div>
            <div className="ocd-template-card-footer">
                <button
                    className="ocd-dialog-button ocd-template-use-button"
                    onClick={onUseClick}
                    disabled={!isSelected}
                    aria-label={`Use template: ${template.title}`}
                >
                    Use Template
                </button>
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Main gallery dialog
// ---------------------------------------------------------------------------

export function OcdTemplateGallery({ onSelect, onClose }: OcdTemplateGalleryProps): JSX.Element {
    const [selectedId, setSelectedId] = useState<string>(
        ocdArchitectureTemplates.length > 0 ? ocdArchitectureTemplates[0].id : ''
    )

    const onClickUse = () => {
        if (selectedId) onSelect(selectedId)
    }

    const onClickCancel = () => onClose()

    const onKeyDownDialog = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Escape') onClose()
    }

    return (
        <div className="ocd-template-gallery-overlay" role="dialog" aria-modal="true" aria-label="New from Template" onKeyDown={onKeyDownDialog}>
            <div className="ocd-template-gallery">
                <div className="ocd-dialog-title">New from Template</div>

                <div className="ocd-dialog-body ocd-template-gallery-body">
                    <p className="ocd-template-gallery-intro">
                        Choose a starter architecture to seed onto the canvas. Resources can be customised after loading.
                    </p>
                    <div className="ocd-template-card-grid" role="list">
                        {ocdArchitectureTemplates.map((template) => (
                            <div key={template.id} role="listitem">
                                <TemplateCard
                                    template={template}
                                    isSelected={selectedId === template.id}
                                    onHighlight={setSelectedId}
                                    onUse={onSelect}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ocd-dialog-footer">
                    <div>
                        <div className="ocd-dialog-button ocd-dialog-cancel-button">
                            <button onClick={onClickCancel}>Cancel</button>
                        </div>
                        <div className="ocd-dialog-button">
                            <button onClick={onClickUse} disabled={!selectedId}>
                                Use Template
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OcdTemplateGallery
