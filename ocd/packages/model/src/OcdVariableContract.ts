/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

/**
 * OcdVariableContract — the single authoritative generator for Landing Zone
 * naming. Every exporter / diagram / config emitter SHOULD derive resource
 * names from here instead of re-deriving the `<region>/<env>/<lze>` token rules
 * ad hoc.
 *
 * The conventions encoded below are NOT invented — they are lifted verbatim from
 * the Landing-Zone-Next-Gen (LZNG) addon, which is today's de-facto source of
 * truth for token naming. Each generator cites the file:line it mirrors:
 *
 *   external/lz-addons/landing-zone-next-gen/src-lzng/services/hubKinds.ts
 *   external/lz-addons/landing-zone-next-gen/src-lzng/services/routeTables.ts
 *   external/lz-addons/landing-zone-next-gen/src-lzng/diagram/buildGraph.ts
 *   external/lz-addons/landing-zone-next-gen/src-lzng/model/defaults.ts
 *
 * Design rules:
 *   - Pure & immutable: inputs are `Readonly`, nothing is mutated, same input →
 *     same output.
 *   - The `<region>` token resolves to `regionShortName` (the 3-letter key), NOT
 *     the full region id — matching hubKinds/buildGraph/routeTables.
 *   - Token substitution leaves a token literal when its value is empty, exactly
 *     like `resolveHubName` (so a half-filled wizard shows what's missing).
 */

// ---------------------------------------------------------------------------
// Naming context — the inputs every generator derives names from.
// Mirrors FoundationConfig + presentation.landingZone in the LZNG model
// (src-lzng/model/types.ts FoundationConfig; buildGraph.ts:220-227).
// ---------------------------------------------------------------------------
export interface OcdNamingContext {
    /** Realm id, e.g. 'oc1'. Not tokenized by any current source — carried for completeness. */
    realm: string
    /** Full region identifier, e.g. 'eu-frankfurt-1'. Used for region labels, NOT the `<region>` token. */
    region: string
    /** Three-letter region key, e.g. 'fra'. This is what the `<region>` token expands to. */
    regionShortName: string
    /** Landing-zone name (raw, as the wizard stores it), e.g. 'landingzone'. Expands the `<lze>` token. */
    lze: string
    /** Environment name, e.g. 'prod'. Optional — absent on hub-scoped names. Expands the `<env>` token. */
    env?: string
}

/** A token recognised by {@link expandTokens}. */
export type OcdNameToken = '<region>' | '<env>' | '<lze>'

// ---------------------------------------------------------------------------
// Canonical constants (lifted from the LZNG addon).
// ---------------------------------------------------------------------------

/** Fixed spoke subnet roles every environment starts with (defaults.ts:13 ENV_SUBNET_ROLES). */
export const ENV_SUBNET_ROLES = ['web', 'app', 'db', 'infra'] as const
export type EnvSubnetRole = (typeof ENV_SUBNET_ROLES)[number]

/** Hub A subnet roles, in order (hubKinds.ts:38-43 defaultSubnets, minus the shared prefix). */
export const HUB_SUBNET_ROLES = ['fw-dmz', 'lb', 'fw-int', 'mgmt', 'mon', 'dns'] as const
export type HubSubnetRole = (typeof HUB_SUBNET_ROLES)[number]

/** Default DRG display name (defaults.ts:16 DEFAULT_DRG_NAME). */
export const DEFAULT_DRG_NAME = 'DRG'

/** Default landing-zone name when the field is blank (defaults.ts:72; buildGraph.ts:225). */
export const DEFAULT_LANDING_ZONE_NAME = 'landingzone'

// ---------------------------------------------------------------------------
// Name templates — the canonical token strings. Generators expand these via
// expandTokens, so the token rules live in exactly ONE place.
// ---------------------------------------------------------------------------
const HUB_VCN_TEMPLATE = 'vcn-<region>-<lze>-hub' // hubKinds.ts:35 defaultVcnName
const HUB_SUBNET_TEMPLATE_PREFIX = 'sn-<region>-<lze>-hub-' // hubKinds.ts:38-43 / lzConfig.ts:57
const SPOKE_SUBNET_TEMPLATE_PREFIX = 'sn-<region>-<env>-' // defaults.ts:38 envNetworkDefaults
const SPOKE_VCN_TEMPLATE = 'vcn-<region>-<env>-projects' // buildGraph.ts:286 vcnLabel
const HUB_ATTACHMENT_NAME = 'vcn-hub-attach' // defaults.ts:20 hubRoutingDefaults.attachmentName
const SPOKE_ATTACHMENT_TEMPLATE = 'vcn-<env>-attach' // defaults.ts:25 envRoutingDefaults.attachmentName

// ---------------------------------------------------------------------------
// Token substitution — the reusable primitive. Mirrors resolveHubName
// (hubKinds.ts:103-109): replace a token only when its value is non-empty, so
// unresolved tokens stay literal.
// ---------------------------------------------------------------------------
export function expandTokens(template: string, ctx: Readonly<OcdNamingContext>): string {
    let out = template
    const region = ctx.regionShortName.trim()
    const lze = ctx.lze.trim()
    const env = (ctx.env ?? '').trim()
    if (region) out = out.replaceAll('<region>', region)
    if (lze) out = out.replaceAll('<lze>', lze)
    if (env) out = out.replaceAll('<env>', env)
    return out
}

// ---------------------------------------------------------------------------
// Landing-zone name helper.
// buildGraph.ts:225-226 strips a leading `cmp-` and defaults to 'landingzone';
// the `cmp-` prefix is then re-applied on the compartment label. Note: the
// `<lze>` TOKEN expands to the RAW value (buildGraph.ts:227 `lze: lzRaw`), so
// compartment labels and token-based names can diverge — see header notes.
// ---------------------------------------------------------------------------
export function landingZoneName(ctx: Readonly<OcdNamingContext>): string {
    const raw = ctx.lze.trim().replace(/^cmp-/, '')
    return raw || DEFAULT_LANDING_ZONE_NAME
}

// ---------------------------------------------------------------------------
// VCN names.
// ---------------------------------------------------------------------------

/** Hub VCN name: `vcn-<region>-<lze>-hub` (hubKinds.ts:35). */
export function hubVcnName(ctx: Readonly<OcdNamingContext>): string {
    return expandTokens(HUB_VCN_TEMPLATE, ctx)
}

/** Spoke (environment) VCN name: `vcn-<region>-<env>-projects` (buildGraph.ts:286). */
export function spokeVcnName(ctx: Readonly<OcdNamingContext>): string {
    return expandTokens(SPOKE_VCN_TEMPLATE, ctx)
}

// ---------------------------------------------------------------------------
// Subnet names.
// ---------------------------------------------------------------------------

/** Hub subnet name: `sn-<region>-<lze>-hub-<role>` (hubKinds.ts:38-43). */
export function hubSubnetName(ctx: Readonly<OcdNamingContext>, role: string): string {
    return expandTokens(`${HUB_SUBNET_TEMPLATE_PREFIX}${role}`, ctx)
}

/** Spoke subnet name: `sn-<region>-<env>-<role>` (defaults.ts:38). */
export function spokeSubnetName(ctx: Readonly<OcdNamingContext>, role: string): string {
    return expandTokens(`${SPOKE_SUBNET_TEMPLATE_PREFIX}${role}`, ctx)
}

// ---------------------------------------------------------------------------
// Compartment names. These are built by direct interpolation in buildGraph
// (not via resolveHubName), using the `cmp-` stripped landing-zone name.
//   cmp-<lze>            landing zone        (buildGraph.ts:226)
//   cmp-<lze>-network    shared network      (buildGraph.ts:339)
//   cmp-<lze>-security   security            (buildGraph.ts:397)
//   cmp-<lze>-<env>      one per environment (buildGraph.ts:283)
//   cmp-<lze>-<env>-network   env network    (buildGraph.ts:285)
//   cmp-<lze>-<env>-projects  env projects   (buildGraph.ts:420)
// ---------------------------------------------------------------------------

export function landingZoneCompartmentName(ctx: Readonly<OcdNamingContext>): string {
    return `cmp-${landingZoneName(ctx)}`
}

export function networkCompartmentName(ctx: Readonly<OcdNamingContext>): string {
    return `cmp-${landingZoneName(ctx)}-network`
}

export function securityCompartmentName(ctx: Readonly<OcdNamingContext>): string {
    return `cmp-${landingZoneName(ctx)}-security`
}

/** Requires `ctx.env`; throws when absent so callers do not silently emit `cmp-<lze>-undefined`. */
export function environmentCompartmentName(ctx: Readonly<OcdNamingContext>): string {
    return `cmp-${landingZoneName(ctx)}-${requireEnv(ctx)}`
}

export function environmentNetworkCompartmentName(ctx: Readonly<OcdNamingContext>): string {
    return `cmp-${landingZoneName(ctx)}-${requireEnv(ctx)}-network`
}

export function environmentProjectsCompartmentName(ctx: Readonly<OcdNamingContext>): string {
    return `cmp-${landingZoneName(ctx)}-${requireEnv(ctx)}-projects`
}

// ---------------------------------------------------------------------------
// DRG + attachment names.
// ---------------------------------------------------------------------------

/** The single DRG display name (defaults.ts:16). */
export function drgName(): string {
    return DEFAULT_DRG_NAME
}

/** Hub VCN → DRG attachment: `vcn-hub-attach` (defaults.ts:20). */
export function hubAttachmentName(): string {
    return HUB_ATTACHMENT_NAME
}

/** Spoke VCN → DRG attachment: `vcn-<env>-attach` (defaults.ts:25). */
export function spokeAttachmentName(ctx: Readonly<OcdNamingContext>): string {
    return expandTokens(SPOKE_ATTACHMENT_TEMPLATE, ctx)
}

// ---------------------------------------------------------------------------
// Route-table names (routeTables.ts).
//   Hub subnet tables   rt-<region>-hub-<role>        (routeTables.ts:105-118)
//   Hub gateway tables  rt-<region>-hub-<gateway>     (routeTables.ts:121-127)
//   DRG tables          rt-<region>-drg-<target>      (routeTables.ts:135,141)
//   Spoke subnet tables rt-<region>-ssn-<env>-<role>  (routeTables.ts:151)
// `<region>` here is the regionShortName too (routeTables.ts:77).
// ---------------------------------------------------------------------------

export type HubGatewayRole = 'igw' | 'natgw' | 'ingress'

/**
 * Hub-subnet route-table role. NOTE the irregular mapping: the route table for
 * the `fw-int` subnet is named `...-internal`, NOT `...-fw-int` or `...-int`
 * (routeTables.ts:111). `fw-dmz` collapses to `dmz` (routeTables.ts:105). This
 * is one of the documented naming inconsistencies — kept faithful here.
 */
export function hubRouteTableRole(hubSubnetRole: string): string {
    if (hubSubnetRole === 'fw-int') return 'internal'
    if (hubSubnetRole === 'fw-dmz') return 'dmz'
    return hubSubnetRole
}

/** `rt-<region>-hub-<role>` — pass a hub-subnet role; mapping applied for you. */
export function hubSubnetRouteTableName(ctx: Readonly<OcdNamingContext>, hubSubnetRole: string): string {
    return expandTokens(`rt-<region>-hub-${hubRouteTableRole(hubSubnetRole)}`, ctx)
}

/** `rt-<region>-hub-<gateway>` (igw / natgw / ingress). */
export function hubGatewayRouteTableName(ctx: Readonly<OcdNamingContext>, gateway: HubGatewayRole): string {
    return expandTokens(`rt-<region>-hub-${gateway}`, ctx)
}

/** `rt-<region>-drg-hub` (routeTables.ts:135). */
export function hubDrgRouteTableName(ctx: Readonly<OcdNamingContext>): string {
    return expandTokens('rt-<region>-drg-hub', ctx)
}

/** `rt-<region>-drg-<env>` (routeTables.ts:141). */
export function spokeDrgRouteTableName(ctx: Readonly<OcdNamingContext>): string {
    return expandTokens(`rt-<region>-drg-${requireEnv(ctx)}`, ctx)
}

/** `rt-<region>-ssn-<env>-<role>` (routeTables.ts:151). */
export function spokeSubnetRouteTableName(ctx: Readonly<OcdNamingContext>, role: string): string {
    return expandTokens(`rt-<region>-ssn-${requireEnv(ctx)}-${role}`, ctx)
}

// ---------------------------------------------------------------------------
// Firewall instance names (route-table captions).
//   nfw-<region>-hub-dmz / nfw-<region>-hub-int  (routeTables.ts:90-91)
// Note: the DMZ firewall maps to subnet role `fw-dmz` and the internal firewall
// to `fw-int`, but the caption uses bare `dmz` / `int` — a third spelling of the
// same two firewalls (see inconsistencies in header).
// ---------------------------------------------------------------------------
export type FirewallPosition = 'dmz' | 'int'

export function firewallName(ctx: Readonly<OcdNamingContext>, position: FirewallPosition): string {
    return expandTokens(`nfw-<region>-hub-${position}`, ctx)
}

// ---------------------------------------------------------------------------
// Internal helpers.
// ---------------------------------------------------------------------------
function requireEnv(ctx: Readonly<OcdNamingContext>): string {
    const env = (ctx.env ?? '').trim()
    if (!env) {
        throw new Error('OcdNamingContext.env is required for environment-scoped names')
    }
    return env
}
