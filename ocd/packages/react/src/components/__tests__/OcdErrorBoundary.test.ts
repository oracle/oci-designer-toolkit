/*
** Copyright (c) 2026, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { afterEach, describe, expect, it, vi } from 'vitest'
import React from 'react'
import { OcdLogger } from '@ocd/core'
import { OcdErrorBoundary, toErrorBoundaryLog } from '../OcdErrorBoundary'

describe('OcdErrorBoundary logging', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        OcdLogger.setLevel('info')
    })

    it('summarizes component stack lines without file locations', () => {
        const summary = toErrorBoundaryLog(new Error('boom'), {
            componentStack: '\n    at SecretPanel (/Users/me/project/SecretPanel.tsx:12:3)\n    at OcdConsole',
        })

        expect(summary).toEqual({
            name: 'Error',
            message: 'boom',
            componentStack: ['at SecretPanel', 'at OcdConsole'],
        })
    })

    it('logs a structured summary instead of raw React ErrorInfo', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const info: React.ErrorInfo = {
            componentStack: '\n    at SecretPanel (/Users/me/project/SecretPanel.tsx:12:3)',
        }
        const boundary = new OcdErrorBoundary({ children: null })

        boundary.componentDidCatch(new Error('boom'), info)

        expect(errorSpy).toHaveBeenCalledTimes(1)
        const args = errorSpy.mock.calls[0]
        expect(args).not.toContain(info)
        expect(args[1]).toBe('render failed')
        expect(args[2]).toEqual({
            name: 'Error',
            message: 'boom',
            componentStack: ['at SecretPanel'],
        })
    })
})
