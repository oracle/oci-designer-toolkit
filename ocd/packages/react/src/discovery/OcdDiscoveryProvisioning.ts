import { DiscoveryOciTargetMapping, DiscoverySnapshot } from './OcdDiscoveryTypes'
import { mapDiscoveryServicesToOciTargets } from './OcdDiscoveryMappers'
import type { OutputDataStringArray } from '@ocd/export'

export type DiscoveryProvisioningLanguage = 'terraform' | 'json' | 'yaml' | 'bash' | 'python'

export interface DiscoveryProvisioningArtifact {
    path: string
    language: DiscoveryProvisioningLanguage
    content: string
}

export interface DiscoveryProvisioningVariable {
    name: string
    description: string
    required: boolean
    sensitive: boolean
}

export interface DiscoveryProvisioningDelta {
    summary: string
    files: DiscoveryProvisioningArtifact[]
    variables: DiscoveryProvisioningVariable[]
    warnings: string[]
}

export interface DiscoveryResourceManagerPackageOptions {
    region?: string
    tenancyOcid?: string
    targetCompartmentId?: string
    architectureName?: string
}

export interface DiscoveryResourceManagerPackage {
    ready: boolean
    files: OutputDataStringArray
    fileCount: number
    packageDigest: string
    blockers: string[]
    warnings: string[]
}

const SENSITIVE_IDENTIFIER_PATTERN = /ocid1\.[a-z0-9_.-]+/gi

const terraformIdentifier = (value: string, fallback: string): string => {
    const slug = value
        .trim()
        .toLowerCase()
        .replace(SENSITIVE_IDENTIFIER_PATTERN, 'oci-resource')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
    const normalized = slug || fallback
    return /^[a-z]/.test(normalized) ? normalized : `w_${normalized}`
}

const safeVariableValue = (value: string, fallback: string): string => {
    const text = value.trim().replace(SENSITIVE_IDENTIFIER_PATTERN, '<OCI_RESOURCE_ID>')
    return text || fallback
}

const unique = (values: readonly string[]): string[] => Array.from(new Set(values.filter((value) => value.trim() !== '')))

const buildWorkloads = (snapshot: DiscoverySnapshot) => snapshot.applications.map((application, index) => ({
    key: terraformIdentifier(application.name || application.id, `workload_${index + 1}`),
    name: safeVariableValue(application.name, `Workload ${index + 1}`),
    environment: application.environment,
    criticality: application.criticality,
    disposition: application.preferredDisposition,
}))

const buildSubnets = (targets: readonly DiscoveryOciTargetMapping[]) => {
    const needsPublicEdge = targets.some((target) => target.targetService.includes('Load Balancer'))
    const needsDatabase = targets.some((target) => ['Autonomous Database', 'MySQL HeatWave'].includes(target.targetService))
    return [
        ...(needsPublicEdge ? [{
            key: 'edge',
            name: 'edge',
            cidr: '10.80.1.0/24',
            dns_label: 'edge',
            prohibit_public_ip_on_vnic: false,
        }] : []),
        {
            key: 'app',
            name: 'app',
            cidr: '10.80.2.0/24',
            dns_label: 'app',
            prohibit_public_ip_on_vnic: true,
        },
        ...(needsDatabase ? [{
            key: 'database',
            name: 'database',
            cidr: '10.80.3.0/24',
            dns_label: 'db',
            prohibit_public_ip_on_vnic: true,
        }] : []),
    ]
}

const buildVariables = (): DiscoveryProvisioningVariable[] => [
    { name: 'region', description: 'OCI region used by the provider.', required: true, sensitive: false },
    { name: 'tenancy_ocid', description: 'Tenancy OCID loaded from caller-specific tfvars or Resource Manager variables.', required: true, sensitive: true },
    { name: 'target_compartment_id', description: 'Parent compartment OCID for generated network and workload compartments.', required: true, sensitive: true },
    { name: 'architecture_name', description: 'Environment-neutral display-name prefix for generated resources.', required: true, sensitive: false },
    { name: 'dns_label', description: 'DNS-safe VCN label.', required: true, sensitive: false },
    { name: 'network_cidr', description: 'VCN CIDR selected by the operator after IPAM review.', required: true, sensitive: false },
    { name: 'workload_compartments', description: 'Variable list of workload compartment names and classifications.', required: true, sensitive: false },
    { name: 'subnets', description: 'Variable list of subnet roles, CIDRs, and public-IP policy.', required: true, sensitive: false },
    { name: 'enable_compartment_delete', description: 'Controls Terraform delete behavior for generated compartments.', required: false, sensitive: false },
    { name: 'enable_internet_gateway', description: 'Enables a public edge gateway when reviewed architecture requires one.', required: false, sensitive: false },
    { name: 'enable_nat_gateway', description: 'Enables private egress for application subnets.', required: false, sensitive: false },
]

const buildVersionsTf = (): string => [
    'terraform {',
    '  required_version = ">= 1.5.0"',
    '',
    '  required_providers {',
    '    oci = {',
    '      source  = "oracle/oci"',
    '      version = ">= 6.0.0"',
    '    }',
    '  }',
    '}',
    '',
    'provider "oci" {',
    '  region       = var.region',
    '  tenancy_ocid = var.tenancy_ocid',
    '}',
    '',
].join('\n')

const buildVariablesTf = (): string => [
    'variable "region" {',
    '  type        = string',
    '  description = "OCI region used by the provider."',
    '}',
    '',
    'variable "tenancy_ocid" {',
    '  type        = string',
    '  description = "Tenancy OCID supplied outside source control."',
    '  sensitive   = true',
    '}',
    '',
    'variable "target_compartment_id" {',
    '  type        = string',
    '  description = "Parent compartment OCID supplied outside source control."',
    '  sensitive   = true',
    '}',
    '',
    'variable "architecture_name" {',
    '  type        = string',
    '  description = "Environment-neutral prefix for generated resources."',
    '}',
    '',
    'variable "dns_label" {',
    '  type        = string',
    '  description = "DNS-safe VCN label."',
    '}',
    '',
    'variable "network_cidr" {',
    '  type        = string',
    '  description = "Reviewed VCN CIDR."',
    '}',
    '',
    'variable "enable_compartment_delete" {',
    '  type        = bool',
    '  description = "Whether generated workload compartments can be deleted by Terraform."',
    '  default     = false',
    '}',
    '',
    'variable "enable_internet_gateway" {',
    '  type        = bool',
    '  description = "Whether to create an internet gateway for reviewed public edge tiers."',
    '  default     = false',
    '}',
    '',
    'variable "enable_nat_gateway" {',
    '  type        = bool',
    '  description = "Whether to create a NAT gateway for private subnet egress."',
    '  default     = true',
    '}',
    '',
    'variable "workload_compartments" {',
    '  type = list(object({',
    '    key         = string',
    '    name        = string',
    '    environment = string',
    '    criticality = string',
    '    disposition = string',
    '  }))',
    '  description = "Workload compartment definitions derived from discovery and reviewed through tfvars."',
    '}',
    '',
    'variable "subnets" {',
    '  type = list(object({',
    '    key                         = string',
    '    name                        = string',
    '    cidr                        = string',
    '    dns_label                   = string',
    '    prohibit_public_ip_on_vnic  = bool',
    '  }))',
    '  description = "Subnet definitions derived from discovery and reviewed through tfvars."',
    '}',
    '',
].join('\n')

const buildMainTf = (): string => [
    'locals {',
    '  workload_compartments = { for workload in var.workload_compartments : workload.key => workload }',
    '  subnets               = { for subnet in var.subnets : subnet.key => subnet }',
    '}',
    '',
    'resource "oci_identity_compartment" "workload" {',
    '  for_each       = local.workload_compartments',
    '  compartment_id = var.target_compartment_id',
    '  name           = each.value.name',
    '  description    = "Discovery workload compartment ${each.value.environment}/${each.value.criticality}/${each.value.disposition}"',
    '  enable_delete  = var.enable_compartment_delete',
    '}',
    '',
    'resource "oci_core_vcn" "discovery" {',
    '  compartment_id = var.target_compartment_id',
    '  cidr_block     = var.network_cidr',
    '  display_name   = var.architecture_name',
    '  dns_label      = var.dns_label',
    '}',
    '',
    'resource "oci_core_internet_gateway" "edge" {',
    '  count          = var.enable_internet_gateway ? 1 : 0',
    '  compartment_id = var.target_compartment_id',
    '  vcn_id         = oci_core_vcn.discovery.id',
    '  display_name   = "${var.architecture_name}-igw"',
    '  enabled        = true',
    '}',
    '',
    'resource "oci_core_nat_gateway" "private_egress" {',
    '  count          = var.enable_nat_gateway ? 1 : 0',
    '  compartment_id = var.target_compartment_id',
    '  vcn_id         = oci_core_vcn.discovery.id',
    '  display_name   = "${var.architecture_name}-nat"',
    '}',
    '',
    'resource "oci_core_subnet" "subnet" {',
    '  for_each                    = local.subnets',
    '  compartment_id              = var.target_compartment_id',
    '  vcn_id                      = oci_core_vcn.discovery.id',
    '  cidr_block                  = each.value.cidr',
    '  display_name                = "${var.architecture_name}-${each.value.name}"',
    '  dns_label                   = each.value.dns_label',
    '  prohibit_public_ip_on_vnic  = each.value.prohibit_public_ip_on_vnic',
    '}',
    '',
    'output "workload_compartment_ids" {',
    '  value = { for key, compartment in oci_identity_compartment.workload : key => compartment.id }',
    '}',
    '',
    'output "network_summary" {',
    '  value = {',
    '    vcn_id     = oci_core_vcn.discovery.id',
    '    subnet_ids = { for key, subnet in oci_core_subnet.subnet : key => subnet.id }',
    '  }',
    '}',
    '',
].join('\n')

const buildTfvars = (snapshot: DiscoverySnapshot, targets: readonly DiscoveryOciTargetMapping[]): string => `${JSON.stringify({
    region: '<OCI_REGION>',
    tenancy_ocid: '<TENANCY_OCID>',
    target_compartment_id: '<TARGET_COMPARTMENT_OCID>',
    architecture_name: 'discovery-architecture',
    dns_label: 'discovery',
    network_cidr: '10.80.0.0/16',
    enable_compartment_delete: false,
    enable_internet_gateway: targets.some((target) => target.targetService.includes('Load Balancer')),
    enable_nat_gateway: true,
    workload_compartments: buildWorkloads(snapshot),
    subnets: buildSubnets(targets),
}, null, 2)}\n`

const buildAnsiblePlaybook = (): string => [
    '---',
    '- name: Reconcile discovery architecture variables with OCI',
    '  hosts: localhost',
    '  connection: local',
    '  gather_facts: false',
    '  vars_files:',
    '    - discovery-variables.yml',
    '  tasks:',
    '    - name: Create reviewed discovery VCN',
    '      oracle.oci.oci_network_vcn:',
    '        compartment_id: "{{ target_compartment_id }}"',
    '        cidr_block: "{{ network_cidr }}"',
    '        display_name: "{{ architecture_name }}"',
    '        dns_label: "{{ dns_label }}"',
    '      check_mode: "{{ plan_only | default(true) }}"',
    '',
    '    - name: Create reviewed workload compartments',
    '      oracle.oci.oci_identity_compartment:',
    '        compartment_id: "{{ target_compartment_id }}"',
    '        name: "{{ item.name }}"',
    '        description: "Discovery workload compartment {{ item.environment }}/{{ item.criticality }}/{{ item.disposition }}"',
    '      loop: "{{ workload_compartments }}"',
    '      check_mode: "{{ plan_only | default(true) }}"',
    '',
].join('\n')

const buildAnsibleVariables = (snapshot: DiscoverySnapshot, targets: readonly DiscoveryOciTargetMapping[]): string => [
    'region: <OCI_REGION>',
    'tenancy_ocid: <TENANCY_OCID>',
    'target_compartment_id: <TARGET_COMPARTMENT_OCID>',
    'architecture_name: discovery-architecture',
    'dns_label: discovery',
    'network_cidr: 10.80.0.0/16',
    'plan_only: true',
    'workload_compartments:',
    ...buildWorkloads(snapshot).map((workload) => `  - key: ${workload.key}\n    name: ${JSON.stringify(workload.name)}\n    environment: ${workload.environment}\n    criticality: ${workload.criticality}\n    disposition: ${workload.disposition}`),
    'subnets:',
    ...buildSubnets(targets).map((subnet) => `  - key: ${subnet.key}\n    name: ${subnet.name}\n    cidr: ${subnet.cidr}\n    dns_label: ${subnet.dns_label}\n    prohibit_public_ip_on_vnic: ${subnet.prohibit_public_ip_on_vnic}`),
    '',
].join('\n')

const buildPlanScript = (): string => [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    '',
    'TF_DIR="${TF_DIR:-terraform}"',
    'TF_VARS="${TF_VARS:-terraform/terraform.tfvars.json}"',
    '',
    'terraform -chdir="${TF_DIR}" init -upgrade',
    'terraform -chdir="${TF_DIR}" fmt -check',
    'terraform -chdir="${TF_DIR}" validate',
    'terraform -chdir="${TF_DIR}" plan -var-file="../${TF_VARS}" -out discovery.tfplan',
    '',
].join('\n')

const buildRestDryRun = (): string => [
    '#!/usr/bin/env python3',
    'import json',
    'import sys',
    'from pathlib import Path',
    '',
    'def main() -> int:',
    '    variables_file = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("terraform/terraform.tfvars.json")',
    '    variables = json.loads(variables_file.read_text())',
    '    print("Discovery REST reconciliation dry-run")',
    '    print(f"region={variables.get(\'region\')}")',
    '    print(f"workloads={len(variables.get(\'workload_compartments\', []))}")',
    '    print(f"subnets={len(variables.get(\'subnets\', []))}")',
    '    if "--execute" in sys.argv:',
    '        raise SystemExit("Execution is intentionally disabled in generated REST scripts. Use Terraform Resource Manager PLAN first.")',
    '    return 0',
    '',
    'if __name__ == "__main__":',
    '    raise SystemExit(main())',
    '',
].join('\n')

const buildManifest = (
    snapshot: DiscoverySnapshot,
    targets: readonly DiscoveryOciTargetMapping[],
    warnings: readonly string[],
): string => `${JSON.stringify({
    source: snapshot.source,
    generatedAt: snapshot.generatedAt,
    applications: snapshot.applications.length,
    assets: snapshot.assets.length,
    services: snapshot.services.length,
    targetResourceTypes: unique(targets.map((target) => target.targetResourceType)).sort(),
    warnings,
}, null, 2)}\n`

const splitLines = (content: string): string[] => content.replace(/\n$/, '').split('\n')

const requiredOption = (value: string | undefined): string => value?.trim() ?? ''

const stablePackageText = (files: OutputDataStringArray): string =>
    Object.entries(files)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([filename, lines]) => `${filename}\n${lines.join('\n')}`)
        .join('\n---\n')

const fnv1a32 = (text: string): string => {
    let hash = 0x811c9dc5
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index)
        hash = Math.imul(hash, 0x01000193) >>> 0
    }
    return hash.toString(16).padStart(8, '0')
}

export const buildDiscoveryResourceManagerPackageDigest = (files: OutputDataStringArray): string =>
    `fnv1a-${fnv1a32(stablePackageText(files))}`

export const isDiscoveryResourceManagerPlanCurrent = (
    currentPackageDigest: string,
    plan: { packageDigest?: string } | undefined,
): boolean =>
    Boolean(plan?.packageDigest) && plan?.packageDigest === currentPackageDigest

const applyTfvarsOverrides = (
    content: string,
    options: DiscoveryResourceManagerPackageOptions,
): string => {
    const tfvars = JSON.parse(content) as Record<string, unknown>
    return `${JSON.stringify({
        ...tfvars,
        ...(requiredOption(options.region) ? { region: requiredOption(options.region) } : {}),
        ...(requiredOption(options.tenancyOcid) ? { tenancy_ocid: requiredOption(options.tenancyOcid) } : {}),
        ...(requiredOption(options.targetCompartmentId) ? { target_compartment_id: requiredOption(options.targetCompartmentId) } : {}),
        ...(requiredOption(options.architectureName) ? { architecture_name: requiredOption(options.architectureName) } : {}),
    }, null, 2)}\n`
}

export const buildDiscoveryResourceManagerPackage = (
    delta: DiscoveryProvisioningDelta,
    options: DiscoveryResourceManagerPackageOptions = {},
): DiscoveryResourceManagerPackage => {
    const terraformFiles = delta.files.filter((file) => file.path.startsWith('terraform/'))
    const files = terraformFiles.reduce((output, file) => {
        const name = file.path.replace(/^terraform\//, '')
        const content = name === 'terraform.tfvars.json'
            ? applyTfvarsOverrides(file.content, options)
            : file.content
        return { ...output, [name]: splitLines(content) }
    }, {} as OutputDataStringArray)
    const manifest = delta.files.find((file) => file.path === 'manifest.json')
    const packagedFiles: OutputDataStringArray = {
        ...files,
        ...(manifest ? { 'discovery-manifest.json': splitLines(manifest.content) } : {}),
        'README_DISCOVERY_RESOURCE_MANAGER.md': [
            '# Discovery Resource Manager Plan Package',
            '',
            'This package was generated from OCI Discovery Workbench provisioning delta data.',
            'Submit it as a Resource Manager PLAN first. Apply remains gated by reviewed plan output.',
            '',
            'Required runtime values are injected from the selected OCI profile, region, and compartment.',
        ],
    }
    const joined = Object.values(packagedFiles).flat().join('\n')
    const blockers = [
        ...(!requiredOption(options.region) ? ['Select an OCI region before submitting a Resource Manager plan.'] : []),
        ...(!requiredOption(options.tenancyOcid) ? ['Selected profile does not expose a tenancy OCID for Resource Manager variables.'] : []),
        ...(!requiredOption(options.targetCompartmentId) ? ['Select a target compartment before submitting a Resource Manager plan.'] : []),
        ...(joined.includes('<OCI_REGION>') || joined.includes('<TENANCY_OCID>') || joined.includes('<TARGET_COMPARTMENT_OCID>')
            ? ['Resolve Resource Manager runtime placeholders before submitting a plan.']
            : []),
        ...(joined.match(/\bterraform\s+apply\b/i) ? ['Package contains terraform apply, which is not allowed in Discovery handoff.'] : []),
    ]
    return {
        ready: blockers.length === 0,
        files: packagedFiles,
        fileCount: Object.keys(packagedFiles).length,
        packageDigest: buildDiscoveryResourceManagerPackageDigest(packagedFiles),
        blockers,
        warnings: delta.warnings,
    }
}

export const buildDiscoveryProvisioningDelta = (
    snapshot: DiscoverySnapshot,
    targets: readonly DiscoveryOciTargetMapping[] = mapDiscoveryServicesToOciTargets(snapshot),
): DiscoveryProvisioningDelta => {
    const warnings = [
        'Generated artifacts are plan-first scaffolding. Run Terraform validate and Resource Manager PLAN before any apply.',
        ...(snapshot.source === 'sample' ? ['Sample discovery data is active; replace variable values before use.'] : []),
        ...(targets.length === 0 ? ['No service target mappings were available; generated artifacts contain network and compartment scaffolding only.'] : []),
    ]
    const files: DiscoveryProvisioningArtifact[] = [
        { path: 'terraform/versions.tf', language: 'terraform', content: buildVersionsTf() },
        { path: 'terraform/variables.tf', language: 'terraform', content: buildVariablesTf() },
        { path: 'terraform/main.tf', language: 'terraform', content: buildMainTf() },
        { path: 'terraform/terraform.tfvars.json', language: 'json', content: buildTfvars(snapshot, targets) },
        { path: 'ansible/discovery-reconcile.yml', language: 'yaml', content: buildAnsiblePlaybook() },
        { path: 'ansible/discovery-variables.yml', language: 'yaml', content: buildAnsibleVariables(snapshot, targets) },
        { path: 'scripts/plan.sh', language: 'bash', content: buildPlanScript() },
        { path: 'scripts/rest_reconcile.py', language: 'python', content: buildRestDryRun() },
        { path: 'manifest.json', language: 'json', content: buildManifest(snapshot, targets, warnings) },
    ]
    return {
        summary: `Provisioning delta for ${snapshot.applications.length} applications, ${targets.length} target mappings, and ${buildSubnets(targets).length} reviewed subnet roles.`,
        files,
        variables: buildVariables(),
        warnings,
    }
}
