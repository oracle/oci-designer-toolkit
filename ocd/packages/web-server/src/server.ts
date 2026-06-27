/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Local, loopback-only web backend that exposes OCD's OCI discovery and guarded
** integration endpoints to browser builds. The side-effect-free HTTP app lives in
** OciWebServerHttp.ts so tests can exercise route envelopes without binding the
** default production port.
*/

import { OcdLogger } from '@ocd/core'
import { createOciWebServer, HOST, port } from './OciWebServerHttp.js'

const logger = OcdLogger.scope('web-server')
const server = createOciWebServer()

server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        logger.error('port already in use', { port: port() })
    } else {
        logger.error('server error', { code: err.code ?? 'unknown', message: err.message })
    }
    process.exit(1)
})

const shutdown = (): void => {
    logger.info('shutting down')
    server.close(() => {
        logger.info('all connections closed, exiting')
        process.exit(0)
    })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

server.listen(port(), HOST, () => {
    logger.info('listening', { host: HOST, port: port(), mode: 'read-only OCI discovery' })
})

export { server }
