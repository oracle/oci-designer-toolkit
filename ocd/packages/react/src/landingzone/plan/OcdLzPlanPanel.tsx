/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * Presentational panel that renders a PlanEntry[] produced by diffDesigns().
 *
 * Mirrors the CSS conventions of OcdValidation.tsx and OcdGovernancePanel.tsx:
 *   - ocd-details / ocd-details-body for collapsible groups
 *   - summary-background for the <summary> element
 *   - ocd-plan-* prefix for diff-specific class names
 *
 * No data fetching, no side effects, no React.FC.
 */

import React, { useState } from 'react'
import { PlanEntry, PlanFieldChange, PlanSummary, PlanAction, summarizePlan } from './OcdLzPlan'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface OcdLzPlanPanelProps {
    entries: PlanEntry[]
    summary?: PlanSummary
    baseLabel?: string
    targetLabel?: string
}

// ---------------------------------------------------------------------------
// CSS class maps
// ---------------------------------------------------------------------------

const ACTION_CSS: Record<PlanAction, string> = {
    create: 'ocd-plan-action-create',
    update: 'ocd-plan-action-update',
    delete: 'ocd-plan-action-delete',
    'no-op': 'ocd-plan-action-noop',
}

const ACTION_SYMBOL: Record<PlanAction, string> = {
    create: '+',
    update: '~',
    delete: '-',
    'no-op': '=',
}

const ACTION_LABEL: Record<PlanAction, string> = {
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    'no-op': 'No change',
}

// The four groups we render in this order
const ACTION_ORDER: ReadonlyArray<PlanAction> = ['create', 'update', 'delete', 'no-op']

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface FieldChangeRowProps {
    change: PlanFieldChange
    baseLabel: string
    targetLabel: string
}

function FieldChangeRow({ change, baseLabel, targetLabel }: FieldChangeRowProps): JSX.Element {
    const fromStr = JSON.stringify(change.from)
    const toStr = JSON.stringify(change.to)
    return (
        <div className='ocd-plan-field-change'>
            <span className='ocd-plan-field-name'>{change.field}</span>
            <span className='ocd-plan-field-from' title={`${baseLabel}: ${fromStr}`}>{fromStr}</span>
            <span className='ocd-plan-field-arrow'>→</span>
            <span className='ocd-plan-field-to' title={`${targetLabel}: ${toStr}`}>{toStr}</span>
        </div>
    )
}

interface PlanEntryRowProps {
    entry: PlanEntry
    baseLabel: string
    targetLabel: string
}

function PlanEntryRow({ entry, baseLabel, targetLabel }: PlanEntryRowProps): JSX.Element {
    const [expanded, setExpanded] = useState(false)
    const hasChanges = entry.changes && entry.changes.length > 0
    const symbol = ACTION_SYMBOL[entry.action]

    return (
        <div className={`ocd-plan-entry ${ACTION_CSS[entry.action]}`}>
            <div
                className='ocd-plan-entry-header'
                onClick={() => hasChanges && setExpanded((v) => !v)}
                role={hasChanges ? 'button' : undefined}
                aria-expanded={hasChanges ? expanded : undefined}
                tabIndex={hasChanges ? 0 : undefined}
                onKeyDown={(e) => {
                    if (hasChanges && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault()
                        setExpanded((v) => !v)
                    }
                }}
            >
                <span className='ocd-plan-symbol'>{symbol}</span>
                <span className='ocd-plan-entry-type'>{entry.resourceType}</span>
                <span className='ocd-plan-entry-name'>{entry.displayName || entry.resourceId}</span>
                <span className='ocd-plan-entry-key'>({entry.resourceKey})</span>
                {hasChanges && (
                    <span className='ocd-plan-change-count'>
                        {entry.changes!.length} field{entry.changes!.length === 1 ? '' : 's'} changed
                        {expanded ? ' ▲' : ' ▼'}
                    </span>
                )}
            </div>
            {hasChanges && expanded && (
                <div className='ocd-plan-field-changes'>
                    {entry.changes!.map((c) => (
                        <FieldChangeRow
                            key={c.field}
                            change={c}
                            baseLabel={baseLabel}
                            targetLabel={targetLabel}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

interface ActionGroupProps {
    action: PlanAction
    entries: PlanEntry[]
    baseLabel: string
    targetLabel: string
}

function ActionGroup({ action, entries, baseLabel, targetLabel }: ActionGroupProps): JSX.Element | null {
    if (entries.length === 0) return null

    const label = `${ACTION_LABEL[action]} (${entries.length})`
    // Auto-open create/update/delete; collapse no-op by default
    const defaultOpen = action !== 'no-op'

    return (
        <details className='ocd-details' open={defaultOpen}>
            <summary className={`summary-background ${ACTION_CSS[action]}-summary`}>
                <label>{label}</label>
            </summary>
            <div className='ocd-details-body ocd-plan-group-body'>
                {entries.map((e) => (
                    <PlanEntryRow
                        key={`${e.resourceKey}::${e.resourceId}::${e.displayName}`}
                        entry={e}
                        baseLabel={baseLabel}
                        targetLabel={targetLabel}
                    />
                ))}
            </div>
        </details>
    )
}

// ---------------------------------------------------------------------------
// Summary bar
// ---------------------------------------------------------------------------

interface PlanSummaryBarProps {
    summary: PlanSummary
}

function PlanSummaryBar({ summary }: PlanSummaryBarProps): JSX.Element {
    return (
        <div className='ocd-plan-summary-bar'>
            <span className='ocd-plan-summary-total'>{summary.total} resource{summary.total === 1 ? '' : 's'}</span>
            {summary.create > 0 && (
                <span className='ocd-plan-summary-create'>+{summary.create} create</span>
            )}
            {summary.update > 0 && (
                <span className='ocd-plan-summary-update'>~{summary.update} update</span>
            )}
            {summary.delete > 0 && (
                <span className='ocd-plan-summary-delete'>-{summary.delete} delete</span>
            )}
            {summary.noop > 0 && (
                <span className='ocd-plan-summary-noop'>={summary.noop} no-op</span>
            )}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function OcdLzPlanPanel({
    entries,
    summary: summaryProp,
    baseLabel = 'Current',
    targetLabel = 'Proposed',
}: OcdLzPlanPanelProps): JSX.Element {
    const summary = summaryProp ?? summarizePlan(entries)

    // Group entries by action for rendering
    const grouped: Record<PlanAction, PlanEntry[]> = {
        create: [],
        update: [],
        delete: [],
        'no-op': [],
    }
    for (const e of entries) {
        grouped[e.action].push(e)
    }

    const isEmpty = entries.length === 0

    return (
        <div className='ocd-plan-view'>
            <PlanSummaryBar summary={summary} />
            {isEmpty ? (
                <div className='ocd-plan-empty'>No resources to compare. Load both a base and a target design.</div>
            ) : (
                ACTION_ORDER.map((action) => (
                    <ActionGroup
                        key={action}
                        action={action}
                        entries={grouped[action]}
                        baseLabel={baseLabel}
                        targetLabel={targetLabel}
                    />
                ))
            )}
        </div>
    )
}
