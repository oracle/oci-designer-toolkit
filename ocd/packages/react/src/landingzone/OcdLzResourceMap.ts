/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/**
 * Cross-project resource name mapping (roadmap B3).
 *
 * Single source of truth linking, for every resource the Operating Entities
 * (OE / Landing Zone Next Generation) generator actually emits:
 *
 *   - the OCD model resource type      (the `OcdResource` key, e.g. 'vcn')
 *   - the OCI Terraform resource type   (e.g. 'oci_core_vcn')
 *   - a human friendly display name     (matches the OcdPalette title)
 *   - the OE/LZNG section key path(s)    (dotted path into the OE JSON output)
 *   - the OcdPalette icon class          (e.g. 'oci-vcn')
 *
 * This underpins the future "Open generated LZ in Designer" bridge: when the
 * wizard emits an OE configuration, the bridge can walk the OE JSON, look up
 * each OE key here, and instantiate the matching OCD model resource (with the
 * right Terraform type + palette icon) on the canvas.
 *
 * Provenance of every value below:
 *   - `ocdModelType`     : verified against the `newResource(type='...')`
 *                          default in
 *                          packages/model/src/provider/oci/resources/generated/Oci*.ts
 *   - `ociTerraformType` : verified against the `resource "oci_..."` literal in
 *                          packages/export/src/terraform/provider/oci/resources/generated/Oci*.ts
 *   - `oeKinds`          : verified against the OE builders in
 *                          packages/react/src/landingzone/oe/gen/builders/*.libsonnet
 *                          and hub/*.libsonnet (note: OE sources are gitignored).
 *   - `paletteClass`     : verified against packages/react/src/data/OcdPalette.ts
 *
 * Do not invent keys. Any OE-key mapping that could not be confidently
 * verified is flagged with a `// TODO verify` comment.
 */

export interface CrossProjectResource {
    /** OCD model resource type — the `OcdResource` key (e.g. 'vcn'). */
    ocdModelType: string
    /** OCI Terraform resource type (e.g. 'oci_core_vcn'). */
    ociTerraformType: string
    /** Human friendly display name (matches the OcdPalette title). */
    displayName: string
    /**
     * OE/LZNG section key path(s) this resource maps to.
     *
     * Paths are dotted into the OE JSON output. Where a resource is nested
     * inside the per-category / per-VCN network tree the path is given
     * relative to its parent container (the wildcard `*` denotes a generated
     * category / VCN / project key).
     */
    oeKinds: string[]
    /** OcdPalette icon class (e.g. 'oci-vcn'). */
    paletteClass?: string
}

/**
 * Network sub-resources are emitted nested under each generated VCN inside the
 * network configuration categories tree. This prefix documents that parent
 * path so the nested `oeKinds` entries below stay readable.
 *
 *   network.network_configuration.network_configuration_categories.<category>.vcns.<vcn>
 */
const NET_VCN = 'network.network_configuration.network_configuration_categories.*.vcns.*'

export const CROSS_PROJECT_RESOURCES: readonly CrossProjectResource[] = [
    // --- Identity / IAM ---
    {
        ocdModelType: 'compartment',
        ociTerraformType: 'oci_identity_compartment',
        displayName: 'Compartment',
        oeKinds: ['iam.compartments_configuration.compartments'],
        paletteClass: 'oci-compartment',
    },
    {
        ocdModelType: 'group',
        ociTerraformType: 'oci_identity_group',
        displayName: 'Group',
        // OE emits IAM groups inside the identity domain groups configuration.
        oeKinds: ['iam.identity_domain_groups_configuration.groups'],
        paletteClass: 'oci-group',
    },
    {
        ocdModelType: 'dynamic_group',
        ociTerraformType: 'oci_identity_dynamic_group',
        displayName: 'Dynamic Group',
        // TODO verify — the OE IAM builder emits identity_domains_configuration
        // and identity_domain_groups_configuration but no standalone
        // dynamic_groups section was found; dynamic group grants appear inside
        // policy statements. Mapping kept for the designer bridge but unconfirmed.
        oeKinds: ['iam.identity_domain_groups_configuration.dynamic_groups'],
        paletteClass: 'oci-dynamic-group',
    },
    {
        ocdModelType: 'policy',
        ociTerraformType: 'oci_identity_policy',
        displayName: 'Policy',
        oeKinds: ['iam.policies_configuration.supplied_policies'],
        paletteClass: 'oci-policy',
    },

    // --- Networking: VCN and contained resources ---
    {
        ocdModelType: 'vcn',
        ociTerraformType: 'oci_core_vcn',
        displayName: 'Vcn',
        oeKinds: [`${NET_VCN.replace('.vcns.*', '.vcns')}`],
        paletteClass: 'oci-vcn',
    },
    {
        ocdModelType: 'subnet',
        ociTerraformType: 'oci_core_subnet',
        displayName: 'Subnet',
        oeKinds: [`${NET_VCN}.subnets`],
        paletteClass: 'oci-subnet',
    },
    {
        ocdModelType: 'route_table',
        ociTerraformType: 'oci_core_route_table',
        displayName: 'Route Table',
        oeKinds: [`${NET_VCN}.route_tables`],
        paletteClass: 'oci-route-table',
    },
    {
        ocdModelType: 'security_list',
        ociTerraformType: 'oci_core_security_list',
        displayName: 'Security List',
        // OE emits both a default_security_list and a security_lists map per VCN.
        oeKinds: [`${NET_VCN}.security_lists`, `${NET_VCN}.default_security_list`],
        paletteClass: 'oci-security-list',
    },
    {
        ocdModelType: 'network_security_group',
        ociTerraformType: 'oci_core_network_security_group',
        displayName: 'Network Security Group',
        oeKinds: [`${NET_VCN}.network_security_groups`],
        paletteClass: 'oci-network-security-group',
    },

    // --- Networking: VCN-specific gateways ---
    {
        ocdModelType: 'internet_gateway',
        ociTerraformType: 'oci_core_internet_gateway',
        displayName: 'Internet Gateway',
        oeKinds: [`${NET_VCN}.vcn_specific_gateways.internet_gateways`],
        paletteClass: 'oci-internet-gateway',
    },
    {
        ocdModelType: 'nat_gateway',
        ociTerraformType: 'oci_core_nat_gateway',
        displayName: 'NAT Gateway',
        oeKinds: [`${NET_VCN}.vcn_specific_gateways.nat_gateways`],
        paletteClass: 'oci-nat-gateway',
    },
    {
        ocdModelType: 'service_gateway',
        ociTerraformType: 'oci_core_service_gateway',
        displayName: 'Service Gateway',
        oeKinds: [`${NET_VCN}.vcn_specific_gateways.service_gateways`],
        paletteClass: 'oci-service-gateway',
    },

    // --- Networking: DRG (non-VCN-specific gateways) ---
    {
        ocdModelType: 'drg',
        ociTerraformType: 'oci_core_drg',
        displayName: 'Dynamic Routing Gateway',
        oeKinds: [`${NET_VCN}.non_vcn_specific_gateways.dynamic_routing_gateways`],
        paletteClass: 'oci-drg',
    },
    {
        ocdModelType: 'drg_attachment',
        ociTerraformType: 'oci_core_drg_attachment',
        displayName: 'Dynamic Routing Gateway Attachment',
        // Nested under each DRG entry in the OE output.
        oeKinds: [`${NET_VCN}.non_vcn_specific_gateways.dynamic_routing_gateways.*.drg_attachments`],
        paletteClass: 'oci-drg-attachment',
    },
    {
        ocdModelType: 'drg_route_table',
        ociTerraformType: 'oci_core_drg_route_table',
        displayName: 'DRG Route Table',
        oeKinds: [`${NET_VCN}.non_vcn_specific_gateways.dynamic_routing_gateways.*.drg_route_tables`],
        paletteClass: 'oci-drg-route-table',
    },
    {
        ocdModelType: 'drg_route_distribution',
        ociTerraformType: 'oci_core_drg_route_distribution',
        displayName: 'DRG Route Distribution',
        oeKinds: [`${NET_VCN}.non_vcn_specific_gateways.dynamic_routing_gateways.*.drg_route_distributions`],
        paletteClass: 'oci-drg-route-distribution',
    },
] as const

/**
 * Build a flat lookup of every OE key path to its mapping. A resource that
 * declares multiple OE keys is indexed under each of them.
 */
const oeKindIndex: ReadonlyMap<string, CrossProjectResource> = (() => {
    const index = new Map<string, CrossProjectResource>()
    for (const resource of CROSS_PROJECT_RESOURCES) {
        for (const kind of resource.oeKinds) {
            index.set(kind, resource)
        }
    }
    return index
})()

const ocdModelTypeIndex: ReadonlyMap<string, CrossProjectResource> = new Map(
    CROSS_PROJECT_RESOURCES.map((resource) => [resource.ocdModelType, resource])
)

const terraformTypeIndex: ReadonlyMap<string, CrossProjectResource> = new Map(
    CROSS_PROJECT_RESOURCES.map((resource) => [resource.ociTerraformType, resource])
)

/** Look up a mapping by its OE/LZNG section key path. */
export function byOeKind(oeKind: string): CrossProjectResource | undefined {
    return oeKindIndex.get(oeKind)
}

/** Look up a mapping by its OCD model resource type (e.g. 'vcn'). */
export function byOcdModelType(t: string): CrossProjectResource | undefined {
    return ocdModelTypeIndex.get(t)
}

/** Look up a mapping by its OCI Terraform resource type (e.g. 'oci_core_vcn'). */
export function byTerraformType(t: string): CrossProjectResource | undefined {
    return terraformTypeIndex.get(t)
}

export default CROSS_PROJECT_RESOURCES
