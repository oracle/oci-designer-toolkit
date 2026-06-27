/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Presentational panel that renders GovernanceFinding[] grouped by severity.
** Mirrors the structure and CSS class conventions of OcdValidation.tsx.
**
** Props:
**   findings    - the pre-computed array from evaluateGovernance()
**   design      - the OcdDesign (passed through for drill-down context, not read here)
**   onApplyFix  - optional: called when the user clicks "Apply fix" on an autoFixable finding
**
** No data fetching, no side effects, no React.FC.
*/

import React, { useState } from 'react'
import { OcdDesign } from '@ocd/model'
import { GovernanceFinding, GovernanceSeverity } from './OcdGovernanceChecks'

// ---------------------------------------------------------------------------
// Public props interface
// ---------------------------------------------------------------------------

export interface OcdGovernancePanelProps {
    findings: GovernanceFinding[]
    design: OcdDesign
    /** Optional callback invoked when the user triggers a one-click fix. */
    onApplyFix?: (finding: GovernanceFinding) => void
}

// ---------------------------------------------------------------------------
// Severity ordering and helpers
// ---------------------------------------------------------------------------

const SEVERITY_ORDER: ReadonlyArray<GovernanceSeverity> = ['critical', 'high', 'medium', 'low']

const SEVERITY_LABEL: Record<GovernanceSeverity, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
}

/** Maps GovernanceSeverity to the CSS modifier used in the validation page. */
const SEVERITY_CSS: Record<GovernanceSeverity, string> = {
    critical: 'ocd-validation-error-result',
    high:     'ocd-validation-error-result',
    medium:   'ocd-validation-warning-result',
    low:      'ocd-validation-information-result',
}

// ---------------------------------------------------------------------------
// Clipboard helper
// Mirrors the pattern from landingzone/ui/LzngUpdateBanner.tsx:
//   - prefers the async Clipboard API
//   - falls back to execCommand for environments without it
// ---------------------------------------------------------------------------

async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text)
            return true
        }
        // Fallback: create a temporary textarea
        const el = document.createElement('textarea')
        el.value = text
        el.style.position = 'fixed'
        el.style.opacity = '0'
        document.body.appendChild(el)
        el.focus()
        el.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(el)
        return ok
    } catch {
        return false
    }
}

// ---------------------------------------------------------------------------
// Terraform copy button
// ---------------------------------------------------------------------------

interface TerraformCopyButtonProps {
    terraform: string
}

function TerraformCopyButton({ terraform }: TerraformCopyButtonProps): JSX.Element {
    const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

    const handleCopy = async () => {
        const ok = await copyToClipboard(terraform)
        setCopyState(ok ? 'copied' : 'failed')
        // Reset label after 2 s
        setTimeout(() => setCopyState('idle'), 2000)
    }

    const label =
        copyState === 'copied' ? '✓ Copied' :
        copyState === 'failed' ? '✗ Failed' :
        'Copy Terraform'

    return (
        <button
            className='ocd-governance-remediation-copy-btn'
            onClick={handleCopy}
            title='Copy illustrative Terraform snippet to clipboard'
            type='button'
        >
            {label}
        </button>
    )
}

// ---------------------------------------------------------------------------
// Single finding row
// ---------------------------------------------------------------------------

interface FindingRowProps {
    finding: GovernanceFinding
    onApplyFix?: (finding: GovernanceFinding) => void
}

function FindingRow({ finding, onApplyFix }: FindingRowProps): JSX.Element {
    const severityCss = SEVERITY_CSS[finding.severity]
    const categoryLabel = finding.category.charAt(0).toUpperCase() + finding.category.slice(1)
    const rem = finding.remediation

    return (
        <div className='ocd-validation-result'>
            <div className={severityCss}>
                <div className='ocd-validation-result-title'>
                    <span className='ocd-governance-severity-badge' data-severity={finding.severity}>
                        {SEVERITY_LABEL[finding.severity]}
                    </span>
                    <span className='ocd-governance-category-label'>{categoryLabel}</span>
                    {finding.resourceName && (
                        <span className='ocd-governance-resource-name'>{finding.resourceName}</span>
                    )}
                    {' / '}
                    {finding.title}
                </div>
                <div className='ocd-validation-message'>{finding.message}</div>

                {rem && (
                    <div className='ocd-governance-remediation'>
                        <p className='ocd-governance-remediation-summary'>{rem.summary}</p>
                        <div className='ocd-governance-remediation-actions'>
                            {rem.terraform && (
                                <TerraformCopyButton terraform={rem.terraform} />
                            )}
                            {rem.autoFixable && onApplyFix && (
                                <button
                                    className='ocd-governance-remediation-apply-btn'
                                    onClick={() => onApplyFix(finding)}
                                    title='Apply one-click fix to the design model'
                                    type='button'
                                >
                                    Apply fix
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Severity group (collapsible <details> block)
// ---------------------------------------------------------------------------

interface SeverityGroupProps {
    severity: GovernanceSeverity
    findings: GovernanceFinding[]
    onApplyFix?: (finding: GovernanceFinding) => void
}

function SeverityGroup({ severity, findings, onApplyFix }: SeverityGroupProps): JSX.Element {
    const label = `${SEVERITY_LABEL[severity]} (${findings.length})`
    // Default open when there are findings; collapsed when empty (mirrors OcdValidation)
    const defaultOpen = findings.length > 0
    return (
        <details className='ocd-details' open={defaultOpen}>
            <summary className='summary-background'>
                <label>{label}</label>
            </summary>
            <div className='ocd-details-body'>
                {findings.length === 0
                    ? <div className='ocd-governance-empty-group'>No {SEVERITY_LABEL[severity].toLowerCase()} findings</div>
                    : findings.map((f) => (
                        <FindingRow
                            finding={f}
                            onApplyFix={onApplyFix}
                            key={f.id}
                        />
                    ))
                }
            </div>
        </details>
    )
}

// ---------------------------------------------------------------------------
// Summary bar
// ---------------------------------------------------------------------------

interface GovernanceSummaryProps {
    findings: GovernanceFinding[]
}

function GovernanceSummary({ findings }: GovernanceSummaryProps): JSX.Element {
    const counts = SEVERITY_ORDER.reduce<Record<GovernanceSeverity, number>>(
        (acc, s) => ({ ...acc, [s]: findings.filter((f) => f.severity === s).length }),
        { critical: 0, high: 0, medium: 0, low: 0 }
    )
    const total = findings.length
    const passFail = total === 0

    return (
        <div className='ocd-governance-summary'>
            <div className={`ocd-governance-status ${passFail ? 'ocd-governance-pass' : 'ocd-governance-fail'}`}>
                {passFail
                    ? 'All governance checks passed'
                    : `${total} finding${total !== 1 ? 's' : ''}: ${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low`
                }
            </div>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Root panel
// ---------------------------------------------------------------------------

export function OcdGovernancePanel({ findings, onApplyFix }: OcdGovernancePanelProps): JSX.Element {
    const byseverity = SEVERITY_ORDER.reduce<Record<GovernanceSeverity, GovernanceFinding[]>>(
        (acc, s) => ({ ...acc, [s]: findings.filter((f) => f.severity === s) }),
        { critical: [], high: [], medium: [], low: [] }
    )

    return (
        <div className='ocd-validation-view ocd-governance-view'>
            <GovernanceSummary findings={findings} />
            {SEVERITY_ORDER.map((severity) => (
                <SeverityGroup
                    severity={severity}
                    findings={byseverity[severity]}
                    onApplyFix={onApplyFix}
                    key={severity}
                />
            ))}
        </div>
    )
}

/** Allow consumers to import the panel as a default export (consistent with OcdValidation). */
export default OcdGovernancePanel
