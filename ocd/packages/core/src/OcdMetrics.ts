/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** OcdMetrics - minimal, sink-agnostic metrics layer shared across OCD packages.
**
** Mirrors OcdLogger / OcdFetch house style: zero third-party deps, renderer-safe
** (`process` is only dereferenced behind a typeof guard so the module can be
** bundled for the browser), and env-gated so it costs nothing unless opted in.
**
** DESIGN
**   - Three primitives: counter(), gauge(), timer(). `time()` wraps an async fn.
**   - A pluggable SINK receives one OcdMetricRecord per emission. The default
**     sink is a NO-OP (zero overhead on the hot path). When the OCD_METRICS env
**     var is truthy (Node / Electron-main), the default becomes a JSON console
**     sink that emits via OcdLogger.debug. A Prometheus/OTel sink can be dropped
**     in later with OcdMetrics.setSink(...); OcdMetrics.resetSink() reverts to
**     the env default (used by tests).
**   - timer() uses a monotonic clock (performance.now when available, else
**     Date.now) so elapsed durations are immune to wall-clock adjustments.
**
** LABEL CONTRACT (CRITICAL):
**   Labels MUST NOT carry OCIDs, secrets, tokens, profile contents, design JSON,
**   or any high-cardinality / sensitive value. Callers pass only COARSE labels:
**   an operation name, a 'success' | 'failure' outcome, a backend kind, etc.
**   Correlation ids (requestId) belong in logs, NOT in metric labels — they
**   explode cardinality and can leak into metric-store exports. This repository
**   is a public fork; emitted metrics may surface in CI logs or bug reports.
*/

import { OcdLogger } from './OcdLogger.js'

export type OcdMetricKind = 'counter' | 'gauge' | 'timer'

/** Coarse, low-cardinality labels only — see the LABEL CONTRACT above. */
export interface OcdMetricLabels {
    readonly [label: string]: string | number | boolean
}

export interface OcdMetricRecord {
    readonly kind: OcdMetricKind
    readonly name: string
    /** Counter increment, gauge value, or elapsed milliseconds for a timer. */
    readonly value: number
    readonly labels?: OcdMetricLabels
    /** Wall-clock emission time (epoch ms) for ordering in a sink. */
    readonly timestamp: number
}

export interface OcdMetricSink {
    record(metric: OcdMetricRecord): void
}

/** Returned by timer(); call stop() once to record + return elapsed ms. */
export interface OcdTimerHandle {
    stop(labels?: OcdMetricLabels): number
}

// Monotonic clock: performance.now where available (browser, worker, Node 16+),
// otherwise the wall clock. Guarded so the reference is renderer- and Node-safe.
function nowMs(): number {
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now()
}

// Guarded: `process` does not exist in renderer / browser bundles.
function envMetricsEnabled(): boolean {
    const value = typeof process !== 'undefined' && process.env !== undefined ? process.env.OCD_METRICS : undefined
    if (value === undefined) return false
    const normalised = value.trim().toLowerCase()
    return normalised !== '' && normalised !== '0' && normalised !== 'false'
}

const NOOP_SINK: OcdMetricSink = {
    record: () => {},
}

const metricsLogger = OcdLogger.scope('OcdMetrics')

// JSON-per-line console sink, routed through OcdLogger so it honours OCD_LOG_LEVEL
// and the no-OCID logging contract. Only active when OCD_METRICS is truthy.
const consoleSink: OcdMetricSink = {
    record: (metric: OcdMetricRecord): void => {
        metricsLogger.debug(JSON.stringify(metric))
    },
}

function normaliseLabels(labels?: OcdMetricLabels): OcdMetricLabels | undefined {
    if (!labels) return undefined
    return Object.keys(labels).length > 0 ? labels : undefined
}

class OcdMetricsRegistry {
    private sink: OcdMetricSink = OcdMetricsRegistry.defaultSink()

    private static defaultSink(): OcdMetricSink {
        return envMetricsEnabled() ? consoleSink : NOOP_SINK
    }

    /** Install a custom sink (e.g. Prometheus/OTel exporter). */
    setSink(sink: OcdMetricSink): void {
        this.sink = sink
    }

    /** Revert to the env-derived default sink (NO-OP unless OCD_METRICS set). */
    resetSink(): void {
        this.sink = OcdMetricsRegistry.defaultSink()
    }

    counter(name: string, value: number = 1, labels?: OcdMetricLabels): void {
        this.emit('counter', name, value, labels)
    }

    gauge(name: string, value: number, labels?: OcdMetricLabels): void {
        this.emit('gauge', name, value, labels)
    }

    timer(name: string, labels?: OcdMetricLabels): OcdTimerHandle {
        const start = nowMs()
        let elapsed: number | null = null
        return {
            stop: (extraLabels?: OcdMetricLabels): number => {
                if (elapsed !== null) return elapsed
                elapsed = nowMs() - start
                this.emit('timer', name, elapsed, { ...(labels ?? {}), ...(extraLabels ?? {}) })
                return elapsed
            },
        }
    }

    /** Convenience: time an async fn, recording even when it throws. */
    async time<T>(name: string, fn: () => Promise<T>, labels?: OcdMetricLabels): Promise<T> {
        const handle = this.timer(name, labels)
        try {
            return await fn()
        } finally {
            handle.stop()
        }
    }

    private emit(kind: OcdMetricKind, name: string, value: number, labels?: OcdMetricLabels): void {
        this.sink.record({
            kind,
            name,
            value,
            labels: normaliseLabels(labels),
            timestamp: Date.now(),
        })
    }
}

export const OcdMetrics = new OcdMetricsRegistry()
