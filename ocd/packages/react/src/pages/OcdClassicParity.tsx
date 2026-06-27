import { ConsolePageProps } from '../types/Console'
import {
    OcdClassicCapability,
    okitClassicDesktopViews,
    okitClassicImportExportCapabilities,
    okitNextGenEnhancements,
    summarizeClassicParity
} from '../classic/OcdClassicCapabilities'

const statusLabels: Record<OcdClassicCapability['status'], string> = {
    available: 'Available',
    enhanced: 'Enhanced',
    partial: 'Partial',
    planned: 'Planned'
}

const StatusBadge = ({ status }: { status: OcdClassicCapability['status'] }): JSX.Element => (
    <span className={`ocd-classic-status ocd-classic-status-${status}`}>{statusLabels[status]}</span>
)

const CapabilityTable = ({ title, capabilities }: { title: string, capabilities: OcdClassicCapability[] }): JSX.Element => (
    <section className='ocd-discovery-section ocd-classic-section'>
        <h2>{title}</h2>
        <table className='ocd-discovery-table ocd-classic-table'>
            <thead>
                <tr>
                    <th>Capability</th>
                    <th>Classic 0.70 surface</th>
                    <th>Next Gen Desktop surface</th>
                    <th>Status</th>
                    <th>Next enhancement</th>
                </tr>
            </thead>
            <tbody>
                {capabilities.map((capability) => (
                    <tr key={capability.id}>
                        <td><strong>{capability.capability}</strong></td>
                        <td>{capability.classicSurface}</td>
                        <td>{capability.nextGenSurface}</td>
                        <td><StatusBadge status={capability.status} /></td>
                        <td>{capability.nextStep}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </section>
)

const OcdClassicParity = (_props: ConsolePageProps): JSX.Element => {
    const summary = summarizeClassicParity()

    return (
        <div className='ocd-discovery-page ocd-classic-page'>
            <header className='ocd-discovery-header'>
                <div>
                    <h1>OKIT Classic 0.70 Parity</h1>
                    <div className='ocd-discovery-kpis' aria-label='Classic parity summary'>
                        <span>{summary.enhanced} enhanced</span>
                        <span>{summary.available} available</span>
                        <span>{summary.partial} partial</span>
                        <span>{summary.planned} planned</span>
                    </div>
                </div>
            </header>
            <div className='ocd-classic-intro'>
                <p>
                    Desktop parity tracks the final OKIT Classic capability surface and keeps each item mapped to the
                    current Next Gen implementation path. The target is feature continuity plus Landing Zone, discovery,
                    governance, and expanded OCI catalog workflows.
                </p>
            </div>
            <div className='ocd-discovery-grid ocd-classic-enhancements' aria-label='Next Gen enhancement lanes'>
                {okitNextGenEnhancements.map((enhancement) => (
                    <section className='ocd-discovery-card' key={enhancement.id}>
                        <h2>{enhancement.title}</h2>
                        <p>{enhancement.summary}</p>
                    </section>
                ))}
            </div>
            <CapabilityTable title='Views' capabilities={okitClassicDesktopViews} />
            <CapabilityTable title='Import, Export, Query' capabilities={okitClassicImportExportCapabilities} />
        </div>
    )
}

export default OcdClassicParity
