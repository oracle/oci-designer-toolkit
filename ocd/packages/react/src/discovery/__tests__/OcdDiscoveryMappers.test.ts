import { describe, expect, it } from 'vitest'
import { OcdDesign, OciModelResources } from '@ocd/model'
import { discoverySampleSnapshot } from '../OcdDiscoverySampleData'
import { recommendDiscoveryLandingZone } from '../OcdDiscoveryLzRecommendations'
import { buildDiscoveryProvisioningDelta, buildDiscoveryResourceManagerPackage, isDiscoveryResourceManagerPlanCurrent } from '../OcdDiscoveryProvisioning'
import {
    buildArchitecturePlanFromDiscoverySnapshot,
    buildDiscoveryArchitecturePrompt,
    buildDiscoveryRelationshipBrief,
    mapCompartmentsToDiscoverySnapshot,
    mapDiscoveryServicesToOciTargets,
    mapOciDesignToDiscoverySnapshot,
} from '../OcdDiscoveryMappers'

describe('mapDiscoveryServicesToOciTargets', () => {
    it('maps runtimes to OCI target services and migration dispositions', () => {
        const targets = mapDiscoveryServicesToOciTargets(discoverySampleSnapshot)

        expect(targets.find((target) => target.serviceId === 'svc-shop-api-1')).toMatchObject({
            targetResourceType: 'oci_containerengine_cluster',
            targetService: 'OKE',
            disposition: 'replatform'
        })
        expect(targets.find((target) => target.serviceId === 'svc-shop-db')).toMatchObject({
            targetResourceType: 'oci_database_autonomous_database',
            targetService: 'Autonomous Database',
            disposition: 'replatform'
        })
        expect(targets.find((target) => target.serviceId === 'svc-reporting-kafka')).toMatchObject({
            targetResourceType: 'oci_streaming_stream',
            targetService: 'Streaming',
            disposition: 'refactor'
        })
        expect(targets.find((target) => target.serviceId === 'svc-reporting-redis')).toMatchObject({
            targetResourceType: 'oci_redis_redis_cluster',
            targetService: 'OCI Cache with Redis',
            disposition: 'replatform'
        })
    })
})

describe('buildDiscoveryProvisioningDelta', () => {
    it('generates variable-driven provisioning artifacts without putting environment identifiers in Terraform source', () => {
        const delta = buildDiscoveryProvisioningDelta(discoverySampleSnapshot)
        const mainTf = delta.files.find((file) => file.path === 'terraform/main.tf')?.content ?? ''
        const variablesTf = delta.files.find((file) => file.path === 'terraform/variables.tf')?.content ?? ''
        const tfvars = JSON.parse(delta.files.find((file) => file.path === 'terraform/terraform.tfvars.json')?.content ?? '{}') as {
            target_compartment_id?: string
            workload_compartments?: Array<{ name: string }>
            subnets?: unknown[]
        }

        expect(delta.files.map((file) => file.path)).toEqual([
            'terraform/versions.tf',
            'terraform/variables.tf',
            'terraform/main.tf',
            'terraform/terraform.tfvars.json',
            'ansible/discovery-reconcile.yml',
            'ansible/discovery-variables.yml',
            'scripts/plan.sh',
            'scripts/rest_reconcile.py',
            'manifest.json',
        ])
        expect(mainTf).toContain('var.target_compartment_id')
        expect(mainTf).toContain('resource "oci_core_vcn" "discovery"')
        expect(mainTf).toContain('resource "oci_core_subnet" "subnet"')
        expect(mainTf).not.toContain('Retail Shop')
        expect(variablesTf).toContain('sensitive   = true')
        expect(tfvars.target_compartment_id).toBe('<TARGET_COMPARTMENT_OCID>')
        expect(tfvars.workload_compartments?.map((workload) => workload.name)).toContain('Retail Shop')
        expect(tfvars.subnets?.length).toBeGreaterThan(0)
        expect(delta.files.map((file) => file.content).join('\n')).not.toMatch(/ocid1\./i)
    })

    it('keeps generated execution scripts plan-first by default', () => {
        const delta = buildDiscoveryProvisioningDelta(discoverySampleSnapshot)
        const planScript = delta.files.find((file) => file.path === 'scripts/plan.sh')?.content ?? ''
        const restScript = delta.files.find((file) => file.path === 'scripts/rest_reconcile.py')?.content ?? ''

        expect(planScript).toContain('terraform -chdir="${TF_DIR}" validate')
        expect(planScript).toContain('terraform -chdir="${TF_DIR}" plan')
        expect(planScript).not.toContain('terraform apply')
        expect(restScript).toContain('dry-run')
        expect(restScript).toContain('Execution is intentionally disabled')
    })

    it('packages Terraform delta files for Resource Manager PLAN handoff only after runtime variables resolve', () => {
        const delta = buildDiscoveryProvisioningDelta(discoverySampleSnapshot)

        const unresolved = buildDiscoveryResourceManagerPackage(delta, {
            region: 'eu-frankfurt-1',
            targetCompartmentId: '<TARGET_COMPARTMENT_OCID>',
        })

        expect(Object.keys(unresolved.files)).toEqual([
            'versions.tf',
            'variables.tf',
            'main.tf',
            'terraform.tfvars.json',
            'discovery-manifest.json',
            'README_DISCOVERY_RESOURCE_MANAGER.md',
        ])
        expect(unresolved.ready).toBe(false)
        expect(unresolved.blockers.join(' ')).toContain('tenancy OCID')
        expect(Object.values(unresolved.files).flat().join('\n')).not.toMatch(/\bterraform\s+apply\b/i)

        const ready = buildDiscoveryResourceManagerPackage(delta, {
            region: 'eu-frankfurt-1',
            tenancyOcid: 'tenancy-value-for-test',
            targetCompartmentId: 'compartment-value-for-test',
            architectureName: 'cap-plan-review',
        })
        const tfvars = JSON.parse((ready.files['terraform.tfvars.json'] ?? []).join('\n')) as {
            region: string
            architecture_name: string
        }

        expect(ready.ready).toBe(true)
        expect(ready.blockers).toEqual([])
        expect(ready.packageDigest).toMatch(/^fnv1a-[a-f0-9]{8}$/)
        expect(tfvars.region).toBe('eu-frankfurt-1')
        expect(tfvars.architecture_name).toBe('cap-plan-review')
    })

    it('changes Resource Manager package digest when discovered provisioning inputs drift', () => {
        const originalDelta = buildDiscoveryProvisioningDelta(discoverySampleSnapshot)
        const driftedDelta = buildDiscoveryProvisioningDelta({
            ...discoverySampleSnapshot,
            applications: [
                ...discoverySampleSnapshot.applications,
                {
                    id: 'app-new',
                    name: 'New Workload',
                    environment: 'prod',
                    owner: 'platform',
                    criticality: 'high',
                    preferredDisposition: 'replatform',
                },
            ],
        })

        const options = {
            region: 'eu-frankfurt-1',
            tenancyOcid: 'tenancy-value-for-test',
            targetCompartmentId: 'compartment-value-for-test',
            architectureName: 'cap-plan-review',
        }

        expect(buildDiscoveryResourceManagerPackage(originalDelta, options).packageDigest).not.toBe(
            buildDiscoveryResourceManagerPackage(driftedDelta, options).packageDigest,
        )
    })

    it('treats recent discovery plans without matching package digest as stale', () => {
        const delta = buildDiscoveryProvisioningDelta(discoverySampleSnapshot)
        const pack = buildDiscoveryResourceManagerPackage(delta, {
            region: 'eu-frankfurt-1',
            tenancyOcid: 'tenancy-value-for-test',
            targetCompartmentId: 'compartment-value-for-test',
            architectureName: 'cap-plan-review',
        })

        expect(isDiscoveryResourceManagerPlanCurrent(pack.packageDigest, {
            packageDigest: pack.packageDigest,
        })).toBe(true)
        expect(isDiscoveryResourceManagerPlanCurrent(pack.packageDigest, {
            packageDigest: 'fnv1a-deadbeef',
        })).toBe(false)
        expect(isDiscoveryResourceManagerPlanCurrent(pack.packageDigest, {})).toBe(false)
    })
})

describe('recommendDiscoveryLandingZone', () => {
    it('derives landing zone compartments, overlays, and waves from discovery data', () => {
        const recommendations = recommendDiscoveryLandingZone(discoverySampleSnapshot)

        expect(recommendations.compartments).toEqual(['prod-commerce', 'prod-finance', 'stage-analytics'])
        expect(recommendations.overlays).toEqual(['observability', 'oke', 'iam-blueprint'])
        expect(recommendations.migrationWaves.map((wave) => wave.name)).toEqual([
            'Wave 1 - Low Risk',
            'Wave 2 - Production Replatform',
            'Wave 3 - Legacy Critical'
        ])
    })
})

describe('mapOciDesignToDiscoverySnapshot', () => {
    it('creates a live context snapshot from selected compartments without sample inventory', () => {
        const snapshot = mapCompartmentsToDiscoverySnapshot([
            { id: '<COMPARTMENT_A>', displayName: 'Network' },
            { id: '<COMPARTMENT_B>', displayName: 'Security' },
        ], ['<COMPARTMENT_B>'], {
            id: 'context-1',
            generatedAt: '2026-06-11T10:00:00.000Z',
        })

        expect(snapshot).toMatchObject({
            id: 'context-1',
            source: 'oci-query',
            applications: [{ name: 'Security' }],
            assets: [],
            services: [],
            dependencies: [],
            metrics: [],
            ociResources: [],
        })
    })

    it('summarizes live OCI designs without putting raw identifiers into agent prompts', () => {
        const compartment = OciModelResources.OciCompartment.newResource()
        compartment.id = '<TENANCY_COMPARTMENT_ID>'
        compartment.displayName = 'Prod'
        const instance = OciModelResources.OciInstance.newResource()
        instance.displayName = 'App Server <INSTANCE_ID>'
        instance.compartmentId = compartment.id
        const loadBalancer = OciModelResources.OciLoadBalancer.newResource()
        loadBalancer.displayName = 'Public Edge'
        loadBalancer.compartmentId = compartment.id
        const design = OcdDesign.newDesign()
        design.model.oci.resources.compartment = [compartment]
        design.model.oci.resources.instance = [instance]
        design.model.oci.resources.load_balancer = [loadBalancer]

        const snapshot = mapOciDesignToDiscoverySnapshot(design, {
            id: 'snapshot-1',
            generatedAt: '2026-06-11T10:00:00.000Z',
        })
        const prompt = buildDiscoveryArchitecturePrompt(snapshot)

        expect(snapshot.source).toBe('oci-query')
        expect(snapshot.applications.map((application) => application.name)).toEqual(['Prod'])
        expect(snapshot.assets.map((asset) => asset.hostName)).toEqual(['App Server <INSTANCE_ID>'])
        expect(snapshot.services.map((service) => service.displayName)).toContain('load_balancer: Public Edge')
        expect(snapshot.ociResources?.map((resource) => resource.resourceType)).toEqual(['compartment', 'instance', 'load_balancer'])
        expect(snapshot.ociResources?.find((resource) => resource.resourceType === 'load_balancer')?.compartmentName).toBe('Prod')
        expect(prompt).toContain('3 OCI resources')
        expect(prompt).not.toContain('ocid1.')
    })
})

describe('buildDiscoveryRelationshipBrief', () => {
    it('summarizes application and service dependencies for architecture prompts', () => {
        const brief = buildDiscoveryRelationshipBrief(discoverySampleSnapshot, 2)

        expect(brief).toHaveLength(2)
        expect(brief[0]).toContain('Retail Shop / Shop Nginx A -> Retail Shop / Shop API A over http/8080')
        expect(brief[0]).toContain('connections/hour')
        expect(brief.join('\n')).not.toContain('ocid1.')
    })
})

describe('buildArchitecturePlanFromDiscoverySnapshot', () => {
    it('creates a conservative plan with network, app, database, and guardrail resources', () => {
        const plan = buildArchitecturePlanFromDiscoverySnapshot(discoverySampleSnapshot)

        expect(plan.resources.map((resource) => resource.kind)).toEqual(expect.arrayContaining([
            'vcn',
            'subnet',
            'nat_gateway',
            'service_gateway',
            'load_balancer',
            'oke_cluster',
            'db_system',
            'log_group',
            'monitoring_alarm',
            'budget',
        ]))
        expect(plan.assumptions.some((assumption) => assumption.includes('Observed dependency'))).toBe(true)
        expect(buildDiscoveryArchitecturePrompt(discoverySampleSnapshot)).toContain('Top observed dependencies:')
    })
})
