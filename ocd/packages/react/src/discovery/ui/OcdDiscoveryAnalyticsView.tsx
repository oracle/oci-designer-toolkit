import { summarizeUtilization } from '../OcdDiscoveryAnalytics'
import { DiscoverySnapshot } from '../OcdDiscoveryTypes'
import { zeroTrustControls } from '../../security/OcdZeroTrustReference'

export interface OcdDiscoveryAnalyticsViewProps {
    snapshot: DiscoverySnapshot
}

const formatUsd = (value: number): string => `USD ${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`

const OcdDiscoveryAnalyticsView = ({ snapshot }: OcdDiscoveryAnalyticsViewProps): JSX.Element => {
    const utilization = summarizeUtilization(snapshot)
    const assets = new Map(snapshot.assets.map((asset) => [asset.id, asset]))
    const sensitiveDatabases = snapshot.services.filter((service) => service.runtime.includes('database')).length
    const privateControlCandidates = snapshot.dependencies.filter((dependency) => dependency.protocol === 'tcp').length
    const ociResourceTypes = snapshot.ociResources?.reduce<Record<string, number>>((acc, resource) => ({
        ...acc,
        [resource.resourceType]: (acc[resource.resourceType] ?? 0) + 1,
    }), {}) ?? {}
    const agenticEvidenceControls = zeroTrustControls.reduce((total, control) => total + control.evidence.length, 0)

    return (
        <div className='ocd-discovery-section'>
            <div className='ocd-discovery-grid'>
                <article className='ocd-discovery-card'>
                    <h2>Monthly Cost</h2>
                    <strong>{formatUsd(utilization.monthlyCostUsd)}</strong>
                </article>
                <article className='ocd-discovery-card'>
                    <h2>CPU Hot Assets</h2>
                    <strong>{utilization.p95CpuHotAssets.length}</strong>
                </article>
                <article className='ocd-discovery-card'>
                    <h2>Memory Hot Assets</h2>
                    <strong>{utilization.p95MemoryHotAssets.length}</strong>
                </article>
                <article className='ocd-discovery-card'>
                    <h2>OCI Resource Types</h2>
                    <strong>{Object.keys(ociResourceTypes).length}</strong>
                </article>
            </div>
            <h2>Zero Trust Readiness</h2>
            <div className='ocd-discovery-grid ocd-zero-trust-readiness'>
                <article className='ocd-discovery-card'>
                    <h2>Sensitive Data Targets</h2>
                    <p>Map to Data Safe targets, Vault keys, and data-class policy checks.</p>
                    <strong>{sensitiveDatabases}</strong>
                </article>
                <article className='ocd-discovery-card'>
                    <h2>Policy Gate Candidates</h2>
                    <p>TCP service paths that should be mediated by private endpoints, NSGs, ZPR, or brokered execution.</p>
                    <strong>{privateControlCandidates}</strong>
                </article>
                <article className='ocd-discovery-card'>
                    <h2>Evidence Outputs</h2>
                    <p>Reference evidence artifacts for audit, SOC, and operational proof.</p>
                    <strong>{agenticEvidenceControls}</strong>
                </article>
            </div>
            <div className='ocd-zero-trust-matrix'>
                {zeroTrustControls.map((control) => (
                    <article key={control.principle}>
                        <h3>{control.principle}</h3>
                        <p>{control.agenticExtension}</p>
                        <div>{control.ociControls.map((item) => <span key={item}>{item}</span>)}</div>
                    </article>
                ))}
            </div>
            <h2>Utilization Metrics</h2>
            {snapshot.metrics.length > 0 ? (
                <table className='ocd-discovery-table'>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Avg CPU</th>
                            <th>P95 CPU</th>
                            <th>Avg Memory</th>
                            <th>P95 Memory</th>
                            <th>P95 Network</th>
                            <th>P95 IOPS</th>
                            <th>Monthly Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {snapshot.metrics.map((metric) => (
                            <tr key={metric.assetId}>
                                <td>{assets.get(metric.assetId)?.hostName ?? metric.assetId}</td>
                                <td>{metric.avgCpuPercent}%</td>
                                <td>{metric.p95CpuPercent}%</td>
                                <td>{metric.avgMemoryPercent}%</td>
                                <td>{metric.p95MemoryPercent}%</td>
                                <td>{metric.p95NetworkMbps} Mbps</td>
                                <td>{metric.p95Iops.toLocaleString()}</td>
                                <td>{formatUsd(metric.monthlyCostUsd)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className='ocd-discovery-note'>No utilization metrics are available in this discovery snapshot. Live OCI resource counts are shown below.</p>
            )}
            {Object.keys(ociResourceTypes).length > 0 && (
                <>
                    <h2>OCI Resource Mix</h2>
                    <table className='ocd-discovery-table'>
                        <thead>
                            <tr>
                                <th>Resource Type</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(ociResourceTypes).sort(([left], [right]) => left.localeCompare(right)).map(([resourceType, count]) => (
                                <tr key={resourceType}>
                                    <td><code>{resourceType}</code></td>
                                    <td>{count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    )
}

export default OcdDiscoveryAnalyticsView
