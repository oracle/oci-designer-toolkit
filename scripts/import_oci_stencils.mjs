#!/usr/bin/env node
/*
** Copyright (c) 2020, 2026, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const defaultArchives = [
  {
    collection: 'general',
    title: 'General',
    archive: '/Users/abirzu/Downloads/General.zip',
    prefix: 'General/',
  },
  {
    collection: 'services-products',
    title: 'Services or Products',
    archive: '/Users/abirzu/Downloads/OneDrive_2026-06-09 (4).zip',
    prefix: 'Services or Products/',
  },
]

const reactPublicRoot = path.join(repoRoot, 'ocd/packages/react/public/oci-stencils')
const desktopPublicRoot = path.join(repoRoot, 'ocd/packages/desktop/public/oci-stencils')
const cssOutput = path.join(repoRoot, 'ocd/packages/react/src/css/oci-stencils.css')
const dataOutput = path.join(repoRoot, 'ocd/packages/react/src/data/OcdOciStencils.ts')

const oracleCloudStencilPattern = new RegExp([
  '\\boci\\b',
  '\\boracle\\b',
  '\\bcloud\\b',
  'cloud-at-customer',
  '\\bautonomous\\b',
  '\\bdatabase\\b',
  '\\bdb\\b',
  '\\bdbaas\\b',
  '\\badw\\b',
  '\\batp\\b',
  '\\brac\\b',
  '\\bmysql\\b',
  '\\bnosql\\b',
  '\\bpostgresql\\b',
  '\\bpsql\\b',
  '\\bredis\\b',
  '\\bexadata\\b',
  '\\bexascale\\b',
  '\\bgoldengate\\b',
  '\\bapex\\b',
  '\\bords\\b',
  '\\bsql developer\\b',
  '\\bweblogic\\b',
  '\\bvisual builder\\b',
  '\\bdigital assistant\\b',
  '\\bdata catalog\\b',
  '\\bdatacatalog\\b',
  '\\bdata flow\\b',
  '\\bdataflow\\b',
  '\\bdata integration\\b',
  '\\bdataintegration\\b',
  '\\bdata science\\b',
  '\\bdatascience\\b',
  '\\bdata safe\\b',
  '\\bdatasafe\\b',
  '\\bdata guard\\b',
  '\\bdata lake\\b',
  '\\bdata lakehouse\\b',
  '\\bdata transfer\\b',
  '\\bdata pump\\b',
  '\\bdata transforms\\b',
  '\\bdocument understanding\\b',
  '\\bai\\b',
  '\\bartificial intelligence\\b',
  '\\bgenerative ai\\b',
  '\\bgen ai\\b',
  '\\bselect ai\\b',
  '\\bmachine learning\\b',
  '\\banomaly detection\\b',
  '\\bforecasting\\b',
  '\\bvision\\b',
  '\\blanguage\\b',
  '\\bcompute\\b',
  '\\bbare metal\\b',
  '\\bvirtual machine\\b',
  '\\bvm\\b',
  '\\bgpu\\b',
  '\\bautoscaling\\b',
  '\\binstance pools?\\b',
  '\\bcontainers?\\b',
  '\\bcontainer engine\\b',
  '\\bkubernetes\\b',
  '\\boke\\b',
  '\\bcontainer registry\\b',
  '\\bcontainer repository\\b',
  '\\bnetwork\\b',
  '\\bvcn\\b',
  '\\bsubnet\\b',
  '\\broute ?table\\b',
  '\\bsecurity ?lists?\\b',
  '\\bdrg\\b',
  '\\bdynamic routing gateway\\b',
  '\\binternet gateway\\b',
  '\\bnat gateway\\b',
  '\\bservice gateway\\b',
  '\\blocal peering\\b',
  '\\bremote peering\\b',
  '\\bcustomer premises equipment\\b',
  '\\bcpe\\b',
  '\\bvpn\\b',
  '\\bbyoip\\b',
  '\\bip pools?\\b',
  '\\bprivate endpoint\\b',
  '\\bprivate ip\\b',
  '\\bload ?balancer\\b',
  '\\bfirewall\\b',
  '\\bwaf\\b',
  '\\bddos\\b',
  '\\bdns\\b',
  '\\bvtap\\b',
  '\\bbackbone\\b',
  '\\bblock ?storage\\b',
  '\\bobject ?storage\\b',
  '\\bstorage buckets?\\b',
  '\\bfile ?storage\\b',
  '\\bmount target\\b',
  '\\bboot volume\\b',
  '\\bvolume\\b',
  '\\bvault\\b',
  '\\bkey ?management\\b',
  '\\bkms\\b',
  '\\bcertificates?\\b',
  '\\bidentity\\b',
  '\\biam\\b',
  '\\bgroups?\\b',
  '\\bpolic(y|ies)\\b',
  '\\bcompartments?\\b',
  '\\btagging\\b',
  '\\baudit\\b',
  '\\bcloud guard\\b',
  '\\bsecurity zone\\b',
  '\\bmaxsecurityzone\\b',
  '\\bvulnerability\\b',
  '\\bthreat\\b',
  '\\bencryption\\b',
  '\\blogging\\b',
  '\\blogging analytics\\b',
  '\\bmonitoring\\b',
  '\\balarm\\b',
  '\\bevents?\\b',
  '\\bstreaming\\b',
  '\\bqueue\\b',
  '\\bnotifications?\\b',
  '\\bservice connector\\b',
  '\\bservice mesh\\b',
  '\\bresource ?manager\\b',
  '\\bresource ?management\\b',
  '\\bmarketplace\\b',
  '\\bdevops\\b',
  '\\bhealth ?checks?\\b',
  '\\banalytics\\b',
  '\\bapplication performance monitoring\\b',
  '\\bapm\\b',
  '\\boperations insight\\b',
  '\\bopsi\\b',
  '\\bdatabase management\\b',
  '\\bstack monitoring\\b',
  '\\bmanagement agent\\b',
  '\\bjava management\\b',
  '\\bos management\\b',
  '\\bfleet applications management\\b',
  '\\bcloud migrations?\\b',
  '\\bmigration workbench\\b',
  '\\bzero downtime migration\\b',
  '\\broving edge\\b',
  '\\bdedicated region\\b',
  '\\bcloud native environment\\b',
  '\\bdigital media\\b',
  '\\bmedia flow\\b',
  '\\bmedia stream\\b',
  '\\bsearch with opensearch\\b',
  '\\bopensearch\\b',
  '\\bblockchain\\b',
  '\\bbig ?data\\b',
  '\\bbds\\b',
  '\\bemail\\b',
  '\\bfunctions?\\b',
  '\\bintegration\\b',
].join('|'), 'i')

function isOracleCloudStencil(source, title, entry) {
  if (source.collection === 'general') {
    return /\b(oci|oracle|cloud|autonomous|database|exadata|goldengate|mysql|nosql|apex|ords|sql developer|weblogic|kubernetes)\b/i.test(`${title} ${entry}`)
  }

  return oracleCloudStencilPattern.test(`${title} ${entry}`)
}

function listArchive(archive) {
  return execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8', maxBuffer: 1024 * 1024 * 16 })
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function extractArchiveSvgs(archive) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocd-oci-stencils-'))
  execFileSync('unzip', ['-q', archive, '*.svg', '-d', tempDir], { stdio: 'pipe', maxBuffer: 1024 * 1024 * 16 })
  return tempDir
}

function walkFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walkFiles(entryPath)
    return [entryPath]
  })
}

function cleanTitle(entry, prefix) {
  const withoutPrefix = entry.startsWith(prefix) ? entry.slice(prefix.length) : entry
  const basename = path.posix.basename(withoutPrefix, path.posix.extname(withoutPrefix))
  return basename.replace(/\s+/g, ' ').trim()
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .toLowerCase()
}

function uniqueId(base, used) {
  let candidate = base || 'stencil'
  let suffix = 2
  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  used.add(candidate)
  return candidate
}

function ensureEmptyDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
}

function syncDir(source, target) {
  fs.rmSync(target, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.cpSync(source, target, { recursive: true })
}

function writeTextFile(filename, content) {
  fs.mkdirSync(path.dirname(filename), { recursive: true })
  fs.writeFileSync(filename, content)
}

function buildCss(stencils) {
  const lines = [
    '/* Copyright (c) 2020, 2026, Oracle and/or its affiliates. All rights reserved. */',
    '/* Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl. */',
    '/* Generated by scripts/import_oci_stencils.mjs. Do not edit by hand. */',
    '',
    ':root {',
    ...stencils.map((stencil) => `    ${stencil.cssVariable}: url("/${stencil.path}");`),
    '}',
    '',
    '.ocd-oci-stencil {',
    '    background-repeat: no-repeat;',
    '    background-position: center;',
    '    background-size: contain;',
    '}',
    '',
    ...stencils.map((stencil) => `.${stencil.className} {\n    background-image: var(${stencil.cssVariable});\n}`),
    '',
  ]
  return lines.join('\n')
}

function buildData(stencils, collections) {
  const json = JSON.stringify(stencils, null, 4)
  const collectionJson = JSON.stringify(collections, null, 4)
  return `/*
** Copyright (c) 2020, 2026, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

// Generated by scripts/import_oci_stencils.mjs. Do not edit by hand.

export type OciStencilCollection = 'general' | 'services-products'

export interface OciStencil {
    readonly id: string
    readonly title: string
    readonly collection: OciStencilCollection
    readonly collectionTitle: string
    readonly className: string
    readonly cssVariable: string
    readonly path: string
}

export const ociStencilCollections = ${collectionJson} as const

export const ociStencils = ${json} as const satisfies readonly OciStencil[]

export const ociStencilById = Object.freeze(Object.fromEntries(
    ociStencils.map((stencil) => [stencil.id, stencil]),
)) as Readonly<Record<string, OciStencil>>

export const ociStencilCssVariables = Object.freeze(Object.fromEntries(
    ociStencils.map((stencil) => [stencil.id, stencil.cssVariable]),
)) as Readonly<Record<string, string>>

export const ociStencilClassNames = Object.freeze(Object.fromEntries(
    ociStencils.map((stencil) => [stencil.id, stencil.className]),
)) as Readonly<Record<string, string>>

export const getOciStencil = (id: string): OciStencil | undefined => ociStencilById[id]

export const getOciStencilPath = (id: string): string | undefined => ociStencilById[id]?.path

export const getOciStencilUrl = (id: string, baseUri: string = globalThis.document?.baseURI ?? 'http://localhost/'): string | undefined => {
    const stencil = getOciStencil(id)
    return stencil ? new URL(stencil.path, baseUri).toString() : undefined
}

export default ociStencils
`
}

function importStencils(archives) {
  const usedIds = new Set()
  const stencils = []
  const importStats = []

  ensureEmptyDir(reactPublicRoot)

  for (const source of archives) {
    if (!fs.existsSync(source.archive)) {
      throw new Error(`Archive not found: ${source.archive}`)
    }
    const extractedRoot = extractArchiveSvgs(source.archive)
    const collectionDir = path.join(reactPublicRoot, source.collection)
    fs.mkdirSync(collectionDir, { recursive: true })

    const candidateEntries = listArchive(source.archive)
      .filter((entry) => entry.startsWith(source.prefix))
      .filter((entry) => !entry.includes('/PNG '))
      .filter((entry) => entry.toLowerCase().endsWith('.svg'))
      .sort((a, b) => a.localeCompare(b))
    const entries = candidateEntries
      .filter((entry) => isOracleCloudStencil(source, cleanTitle(entry, source.prefix), entry))
    importStats.push({
      collection: source.collection,
      title: source.title,
      candidates: candidateEntries.length,
      accepted: entries.length,
      excluded: candidateEntries.length - entries.length,
    })
    const extractedByEntry = new Map(walkFiles(extractedRoot).map((filename) => [
      path.relative(extractedRoot, filename).split(path.sep).join('/'),
      filename,
    ]))

    for (const entry of entries) {
      const title = cleanTitle(entry, source.prefix)
      const baseId = uniqueId(`${source.collection}-${slugify(title)}`, usedIds)
      const filename = `${baseId}.svg`
      const relativePath = `oci-stencils/${source.collection}/${filename}`
      const outputFile = path.join(collectionDir, filename)
      const extractedFile = extractedByEntry.get(entry)
      if (!extractedFile) throw new Error(`Extracted SVG not found for archive entry: ${entry}`)
      const content = fs.readFileSync(extractedFile)

      fs.writeFileSync(outputFile, content)
      stencils.push({
        id: baseId,
        title,
        collection: source.collection,
        collectionTitle: source.title,
        className: `ocd-oci-stencil-${baseId}`,
        cssVariable: `--ocd-oci-stencil-${baseId}`,
        path: relativePath,
      })
    }
    fs.rmSync(extractedRoot, { recursive: true, force: true })
  }

  syncDir(reactPublicRoot, desktopPublicRoot)
  writeTextFile(cssOutput, buildCss(stencils))
  writeTextFile(dataOutput, buildData(stencils, archives.map(({ collection, title }) => ({ id: collection, title }))))

  return { stencils, importStats }
}

const { stencils, importStats } = importStencils(defaultArchives)
const counts = stencils.reduce((acc, stencil) => ({ ...acc, [stencil.collection]: (acc[stencil.collection] ?? 0) + 1 }), {})
console.info(`[oci-stencils] Imported ${stencils.length} SVG stencils`)
for (const stat of importStats) {
  console.info(`[oci-stencils] ${stat.collection}: accepted ${stat.accepted}/${stat.candidates}, excluded ${stat.excluded} non-Oracle/OCI SVGs`)
}
for (const [collection, count] of Object.entries(counts)) {
  console.info(`[oci-stencils] ${collection}: ${count}`)
}
console.info(`[oci-stencils] Wrote ${path.relative(repoRoot, cssOutput)}`)
console.info(`[oci-stencils] Wrote ${path.relative(repoRoot, dataOutput)}`)
