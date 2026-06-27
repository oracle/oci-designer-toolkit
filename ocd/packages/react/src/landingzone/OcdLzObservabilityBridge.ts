/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * Bridge the OE-generated `observability.json` into OCD model resources.
 *
 * The LZ→model bridge (OcdLzToModel.buildOcdDesignFromLz) historically mapped
 * only iam.json and network.json; the observability output (events rules,
 * notification topics, service connectors, log groups + logs) was silently
 * dropped. This module maps those sections so the full Landing Zone — including
 * its observability resources — lands in the Designer with editable properties.
 *
 * Pure (no DOM, no OcdDocument) so it unit-tests under node. Each resource is
 * created with its per-type OciModelResources client, so foreign-key fields
 * (e.g. a log's logGroupId) exist and are wired.
 *
 * observability.json shape (OE):
 *   {
 *     events_configuration:          { event_rules:        { <key>: {...} } },
 *     notifications_configuration:   { topics:             { <key>: {...} } },
 *     service_connectors_configuration: { service_connectors: { <key>: {...} } },
 *     log_groups: { <key>: { display_name?, logs?: { <key>: {...} } } }
 *   }
 */

import { OciModelResources } from '@ocd/model'

interface ObsRaw {
    display_name?: string
    logs?: Record<string, ObsRaw>
    [key: string]: unknown
}

interface ObservabilityContent {
    events_configuration?: { event_rules?: Record<string, ObsRaw> }
    notifications_configuration?: { topics?: Record<string, ObsRaw> }
    service_connectors_configuration?: { service_connectors?: Record<string, ObsRaw> }
    log_groups?: Record<string, ObsRaw>
}

export interface ObservabilityMapResult {
    /** OCD model type -> created resources. */
    resources: Record<string, Record<string, unknown>[]>
    /** Per-type counts. */
    counts: Record<string, number>
    /** Human-readable notes about what was mapped / skipped. */
    notes: string[]
}

/** OCD model type ('log_group') -> OciModelResources client key ('OciLogGroup'). */
function clientKeyFor(ocdModelType: string): string {
    return 'Oci' + ocdModelType.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

function newResourceOfType(ocdModelType: string): Record<string, unknown> | undefined {
    const client = (OciModelResources as Record<string, { newResource: (t?: string) => unknown }>)[clientKeyFor(ocdModelType)]
    if (!client || typeof client.newResource !== 'function') return undefined
    return client.newResource(ocdModelType) as Record<string, unknown>
}

/**
 * Map an observability.json document (raw string) into OCD resources, parented
 * to `compartmentId`. Returns empty result for null / invalid / empty input.
 */
export function mapObservabilityJson(content: string | null | undefined, compartmentId: string): ObservabilityMapResult {
    const result: ObservabilityMapResult = { resources: {}, counts: {}, notes: [] }
    if (!content) return result

    let doc: ObservabilityContent
    try {
        doc = JSON.parse(content) as ObservabilityContent
    } catch {
        result.notes.push('Skipped observability.json: invalid JSON.')
        return result
    }

    const add = (type: string, raw: ObsRaw, configure?: (resource: Record<string, unknown>) => void): string | undefined => {
        const resource = newResourceOfType(type)
        if (!resource) {
            result.notes.push(`Skipped observability "${type}": no OCD model client.`)
            return undefined
        }
        if (raw.display_name) resource.displayName = raw.display_name
        resource.compartmentId = compartmentId
        configure?.(resource)
        if (!result.resources[type]) result.resources[type] = []
        result.resources[type].push(resource)
        result.counts[type] = (result.counts[type] ?? 0) + 1
        return resource.id as string
    }

    const mapSection = (container: Record<string, ObsRaw> | undefined, type: string): void => {
        if (!container) return
        Object.keys(container).sort().forEach((key) => add(type, container[key] ?? { display_name: key }))
    }

    mapSection(doc.events_configuration?.event_rules, 'events_rule')
    mapSection(doc.notifications_configuration?.topics, 'notification_topic')
    mapSection(doc.service_connectors_configuration?.service_connectors, 'service_connector')

    // Log groups, with their nested logs wired by logGroupId.
    const logGroups = doc.log_groups
    if (logGroups) {
        Object.keys(logGroups).sort().forEach((key) => {
            const raw = logGroups[key] ?? {}
            const logGroupId = add('log_group', raw)
            if (logGroupId && raw.logs && typeof raw.logs === 'object') {
                const logs = raw.logs
                Object.keys(logs).sort().forEach((logKey) => {
                    add('logging_log', logs[logKey] ?? { display_name: logKey }, (resource) => {
                        resource.logGroupId = logGroupId
                    })
                })
            }
        })
    }

    const total = Object.values(result.counts).reduce((sum, n) => sum + n, 0)
    if (total > 0) result.notes.push(`Mapped ${total} observability resource(s) from observability.json.`)
    return result
}
