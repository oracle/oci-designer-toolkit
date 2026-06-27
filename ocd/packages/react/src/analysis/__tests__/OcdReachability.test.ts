/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Vitest specs for OcdReachability.evaluateReachability().
**
** Run with:  cd ocd && npm test
** (Vitest 3.x — no extra runner config needed beyond the existing workspace setup.)
**
** Tests cover pure logic only — no React, no DOM, no OCI API calls.
** Each test builds a minimal OcdDesign with only the fields relevant to the rule.
*/

import { describe, it, expect } from 'vitest'
import { evaluateReachability } from '../OcdReachability'
import type { GovernanceFinding } from '../../governance/OcdGovernanceChecks'
import type { OcdDesign } from '@ocd/model'

// ---------------------------------------------------------------------------
// Test helpers — mirrors OcdGovernanceChecks.test.ts style
// ---------------------------------------------------------------------------

/** Minimal valid OcdDesign skeleton — extend per-test by spreading. */
function baseDesign(ociResources: Record<string, unknown[]> = {}): OcdDesign {
    return {
        metadata: {
            ocdVersion: '0.0.0',
            ocdSchemaVersion: '0.0.0',
            ocdModelId: 'test-model',
            platform: 'oci',
            title: 'Test',
            documentation: '',
            created: '',
            updated: '',
            separateIdentity: false,
        },
        model: {
            oci: {
                tags: { freeformTags: {}, definedTags: {} },
                vars: [],
                resources: ociResources,
            },
            azure: { vars: [], resources: {} },
            google: { vars: [], resources: {} },
            general: { vars: [], resources: {} },
        },
        view: {
            id: 'view-test',
            pages: [],
        },
        userDefined: {},
    } as unknown as OcdDesign
}

function findingIds(findings: GovernanceFinding[]): string[] {
    return findings.map((f) => f.id.split('::')[0])
}

function requireFinding(findings: GovernanceFinding[], rulePrefix: string): GovernanceFinding {
    const f = findings.find((x) => x.id.startsWith(rulePrefix))
    expect(f, `Expected a ${rulePrefix} finding`).toBeDefined()
    return f!
}

// ---------------------------------------------------------------------------
// Shared fixture data
// ---------------------------------------------------------------------------

/** A route table with a 0.0.0.0/0 → IGW rule. */
const IGW_ID = 'igw-1'
const NATGW_ID = 'natgw-1'
const IGW_RT_ID = 'rt-igw'
const NATGW_RT_ID = 'rt-natgw'
const EMPTY_RT_ID = 'rt-empty'
const SL_ID = 'sl-1'
const SUBNET_PUB_ID = 'sn-pub'
const SUBNET_PRIV_ID = 'sn-priv'
const SUBNET_BARE_ID = 'sn-bare'

/** Route table with a default route pointing to igw-1. */
const igwRouteTable = {
    id: IGW_RT_ID,
    displayName: 'igw-rt',
    vcnId: 'vcn-1',
    routeRules: [
        { destination: '0.0.0.0/0', destinationType: 'CIDR_BLOCK', networkEntityId: IGW_ID },
    ],
}

/** Route table with a default route pointing to natgw-1. */
const natgwRouteTable = {
    id: NATGW_RT_ID,
    displayName: 'natgw-rt',
    vcnId: 'vcn-1',
    routeRules: [
        { destination: '0.0.0.0/0', destinationType: 'CIDR_BLOCK', networkEntityId: NATGW_ID },
    ],
}

/** Route table with no rules at all. */
const emptyRouteTable = {
    id: EMPTY_RT_ID,
    displayName: 'empty-rt',
    vcnId: 'vcn-1',
    routeRules: [],
}

const igwResource = { id: IGW_ID, displayName: 'igw', vcnId: 'vcn-1', enabled: true }
const natgwResource = { id: NATGW_ID, displayName: 'nat-gw', vcnId: 'vcn-1' }
const slResource = { id: SL_ID, displayName: 'sl', vcnId: 'vcn-1' }

/** Public subnet — prohibitPublicIpOnVnic=false, uses igw route table. */
const publicSubnet = {
    id: SUBNET_PUB_ID,
    displayName: 'pub-subnet',
    vcnId: 'vcn-1',
    cidrBlock: '10.0.1.0/24',
    prohibitPublicIpOnVnic: false,
    routeTableId: IGW_RT_ID,
    securityListIds: [SL_ID],
}

/** Private subnet — prohibitPublicIpOnVnic=true, uses natgw route table. */
const privateSubnet = {
    id: SUBNET_PRIV_ID,
    displayName: 'priv-subnet',
    vcnId: 'vcn-1',
    cidrBlock: '10.0.2.0/24',
    prohibitPublicIpOnVnic: true,
    routeTableId: NATGW_RT_ID,
    securityListIds: [SL_ID],
}

/** Subnet with no routeTableId (uses VCN default, not modelled). */
const bareSubnet = {
    id: SUBNET_BARE_ID,
    displayName: 'bare-subnet',
    vcnId: 'vcn-1',
    cidrBlock: '10.0.3.0/24',
    prohibitPublicIpOnVnic: true,
    routeTableId: '',
    securityListIds: [],
}

/** Full clean baseline: public + private subnet, both GWs, one SL. */
function cleanDesign(): OcdDesign {
    return baseDesign({
        internet_gateway: [igwResource],
        nat_gateway: [natgwResource],
        route_table: [igwRouteTable, natgwRouteTable],
        security_list: [slResource],
        subnet: [publicSubnet, privateSubnet],
    })
}

// ---------------------------------------------------------------------------
// REACH-01: Subnet has no egress route
// ---------------------------------------------------------------------------

describe('REACH-01 — subnet has no egress route', () => {
    it('flags a subnet whose route table has no default route', () => {
        const design = baseDesign({
            route_table: [emptyRouteTable],
            subnet: [
                {
                    id: 'sn-1',
                    displayName: 'Isolated Subnet',
                    routeTableId: EMPTY_RT_ID,
                    securityListIds: [],
                    prohibitPublicIpOnVnic: true,
                },
            ],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-01')
    })

    it('does not flag a subnet whose route table has a 0.0.0.0/0 rule', () => {
        const design = cleanDesign()
        // publicSubnet has igwRouteTable with a default rule → no REACH-01
        const findings = evaluateReachability(design)
        const reach01 = findings.filter((f) => f.id.startsWith('REACH-01'))
        expect(reach01).toHaveLength(0)
    })

    it('skips subnets with no routeTableId (VCN default is not modelled)', () => {
        const design = baseDesign({
            subnet: [bareSubnet],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).not.toContain('REACH-01')
    })

    it('finding has autoFixable=false and includes a terraform snippet', () => {
        const design = baseDesign({
            route_table: [emptyRouteTable],
            subnet: [{ id: 'sn-1', routeTableId: EMPTY_RT_ID, prohibitPublicIpOnVnic: true, securityListIds: [] }],
        })
        const findings = evaluateReachability(design)
        const finding = requireFinding(findings, 'REACH-01')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('route_rules')
        expect(finding.remediation!.summary).toBeTruthy()
        expect(finding.category).toBe('network')
    })
})

// ---------------------------------------------------------------------------
// REACH-02: Dangling route target
// ---------------------------------------------------------------------------

describe('REACH-02 — dangling route target', () => {
    it('flags a route table rule whose networkEntityId is absent from the design', () => {
        const rtWithDanglingRef = {
            id: 'rt-dangling',
            displayName: 'rt-dangling',
            vcnId: 'vcn-1',
            routeRules: [
                {
                    destination: '0.0.0.0/0',
                    destinationType: 'CIDR_BLOCK',
                    networkEntityId: 'igw-does-not-exist',
                },
            ],
        }
        const design = baseDesign({
            route_table: [rtWithDanglingRef],
            subnet: [{ id: 'sn-1', routeTableId: 'rt-dangling', prohibitPublicIpOnVnic: true, securityListIds: [] }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-02')
    })

    it('does not flag route rules whose networkEntityId resolves to a known gateway', () => {
        const design = cleanDesign()
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).not.toContain('REACH-02')
    })

    it('skips route rules with an empty networkEntityId', () => {
        const rtEmptyTarget = {
            id: 'rt-empty-target',
            vcnId: 'vcn-1',
            routeRules: [{ destination: '0.0.0.0/0', destinationType: 'CIDR_BLOCK', networkEntityId: '' }],
        }
        const design = baseDesign({ route_table: [rtEmptyTarget] })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).not.toContain('REACH-02')
    })

    it('finding is high severity with autoFixable=false and a terraform snippet', () => {
        const rtWithDanglingRef = {
            id: 'rt-d',
            displayName: 'rt-d',
            vcnId: 'vcn-1',
            routeRules: [{ destination: '10.1.0.0/16', destinationType: 'CIDR_BLOCK', networkEntityId: 'drg-ghost' }],
        }
        const design = baseDesign({ route_table: [rtWithDanglingRef] })
        const findings = evaluateReachability(design)
        const finding = requireFinding(findings, 'REACH-02')
        expect(finding.severity).toBe('high')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('network_entity_id')
    })
})

// ---------------------------------------------------------------------------
// REACH-03: Internet-reachable database
// ---------------------------------------------------------------------------

describe('REACH-03 — internet-reachable database', () => {
    it('flags an Autonomous Database in a subnet with an IGW default route', () => {
        const design = baseDesign({
            internet_gateway: [igwResource],
            route_table: [igwRouteTable],
            subnet: [publicSubnet],
            autonomous_database: [{ id: 'adb-1', displayName: 'ADB', subnetId: SUBNET_PUB_ID }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-03')
    })

    it('flags a MySQL DB System in a subnet with an IGW default route', () => {
        const design = baseDesign({
            internet_gateway: [igwResource],
            route_table: [igwRouteTable],
            subnet: [publicSubnet],
            mysql_db_system: [{ id: 'mysql-1', displayName: 'MySQL', subnetId: SUBNET_PUB_ID }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-03')
    })

    it('flags a DB System in a subnet with an IGW default route', () => {
        const design = baseDesign({
            internet_gateway: [igwResource],
            route_table: [igwRouteTable],
            subnet: [publicSubnet],
            db_system: [{ id: 'dbs-1', displayName: 'DBSystem', subnetId: SUBNET_PUB_ID }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-03')
    })

    it('does not flag a DB in a private subnet with a NAT GW route (no IGW)', () => {
        const design = baseDesign({
            internet_gateway: [igwResource],
            nat_gateway: [natgwResource],
            route_table: [igwRouteTable, natgwRouteTable],
            security_list: [slResource],
            subnet: [publicSubnet, privateSubnet],
            autonomous_database: [{ id: 'adb-2', displayName: 'PrivateADB', subnetId: SUBNET_PRIV_ID }],
        })
        const findings = evaluateReachability(design)
        const reach03 = findings.filter((f) => f.id.startsWith('REACH-03'))
        expect(reach03).toHaveLength(0)
    })

    it('does not flag a DB with no subnetId (handled by governance checks instead)', () => {
        const design = baseDesign({
            autonomous_database: [{ id: 'adb-no-subnet', displayName: 'Floating ADB', subnetId: '' }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).not.toContain('REACH-03')
    })

    it('finding is critical severity with autoFixable=false', () => {
        const design = baseDesign({
            internet_gateway: [igwResource],
            route_table: [igwRouteTable],
            subnet: [publicSubnet],
            db_system: [{ id: 'dbs-1', subnetId: SUBNET_PUB_ID }],
        })
        const findings = evaluateReachability(design)
        const finding = requireFinding(findings, 'REACH-03')
        expect(finding.severity).toBe('critical')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('prohibit_public_ip_on_vnic')
    })
})

// ---------------------------------------------------------------------------
// REACH-04: Public subnet hosts a database
// ---------------------------------------------------------------------------

describe('REACH-04 — database in public subnet', () => {
    it('flags an Autonomous Database in a subnet with prohibitPublicIpOnVnic=false', () => {
        const design = baseDesign({
            subnet: [publicSubnet],
            autonomous_database: [{ id: 'adb-1', displayName: 'ADB', subnetId: SUBNET_PUB_ID }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-04')
    })

    it('flags a MySQL DB System in a public subnet', () => {
        const design = baseDesign({
            subnet: [publicSubnet],
            mysql_db_system: [{ id: 'mysql-1', displayName: 'MySQL', subnetId: SUBNET_PUB_ID }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-04')
    })

    it('flags a DB System in a public subnet', () => {
        const design = baseDesign({
            subnet: [publicSubnet],
            db_system: [{ id: 'dbs-1', displayName: 'DBSystem', subnetId: SUBNET_PUB_ID }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-04')
    })

    it('does not flag a DB in a private subnet (prohibitPublicIpOnVnic=true)', () => {
        const design = baseDesign({
            subnet: [privateSubnet],
            autonomous_database: [{ id: 'adb-priv', displayName: 'PrivADB', subnetId: SUBNET_PRIV_ID }],
        })
        const findings = evaluateReachability(design)
        const reach04 = findings.filter((f) => f.id.startsWith('REACH-04'))
        expect(reach04).toHaveLength(0)
    })

    it('does not flag a DB with no subnetId', () => {
        const design = baseDesign({
            autonomous_database: [{ id: 'adb-bare', subnetId: '' }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).not.toContain('REACH-04')
    })

    it('finding is high severity with autoFixable=false and a terraform snippet', () => {
        const design = baseDesign({
            subnet: [publicSubnet],
            db_system: [{ id: 'dbs-1', subnetId: SUBNET_PUB_ID }],
        })
        const findings = evaluateReachability(design)
        const finding = requireFinding(findings, 'REACH-04')
        expect(finding.severity).toBe('high')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('prohibit_public_ip_on_vnic')
    })
})

// ---------------------------------------------------------------------------
// REACH-05: Subnet references missing route table or security list
// ---------------------------------------------------------------------------

describe('REACH-05 — subnet missing references', () => {
    it('flags a subnet with a routeTableId pointing at an absent route table', () => {
        const design = baseDesign({
            subnet: [{
                id: 'sn-missing-rt',
                displayName: 'Orphan Subnet',
                routeTableId: 'rt-ghost',
                securityListIds: [],
                prohibitPublicIpOnVnic: true,
            }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-05-RT')
    })

    it('flags a subnet with a securityListIds entry pointing at an absent security list', () => {
        const design = baseDesign({
            route_table: [natgwRouteTable],
            subnet: [{
                id: 'sn-missing-sl',
                displayName: 'Subnet Missing SL',
                routeTableId: NATGW_RT_ID,
                securityListIds: ['sl-ghost'],
                prohibitPublicIpOnVnic: true,
            }],
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-05-SL')
    })

    it('does not flag a subnet whose references are all present', () => {
        const design = cleanDesign()
        const findings = evaluateReachability(design)
        const reach05 = findings.filter((f) => f.id.startsWith('REACH-05'))
        expect(reach05).toHaveLength(0)
    })

    it('does not flag a subnet with an empty routeTableId (not set)', () => {
        const design = baseDesign({
            subnet: [bareSubnet], // routeTableId: ''
        })
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).not.toContain('REACH-05-RT')
    })

    it('flags multiple missing security list refs on the same subnet', () => {
        const design = baseDesign({
            route_table: [natgwRouteTable],
            subnet: [{
                id: 'sn-multi',
                routeTableId: NATGW_RT_ID,
                securityListIds: ['sl-ghost-1', 'sl-ghost-2'],
                prohibitPublicIpOnVnic: true,
            }],
        })
        const findings = evaluateReachability(design)
        const slFindings = findings.filter((f) => f.id.startsWith('REACH-05-SL'))
        expect(slFindings.length).toBeGreaterThanOrEqual(2)
    })

    it('finding has autoFixable=false and includes a terraform snippet', () => {
        const design = baseDesign({
            subnet: [{ id: 'sn-1', routeTableId: 'rt-ghost', securityListIds: [], prohibitPublicIpOnVnic: true }],
        })
        const findings = evaluateReachability(design)
        const finding = requireFinding(findings, 'REACH-05-RT')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('oci_core_route_table')
    })
})

// ---------------------------------------------------------------------------
// Clean design — no findings
// ---------------------------------------------------------------------------

describe('evaluateReachability — clean design yields no reachability findings', () => {
    it('returns no REACH-xx findings for a well-structured design', () => {
        const design = cleanDesign()
        const findings = evaluateReachability(design)
        const reachFindings = findings.filter((f) => f.id.startsWith('REACH-'))
        expect(reachFindings).toHaveLength(0)
    })
})

// ---------------------------------------------------------------------------
// Edge cases — graceful on partial / empty / null designs
// ---------------------------------------------------------------------------

describe('evaluateReachability — edge cases', () => {
    it('returns [] for a null design', () => {
        // @ts-expect-error — intentional bad input test
        expect(evaluateReachability(null)).toEqual([])
    })

    it('returns [] for an empty object', () => {
        // @ts-expect-error — intentional bad input test
        expect(evaluateReachability({})).toEqual([])
    })

    it('returns [] for a design with empty oci.resources', () => {
        const design = baseDesign({})
        expect(evaluateReachability(design)).toEqual([])
    })

    it('does not throw when resource arrays contain unexpected shapes', () => {
        const design = baseDesign({
            subnet: [{ id: 'sn-weird' }], // missing most fields
            route_table: [{ id: 'rt-weird' }],
        })
        expect(() => evaluateReachability(design)).not.toThrow()
    })

    it('never throws on a design with only dangling ids', () => {
        const design = baseDesign({
            subnet: [{
                id: 'sn-all-dangling',
                routeTableId: 'rt-missing',
                securityListIds: ['sl-missing'],
                prohibitPublicIpOnVnic: false,
            }],
            autonomous_database: [{ id: 'adb-dangling', subnetId: 'sn-missing' }],
        })
        expect(() => evaluateReachability(design)).not.toThrow()
        // Should produce REACH-05-RT finding for the dangling RT ref
        const findings = evaluateReachability(design)
        expect(findingIds(findings)).toContain('REACH-05-RT')
    })
})
