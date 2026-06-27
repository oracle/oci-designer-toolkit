import { buildDependencyEdges } from '../OcdDiscoveryAnalytics'
import { DiscoverySnapshot } from '../OcdDiscoveryTypes'

export interface OcdDiscoveryTopologyViewProps {
    snapshot: DiscoverySnapshot
}

const OcdDiscoveryTopologyView = ({ snapshot }: OcdDiscoveryTopologyViewProps): JSX.Element => {
    const edges = buildDependencyEdges(snapshot)
    const resourceEdges = snapshot.ociResources?.filter((resource) => resource.resourceType !== 'compartment') ?? []

    return (
        <div className='ocd-discovery-section'>
            <h2>Dependency Topology</h2>
            {edges.length > 0 && (
                <table className='ocd-discovery-table'>
                    <thead>
                        <tr>
                            <th>Source Application</th>
                            <th>Source Service</th>
                            <th>Target Application</th>
                            <th>Target Service</th>
                            <th>Protocol</th>
                            <th>Port</th>
                            <th>Connections / Hour</th>
                        </tr>
                    </thead>
                    <tbody>
                        {edges.map((edge) => (
                            <tr key={edge.id}>
                                <td>{edge.sourceApplication}</td>
                                <td>{edge.sourceService}</td>
                                <td>{edge.targetApplication}</td>
                                <td>{edge.targetService}</td>
                                <td>{edge.protocol}</td>
                                <td>{edge.port}</td>
                                <td>{edge.observedConnectionsPerHour.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {edges.length === 0 && resourceEdges.length > 0 && (
                <table className='ocd-discovery-table'>
                    <thead>
                        <tr>
                            <th>Scope</th>
                            <th>Relation</th>
                            <th>Resource Type</th>
                            <th>Resource</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resourceEdges.map((resource, index) => (
                            <tr key={`${resource.resourceType}-${resource.displayName}-${index}`}>
                                <td>{resource.compartmentName ?? 'Tenancy or shared scope'}</td>
                                <td>contains</td>
                                <td><code>{resource.resourceType}</code></td>
                                <td>{resource.displayName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {edges.length === 0 && resourceEdges.length === 0 && (
                <p className='ocd-discovery-note'>No dependency or OCI resource relationships are available for the active discovery snapshot.</p>
            )}
        </div>
    )
}

export default OcdDiscoveryTopologyView
