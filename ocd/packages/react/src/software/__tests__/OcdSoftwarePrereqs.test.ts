/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { validateSoftwarePrerequisites } from '../OcdSoftwarePrereqs'
import { findSoftwarePackage } from '../OcdSoftwareCatalog'

const nginx = findSoftwarePackage('nginx')! // listens on 80, 443

const designWith = (resources: Record<string, any[]>) => ({ model: { oci: { resources } } })

// One instance + an NSG ingress rule opening TCP 80-443.
const designOpening = (min: number, max: number, protocol = '6') =>
    designWith({
        instance: [{ id: 'i-1', displayName: 'web', shape: 'VM.Standard.E4.Flex' }],
        network_security_group_security_rule: [
            { id: 'r-1', direction: 'INGRESS', protocol, tcp_options: { destination_port_range: { min, max } } },
        ],
    })

describe('validateSoftwarePrerequisites', () => {
    it('flags a hard blocker when there is no instance to install onto', () => {
        const report = validateSoftwarePrerequisites(designWith({}), [nginx])
        expect(report.installable).toBe(false)
        expect(report.findings.some((f) => f.severity === 'blocker')).toBe(true)
    })

    it('marks ports OK when an ingress rule covers them', () => {
        const report = validateSoftwarePrerequisites(designOpening(80, 443), [nginx])
        expect(report.installable).toBe(true)
        const ports = report.findings.filter((f) => f.severity === 'ok')
        expect(ports.map((f) => f.message)).toEqual(
            expect.arrayContaining([expect.stringContaining('port 80'), expect.stringContaining('port 443')]),
        )
    })

    it('warns on a listen port with no covering ingress rule', () => {
        const report = validateSoftwarePrerequisites(designOpening(80, 80), [nginx]) // 443 not covered
        const warnings = report.findings.filter((f) => f.severity === 'warning')
        expect(warnings).toHaveLength(1)
        expect(warnings[0].message).toContain('443')
        expect(report.installable).toBe(true) // a warning is not a blocker
    })

    it('treats protocol "all" as opening every port', () => {
        const report = validateSoftwarePrerequisites(designOpening(0, 0, 'all'), [nginx])
        expect(report.findings.some((f) => f.severity === 'warning')).toBe(false)
    })

    it('reads embedded security_list ingress rules too', () => {
        const design = designWith({
            instance: [{ id: 'i-1', shape: 'VM.Standard.E4.Flex' }],
            security_list: [
                { id: 'sl-1', ingress_security_rules: [{ protocol: '6', tcp_options: { destination_port_range: { min: 443, max: 443 } } }] },
            ],
        })
        const report = validateSoftwarePrerequisites(design, [nginx])
        expect(report.findings.some((f) => f.severity === 'ok' && f.message.includes('443'))).toBe(true)
    })

    it('always emits host tools as a manual check, never a blocker', () => {
        const report = validateSoftwarePrerequisites(designOpening(80, 443), [nginx])
        const manual = report.findings.filter((f) => f.severity === 'manual')
        expect(manual).toHaveLength(1)
        expect(manual[0].message).toMatch(/python3|nginx/)
    })
})
