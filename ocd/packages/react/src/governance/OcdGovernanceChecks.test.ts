/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Vitest specs for OcdGovernanceChecks.evaluateGovernance() and applyRemediation().
**
** Run with:  cd ocd && npm test
** (Vitest 3.x — no extra runner config needed beyond the existing workspace setup.)
**
** Tests cover pure logic only — no React, no DOM, no OCI API calls.
** Each test builds a minimal OcdDesign with only the fields relevant to the rule.
*/

import { describe, it, expect } from 'vitest'
import { evaluateGovernance, applyRemediation, GovernanceFinding } from './OcdGovernanceChecks'
import type { OcdDesign } from '@ocd/model'

// ---------------------------------------------------------------------------
// Test helpers
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

/** Retrieve the finding for a specific rule prefix, assert it exists, and return it. */
function requireFinding(findings: GovernanceFinding[], rulePrefix: string): GovernanceFinding {
    const f = findings.find((x) => x.id.startsWith(rulePrefix))
    expect(f, `Expected a ${rulePrefix} finding`).toBeDefined()
    return f!
}

// ---------------------------------------------------------------------------
// GOV-NET-01: Public subnets
// ---------------------------------------------------------------------------

describe('GOV-NET-01 — public subnets', () => {
    it('flags a subnet where prohibitPublicIpOnVnic is false', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1', displayName: 'Root' }],
            subnet: [{ id: 'sn-1', displayName: 'Public Subnet', prohibitPublicIpOnVnic: false }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).toContain('GOV-NET-01')
    })

    it('does not flag a subnet where prohibitPublicIpOnVnic is true', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1', displayName: 'Root' }],
            subnet: [{ id: 'sn-2', displayName: 'Private Subnet', prohibitPublicIpOnVnic: true }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).not.toContain('GOV-NET-01')
    })

    it('finding has remediation with autoFixable=true and a terraform snippet', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            subnet: [{ id: 'sn-1', prohibitPublicIpOnVnic: false }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-NET-01')
        expect(finding.remediation).toBeDefined()
        expect(finding.remediation!.autoFixable).toBe(true)
        expect(finding.remediation!.terraform).toContain('prohibit_public_ip_on_vnic')
        expect(finding.remediation!.summary).toBeTruthy()
    })
})

// ---------------------------------------------------------------------------
// GOV-NET-02: Security List 0.0.0.0/0 ingress
// ---------------------------------------------------------------------------

describe('GOV-NET-02 — security list open ingress', () => {
    it('flags a security list with a 0.0.0.0/0 ingress rule', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            security_list: [{
                id: 'sl-1',
                displayName: 'Open SL',
                ingressSecurityRules: [{ source: '0.0.0.0/0', protocol: '6' }],
            }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).toContain('GOV-NET-02')
    })

    it('flags a security list with an ::/0 ingress rule', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            security_list: [{
                id: 'sl-2',
                displayName: 'IPv6 Open SL',
                ingressSecurityRules: [{ source: '::/0', protocol: '6' }],
            }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).toContain('GOV-NET-02')
    })

    it('does not flag a security list with restricted ingress', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            security_list: [{
                id: 'sl-3',
                displayName: 'Restricted SL',
                ingressSecurityRules: [{ source: '10.0.0.0/16', protocol: '6' }],
            }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).not.toContain('GOV-NET-02')
    })

    it('finding has autoFixable=false (ingress rule restriction requires human judgment)', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            security_list: [{
                id: 'sl-1',
                ingressSecurityRules: [{ source: '0.0.0.0/0', protocol: '6' }],
            }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-NET-02')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('ingress_security_rules')
    })
})

// ---------------------------------------------------------------------------
// GOV-NET-03: NSG rule 0.0.0.0/0
// ---------------------------------------------------------------------------

describe('GOV-NET-03 — NSG open ingress', () => {
    it('flags an INGRESS NSG rule sourced from 0.0.0.0/0', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            network_security_group_security_rule: [{
                id: 'nsg-rule-1',
                displayName: 'Open NSG Rule',
                direction: 'INGRESS',
                source: '0.0.0.0/0',
                protocol: '6',
            }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).toContain('GOV-NET-03')
    })

    it('does not flag an EGRESS NSG rule with 0.0.0.0/0 as destination', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            network_security_group_security_rule: [{
                id: 'nsg-rule-2',
                displayName: 'Egress Rule',
                direction: 'EGRESS',
                source: '0.0.0.0/0',
                protocol: '6',
            }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).not.toContain('GOV-NET-03')
    })

    it('finding has autoFixable=false', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            network_security_group_security_rule: [{
                id: 'nsg-rule-1',
                direction: 'INGRESS',
                source: '0.0.0.0/0',
                protocol: '6',
            }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-NET-03')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('CIDR_BLOCK')
    })
})

// ---------------------------------------------------------------------------
// GOV-STG-01: Public Object Storage bucket
// ---------------------------------------------------------------------------

describe('GOV-STG-01 — public buckets', () => {
    it('raises critical severity for ObjectRead bucket', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            bucket: [{ id: 'bkt-1', displayName: 'Public Bucket', accessType: 'ObjectRead' }],
        })
        const findings = evaluateGovernance(design)
        const finding = findings.find((f) => f.id.startsWith('GOV-STG-01'))
        expect(finding).toBeDefined()
        expect(finding?.severity).toBe('critical')
    })

    it('raises medium severity for unset accessType', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            bucket: [{ id: 'bkt-2', displayName: 'Unset Bucket', accessType: '' }],
        })
        const findings = evaluateGovernance(design)
        const finding = findings.find((f) => f.id.startsWith('GOV-STG-01'))
        expect(finding).toBeDefined()
        expect(finding?.severity).toBe('medium')
    })

    it('does not flag a NoPublicAccess bucket', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            bucket: [{ id: 'bkt-3', displayName: 'Private Bucket', accessType: 'NoPublicAccess' }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).not.toContain('GOV-STG-01')
    })

    it('finding has autoFixable=true and a terraform snippet', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            bucket: [{ id: 'bkt-1', accessType: 'ObjectRead' }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-STG-01')
        expect(finding.remediation!.autoFixable).toBe(true)
        expect(finding.remediation!.terraform).toContain('NoPublicAccess')
    })
})

// ---------------------------------------------------------------------------
// GOV-TAG-01: Missing cost-tracking tags
// ---------------------------------------------------------------------------

describe('GOV-TAG-01 — missing tags', () => {
    it('flags an Instance with no tags', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            instance: [{ id: 'i-1', displayName: 'Worker', freeformTags: {}, definedTags: {} }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).toContain('GOV-TAG-01')
    })

    it('does not flag an Instance that has freeform tags', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }, { id: 'c2' }],
            instance: [{ id: 'i-2', displayName: 'Tagged', freeformTags: { env: 'prod' }, definedTags: {} }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        const tagFindings = findings.filter((f) => f.id.startsWith('GOV-TAG-01') && f.resourceId === 'i-2')
        expect(tagFindings).toHaveLength(0)
    })

    it('finding has autoFixable=false (tag values are org-specific)', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            instance: [{ id: 'i-1', freeformTags: {}, definedTags: {} }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-TAG-01')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('freeform_tags')
    })
})

// ---------------------------------------------------------------------------
// GOV-CMPT-01: Compartment segmentation
// ---------------------------------------------------------------------------

describe('GOV-CMPT-01 — compartment segmentation', () => {
    it('flags a design with only one compartment', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1', displayName: 'Root' }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).toContain('GOV-CMPT-01')
    })

    it('does not flag a design with multiple compartments', () => {
        const design = baseDesign({
            compartment: [
                { id: 'c1', displayName: 'Root' },
                { id: 'c2', displayName: 'Workload' },
            ],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).not.toContain('GOV-CMPT-01')
    })

    it('finding has autoFixable=false (compartment structure is org-specific)', () => {
        const design = baseDesign({ compartment: [{ id: 'c1' }] })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-CMPT-01')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('oci_identity_compartment')
    })
})

// ---------------------------------------------------------------------------
// GOV-DB-01: Autonomous Database public endpoint
// ---------------------------------------------------------------------------

describe('GOV-DB-01 — ADB public endpoint', () => {
    it('flags an Autonomous Database with no subnetId', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            autonomous_database: [{ id: 'adb-1', displayName: 'ADB', subnetId: '' }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).toContain('GOV-DB-01')
    })

    it('does not flag an Autonomous Database placed in a subnet', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }, { id: 'c2' }],
            autonomous_database: [{ id: 'adb-2', displayName: 'Private ADB', subnetId: 'sn-1' }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).not.toContain('GOV-DB-01')
    })

    it('finding has autoFixable=false (subnet selection requires user input)', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            autonomous_database: [{ id: 'adb-1', subnetId: '' }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-DB-01')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('subnet_id')
    })
})

// ---------------------------------------------------------------------------
// GOV-COST-01: No Budget
// ---------------------------------------------------------------------------

describe('GOV-COST-01 — no budget', () => {
    it('flags a design with no budget resources', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }, { id: 'c2' }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).toContain('GOV-COST-01')
    })

    it('does not flag when at least one budget exists', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }, { id: 'c2' }],
            budget: [{ id: 'bgt-1', displayName: 'Monthly Budget', amount: 500, resetPeriod: 'MONTHLY' }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).not.toContain('GOV-COST-01')
    })

    it('finding has autoFixable=false (budget amount is org-specific)', () => {
        const design = baseDesign({ compartment: [{ id: 'c1' }, { id: 'c2' }] })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-COST-01')
        expect(finding.remediation!.autoFixable).toBe(false)
        expect(finding.remediation!.terraform).toContain('oci_budget_budget')
    })
})

// ---------------------------------------------------------------------------
// GOV-COMPUTE-01: Instance with public IP
// ---------------------------------------------------------------------------

describe('GOV-COMPUTE-01 — instance public IP', () => {
    it('flags an Instance with assignPublicIp = true', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            instance: [{
                id: 'inst-1',
                displayName: 'Public VM',
                createVnicDetails: { assignPublicIp: true, subnetId: 'sn-1' },
            }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).toContain('GOV-COMPUTE-01')
    })

    it('does not flag an Instance with assignPublicIp = false', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }, { id: 'c2' }],
            instance: [{
                id: 'inst-2',
                displayName: 'Private VM',
                freeformTags: { env: 'prod' },
                createVnicDetails: { assignPublicIp: false, subnetId: 'sn-1' },
            }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        expect(findingIds(findings)).not.toContain('GOV-COMPUTE-01')
    })

    it('finding has autoFixable=true and a terraform snippet', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            instance: [{
                id: 'inst-1',
                createVnicDetails: { assignPublicIp: true, subnetId: 'sn-1' },
            }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-COMPUTE-01')
        expect(finding.remediation!.autoFixable).toBe(true)
        expect(finding.remediation!.terraform).toContain('assign_public_ip = false')
    })
})

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe('evaluateGovernance — edge cases', () => {
    it('returns empty array for a null-ish design', () => {
        // @ts-expect-error — intentional bad input test
        expect(evaluateGovernance(null)).toEqual([])
        // @ts-expect-error — intentional bad input test
        expect(evaluateGovernance({})).toEqual([])
    })

    it('returns empty array when oci.resources is empty', () => {
        const design = baseDesign({})
        // With all empty lists the only design-level findings are CMPT-01 and COST-01
        const findings = evaluateGovernance(design)
        const ids = findingIds(findings)
        expect(ids).toContain('GOV-CMPT-01')
        expect(ids).toContain('GOV-COST-01')
        // No resource-specific findings
        expect(ids).not.toContain('GOV-NET-01')
        expect(ids).not.toContain('GOV-STG-01')
    })
})

// ---------------------------------------------------------------------------
// applyRemediation — auto-fixable rules
// ---------------------------------------------------------------------------

describe('applyRemediation — GOV-NET-01 (public subnet)', () => {
    it('sets prohibitPublicIpOnVnic to true and clears the finding', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }, { id: 'c2' }],
            subnet: [{ id: 'sn-1', displayName: 'Public Subnet', prohibitPublicIpOnVnic: false }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-NET-01')

        const fixed = applyRemediation(design, finding)

        // Must return a NEW object (immutable)
        expect(fixed).not.toBe(design)

        // The subnet in the new design must have the field set
        const subnets = fixed.model.oci.resources['subnet'] as Record<string, unknown>[]
        expect(subnets[0].prohibitPublicIpOnVnic).toBe(true)

        // Re-running the rule against the fixed design must produce no GOV-NET-01 finding
        const newFindings = evaluateGovernance(fixed)
        expect(findingIds(newFindings)).not.toContain('GOV-NET-01')
    })

    it('does not mutate the original design', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            subnet: [{ id: 'sn-1', prohibitPublicIpOnVnic: false }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-NET-01')

        applyRemediation(design, finding)

        const subnets = design.model.oci.resources['subnet'] as Record<string, unknown>[]
        expect(subnets[0].prohibitPublicIpOnVnic).toBe(false)
    })

    it('no-ops when resourceId not found in subnet list', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            subnet: [{ id: 'sn-1', prohibitPublicIpOnVnic: false }],
        })
        const fakeFinding: GovernanceFinding = {
            id: 'GOV-NET-01::does-not-exist',
            severity: 'medium',
            category: 'network',
            title: 'test',
            message: 'test',
            resourceId: 'does-not-exist',
            remediation: { summary: '', autoFixable: true },
        }
        const fixed = applyRemediation(design, fakeFinding)
        expect(fixed).toBe(design)
    })
})

describe('applyRemediation — GOV-STG-01 (public bucket)', () => {
    it('sets accessType to NoPublicAccess and clears the finding', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }, { id: 'c2' }],
            bucket: [{ id: 'bkt-1', displayName: 'Public Bucket', accessType: 'ObjectRead' }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-STG-01')

        const fixed = applyRemediation(design, finding)

        expect(fixed).not.toBe(design)

        const buckets = fixed.model.oci.resources['bucket'] as Record<string, unknown>[]
        expect(buckets[0].accessType).toBe('NoPublicAccess')

        const newFindings = evaluateGovernance(fixed)
        expect(findingIds(newFindings)).not.toContain('GOV-STG-01')
    })

    it('does not mutate the original design', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            bucket: [{ id: 'bkt-1', accessType: 'ObjectRead' }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-STG-01')

        applyRemediation(design, finding)

        const buckets = design.model.oci.resources['bucket'] as Record<string, unknown>[]
        expect(buckets[0].accessType).toBe('ObjectRead')
    })
})

describe('applyRemediation — GOV-COMPUTE-01 (public instance)', () => {
    it('sets createVnicDetails.assignPublicIp to false and clears the finding', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }, { id: 'c2' }],
            instance: [{
                id: 'inst-1',
                displayName: 'Public VM',
                freeformTags: { env: 'prod' },
                createVnicDetails: { assignPublicIp: true, subnetId: 'sn-1' },
            }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-COMPUTE-01')

        const fixed = applyRemediation(design, finding)

        expect(fixed).not.toBe(design)

        const instances = fixed.model.oci.resources['instance'] as Record<string, unknown>[]
        const vnic = instances[0].createVnicDetails as Record<string, unknown>
        expect(vnic.assignPublicIp).toBe(false)
        // Other vnic fields must be preserved
        expect(vnic.subnetId).toBe('sn-1')

        const newFindings = evaluateGovernance(fixed)
        expect(findingIds(newFindings)).not.toContain('GOV-COMPUTE-01')
    })

    it('does not mutate the original design', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            instance: [{
                id: 'inst-1',
                createVnicDetails: { assignPublicIp: true },
            }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-COMPUTE-01')

        applyRemediation(design, finding)

        const instances = design.model.oci.resources['instance'] as Record<string, unknown>[]
        const vnic = instances[0].createVnicDetails as Record<string, unknown>
        expect(vnic.assignPublicIp).toBe(true)
    })

    it('handles a missing createVnicDetails gracefully (no-op)', () => {
        // Instance without createVnicDetails won't trigger the finding anyway,
        // but if somehow passed a finding with that resourceId it must not throw.
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            instance: [{ id: 'inst-no-vnic', createVnicDetails: undefined }],
        })
        const fakeFinding: GovernanceFinding = {
            id: 'GOV-COMPUTE-01::inst-no-vnic',
            severity: 'high',
            category: 'compute',
            title: 'test',
            message: 'test',
            resourceId: 'inst-no-vnic',
            remediation: { summary: '', autoFixable: true },
        }
        // Must not throw
        expect(() => applyRemediation(design, fakeFinding)).not.toThrow()
    })
})

// ---------------------------------------------------------------------------
// applyRemediation — non-auto-fixable rules return design unchanged
// ---------------------------------------------------------------------------

describe('applyRemediation — non-auto-fixable rules', () => {
    it('returns the original design reference for GOV-NET-02', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            security_list: [{
                id: 'sl-1',
                ingressSecurityRules: [{ source: '0.0.0.0/0', protocol: '6' }],
            }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-NET-02')
        // autoFixable = false
        const result = applyRemediation(design, finding)
        expect(result).toBe(design)
    })

    it('returns the original design reference for GOV-NET-03', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            network_security_group_security_rule: [{
                id: 'nsg-1',
                direction: 'INGRESS',
                source: '0.0.0.0/0',
                protocol: '6',
            }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-NET-03')
        const result = applyRemediation(design, finding)
        expect(result).toBe(design)
    })

    it('returns the original design reference for GOV-TAG-01', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            instance: [{ id: 'i-1', freeformTags: {}, definedTags: {} }],
            budget: [{ id: 'b1', amount: 100 }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-TAG-01')
        const result = applyRemediation(design, finding)
        expect(result).toBe(design)
    })

    it('returns the original design reference for GOV-CMPT-01', () => {
        const design = baseDesign({ compartment: [{ id: 'c1' }] })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-CMPT-01')
        const result = applyRemediation(design, finding)
        expect(result).toBe(design)
    })

    it('returns the original design reference for GOV-DB-01', () => {
        const design = baseDesign({
            compartment: [{ id: 'c1' }],
            autonomous_database: [{ id: 'adb-1', subnetId: '' }],
        })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-DB-01')
        const result = applyRemediation(design, finding)
        expect(result).toBe(design)
    })

    it('returns the original design reference for GOV-COST-01', () => {
        const design = baseDesign({ compartment: [{ id: 'c1' }, { id: 'c2' }] })
        const findings = evaluateGovernance(design)
        const finding = requireFinding(findings, 'GOV-COST-01')
        const result = applyRemediation(design, finding)
        expect(result).toBe(design)
    })
})
