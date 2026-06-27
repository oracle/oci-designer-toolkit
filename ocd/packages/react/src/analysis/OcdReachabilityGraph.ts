/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Reachability graph algorithm.
**
** Holds the pure graph-construction (DesignMaps / buildMaps) and the individual
** reachability rule implementations (REACH-01 … REACH-05). The orchestration
** that runs these rules lives in OcdReachability.evaluateReachability().
**
** Extracted verbatim from OcdReachability — no behavioural changes. Only fields
** confirmed in generated model interfaces are referenced. No live OCI API
** calls; reads only design.model.oci.resources.
*/

import { OcdDesign } from '@ocd/model'
import {
    GovernanceFinding,
    GovernanceSeverity,
    GovernanceCategory,
} from '../governance/OcdGovernanceChecks'

// ---------------------------------------------------------------------------
// Internal helpers (mirrors the style in OcdGovernanceChecks.ts)
// ---------------------------------------------------------------------------

function resourceList(design: OcdDesign, key: string): Record<string, unknown>[] {
    const resources = design?.model?.oci?.resources
    if (!resources) return []
    const list = resources[key]
    return Array.isArray(list) ? (list as Record<string, unknown>[]) : []
}

function str(v: unknown): string {
    return typeof v === 'string' ? v : ''
}

function bool(v: unknown): boolean {
    return v === true
}

function arr(v: unknown): unknown[] {
    return Array.isArray(v) ? v : []
}

function resourceName(resource: Record<string, unknown>): string {
    return str(resource.displayName) || str(resource.id)
}

function findingId(ruleId: string, resourceId: unknown): string {
    return `${ruleId}::${String(resourceId ?? 'global')}`
}

// ---------------------------------------------------------------------------
// Build lookup maps once per evaluateReachability call
// ---------------------------------------------------------------------------

export interface DesignMaps {
    /** id → route table resource */
    routeTableById: Map<string, Record<string, unknown>>
    /** id → internet gateway resource */
    igwById: Map<string, Record<string, unknown>>
    /** id → NAT gateway resource */
    natgwById: Map<string, Record<string, unknown>>
    /** id → service gateway resource */
    sgwById: Map<string, Record<string, unknown>>
    /** id → DRG resource */
    drgById: Map<string, Record<string, unknown>>
    /** id → security list resource */
    securityListById: Map<string, Record<string, unknown>>
    /** Set of all gateway ids present in the design */
    allGatewayIds: Set<string>
}

export function buildMaps(design: OcdDesign): DesignMaps {
    function toMap(key: string): Map<string, Record<string, unknown>> {
        const m = new Map<string, Record<string, unknown>>()
        for (const r of resourceList(design, key)) {
            const id = str(r.id)
            if (id) m.set(id, r)
        }
        return m
    }

    const igwById = toMap('internet_gateway')
    const natgwById = toMap('nat_gateway')
    const sgwById = toMap('service_gateway')
    const drgById = toMap('drg')

    const allGatewayIds = new Set<string>([
        ...igwById.keys(),
        ...natgwById.keys(),
        ...sgwById.keys(),
        ...drgById.keys(),
    ])

    return {
        routeTableById: toMap('route_table'),
        igwById,
        natgwById,
        sgwById,
        drgById,
        securityListById: toMap('security_list'),
        allGatewayIds,
    }
}

// ---------------------------------------------------------------------------
// Route-rule helpers
// ---------------------------------------------------------------------------

/** Returns the route rules array for a route table resource (or []). */
function routeRules(rt: Record<string, unknown>): Record<string, unknown>[] {
    return arr(rt.routeRules).map((r) => r as Record<string, unknown>)
}

/**
 * Returns true when a route table has at least one default-route rule
 * (destination 0.0.0.0/0 or ::/0) pointing at ANY gateway.
 */
function hasDefaultRoute(rt: Record<string, unknown>): boolean {
    return routeRules(rt).some((rule) => {
        const dest = str(rule.destination)
        return dest === '0.0.0.0/0' || dest === '::/0'
    })
}

/**
 * Returns true when a route table has at least one default-route rule
 * (destination 0.0.0.0/0 or ::/0) whose networkEntityId resolves to an IGW.
 */
function hasDefaultRouteToIgw(
    rt: Record<string, unknown>,
    igwById: Map<string, Record<string, unknown>>,
): boolean {
    return routeRules(rt).some((rule) => {
        const dest = str(rule.destination)
        const isDefault = dest === '0.0.0.0/0' || dest === '::/0'
        return isDefault && igwById.has(str(rule.networkEntityId))
    })
}

// ---------------------------------------------------------------------------
// Rule implementations
// ---------------------------------------------------------------------------

/**
 * REACH-01: Subnet has no egress route.
 *
 * A subnet whose route table (if set) has no default route (0.0.0.0/0 or ::/0)
 * to any gateway cannot reach the internet or OCI services.  This may be
 * intentional for fully isolated subnets, so severity is 'low'.
 *
 * Subnets without a routeTableId are skipped (OCI applies the VCN's default
 * route table which is managed outside the design).
 *
 * Fields used:
 *   OciSubnet.routeTableId
 *   OciRouteTable.routeRules[].destination, .networkEntityId
 */
function checkSubnetNoEgressRoute(
    design: OcdDesign,
    maps: DesignMaps,
): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const subnet of resourceList(design, 'subnet')) {
        const rtId = str(subnet.routeTableId)
        if (!rtId) continue // No explicit RT — relies on VCN default; skip.
        const rt = maps.routeTableById.get(rtId)
        if (!rt) continue // Dangling RT ref — caught by REACH-05.
        if (!hasDefaultRoute(rt)) {
            findings.push({
                id: findingId('REACH-01', subnet.id),
                severity: 'low' as GovernanceSeverity,
                category: 'network' as GovernanceCategory,
                title: 'Subnet has no egress route (no default route in its route table)',
                message:
                    `Subnet "${resourceName(subnet)}" references route table "${resourceName(rt)}" ` +
                    'which has no 0.0.0.0/0 or ::/0 rule. Resources in this subnet cannot reach ' +
                    'the internet or OCI services (OSN, Object Storage) unless a more-specific ' +
                    'route is present. If isolation is intentional, suppress this finding.',
                resourceId: str(subnet.id),
                resourceName: resourceName(subnet),
                remediation: {
                    summary:
                        'Add a default route (0.0.0.0/0) to the route table pointing at an ' +
                        'Internet Gateway (public subnet) or NAT Gateway (private subnet). ' +
                        'For OCI service access only, add a service CIDR route to a Service Gateway.',
                    terraform: `resource "oci_core_route_table" "example" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    # For private subnets use nat_gateway; for public use internet_gateway:
    network_entity_id = oci_core_nat_gateway.main.id
  }
}`,
                    autoFixable: false,
                },
            })
        }
    }
    return findings
}

/**
 * REACH-02: Dangling route target.
 *
 * A route rule whose networkEntityId does not resolve to any known gateway
 * (IGW / NAT GW / Service GW / DRG) in this design means the route is broken.
 * Packets sent to that destination will be dropped.
 *
 * Fields used:
 *   OciRouteTable.routeRules[].networkEntityId, .destination
 */
function checkDanglingRouteTarget(
    design: OcdDesign,
    maps: DesignMaps,
): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const rt of resourceList(design, 'route_table')) {
        for (const rule of routeRules(rt)) {
            const targetId = str(rule.networkEntityId)
            if (!targetId) continue // Empty target — treat as not-yet-configured; skip.
            if (!maps.allGatewayIds.has(targetId)) {
                findings.push({
                    id: findingId('REACH-02', `${str(rt.id)}::${targetId}`),
                    severity: 'high' as GovernanceSeverity,
                    category: 'network' as GovernanceCategory,
                    title: 'Route rule references a gateway not present in the design',
                    message:
                        `Route table "${resourceName(rt)}" has a rule for destination ` +
                        `"${str(rule.destination)}" whose networkEntityId "${targetId}" does not ` +
                        'match any Internet Gateway, NAT Gateway, Service Gateway, or DRG in this design. ' +
                        'Traffic matching this route will be black-holed.',
                    resourceId: str(rt.id),
                    resourceName: resourceName(rt),
                    remediation: {
                        summary:
                            'Either add the missing gateway resource to the design, or correct the ' +
                            'networkEntityId in the route rule to reference an existing gateway. ' +
                            'The correct gateway depends on your topology.',
                        terraform: `# Ensure the gateway exists and reference its id:
resource "oci_core_nat_gateway" "main" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "nat-gw"
}

resource "oci_core_route_table" "example" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.main.id  # Resolved gateway
  }
}`,
                        autoFixable: false,
                    },
                })
            }
        }
    }
    return findings
}

/**
 * REACH-03: Internet-reachable database.
 *
 * A DB / ADB / MySQL resource placed in a subnet whose route table has a
 * 0.0.0.0/0 route pointing at an Internet Gateway means that database is
 * routable to/from the internet — a critical exposure.
 *
 * Fields used:
 *   OciAutonomousDatabase.subnetId
 *   OciMysqlDbSystem.subnetId
 *   OciDbSystem.subnetId
 *   OciSubnet.routeTableId
 *   OciRouteTable.routeRules[].destination, .networkEntityId
 */
function checkInternetReachableDatabase(
    design: OcdDesign,
    maps: DesignMaps,
): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []

    // Build a map of subnet id → route table for fast lookup
    const subnetToRt = new Map<string, Record<string, unknown>>()
    for (const subnet of resourceList(design, 'subnet')) {
        const rtId = str(subnet.routeTableId)
        if (!rtId) continue
        const rt = maps.routeTableById.get(rtId)
        if (rt) subnetToRt.set(str(subnet.id), rt)
    }

    const DB_RESOURCE_KEYS: ReadonlyArray<[string, string]> = [
        ['autonomous_database', 'Autonomous Database'],
        ['mysql_db_system', 'MySQL DB System'],
        ['db_system', 'DB System'],
    ]

    for (const [key, label] of DB_RESOURCE_KEYS) {
        for (const db of resourceList(design, key)) {
            const subnetId = str(db.subnetId)
            if (!subnetId) continue // No subnet — checked by governance GOV-DB-01/-02.
            const rt = subnetToRt.get(subnetId)
            if (!rt) continue
            if (hasDefaultRouteToIgw(rt, maps.igwById)) {
                findings.push({
                    id: findingId('REACH-03', db.id),
                    severity: 'critical' as GovernanceSeverity,
                    category: 'network' as GovernanceCategory,
                    title: `${label} is internet-reachable via its subnet's route table`,
                    message:
                        `${label} "${resourceName(db)}" sits in a subnet whose route table ` +
                        '(id: ' + str(rt.id) + ') has a 0.0.0.0/0 route to an Internet Gateway. ' +
                        'This makes the database routable from the internet. ' +
                        'Move the database to a private subnet (route via NAT Gateway or no default route).',
                    resourceId: str(db.id),
                    resourceName: resourceName(db),
                    remediation: {
                        summary:
                            'Move the database to a dedicated private subnet. Remove the 0.0.0.0/0 → IGW route ' +
                            'from that subnet\'s route table, or replace it with a route to a NAT Gateway. ' +
                            'This change requires redesigning the subnet topology.',
                        terraform: `# Place the database in a subnet with only a NAT gateway default route:
resource "oci_core_route_table" "private_db_rt" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.main.id  # NAT, not IGW
  }
}

resource "oci_core_subnet" "private_db" {
  compartment_id            = var.compartment_id
  vcn_id                    = oci_core_vcn.main.id
  cidr_block                = "10.0.10.0/24"
  prohibit_public_ip_on_vnic = true
  route_table_id            = oci_core_route_table.private_db_rt.id
}`,
                        autoFixable: false,
                    },
                })
            }
        }
    }
    return findings
}

/**
 * REACH-04: Public subnet hosts a database.
 *
 * A database resource placed in a subnet that does NOT prohibit public IPs
 * (prohibitPublicIpOnVnic = false) means compute in that subnet can be assigned
 * public IPs.  Databases should always be in subnets with
 * prohibitPublicIpOnVnic = true.
 *
 * Fields used:
 *   OciAutonomousDatabase.subnetId
 *   OciMysqlDbSystem.subnetId
 *   OciDbSystem.subnetId
 *   OciSubnet.prohibitPublicIpOnVnic
 */
function checkDatabaseInPublicSubnet(
    design: OcdDesign,
): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []

    // Build subnet id → subnet resource map
    const subnetById = new Map<string, Record<string, unknown>>()
    for (const subnet of resourceList(design, 'subnet')) {
        const id = str(subnet.id)
        if (id) subnetById.set(id, subnet)
    }

    const DB_RESOURCE_KEYS: ReadonlyArray<[string, string]> = [
        ['autonomous_database', 'Autonomous Database'],
        ['mysql_db_system', 'MySQL DB System'],
        ['db_system', 'DB System'],
    ]

    for (const [key, label] of DB_RESOURCE_KEYS) {
        for (const db of resourceList(design, key)) {
            const subnetId = str(db.subnetId)
            if (!subnetId) continue
            const subnet = subnetById.get(subnetId)
            if (!subnet) continue
            // prohibitPublicIpOnVnic=false (or unset/undefined) → public subnet
            if (!bool(subnet.prohibitPublicIpOnVnic)) {
                findings.push({
                    id: findingId('REACH-04', db.id),
                    severity: 'high' as GovernanceSeverity,
                    category: 'network' as GovernanceCategory,
                    title: `${label} is placed in a subnet that allows public IPs`,
                    message:
                        `${label} "${resourceName(db)}" is in subnet "${resourceName(subnet)}" ` +
                        '(prohibitPublicIpOnVnic = false). Databases must be placed in private subnets ' +
                        'where public IP assignment is prohibited to prevent direct internet exposure.',
                    resourceId: str(db.id),
                    resourceName: resourceName(db),
                    remediation: {
                        summary:
                            'Move the database to a subnet with prohibitPublicIpOnVnic = true, ' +
                            'or set prohibitPublicIpOnVnic to true on the current subnet ' +
                            '(note: changing an existing subnet affects all VNICs in it).',
                        terraform: `resource "oci_core_subnet" "private_db" {
  compartment_id            = var.compartment_id
  vcn_id                    = oci_core_vcn.main.id
  cidr_block                = "10.0.10.0/24"
  prohibit_public_ip_on_vnic = true   # Private subnet
  route_table_id            = oci_core_route_table.private_db_rt.id
}`,
                        autoFixable: false,
                    },
                })
            }
        }
    }
    return findings
}

/**
 * REACH-05: Subnet references a missing route table or security list.
 *
 * If a subnet's routeTableId or securityListIds reference resources that do
 * not exist in the design, the design is inconsistent.
 *
 * Fields used:
 *   OciSubnet.routeTableId
 *   OciSubnet.securityListIds
 */
function checkSubnetMissingReferences(
    design: OcdDesign,
    maps: DesignMaps,
): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const subnet of resourceList(design, 'subnet')) {
        // Check route table reference
        const rtId = str(subnet.routeTableId)
        if (rtId && !maps.routeTableById.has(rtId)) {
            findings.push({
                id: findingId('REACH-05-RT', subnet.id),
                severity: 'medium' as GovernanceSeverity,
                category: 'network' as GovernanceCategory,
                title: 'Subnet references a route table not present in the design',
                message:
                    `Subnet "${resourceName(subnet)}" has routeTableId "${rtId}" which does not ` +
                    'resolve to any route table in this design. The subnet\'s routing behaviour is undefined.',
                resourceId: str(subnet.id),
                resourceName: resourceName(subnet),
                remediation: {
                    summary:
                        'Add the missing route table resource to the design, or update the subnet\'s ' +
                        'routeTableId to reference an existing route table.',
                    terraform: `resource "oci_core_route_table" "example" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "private-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.main.id
  }
}

resource "oci_core_subnet" "example" {
  # ... other attributes ...
  route_table_id = oci_core_route_table.example.id
}`,
                    autoFixable: false,
                },
            })
        }

        // Check each security list reference
        for (const slId of arr(subnet.securityListIds).map(str)) {
            if (slId && !maps.securityListById.has(slId)) {
                findings.push({
                    id: findingId('REACH-05-SL', `${str(subnet.id)}::${slId}`),
                    severity: 'medium' as GovernanceSeverity,
                    category: 'network' as GovernanceCategory,
                    title: 'Subnet references a security list not present in the design',
                    message:
                        `Subnet "${resourceName(subnet)}" references security list id "${slId}" ` +
                        'which does not exist in this design. Traffic rules for this subnet may be incomplete.',
                    resourceId: str(subnet.id),
                    resourceName: resourceName(subnet),
                    remediation: {
                        summary:
                            'Add the missing security list resource to the design, or remove the stale ' +
                            'id from the subnet\'s securityListIds.',
                        terraform: `resource "oci_core_security_list" "example" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "private-sl"
}

resource "oci_core_subnet" "example" {
  # ... other attributes ...
  security_list_ids = [oci_core_security_list.example.id]
}`,
                        autoFixable: false,
                    },
                })
            }
        }
    }
    return findings
}

// ---------------------------------------------------------------------------
// Rule registry
// ---------------------------------------------------------------------------

export type ReachabilityRule = (design: OcdDesign, maps: DesignMaps) => GovernanceFinding[]

/** Wraps REACH-04 which does not need the gateway maps (a 1-arg fn satisfies ReachabilityRule). */
function checkDatabaseInPublicSubnetRule(design: OcdDesign): GovernanceFinding[] {
    return checkDatabaseInPublicSubnet(design)
}

export const REACHABILITY_RULES: ReadonlyArray<ReachabilityRule> = [
    checkSubnetNoEgressRoute,
    checkDanglingRouteTarget,
    checkInternetReachableDatabase,
    checkDatabaseInPublicSubnetRule,
    checkSubnetMissingReferences,
]
