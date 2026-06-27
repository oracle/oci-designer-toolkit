/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/*
** Landing Zone Wizard setup.
**
** Fetches the PUBLIC OCI Operating Entities (OE) jsonnet sources from upstream
** at a pinned commit, vendors them into the (git-ignored) local tree, and
** regenerates the OE string map consumed by the wizard.
**
** These sources embed public OCI reference OCIDs (CIS security-zone recipe
** policies, the usage-report tenancy), so they are intentionally NOT committed
** to this repository. Every user fetches them locally with:
**
**   npm run setup-lz
**
** The regenerated OcdLandingZoneJsonnetSources.ts is marked skip-worktree so the
** populated (OCID-bearing) copy is never accidentally staged/committed.
*/

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, cpSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const lzSourcesManifestFile = path.join(repoRoot, 'ocd', 'packages', 'react', 'src', 'landingzone', 'OcdLzSources.json')
const lzSourcesManifest = JSON.parse(readFileSync(lzSourcesManifestFile, 'utf-8'))
const lzSources = lzSourcesManifest.sources
const operatingEntitiesSource = lzSources.find((source) => source.key === 'operating-entities')

const useLatest = process.argv.includes('--latest')
const checkOnly = process.argv.includes('--check')
const installSource = process.argv.includes('--install')
const checkAllSources = useLatest || checkOnly
const sourceKey = parseSourceKey()

function run(cmd, args, opts = {}) {
    return execFileSync(cmd, args, { stdio: 'inherit', ...opts, env: commandEnv(cmd, opts.env) })
}

function capture(cmd, args, opts = {}) {
    return execFileSync(cmd, args, { encoding: 'utf8', ...opts, env: commandEnv(cmd, opts.env) }).trim()
}

function githubToken() {
    const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '').trim()
    return /[\r\n]/.test(token) ? '' : token
}

function commandEnv(cmd, baseEnv = process.env) {
    const token = githubToken()
    if (cmd !== 'git' || !token) return baseEnv
    return {
        ...baseEnv,
        GIT_CONFIG_COUNT: '1',
        GIT_CONFIG_KEY_0: `url.https://x-access-token:${encodeURIComponent(token)}@github.com/.insteadOf`,
        GIT_CONFIG_VALUE_0: 'https://github.com/',
    }
}

function repoUrl(source) {
    return `https://github.com/${source.repo}.git`
}

function shortRef(ref) {
    return ref ? ref.slice(0, 12) : '(unpinned)'
}

function parseSourceKey() {
    const sourceArg = process.argv.find((arg) => arg.startsWith('--source='))
    if (sourceArg) return sourceArg.slice('--source='.length)

    const sourceIndex = process.argv.indexOf('--source')
    if (sourceIndex >= 0) return process.argv[sourceIndex + 1] || ''

    return ''
}

function findSource(key) {
    return lzSources.find((source) => source.key === key)
}

// Each installable role checks out under its own sandboxed root inside external/.
const ADDON_CHECKOUT_ROOTS = {
    'project-addon': 'external/lz-addons',
    'software-addon': 'external/software-addons',
}

function assertSafeExternalAddonPath(source) {
    const allowedSubroot = ADDON_CHECKOUT_ROOTS[source.role]
    const localSubdir = source.setup?.localSubdir
    if (!allowedSubroot || !localSubdir || !localSubdir.startsWith(`${allowedSubroot}/`)) {
        throw new Error(`Source '${source.key}' does not declare a safe external add-on checkout path under ${allowedSubroot ?? 'external/'}`)
    }
    const resolved = path.resolve(repoRoot, localSubdir)
    const allowedRoot = path.resolve(repoRoot, ...allowedSubroot.split('/'))
    if (!(resolved === allowedRoot || resolved.startsWith(`${allowedRoot}${path.sep}`))) {
        throw new Error(`Source '${source.key}' checkout path escapes ${allowedSubroot}`)
    }
    return resolved
}

function ensureInstallableAddon(source) {
    if (!Object.prototype.hasOwnProperty.call(ADDON_CHECKOUT_ROOTS, source.role)) {
        throw new Error(`Source '${source.key}' role '${source.role ?? ''}' is not installable with --install`)
    }
    if (source.setup?.install?.mode !== 'git-checkout') {
        throw new Error(`Source '${source.key}' does not declare setup.install.mode=git-checkout`)
    }
    return assertSafeExternalAddonPath(source)
}

function updatePinnedRef(source, pinnedRef) {
    const nextManifest = {
        ...lzSourcesManifest,
        sources: lzSourcesManifest.sources.map((entry) => entry.key === source.key ? { ...entry, pinnedRef } : entry),
    }
    writeFileSync(lzSourcesManifestFile, `${JSON.stringify(nextManifest, null, 2)}\n`)
    source.pinnedRef = pinnedRef
}

function latestCommit(source) {
    const output = capture('git', ['ls-remote', repoUrl(source), 'HEAD'])
    const [sha] = output.split(/\s+/)
    return sha || ''
}

async function latestRelease(source) {
    const token = githubToken()
    const response = await fetch(`https://api.github.com/repos/${source.repo}/releases/latest`, {
        headers: {
            Accept: 'application/vnd.github+json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })
    if (!response.ok) {
        throw new Error(`GitHub API responded ${response.status}`)
    }
    const body = await response.json()
    return typeof body.tag_name === 'string' ? body.tag_name : ''
}

async function latestRef(source) {
    return source.kind === 'release' ? await latestRelease(source) : latestCommit(source)
}

async function printSourceStatus(overrides = {}) {
    console.log('')
    console.log('========================================================================')
    console.log('[setup-lz] Upstream source status')
    console.log('========================================================================')
    const updated = []
    for (const source of lzSources) {
        try {
            const latest = overrides[source.key] ?? await latestRef(source)
            const pinned = source.pinnedRef || ''
            const changed = pinned !== '' && latest !== '' && shortRef(pinned) !== shortRef(latest)
            if (changed) updated.push({ source, latest })
            const marker = changed ? 'UPDATE' : pinned === '' ? 'informational' : 'current'
            console.log(`[setup-lz] ${source.label}: ${marker}`)
            console.log(`[setup-lz]   repo:   https://github.com/${source.repo}`)
            console.log(`[setup-lz]   pinned: ${shortRef(pinned)}`)
            console.log(`[setup-lz]   latest: ${shortRef(latest)}`)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'unknown error'
            console.log(`[setup-lz] ${source.label}: check failed (${message})`)
            console.log(`[setup-lz]   repo:   https://github.com/${source.repo}`)
        }
    }
    if (updated.length > 0) {
        console.log('')
        console.log('[setup-lz] To pin a new version, update pinnedRef in:')
        console.log(`[setup-lz]   ${path.relative(repoRoot, lzSourcesManifestFile)}`)
        for (const { source, latest } of updated) {
            console.log(`[setup-lz]   ${source.key}: ${latest}`)
        }
    }
    console.log('========================================================================')
}

async function updateSourcePin(source) {
    const latest = await latestRef(source)
    if (!latest) {
        throw new Error(`Could not resolve latest ref for ${source.key}`)
    }

    const previous = source.pinnedRef || ''
    updatePinnedRef(source, latest)

    console.log(`[setup-lz] Updated ${source.key} pinnedRef in ${path.relative(repoRoot, lzSourcesManifestFile)}`)
    console.log(`[setup-lz]   previous: ${shortRef(previous)}`)
    console.log(`[setup-lz]   latest:   ${shortRef(latest)}`)
    await printSourceStatus({ [source.key]: latest })
}

async function installProjectAddon(source) {
    const checkoutDir = ensureInstallableAddon(source)
    const latest = useLatest || !source.pinnedRef ? await latestRef(source) : source.pinnedRef
    if (!latest) {
        throw new Error(`Could not resolve checkout ref for ${source.key}`)
    }

    mkdirSync(path.dirname(checkoutDir), { recursive: true })
    if (existsSync(path.join(checkoutDir, '.git'))) {
        console.log(`[setup-lz] Updating ${source.key} checkout in ${path.relative(repoRoot, checkoutDir)}`)
        run('git', ['-C', checkoutDir, 'fetch', '--quiet', 'origin'])
    } else {
        if (existsSync(checkoutDir)) {
            throw new Error(`Checkout path exists but is not a git repository: ${path.relative(repoRoot, checkoutDir)}`)
        }
        console.log(`[setup-lz] Cloning ${source.key} into ${path.relative(repoRoot, checkoutDir)}`)
        run('git', ['clone', '--quiet', repoUrl(source), checkoutDir])
    }
    run('git', ['-C', checkoutDir, 'checkout', '--quiet', latest])
    console.log(`[setup-lz] ${source.label} ready at ${path.relative(repoRoot, checkoutDir)} @ ${shortRef(latest)}`)

    if (useLatest && source.pinnedRef !== latest) {
        updatePinnedRef(source, latest)
        console.log(`[setup-lz] Updated ${source.key} pinnedRef in ${path.relative(repoRoot, lzSourcesManifestFile)}`)
    }

    await printSourceStatus({ [source.key]: latest })
}

async function main() {
    if (!operatingEntitiesSource?.setup) {
        throw new Error(`Missing operating-entities setup metadata in ${lzSourcesManifestFile}`)
    }
    if (checkOnly) {
        await printSourceStatus()
        return
    }
    if (sourceKey && !useLatest && !installSource) {
        throw new Error('--source requires --latest or --install')
    }
    if (sourceKey && !findSource(sourceKey)) {
        throw new Error(`Unknown source '${sourceKey}'. Known sources: ${lzSources.map((source) => source.key).join(', ')}`)
    }
    if (installSource) {
        if (!sourceKey) throw new Error('--install requires --source <key>')
        await installProjectAddon(findSource(sourceKey))
        return
    }
    if (useLatest && sourceKey && sourceKey !== operatingEntitiesSource.key) {
        await updateSourcePin(findSource(sourceKey))
        return
    }

    const upstreamUrl = repoUrl(operatingEntitiesSource)
    const upstreamSha = operatingEntitiesSource.pinnedRef
    const genDir = path.join(repoRoot, operatingEntitiesSource.setup.localSubdir)
    const sourcesFile = path.join(repoRoot, operatingEntitiesSource.setup.generatedFile)
    const tmp = mkdtempSync(path.join(tmpdir(), 'oci-oe-'))
    try {
        // Clone the full default branch so we can either checkout the pinned SHA
        // or resolve the current default-branch HEAD (--latest).
        run('git', ['clone', '--quiet', upstreamUrl, tmp])

        let resolvedSha = upstreamSha
        if (useLatest) {
            // Default-branch HEAD after a fresh clone.
            resolvedSha = capture('git', ['-C', tmp, 'rev-parse', 'HEAD'])
            console.log(`[setup-lz] --latest: using default-branch HEAD @ ${resolvedSha}`)
        } else {
            console.log(`[setup-lz] Fetching OCI Operating Entities @ ${upstreamSha}`)
            run('git', ['-C', tmp, 'checkout', '--quiet', upstreamSha])
        }

        const upstreamGen = path.join(tmp, operatingEntitiesSource.setup.cloneSubdir)
        if (!existsSync(upstreamGen)) {
            throw new Error(`Upstream checkout has no gen/ directory at ${upstreamGen}`)
        }

        // Replace the (git-ignored) vendored sources with the pinned upstream gen/.
        rmSync(genDir, { recursive: true, force: true })
        cpSync(upstreamGen, genDir, { recursive: true })
        console.log(`[setup-lz] Vendored OE sources into ${path.relative(repoRoot, genDir)}/ (git-ignored)`)

        // Regenerate the string map consumed by the wizard.
        run('node', [path.join(repoRoot, operatingEntitiesSource.setup.generator)])

        // Protect the populated (OCID-bearing) generated file from accidental commits.
        if (operatingEntitiesSource.setup.skipWorktree) {
            try {
                run('git', ['-C', repoRoot, 'update-index', '--skip-worktree', path.relative(repoRoot, sourcesFile)],
                    { stdio: 'ignore' })
                console.log('[setup-lz] Marked OcdLandingZoneJsonnetSources.ts skip-worktree (local changes will not be staged).')
            } catch {
                console.warn('[setup-lz] Could not set skip-worktree (file may be untracked). Do NOT commit the populated OcdLandingZoneJsonnetSources.ts.')
            }
        }

        console.log('[setup-lz] Done. The Landing Zone Wizard is ready to use locally.')

        if (useLatest && resolvedSha !== upstreamSha) {
            console.log('')
            console.log('========================================================================')
            console.log(`[setup-lz] NEW upstream SHA: ${resolvedSha}`)
            if (sourceKey === operatingEntitiesSource.key) {
                updatePinnedRef(operatingEntitiesSource, resolvedSha)
                console.log(`[setup-lz] Updated operating-entities pinnedRef in ${path.relative(repoRoot, lzSourcesManifestFile)}`)
            } else {
                console.log('[setup-lz] To pin this version, update pinnedRef for operating-entities in:')
                console.log(`[setup-lz]   ${path.relative(repoRoot, lzSourcesManifestFile)}`)
                console.log('[setup-lz] Or run:')
                console.log('[setup-lz]   npm run setup-lz:latest -- --source operating-entities')
            }
            console.log('========================================================================')
        }

        if (checkAllSources) {
            await printSourceStatus({ [operatingEntitiesSource.key]: resolvedSha })
        }
    } finally {
        rmSync(tmp, { recursive: true, force: true })
    }
}

main().catch((err) => {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[setup-lz] ${message}`)
    process.exit(1)
})
