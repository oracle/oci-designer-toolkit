/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Prerequisite validator for the Software & Ansible Provisioning module
** (blueprint phase 2). Cross-checks each selected package's declared
** prerequisites against the design and reports blockers/warnings/manual checks,
** mirroring the AI Architect's severity-tagged finding style.
**
** Port prerequisites are the one signal reliably derivable from a design: a
** package's listen ports are matched against open TCP INGRESS rules (both
** standalone NSG security rules and embedded security_list ingress rules). A
** port with no covering ingress rule is a WARNING (the workload would install
** but be unreachable). `tool`/`os` prerequisites are host-level — they cannot be
** seen in OCI resource state — so they are emitted as MANUAL checks, never
** false-positive blockers.
*/

import { OcdSoftwarePackage } from './OcdSoftwareCatalog'

export type PrereqSeverity = 'blocker' | 'warning' | 'manual' | 'ok'

export interface PrereqFinding {
    packageId: string
    severity: PrereqSeverity
    message: string
}

export interface PrereqReport {
    findings: PrereqFinding[]
    /** True when nothing is a hard blocker (warnings/manual checks still allowed). */
    installable: boolean
}

type AnyResource = Record<string, any>
type ResourceBag = Record<string, any[]> | undefined
interface DesignLike {
    model?: { oci?: { resources?: ResourceBag } }
}

const TCP_PROTOCOLS = new Set(['6', 'all', 'ALL', '*'])

const list = (resources: ResourceBag, key: string): any[] =>
    Array.isArray(resources?.[key]) ? (resources as Record<string, any[]>)[key] : []

const portRange = (rule: AnyResource): { min: number; max: number } | undefined => {
    const range = rule?.tcp_options?.destination_port_range ?? rule?.tcpOptions?.destinationPortRange
    if (!range) return undefined
    const min = Number(range.min)
    const max = Number(range.max ?? range.min)
    if (Number.isNaN(min) || Number.isNaN(max)) return undefined
    return { min, max }
}

const isTcpIngress = (rule: AnyResource, direction?: string): boolean => {
    const protocol = String(rule?.protocol ?? '')
    if (!TCP_PROTOCOLS.has(protocol)) return false
    // Standalone NSG rules carry their own direction; embedded security-list
    // ingress rules are already ingress-only, so a missing direction is ingress.
    const dir = (direction ?? rule?.direction ?? 'INGRESS').toUpperCase()
    return dir === 'INGRESS'
}

/**
 * Collect every open inbound TCP port range across the design. A protocol of
 * `all`/`*` opens every port, represented as a 1-65535 range.
 */
function openIngressRanges(design: DesignLike): Array<{ min: number; max: number }> {
    const resources = design?.model?.oci?.resources
    const ranges: Array<{ min: number; max: number }> = []

    const collect = (rule: AnyResource, direction?: string) => {
        if (!isTcpIngress(rule, direction)) return
        if (String(rule?.protocol) !== '6') {
            ranges.push({ min: 1, max: 65535 }) // `all` opens everything
            return
        }
        const range = portRange(rule)
        ranges.push(range ?? { min: 1, max: 65535 }) // TCP with no port range = all TCP ports
    }

    for (const rule of list(resources, 'network_security_group_security_rule')) collect(rule, rule?.direction)
    for (const sl of list(resources, 'security_list')) {
        const ingress = Array.isArray(sl?.ingress_security_rules) ? sl.ingress_security_rules : []
        for (const rule of ingress) collect(rule, 'INGRESS')
    }
    return ranges
}

const portIsOpen = (port: number, ranges: Array<{ min: number; max: number }>): boolean =>
    ranges.some((r) => port >= r.min && port <= r.max)

const designHasInstances = (design: DesignLike): boolean =>
    list(design?.model?.oci?.resources, 'instance').length > 0

/**
 * Validate the prerequisites of the selected packages against the design.
 * Returns severity-tagged findings; `installable` is false only when a hard
 * blocker is present (currently: selecting a port-listening package when the
 * design contains no compute instance to install onto).
 */
export function validateSoftwarePrerequisites(
    design: DesignLike,
    packages: ReadonlyArray<OcdSoftwarePackage>,
): PrereqReport {
    const ranges = openIngressRanges(design)
    const hasInstances = designHasInstances(design)
    const findings: PrereqFinding[] = []

    for (const pkg of packages) {
        const declaredPorts = pkg.prerequisites.flatMap((p) => p.ports ?? [])

        if (!hasInstances) {
            findings.push({
                packageId: pkg.id,
                severity: 'blocker',
                message: `No compute instance in the design to install ${pkg.name} onto. Add an instance before provisioning.`,
            })
        }

        for (const port of declaredPorts) {
            findings.push(
                portIsOpen(port, ranges)
                    ? { packageId: pkg.id, severity: 'ok', message: `Ingress to ${pkg.name} port ${port} is allowed.` }
                    : {
                          packageId: pkg.id,
                          severity: 'warning',
                          message: `${pkg.name} listens on TCP ${port}, but no ingress rule allows it — the service would be unreachable.`,
                      },
            )
        }

        const tools = pkg.prerequisites.map((p) => p.tool).filter(Boolean)
        if (tools.length > 0) {
            findings.push({
                packageId: pkg.id,
                severity: 'manual',
                message: `Ensure host prerequisites are met on the target hosts: ${tools.join(', ')}.`,
            })
        }
    }

    return { findings, installable: !findings.some((f) => f.severity === 'blocker') }
}
