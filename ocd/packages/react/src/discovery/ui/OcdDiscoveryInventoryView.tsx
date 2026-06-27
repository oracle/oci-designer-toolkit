import { DiscoverySnapshot } from '../OcdDiscoveryTypes'

export interface OcdDiscoveryInventoryViewProps {
    snapshot: DiscoverySnapshot
}

const OcdDiscoveryInventoryView = ({ snapshot }: OcdDiscoveryInventoryViewProps): JSX.Element => {
    const assetsByApplication = snapshot.assets.reduce<Record<string, typeof snapshot.assets>>((acc, asset) => ({
        ...acc,
        [asset.applicationId]: [...(acc[asset.applicationId] ?? []), asset]
    }), {})
    const servicesByAsset = snapshot.services.reduce<Record<string, typeof snapshot.services>>((acc, service) => ({
        ...acc,
        [service.assetId]: [...(acc[service.assetId] ?? []), service]
    }), {})
    const applications = new Map(snapshot.applications.map((application) => [application.id, application]))

    return (
        <div className='ocd-discovery-section'>
            <div className='ocd-discovery-grid'>
                {snapshot.applications.map((application) => {
                    const assets = assetsByApplication[application.id] ?? []
                    const services = snapshot.services.filter((service) => service.applicationId === application.id)
                    return (
                        <article className='ocd-discovery-card' key={application.id}>
                            <h2>{application.name}</h2>
                            <p>{application.owner} - {application.environment} - {application.criticality}</p>
                            <dl>
                                <dt>Disposition</dt>
                                <dd>{application.preferredDisposition}</dd>
                                <dt>Assets</dt>
                                <dd>{assets.length}</dd>
                                <dt>Services</dt>
                                <dd>{services.length}</dd>
                            </dl>
                        </article>
                    )
                })}
            </div>
            <h2>Compute Assets</h2>
            <table className='ocd-discovery-table'>
                <thead>
                    <tr>
                        <th>Host</th>
                        <th>Application</th>
                        <th>OS</th>
                        <th>CPU</th>
                        <th>Memory</th>
                        <th>Storage</th>
                        <th>Lifecycle</th>
                        <th>Services</th>
                    </tr>
                </thead>
                <tbody>
                    {snapshot.assets.map((asset) => (
                        <tr key={asset.id}>
                            <td>{asset.hostName}</td>
                            <td>{applications.get(asset.applicationId)?.name ?? 'Unknown'}</td>
                            <td>{asset.osName}</td>
                            <td>{asset.cpuCores}</td>
                            <td>{asset.memoryGb} GB</td>
                            <td>{asset.storageGb} GB</td>
                            <td>{asset.lifecycle}</td>
                            <td>{(servicesByAsset[asset.id] ?? []).map((service) => service.displayName).join(' - ')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {(snapshot.ociResources?.length ?? 0) > 0 && (
                <>
                    <h2>OCI Resource Inventory</h2>
                    <table className='ocd-discovery-table'>
                        <thead>
                            <tr>
                                <th>Resource Type</th>
                                <th>Display Name</th>
                                <th>Compartment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {snapshot.ociResources?.map((resource, index) => (
                                <tr key={`${resource.resourceType}-${resource.displayName}-${index}`}>
                                    <td><code>{resource.resourceType}</code></td>
                                    <td>{resource.displayName}</td>
                                    <td>{resource.compartmentName ?? 'Tenancy or shared scope'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    )
}

export default OcdDiscoveryInventoryView
