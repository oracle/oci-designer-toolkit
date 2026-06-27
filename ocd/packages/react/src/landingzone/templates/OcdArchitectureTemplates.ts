/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Enterprise Architecture Template Gallery
**
** Provides a curated set of starter architecture templates. Each template's
** `build` function constructs a fresh OcdDesign containing real model
** resources (via the generated factory namespace functions in OciModelResources),
** so the result can be loaded directly onto the canvas.
**
** Templates currently available:
**   hub-spoke-network      Hub-and-spoke VCN topology with DRG peering
**   three-tier-web-app     Classic 3-tier (LB + app + DB) in a single VCN
**   oke-platform           Kubernetes platform: OKE cluster, node pool, LB subnet
**   secure-landing-zone-lite  Lightweight LZ: root compartment + network + IAM policies
*/

import { OcdDesign, OcdViewLayer } from '@ocd/model'
import { OciModelResources } from '@ocd/model'
import {
    applyCrossTenancyHubSpokeOverlay,
    LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY,
} from '../OcdLzCrossTenancyHubSpoke'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface OcdArchitectureTemplate {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly tags: readonly string[]
    /** Returns a freshly-built OcdDesign seeded with the template resources. */
    build(): OcdDesign
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Push a resource into design.model.oci.resources[key], creating the list if needed. */
function push(design: OcdDesign, key: string, resource: object): void {
    if (!Object.hasOwn(design.model.oci.resources, key)) {
        design.model.oci.resources[key] = []
    }
    design.model.oci.resources[key].push(resource)
}

/** Add a layer (compartment) to every page of the design. */
function addLayer(design: OcdDesign, compartmentId: string, selected: boolean): void {
    const layer: OcdViewLayer = {
        id: compartmentId,
        class: 'oci-compartment',
        visible: true,
        selected,
    }
    design.view.pages.forEach((p) => p.layers.push(layer))
}

/** Create a new design with an empty resource set and cleared layers/coords. */
function baseDesign(title: string): OcdDesign {
    const design = OcdDesign.newDesign()
    design.metadata.title = title
    design.model.oci.resources = {}
    if (design.view.pages[0]) {
        design.view.pages[0].title = title
        design.view.pages[0].layers = []
        design.view.pages[0].coords = []
        design.view.pages[0].connectors = []
    }
    return design
}

// ---------------------------------------------------------------------------
// Template 1 — Hub-and-Spoke Network
// ---------------------------------------------------------------------------

function buildHubSpoke(): OcdDesign {
    const design = baseDesign('Hub-and-Spoke Network')

    // Root compartment
    const rootCmpt = OciModelResources.OciCompartment.newResource()
    rootCmpt.displayName = 'Network Root'
    rootCmpt.description = 'Root compartment for hub-and-spoke topology'
    push(design, 'compartment', rootCmpt)

    const hubCmpt = OciModelResources.OciCompartment.newResource()
    hubCmpt.displayName = 'Hub Compartment'
    hubCmpt.description = 'Hub VCN compartment'
    hubCmpt.compartmentId = rootCmpt.id
    push(design, 'compartment', hubCmpt)

    const spokeCmpt1 = OciModelResources.OciCompartment.newResource()
    spokeCmpt1.displayName = 'Spoke-A Compartment'
    spokeCmpt1.compartmentId = rootCmpt.id
    push(design, 'compartment', spokeCmpt1)

    const spokeCmpt2 = OciModelResources.OciCompartment.newResource()
    spokeCmpt2.displayName = 'Spoke-B Compartment'
    spokeCmpt2.compartmentId = rootCmpt.id
    push(design, 'compartment', spokeCmpt2)

    // DRG (lives in hub compartment)
    const drg = OciModelResources.OciDrg.newResource()
    drg.displayName = 'Hub DRG'
    drg.compartmentId = hubCmpt.id
    push(design, 'drg', drg)

    // Hub VCN
    const hubVcn = OciModelResources.OciVcn.newResource()
    hubVcn.displayName = 'Hub VCN'
    hubVcn.cidrBlocks = ['10.0.0.0/16']
    hubVcn.compartmentId = hubCmpt.id
    push(design, 'vcn', hubVcn)

    // Hub subnet (transit/inspection)
    const hubSubnet = OciModelResources.OciSubnet.newResource()
    hubSubnet.displayName = 'Hub Transit Subnet'
    hubSubnet.cidrBlock = '10.0.1.0/24'
    hubSubnet.vcnId = hubVcn.id
    hubSubnet.compartmentId = hubCmpt.id
    push(design, 'subnet', hubSubnet)

    // Hub IGW
    const igw = OciModelResources.OciInternetGateway.newResource()
    igw.displayName = 'Hub IGW'
    igw.vcnId = hubVcn.id
    igw.compartmentId = hubCmpt.id
    push(design, 'internet_gateway', igw)

    // Spoke-A VCN
    const spokeVcnA = OciModelResources.OciVcn.newResource()
    spokeVcnA.displayName = 'Spoke-A VCN'
    spokeVcnA.cidrBlocks = ['10.1.0.0/16']
    spokeVcnA.compartmentId = spokeCmpt1.id
    push(design, 'vcn', spokeVcnA)

    const spokeSubnetA = OciModelResources.OciSubnet.newResource()
    spokeSubnetA.displayName = 'Spoke-A App Subnet'
    spokeSubnetA.cidrBlock = '10.1.1.0/24'
    spokeSubnetA.vcnId = spokeVcnA.id
    spokeSubnetA.compartmentId = spokeCmpt1.id
    push(design, 'subnet', spokeSubnetA)

    const drgAttA = OciModelResources.OciDrgAttachment.newResource()
    drgAttA.displayName = 'Spoke-A DRG Attachment'
    drgAttA.drgId = drg.id
    drgAttA.compartmentId = hubCmpt.id
    push(design, 'drg_attachment', drgAttA)

    // Spoke-B VCN
    const spokeVcnB = OciModelResources.OciVcn.newResource()
    spokeVcnB.displayName = 'Spoke-B VCN'
    spokeVcnB.cidrBlocks = ['10.2.0.0/16']
    spokeVcnB.compartmentId = spokeCmpt2.id
    push(design, 'vcn', spokeVcnB)

    const spokeSubnetB = OciModelResources.OciSubnet.newResource()
    spokeSubnetB.displayName = 'Spoke-B App Subnet'
    spokeSubnetB.cidrBlock = '10.2.1.0/24'
    spokeSubnetB.vcnId = spokeVcnB.id
    spokeSubnetB.compartmentId = spokeCmpt2.id
    push(design, 'subnet', spokeSubnetB)

    const drgAttB = OciModelResources.OciDrgAttachment.newResource()
    drgAttB.displayName = 'Spoke-B DRG Attachment'
    drgAttB.drgId = drg.id
    drgAttB.compartmentId = hubCmpt.id
    push(design, 'drg_attachment', drgAttB)

    // Layers
    addLayer(design, rootCmpt.id, false)
    addLayer(design, hubCmpt.id, true)
    addLayer(design, spokeCmpt1.id, false)
    addLayer(design, spokeCmpt2.id, false)

    return design
}

// ---------------------------------------------------------------------------
// Template 2 — Three-Tier Web Application
// ---------------------------------------------------------------------------

function buildThreeTierWebApp(): OcdDesign {
    const design = baseDesign('Three-Tier Web Application')

    const cmpt = OciModelResources.OciCompartment.newResource()
    cmpt.displayName = 'Web App Compartment'
    cmpt.description = 'Three-tier web application compartment'
    push(design, 'compartment', cmpt)

    // VCN
    const vcn = OciModelResources.OciVcn.newResource()
    vcn.displayName = 'App VCN'
    vcn.cidrBlocks = ['10.10.0.0/16']
    vcn.compartmentId = cmpt.id
    push(design, 'vcn', vcn)

    // Internet Gateway
    const igw = OciModelResources.OciInternetGateway.newResource()
    igw.displayName = 'Internet Gateway'
    igw.vcnId = vcn.id
    igw.compartmentId = cmpt.id
    push(design, 'internet_gateway', igw)

    // NAT Gateway (for private subnets)
    const natGw = OciModelResources.OciNatGateway.newResource()
    natGw.displayName = 'NAT Gateway'
    natGw.vcnId = vcn.id
    natGw.compartmentId = cmpt.id
    push(design, 'nat_gateway', natGw)

    // Tier 1 — Public LB subnet
    const pubSubnet = OciModelResources.OciSubnet.newResource()
    pubSubnet.displayName = 'Public LB Subnet'
    pubSubnet.cidrBlock = '10.10.1.0/24'
    pubSubnet.vcnId = vcn.id
    pubSubnet.compartmentId = cmpt.id
    pubSubnet.prohibitPublicIpOnVnic = false
    push(design, 'subnet', pubSubnet)

    // Load Balancer in tier-1 subnet
    const lb = OciModelResources.OciLoadBalancer.newResource()
    lb.displayName = 'Public Load Balancer'
    lb.compartmentId = cmpt.id
    lb.subnetIds = [pubSubnet.id]
    lb.isPrivate = false
    lb.shape = 'flexible'
    push(design, 'load_balancer', lb)

    // Tier 2 — App subnet (private)
    const appSubnet = OciModelResources.OciSubnet.newResource()
    appSubnet.displayName = 'App Subnet'
    appSubnet.cidrBlock = '10.10.2.0/24'
    appSubnet.vcnId = vcn.id
    appSubnet.compartmentId = cmpt.id
    appSubnet.prohibitPublicIpOnVnic = true
    push(design, 'subnet', appSubnet)

    // App Instance 1
    const app1 = OciModelResources.OciInstance.newResource()
    app1.displayName = 'App Server 1'
    app1.compartmentId = cmpt.id
    if (app1.createVnicDetails) app1.createVnicDetails.subnetId = appSubnet.id
    push(design, 'instance', app1)

    // App Instance 2
    const app2 = OciModelResources.OciInstance.newResource()
    app2.displayName = 'App Server 2'
    app2.compartmentId = cmpt.id
    if (app2.createVnicDetails) app2.createVnicDetails.subnetId = appSubnet.id
    push(design, 'instance', app2)

    // Tier 3 — DB subnet (private)
    const dbSubnet = OciModelResources.OciSubnet.newResource()
    dbSubnet.displayName = 'DB Subnet'
    dbSubnet.cidrBlock = '10.10.3.0/24'
    dbSubnet.vcnId = vcn.id
    dbSubnet.compartmentId = cmpt.id
    dbSubnet.prohibitPublicIpOnVnic = true
    push(design, 'subnet', dbSubnet)

    // Autonomous Database in DB subnet
    const adb = OciModelResources.OciAutonomousDatabase.newResource()
    adb.displayName = 'App Database'
    adb.compartmentId = cmpt.id
    adb.dbName = 'APPDB'
    adb.subnetId = dbSubnet.id
    push(design, 'autonomous_database', adb)

    // Layers
    addLayer(design, cmpt.id, true)

    return design
}

// ---------------------------------------------------------------------------
// Template 3 — OKE Platform
// ---------------------------------------------------------------------------

function buildOkePlatform(): OcdDesign {
    const design = baseDesign('OKE Platform')

    const cmpt = OciModelResources.OciCompartment.newResource()
    cmpt.displayName = 'OKE Compartment'
    cmpt.description = 'Container platform compartment'
    push(design, 'compartment', cmpt)

    // VCN
    const vcn = OciModelResources.OciVcn.newResource()
    vcn.displayName = 'OKE VCN'
    vcn.cidrBlocks = ['10.20.0.0/16']
    vcn.compartmentId = cmpt.id
    push(design, 'vcn', vcn)

    // Internet Gateway
    const igw = OciModelResources.OciInternetGateway.newResource()
    igw.displayName = 'Internet Gateway'
    igw.vcnId = vcn.id
    igw.compartmentId = cmpt.id
    push(design, 'internet_gateway', igw)

    // Service Gateway
    const sgw = OciModelResources.OciServiceGateway.newResource()
    sgw.displayName = 'Service Gateway'
    sgw.vcnId = vcn.id
    sgw.compartmentId = cmpt.id
    push(design, 'service_gateway', sgw)

    // NAT Gateway
    const natGw = OciModelResources.OciNatGateway.newResource()
    natGw.displayName = 'NAT Gateway'
    natGw.vcnId = vcn.id
    natGw.compartmentId = cmpt.id
    push(design, 'nat_gateway', natGw)

    // API endpoint subnet (public)
    const apiSubnet = OciModelResources.OciSubnet.newResource()
    apiSubnet.displayName = 'API Endpoint Subnet'
    apiSubnet.cidrBlock = '10.20.1.0/24'
    apiSubnet.vcnId = vcn.id
    apiSubnet.compartmentId = cmpt.id
    apiSubnet.prohibitPublicIpOnVnic = false
    push(design, 'subnet', apiSubnet)

    // LB subnet (public)
    const lbSubnet = OciModelResources.OciSubnet.newResource()
    lbSubnet.displayName = 'LB Subnet'
    lbSubnet.cidrBlock = '10.20.2.0/24'
    lbSubnet.vcnId = vcn.id
    lbSubnet.compartmentId = cmpt.id
    lbSubnet.prohibitPublicIpOnVnic = false
    push(design, 'subnet', lbSubnet)

    // Worker node subnet (private)
    const workerSubnet = OciModelResources.OciSubnet.newResource()
    workerSubnet.displayName = 'Worker Node Subnet'
    workerSubnet.cidrBlock = '10.20.3.0/24'
    workerSubnet.vcnId = vcn.id
    workerSubnet.compartmentId = cmpt.id
    workerSubnet.prohibitPublicIpOnVnic = true
    push(design, 'subnet', workerSubnet)

    // OKE Cluster
    const okeCluster = OciModelResources.OciOkeCluster.newResource()
    okeCluster.displayName = 'OKE Cluster'
    okeCluster.compartmentId = cmpt.id
    okeCluster.vcnId = vcn.id
    if (okeCluster.endpointConfig) okeCluster.endpointConfig.subnetId = apiSubnet.id
    push(design, 'oke_cluster', okeCluster)

    // Node Pool
    const nodePool = OciModelResources.OciOkeNodePool.newResource()
    nodePool.displayName = 'Default Node Pool'
    nodePool.compartmentId = cmpt.id
    nodePool.clusterId = okeCluster.id
    push(design, 'oke_node_pool', nodePool)

    // Load Balancer
    const lb = OciModelResources.OciLoadBalancer.newResource()
    lb.displayName = 'OKE Load Balancer'
    lb.compartmentId = cmpt.id
    lb.subnetIds = [lbSubnet.id]
    lb.isPrivate = false
    lb.shape = 'flexible'
    push(design, 'load_balancer', lb)

    // Container Registry
    const repo = OciModelResources.OciArtifactsContainerRepository.newResource()
    repo.displayName = 'App Container Repository'
    repo.compartmentId = cmpt.id
    push(design, 'artifacts_container_repository', repo)

    // Layers
    addLayer(design, cmpt.id, true)

    return design
}

// ---------------------------------------------------------------------------
// Template 4 — Secure Landing Zone (Lite)
// ---------------------------------------------------------------------------

function buildSecureLandingZoneLite(): OcdDesign {
    const design = baseDesign('Secure Landing Zone (Lite)')

    // Root / tenancy placeholder
    const rootCmpt = OciModelResources.OciCompartment.newResource()
    rootCmpt.displayName = 'LZ Root Compartment'
    rootCmpt.description = 'Top-level landing zone compartment'
    push(design, 'compartment', rootCmpt)

    // Child compartments
    const networkCmpt = OciModelResources.OciCompartment.newResource()
    networkCmpt.displayName = 'Network Compartment'
    networkCmpt.compartmentId = rootCmpt.id
    push(design, 'compartment', networkCmpt)

    const securityCmpt = OciModelResources.OciCompartment.newResource()
    securityCmpt.displayName = 'Security Compartment'
    securityCmpt.compartmentId = rootCmpt.id
    push(design, 'compartment', securityCmpt)

    const appCmpt = OciModelResources.OciCompartment.newResource()
    appCmpt.displayName = 'App Workload Compartment'
    appCmpt.compartmentId = rootCmpt.id
    push(design, 'compartment', appCmpt)

    // Network VCN
    const vcn = OciModelResources.OciVcn.newResource()
    vcn.displayName = 'LZ VCN'
    vcn.cidrBlocks = ['10.30.0.0/16']
    vcn.compartmentId = networkCmpt.id
    push(design, 'vcn', vcn)

    // Internet Gateway
    const igw = OciModelResources.OciInternetGateway.newResource()
    igw.displayName = 'Internet Gateway'
    igw.vcnId = vcn.id
    igw.compartmentId = networkCmpt.id
    push(design, 'internet_gateway', igw)

    // NAT Gateway
    const natGw = OciModelResources.OciNatGateway.newResource()
    natGw.displayName = 'NAT Gateway'
    natGw.vcnId = vcn.id
    natGw.compartmentId = networkCmpt.id
    push(design, 'nat_gateway', natGw)

    // Service Gateway
    const sgw = OciModelResources.OciServiceGateway.newResource()
    sgw.displayName = 'Service Gateway'
    sgw.vcnId = vcn.id
    sgw.compartmentId = networkCmpt.id
    push(design, 'service_gateway', sgw)

    // Public (DMZ) subnet
    const pubSubnet = OciModelResources.OciSubnet.newResource()
    pubSubnet.displayName = 'DMZ Subnet'
    pubSubnet.cidrBlock = '10.30.1.0/24'
    pubSubnet.vcnId = vcn.id
    pubSubnet.compartmentId = networkCmpt.id
    push(design, 'subnet', pubSubnet)

    // Private app subnet
    const appSubnet = OciModelResources.OciSubnet.newResource()
    appSubnet.displayName = 'App Private Subnet'
    appSubnet.cidrBlock = '10.30.2.0/24'
    appSubnet.vcnId = vcn.id
    appSubnet.compartmentId = appCmpt.id
    appSubnet.prohibitPublicIpOnVnic = true
    push(design, 'subnet', appSubnet)

    // Vault for secrets
    const vault = OciModelResources.OciVault.newResource()
    vault.displayName = 'LZ Vault'
    vault.compartmentId = securityCmpt.id
    push(design, 'vault', vault)

    // IAM Groups
    const networkAdmins = OciModelResources.OciGroup.newResource()
    networkAdmins.displayName = 'Network Admins'
    networkAdmins.compartmentId = rootCmpt.id
    push(design, 'group', networkAdmins)

    const securityAdmins = OciModelResources.OciGroup.newResource()
    securityAdmins.displayName = 'Security Admins'
    securityAdmins.compartmentId = rootCmpt.id
    push(design, 'group', securityAdmins)

    // Policy (network admins manage network resources)
    const netPolicy = OciModelResources.OciPolicy.newResource()
    netPolicy.displayName = 'Network Admin Policy'
    netPolicy.compartmentId = rootCmpt.id
    netPolicy.statements = [
        `Allow group ${networkAdmins.displayName} to manage virtual-network-family in compartment ${networkCmpt.displayName}`,
    ]
    push(design, 'policy', netPolicy)

    const secPolicy = OciModelResources.OciPolicy.newResource()
    secPolicy.displayName = 'Security Admin Policy'
    secPolicy.compartmentId = rootCmpt.id
    secPolicy.statements = [
        `Allow group ${securityAdmins.displayName} to manage vaults in compartment ${securityCmpt.displayName}`,
    ]
    push(design, 'policy', secPolicy)

    // Layers
    addLayer(design, rootCmpt.id, false)
    addLayer(design, networkCmpt.id, true)
    addLayer(design, securityCmpt.id, false)
    addLayer(design, appCmpt.id, false)

    return design
}

// ---------------------------------------------------------------------------
// Template 5 — Cross-Tenancy Hub-Spoke (best practice)
// ---------------------------------------------------------------------------

/**
 * Two-tenancy DRG + Remote Peering Connection topology. This is a thin wrapper
 * over the Cross-Tenancy Hub-Spoke overlay (the single source of truth for the
 * topology): seed a root compartment, mark the design LZ-origin + enabled, then
 * apply the overlay so template + designer-overlay paths stay in lockstep.
 */
function buildCrossTenancyHubSpoke(): OcdDesign {
    const design = baseDesign('Cross-Tenancy Hub-Spoke')

    const rootCmpt = OciModelResources.OciCompartment.newResource()
    rootCmpt.displayName = 'Cross-Tenancy Root'
    push(design, 'compartment', rootCmpt)

    design.userDefined = {
        ...(design.userDefined ?? {}),
        lzOrigin: true,
        [LZ_CROSSTENANCY_HUBSPOKE_ENABLED_KEY]: true,
    }

    const built = applyCrossTenancyHubSpokeOverlay(design)
    addLayer(built, rootCmpt.id, true)
    return built
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const ocdArchitectureTemplates: readonly OcdArchitectureTemplate[] = [
    {
        id: 'hub-spoke-network',
        title: 'Hub-and-Spoke Network',
        description:
            'Multi-compartment hub-and-spoke VCN topology. A central hub VCN with a DRG connects to spoke VCNs in separate compartments — ideal for shared services and segmented workloads.',
        tags: ['networking', 'hub-spoke', 'drg', 'vcn'],
        build: buildHubSpoke,
    },
    {
        id: 'three-tier-web-app',
        title: 'Three-Tier Web Application',
        description:
            'Classic three-tier architecture: a public load balancer tier, private compute tier (two app servers), and a private Autonomous Database tier — all in a single VCN with proper subnet segregation.',
        tags: ['web', 'three-tier', 'load-balancer', 'compute', 'database'],
        build: buildThreeTierWebApp,
    },
    {
        id: 'oke-platform',
        title: 'OKE Platform',
        description:
            'Production-ready Kubernetes platform: OKE cluster with a dedicated node pool, separate API endpoint / LB / worker subnets, a Service Gateway for OCI services, and a container repository.',
        tags: ['kubernetes', 'oke', 'containers', 'cloud-native'],
        build: buildOkePlatform,
    },
    {
        id: 'secure-landing-zone-lite',
        title: 'Secure Landing Zone (Lite)',
        description:
            'Lightweight landing zone foundation: root compartment with network, security, and app workload child compartments, a VCN with DMZ + private subnets, a Vault, IAM groups, and baseline policies.',
        tags: ['landing-zone', 'security', 'iam', 'governance'],
        build: buildSecureLandingZoneLite,
    },
    {
        id: 'cross-tenancy-hub-spoke',
        title: 'Cross-Tenancy Hub-Spoke',
        description:
            'Connect two OCI tenancies the best-practice way: each tenancy owns a DRG, and a Remote Peering Connection (RPC) on each DRG peers with the other (naming the peer tenancy + region). Non-overlapping VCN CIDRs, DRG attachments, and a symmetric RPC handshake — exports clean Terraform with peer_tenancy_id.',
        tags: ['networking', 'cross-tenancy', 'drg', 'rpc', 'multi-tenancy', 'best-practice'],
        build: buildCrossTenancyHubSpoke,
    },
] as const

/** Look up a template by its id. Returns undefined when not found. */
export function findTemplate(id: string): OcdArchitectureTemplate | undefined {
    return ocdArchitectureTemplates.find((t) => t.id === id)
}
