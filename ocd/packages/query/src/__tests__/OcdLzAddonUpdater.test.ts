/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

import { describe, it, expect } from 'vitest'
import { buildChildEnv } from '../OcdLzAddonUpdater.js'

describe('buildChildEnv', () => {
    it('copies allowlisted vars (PATH, HOME) but drops unrelated secrets', () => {
        const parentEnv: NodeJS.ProcessEnv = {
            PATH: '/usr/bin:/bin',
            HOME: '/home/user',
            AWS_SECRET_ACCESS_KEY: 'super-secret',
        }

        const result = buildChildEnv(parentEnv, undefined)

        expect(result.PATH).toBe('/usr/bin:/bin')
        expect(result.HOME).toBe('/home/user')
        expect(result.AWS_SECRET_ACCESS_KEY).toBeUndefined()
    })

    it('copies GIT_* prefixed vars and proxy/TLS vars when present', () => {
        const parentEnv: NodeJS.ProcessEnv = {
            GIT_SSH_COMMAND: 'ssh -i key',
            HTTPS_PROXY: 'http://proxy:8080',
            NODE_EXTRA_CA_CERTS: '/etc/ca.pem',
            UNRELATED_VAR: 'nope',
        }

        const result = buildChildEnv(parentEnv, undefined)

        expect(result.GIT_SSH_COMMAND).toBe('ssh -i key')
        expect(result.HTTPS_PROXY).toBe('http://proxy:8080')
        expect(result.NODE_EXTRA_CA_CERTS).toBe('/etc/ca.pem')
        expect(result.UNRELATED_VAR).toBeUndefined()
    })

    it('adds normalized GITHUB_TOKEN when a token is supplied', () => {
        const parentEnv: NodeJS.ProcessEnv = { PATH: '/usr/bin' }

        const result = buildChildEnv(parentEnv, '  ghp_exampletoken  ')

        expect(result.GITHUB_TOKEN).toBe('ghp_exampletoken')
    })

    it('omits GITHUB_TOKEN when no token is supplied', () => {
        const parentEnv: NodeJS.ProcessEnv = { PATH: '/usr/bin' }

        const result = buildChildEnv(parentEnv, undefined)

        expect('GITHUB_TOKEN' in result).toBe(false)
    })

    it('omits GITHUB_TOKEN for empty or whitespace-only tokens', () => {
        const parentEnv: NodeJS.ProcessEnv = { PATH: '/usr/bin' }

        expect('GITHUB_TOKEN' in buildChildEnv(parentEnv, '')).toBe(false)
        expect('GITHUB_TOKEN' in buildChildEnv(parentEnv, '   ')).toBe(false)
    })

    it('omits GITHUB_TOKEN when the token contains newlines (normalizer rejects it)', () => {
        const parentEnv: NodeJS.ProcessEnv = { PATH: '/usr/bin' }

        const result = buildChildEnv(parentEnv, 'ghp_token\ninjected')

        expect('GITHUB_TOKEN' in result).toBe(false)
    })

    it('does not preserve an existing GITHUB_TOKEN from the parent env when no token is passed', () => {
        const parentEnv: NodeJS.ProcessEnv = {
            PATH: '/usr/bin',
            GITHUB_TOKEN: 'leaked-parent-token',
        }

        const result = buildChildEnv(parentEnv, undefined)

        // GITHUB_TOKEN is not on the allowlist; it is only set from the explicit arg.
        expect(result.GITHUB_TOKEN).toBeUndefined()
    })
})
