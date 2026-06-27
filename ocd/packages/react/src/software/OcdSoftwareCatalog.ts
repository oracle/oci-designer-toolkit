/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Curated catalogue of installable software for the Software & Ansible
** Provisioning module (blueprint phase 2). Each entry maps to a battle-tested
** Ansible role (Galaxy or GitHub) so provisioning reuses proven automation
** rather than hand-rolled playbooks. Ports declared here drive the prerequisite
** validator (OcdSoftwarePrereqs), which cross-checks them against the design's
** ingress rules; `tool`/`os` prerequisites are host-level and surfaced as manual
** checks. Later, additional entries can be contributed by registered
** `software-addon` GitHub sources.
*/

export type AnsibleSource = 'galaxy' | 'github'

export interface OcdSoftwarePrerequisite {
    /** Host-level tool the role expects to be present (e.g. 'python3', 'docker'). */
    tool: string
    minVersion?: string
    /** Inbound TCP ports the package listens on — validated against ingress rules. */
    ports?: number[]
    /** OS families the role supports (informational; image OS is not resolvable here). */
    os?: string[]
}

export interface OcdSoftwarePackage {
    id: string
    name: string
    vendor: string
    category: 'runtime' | 'web' | 'database' | 'observability' | 'ci-cd' | 'messaging' | 'security'
    tags: string[]
    description: string
    prerequisites: OcdSoftwarePrerequisite[]
    ansible: {
        source: AnsibleSource
        /** Galaxy role name (`namespace.role`) or `owner/repo` for GitHub. */
        ref: string
        /** The role to apply in the generated playbook. */
        role: string
    }
    defaultVars?: Record<string, unknown>
    /** Set on entries contributed by a registered `software-addon` source (its key). */
    addonSource?: string
}

const PY = { tool: 'python3', minVersion: '3.8' } as const
const LINUX = ['RHEL', 'OracleLinux', 'Ubuntu', 'Debian'] as const

/**
 * Seed catalogue. Roles are deliberately the widely-adopted `geerlingguy.*`
 * Galaxy roles (and a couple of upstream-owned roles) so the generated
 * automation is something operators already trust.
 */
export const OCD_SOFTWARE_CATALOG: readonly OcdSoftwarePackage[] = [
    {
        id: 'docker',
        name: 'Docker Engine',
        vendor: 'Docker',
        category: 'runtime',
        tags: ['container', 'runtime', 'oci'],
        description: 'Container runtime for building and running OCI images.',
        prerequisites: [{ ...PY }, { tool: 'systemd', os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'geerlingguy.docker', role: 'geerlingguy.docker' },
        defaultVars: { docker_install_compose: true },
    },
    {
        id: 'nginx',
        name: 'NGINX',
        vendor: 'F5 / NGINX',
        category: 'web',
        tags: ['web', 'reverse-proxy', 'load-balancer'],
        description: 'High-performance web server and reverse proxy.',
        prerequisites: [{ ...PY }, { tool: 'nginx', ports: [80, 443], os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'geerlingguy.nginx', role: 'geerlingguy.nginx' },
    },
    {
        id: 'postgresql',
        name: 'PostgreSQL',
        vendor: 'PostgreSQL Global Development Group',
        category: 'database',
        tags: ['database', 'sql', 'relational'],
        description: 'Object-relational SQL database server.',
        prerequisites: [{ ...PY }, { tool: 'postgresql', ports: [5432], os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'geerlingguy.postgresql', role: 'geerlingguy.postgresql' },
    },
    {
        id: 'mysql',
        name: 'MySQL',
        vendor: 'Oracle',
        category: 'database',
        tags: ['database', 'sql', 'relational'],
        description: 'Popular open-source relational database.',
        prerequisites: [{ ...PY }, { tool: 'mysql', ports: [3306], os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'geerlingguy.mysql', role: 'geerlingguy.mysql' },
    },
    {
        id: 'redis',
        name: 'Redis',
        vendor: 'Redis',
        category: 'database',
        tags: ['cache', 'key-value', 'in-memory'],
        description: 'In-memory data store used as cache, broker, and database.',
        prerequisites: [{ ...PY }, { tool: 'redis', ports: [6379], os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'geerlingguy.redis', role: 'geerlingguy.redis' },
    },
    {
        id: 'prometheus',
        name: 'Prometheus',
        vendor: 'CNCF',
        category: 'observability',
        tags: ['monitoring', 'metrics', 'tsdb'],
        description: 'Metrics collection and alerting time-series database.',
        prerequisites: [{ ...PY }, { tool: 'prometheus', ports: [9090], os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'prometheus.prometheus', role: 'prometheus.prometheus.prometheus' },
    },
    {
        id: 'node-exporter',
        name: 'Prometheus Node Exporter',
        vendor: 'CNCF',
        category: 'observability',
        tags: ['monitoring', 'metrics', 'host'],
        description: 'Exposes host-level hardware and OS metrics to Prometheus.',
        prerequisites: [{ ...PY }, { tool: 'node_exporter', ports: [9100], os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'prometheus.prometheus', role: 'prometheus.prometheus.node_exporter' },
    },
    {
        id: 'grafana',
        name: 'Grafana',
        vendor: 'Grafana Labs',
        category: 'observability',
        tags: ['dashboards', 'visualization', 'monitoring'],
        description: 'Analytics and dashboarding for metrics and logs.',
        prerequisites: [{ ...PY }, { tool: 'grafana', ports: [3000], os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'grafana.grafana', role: 'grafana.grafana.grafana' },
    },
    {
        id: 'jenkins',
        name: 'Jenkins',
        vendor: 'Jenkins / CD Foundation',
        category: 'ci-cd',
        tags: ['ci', 'cd', 'automation'],
        description: 'Automation server for building, testing, and deploying.',
        prerequisites: [{ ...PY }, { tool: 'java', minVersion: '17', ports: [8080], os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'geerlingguy.jenkins', role: 'geerlingguy.jenkins' },
    },
    {
        id: 'elasticsearch',
        name: 'Elasticsearch',
        vendor: 'Elastic',
        category: 'observability',
        tags: ['search', 'logs', 'analytics'],
        description: 'Distributed search and analytics engine.',
        prerequisites: [{ ...PY }, { tool: 'java', minVersion: '17', ports: [9200, 9300], os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'elastic.elasticsearch', role: 'elastic.elasticsearch' },
    },
    {
        id: 'kafka',
        name: 'Apache Kafka',
        vendor: 'Apache Software Foundation',
        category: 'messaging',
        tags: ['streaming', 'broker', 'events'],
        description: 'Distributed event streaming platform.',
        prerequisites: [{ ...PY }, { tool: 'java', minVersion: '17', ports: [9092], os: [...LINUX] }],
        ansible: { source: 'galaxy', ref: 'geerlingguy.kafka', role: 'geerlingguy.kafka' },
    },
    {
        id: 'vault',
        name: 'HashiCorp Vault',
        vendor: 'HashiCorp',
        category: 'security',
        tags: ['secrets', 'pki', 'encryption'],
        description: 'Secrets management, encryption, and identity-based access.',
        prerequisites: [{ ...PY }, { tool: 'vault', ports: [8200], os: [...LINUX] }],
        ansible: { source: 'github', ref: 'ansible-community/ansible-vault', role: 'ansible-vault' },
    },
]

/**
 * Compose the effective catalogue from the seed list plus packages contributed
 * by registered `software-addon` sources (already validated + id-namespaced by
 * OcdSoftwareAddon). Seed entries win on id collision; add-on entries keep their
 * stable order after the seed. Pass `[]` (the default) for the seed-only view.
 */
export function buildSoftwareCatalog(addonPackages: ReadonlyArray<OcdSoftwarePackage> = []): OcdSoftwarePackage[] {
    const byId = new Map<string, OcdSoftwarePackage>()
    for (const pkg of OCD_SOFTWARE_CATALOG) byId.set(pkg.id, pkg)
    for (const pkg of addonPackages) if (!byId.has(pkg.id)) byId.set(pkg.id, pkg)
    return [...byId.values()]
}

/** Lookup by id within a catalogue (defaults to the seed catalogue). */
export function findSoftwarePackage(
    id: string,
    catalog: ReadonlyArray<OcdSoftwarePackage> = OCD_SOFTWARE_CATALOG,
): OcdSoftwarePackage | undefined {
    return catalog.find((pkg) => pkg.id === id)
}

/**
 * Case-insensitive search across id, name, vendor, category, and tags. Empty
 * query returns the whole catalogue (stable order) so the UI can show
 * everything. Defaults to the seed catalogue; pass a composed catalogue (from
 * buildSoftwareCatalog) to include add-on packages.
 */
export function searchSoftwareCatalog(
    query: string,
    catalog: ReadonlyArray<OcdSoftwarePackage> = OCD_SOFTWARE_CATALOG,
): OcdSoftwarePackage[] {
    const q = query.trim().toLowerCase()
    if (!q) return [...catalog]
    return catalog.filter((pkg) =>
        [pkg.id, pkg.name, pkg.vendor, pkg.category, ...pkg.tags].some((field) => field.toLowerCase().includes(q)),
    )
}
