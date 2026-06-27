/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** OcdLogger - minimal structured console logger shared across OCD packages.
**
** CONTRACT: Never pass design JSON, OCI resource payloads, or any OCID-bearing
** value (tenancy/compartment/resource ids, profile contents, cache contents)
** to this logger. Log operation names, counts, durations and error objects
** only. This repository is a public fork; logged output may surface in bug
** reports, CI logs or attached console captures.
**
** Renderer-safe: `process` is only dereferenced behind a typeof guard so the
** module can be bundled for the browser. Minimum level defaults to 'info' and
** can be overridden via the OCD_LOG_LEVEL environment variable (debug | info |
** warn | error) in Node / Electron-main contexts.
*/

export type OcdLogLevel = 'debug' | 'info' | 'warn' | 'error'

const OCD_LOG_LEVEL_ORDER: Record<OcdLogLevel, number> = {debug: 0, info: 1, warn: 2, error: 3}
const OCD_DEFAULT_LOG_LEVEL: OcdLogLevel = 'info'

function isOcdLogLevel(value: string | undefined): value is OcdLogLevel {
    return value !== undefined && Object.hasOwn(OCD_LOG_LEVEL_ORDER, value)
}

function envLogLevel(): OcdLogLevel {
    // Guarded: `process` does not exist in renderer / browser bundles.
    const value = typeof process !== 'undefined' && process.env !== undefined ? process.env.OCD_LOG_LEVEL : undefined
    return isOcdLogLevel(value) ? value : OCD_DEFAULT_LOG_LEVEL
}

export class OcdLogger {
    private static minLevel: OcdLogLevel = envLogLevel()
    private readonly prefix: string

    private constructor(scope: string) {
        this.prefix = `[${scope}]`
    }

    static scope(scope: string): OcdLogger {
        return new OcdLogger(scope)
    }

    static setLevel(level: OcdLogLevel): void {
        OcdLogger.minLevel = level
    }

    debug(...args: unknown[]): void {
        this.log('debug', args)
    }

    info(...args: unknown[]): void {
        this.log('info', args)
    }

    warn(...args: unknown[]): void {
        this.log('warn', args)
    }

    error(...args: unknown[]): void {
        this.log('error', args)
    }

    private log(level: OcdLogLevel, args: unknown[]): void {
        if (OCD_LOG_LEVEL_ORDER[level] < OCD_LOG_LEVEL_ORDER[OcdLogger.minLevel]) return
        const line = `${new Date().toISOString()} ${level.toUpperCase()} ${this.prefix}`
        if (level === 'error') console.error(line, ...args)
        else if (level === 'warn') console.warn(line, ...args)
        else console.log(line, ...args)
    }
}
