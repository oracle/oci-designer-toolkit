/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, expect, it } from 'vitest'
import { mapObservabilityJson } from '../OcdLzObservabilityBridge'

const OBSERVABILITY_JSON = JSON.stringify({
    events_configuration: {
        event_rules: {
            'RULE-A': { display_name: 'All Compute Events' },
        },
    },
    notifications_configuration: {
        topics: {
            'TOPIC-A': { display_name: 'Ops Topic' },
            'TOPIC-B': { display_name: 'Security Topic' },
        },
    },
    service_connectors_configuration: {
        service_connectors: {
            'SCH-A': { display_name: 'Logs to Object Storage' },
        },
    },
    log_groups: {
        'LG-A': {
            display_name: 'Network Log Group',
            logs: {
                'LOG-A': { display_name: 'VCN Flow Logs' },
                'LOG-B': { display_name: 'LB Access Logs' },
            },
        },
    },
})

describe('mapObservabilityJson', () => {
    it('returns an empty result for null / empty input', () => {
        expect(mapObservabilityJson(null, 'cmp').counts).toEqual({})
        expect(mapObservabilityJson('', 'cmp').resources).toEqual({})
    })

    it('notes and skips invalid JSON', () => {
        const r = mapObservabilityJson('{not json', 'cmp')
        expect(r.notes.some((n) => /invalid JSON/i.test(n))).toBe(true)
    })

    it('maps event rules, topics, service connectors, log groups and logs', () => {
        const r = mapObservabilityJson(OBSERVABILITY_JSON, 'cmp-obs')
        expect(r.counts.events_rule).toBe(1)
        expect(r.counts.notification_topic).toBe(2)
        expect(r.counts.service_connector).toBe(1)
        expect(r.counts.log_group).toBe(1)
        expect(r.counts.logging_log).toBe(2)
    })

    it('parents every resource to the given compartment', () => {
        const r = mapObservabilityJson(OBSERVABILITY_JSON, 'cmp-obs')
        const all = Object.values(r.resources).flat()
        expect(all.length).toBeGreaterThan(0)
        expect(all.every((res) => res.compartmentId === 'cmp-obs')).toBe(true)
    })

    it('wires each log to its parent log group via logGroupId', () => {
        const r = mapObservabilityJson(OBSERVABILITY_JSON, 'cmp-obs')
        const logGroupId = r.resources.log_group[0].id
        expect(r.resources.logging_log.every((log) => log.logGroupId === logGroupId)).toBe(true)
    })

    it('preserves display names', () => {
        const r = mapObservabilityJson(OBSERVABILITY_JSON, 'cmp-obs')
        expect(r.resources.notification_topic.map((t) => t.displayName)).toContain('Ops Topic')
        expect(r.resources.events_rule[0].displayName).toBe('All Compute Events')
    })
})
