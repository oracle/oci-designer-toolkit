/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { useMemo, useState } from "react"
import { ConsolePageProps } from "../types/Console"
import { HOURS_PER_MONTH } from "../cost/OcdCostTypes"
import { collectRequiredPartNumbers, estimateMonthlyCost } from "../cost/OcdResourcePriceMap"
import { useOciPriceList } from "../cost/useOciPriceList"

type CostLineItem = { id: string; label: string; estimated_usd?: number; enabled: boolean }
type CostEstimate = {
    currency?: string
    line_items?: CostLineItem[]
    monthly_estimate?: { basis?: string; confidence?: string; estimated_usd?: number }
}
type ObservabilityUserDefined = { ociObservabilityLandingZone?: { cost_estimate?: CostEstimate } }

const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']

const OcdBom = ({ ocdDocument }: ConsolePageProps): JSX.Element => {
    const resources = (ocdDocument.design.model.oci?.resources || {}) as Record<string, any[]>
    const [currency, setCurrency] = useState<string>('USD')

    const resourceRows = Object.entries(resources)
        .map(([type, items]) => ({ type, label: type.replace(/_/g, ' '), count: Array.isArray(items) ? items.length : 0 }))
        .filter((row) => row.count > 0)
        .sort((a, b) => a.label.localeCompare(b.label))
    const resourceCount = resourceRows.reduce((total, row) => total + row.count, 0)

    // Required SKUs = static mapping SKUs + per-shape compute SKUs for the
    // instances actually in this design, deduped, '' dropped.
    const requiredPartNumbers = useMemo(
        () => collectRequiredPartNumbers(resources),
        [resources]
    )

    const { priceMap, loading, error, source, snapshotDate } = useOciPriceList(requiredPartNumbers, currency)
    const estimate = useMemo(
        () => estimateMonthlyCost(resources, priceMap, { hoursPerMonth: HOURS_PER_MONTH, currency }),
        [resources, priceMap, currency]
    )

    const userDefined = ocdDocument.design.userDefined as ObservabilityUserDefined | undefined
    const designCost = userDefined?.ociObservabilityLandingZone?.cost_estimate
    const designLineItems = designCost?.line_items || []

    return (
        <div className='ocd-bom-view'>
            <div className='ocd-bom-summary'>
                <div className='ocd-bom-summary-card'>
                    <span>Resources</span>
                    <strong>{resourceCount}</strong>
                </div>
                <div className='ocd-bom-summary-card'>
                    <span>Estimated Monthly Cost</span>
                    <strong>{estimate.currency} {estimate.totalMonthly.toFixed(2)}</strong>
                    <span className='ocd-bom-source-badge'>{source === 'live' ? 'live pricing' : 'offline snapshot'}</span>
                    {/* `.ocd-bom-summary-card span` already renders small + muted. */}
                    {source === 'snapshot' && <span>Prices as of {snapshotDate}</span>}
                </div>
                <div className='ocd-bom-summary-card'>
                    <span>Currency</span>
                    <select className='ocd-bom-currency-select' value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className='ocd-bom-summary-card'>
                    <span>Costed Items</span>
                    <strong>{estimate.lineItems.length}/{estimate.lineItems.length + estimate.notCosted.length}</strong>
                </div>
            </div>
            {loading && <p className='ocd-bom-loading'>Fetching live OCI list pricing&hellip;</p>}
            {error && <p className='ocd-bom-error'>{error}</p>}
            <div className='ocd-bom-grid'>
                <section className='ocd-bom-panel'>
                    <h2>Bill of Materials</h2>
                    <table className='ocd-bom-table'>
                        <thead><tr><th>Resource Type</th><th>Count</th></tr></thead>
                        <tbody>
                            {resourceRows.map((row) => (
                                <tr key={row.type}><td>{row.label}</td><td>{row.count}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <section className='ocd-bom-panel'>
                    <h2>Cost Estimate ({estimate.currency} / month, {HOURS_PER_MONTH}h)</h2>
                    {estimate.lineItems.length === 0 && <p>No costable resources in this design.</p>}
                    {estimate.lineItems.map((item) => (
                        <div className='ocd-bom-cost-line' key={item.resourceType}>
                            <strong>{item.label} &times;{item.count}</strong>
                            <span>{item.confidence}</span>
                            <code>{estimate.currency} {item.monthlyCost.toFixed(2)}</code>
                            {item.note && <p className='ocd-bom-note'>{item.note}</p>}
                        </div>
                    ))}
                    {estimate.notCosted.length > 0 && (
                        <p className='ocd-bom-note'>
                            Not costed: {estimate.notCosted.map((i) => `${i.label} (${i.count})`).join(', ')}.
                        </p>
                    )}
                    {estimate.missingParts.length > 0 && (
                        <p className='ocd-bom-note'>
                            Pricing unavailable for part number(s): {estimate.missingParts.join(', ')}.
                        </p>
                    )}
                </section>
                {designLineItems.length > 0 && (
                    <section className='ocd-bom-panel'>
                        <h2>Design-authored estimate</h2>
                        <p className='ocd-bom-note'>
                            {designCost?.monthly_estimate?.basis || 'Estimate attached to the design.'}
                        </p>
                        {designLineItems.map((item) => (
                            <div className='ocd-bom-cost-line' key={item.id}>
                                <strong>{item.label}</strong>
                                <span>{item.enabled ? 'enabled' : 'disabled'}</span>
                                <code>{designCost?.currency || 'USD'} {Number(item.estimated_usd || 0).toFixed(2)}</code>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    )
}

export default OcdBom
