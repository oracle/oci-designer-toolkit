/*
** Copyright (c) 2026, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import React from 'react'
import { OcdLogger } from '@ocd/core'

interface OcdErrorBoundaryProps {
    readonly children: React.ReactNode
}

interface OcdErrorBoundaryState {
    readonly error: Error | null
}

interface OcdErrorBoundaryLog {
    readonly name: string
    readonly message: string
    readonly componentStack: string[]
}

const logger = OcdLogger.scope('renderer.error-boundary')

const summarizeComponentStack = (componentStack: string): string[] =>
    componentStack
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.replace(/\s+\([^)]*\)$/, ''))
        .slice(0, 8)

export const toErrorBoundaryLog = (error: Error, info: React.ErrorInfo): OcdErrorBoundaryLog => ({
    name: error.name,
    message: error.message,
    componentStack: summarizeComponentStack(info.componentStack ?? ''),
})

export class OcdErrorBoundary extends React.Component<OcdErrorBoundaryProps, OcdErrorBoundaryState> {
    state: OcdErrorBoundaryState = {
        error: null,
    }

    static getDerivedStateFromError(error: Error): OcdErrorBoundaryState {
        return { error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo): void {
        logger.error('render failed', toErrorBoundaryLog(error, info))
    }

    onReload = (): void => {
        window.location.reload()
    }

    onKeepWorking = (): void => {
        this.setState({ error: null })
    }

    render(): React.ReactNode {
        if (!this.state.error) return this.props.children
        return (
            <div className='ocd-console-loading' role='alert'>
                <div>Something went wrong while rendering this page.</div>
                <div>
                    <button type='button' onClick={this.onReload}>Reload page</button>
                    <button type='button' onClick={this.onKeepWorking}>Keep working</button>
                </div>
            </div>
        )
    }
}

export default OcdErrorBoundary
