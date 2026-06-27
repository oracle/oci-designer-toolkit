/*
** Copyright (c) 2021, Andrew Hopkinson.
** Licensed under the GNU GENERAL PUBLIC LICENSE v 3.0 as shown at https://www.gnu.org/licenses/.
*/

/*
** Enterprise governance / compliance posture overlay.
**
** evaluateGovernance(design) is pure and idempotent — it reads the design
** model and returns a list of GovernanceFinding objects covering CIS
** OCI Landing Zone-style checks:
**   - network exposure (public subnets, 0.0.0.0/0 ingress)
**   - public Object Storage buckets
**   - missing tags on costable resources
**   - missing compartment segmentation
**   - databases without private subnet placement
**   - load balancers without NSG protection
**   - budget governance
**   - public instances
**
** Only fields confirmed in the generated model resource interfaces are
** referenced.  No live OCI API calls; reads only design.model.oci.resources.
*/

import { OcdDesign } from '@ocd/model'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type GovernanceSeverity = 'critical' | 'high' | 'medium' | 'low'
export type GovernanceCategory =
    | 'network'
    | 'storage'
    | 'tagging'
    | 'compartment'
    | 'database'
    | 'compute'
    | 'cost'
    | 'identity'

/**
 * Remediation guidance for a GovernanceFinding.
 * autoFixable=true means applyRemediation() can make the fix programmatically.
 */
export interface GovernanceRemediation {
    /** One-line description: what the fix does and why it is safe. */
    summary: string
    /** Illustrative Terraform HCL fragment using placeholder values only. */
    terraform?: string
    /** True only when applyRemediation() can safely apply a deterministic single-field fix. */
    autoFixable: boolean
}

export interface GovernanceFinding {
    /** Unique deterministic id for this finding (rule-id + resource-id). */
    id: string
    severity: GovernanceSeverity
    category: GovernanceCategory
    title: string
    message: string
    /** The id of the model resource this finding is about, when applicable. */
    resourceId?: string
    /** Human-readable resource name for display (may be empty). */
    resourceName?: string
    /** Optional remediation guidance and/or one-click fix descriptor. */
    remediation?: GovernanceRemediation
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Safe accessor: returns the resource list for a given key, or []. */
function resourceList(design: OcdDesign, key: string): Record<string, unknown>[] {
    const resources = design?.model?.oci?.resources
    if (!resources) return []
    const list = resources[key]
    return Array.isArray(list) ? (list as Record<string, unknown>[]) : []
}

function str(v: unknown): string {
    return typeof v === 'string' ? v : ''
}

function bool(v: unknown): boolean {
    return v === true
}

function arr(v: unknown): unknown[] {
    return Array.isArray(v) ? v : []
}

function hasTags(resource: Record<string, unknown>): boolean {
    const freeform = resource.freeformTags
    const defined = resource.definedTags
    const hasFreeform = freeform != null && typeof freeform === 'object' && Object.keys(freeform as object).length > 0
    const hasDefined = defined != null && typeof defined === 'object' && Object.keys(defined as object).length > 0
    return hasFreeform || hasDefined
}

function resourceName(resource: Record<string, unknown>): string {
    return str(resource.displayName) || str(resource.id)
}

function findingId(ruleId: string, resourceId: unknown): string {
    return `${ruleId}::${String(resourceId ?? 'global')}`
}

// ---------------------------------------------------------------------------
// Rule implementations
// ---------------------------------------------------------------------------

/**
 * GOV-NET-01: Public subnets expose resources to the internet.
 * Field: OciSubnet.prohibitPublicIpOnVnic (false = public subnet)
 * autoFixable: set prohibitPublicIpOnVnic = true
 */
function checkPublicSubnets(design: OcdDesign): GovernanceFinding[] {
    return resourceList(design, 'subnet')
        .filter((s) => bool(s.prohibitPublicIpOnVnic) === false)
        .map((s) => ({
            id: findingId('GOV-NET-01', s.id),
            severity: 'medium' as GovernanceSeverity,
            category: 'network' as GovernanceCategory,
            title: 'Public subnet detected',
            message: `Subnet "${resourceName(s)}" allows public IP assignment (prohibitPublicIpOnVnic is false). ` +
                     'Use private subnets and route traffic through a Load Balancer or Bastion unless internet-facing access is required.',
            resourceId: str(s.id),
            resourceName: resourceName(s),
            remediation: {
                summary: 'Set prohibitPublicIpOnVnic to true so the subnet no longer assigns public IPs to new VNICs. ' +
                         'Existing VNICs are not affected; remove their public IPs separately if needed.',
                terraform: `resource "oci_core_subnet" "example" {
  # ... other attributes ...
  prohibit_public_ip_on_vnic = true
}`,
                autoFixable: true,
            },
        }))
}

/**
 * GOV-NET-02: Security List ingress rules allow traffic from 0.0.0.0/0.
 * Fields: OciSecurityList.ingressSecurityRules[].source
 * autoFixable: false — auto-delete/restrict of ingress rules is destructive and ambiguous
 */
function checkSecurityListOpenIngress(design: OcdDesign): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const sl of resourceList(design, 'security_list')) {
        const ingressRules = arr(sl.ingressSecurityRules)
        const hasWideOpen = ingressRules.some((r) => {
            const rule = r as Record<string, unknown>
            return str(rule.source) === '0.0.0.0/0' || str(rule.source) === '::/0'
        })
        if (hasWideOpen) {
            findings.push({
                id: findingId('GOV-NET-02', sl.id),
                severity: 'high',
                category: 'network',
                title: 'Security List allows unrestricted ingress (0.0.0.0/0)',
                message: `Security List "${resourceName(sl)}" has one or more ingress rules sourced from 0.0.0.0/0 or ::/0. ` +
                         'Restrict ingress to known CIDR ranges and use NSGs for fine-grained control.',
                resourceId: str(sl.id),
                resourceName: resourceName(sl),
                remediation: {
                    summary: 'Replace 0.0.0.0/0 source with the specific CIDR of trusted networks or services. ' +
                             'Each rule must be reviewed individually — no safe default exists.',
                    terraform: `resource "oci_core_security_list" "example" {
  # ... other attributes ...
  ingress_security_rules {
    protocol = "6"
    source    = "10.0.0.0/16"   # Replace with your trusted CIDR
    tcp_options {
      min = 443
      max = 443
    }
  }
}`,
                    autoFixable: false,
                },
            })
        }
    }
    return findings
}

/**
 * GOV-NET-03: NSG security rules allow traffic from 0.0.0.0/0.
 * Fields: OciNetworkSecurityGroupSecurityRule.source, .direction
 * autoFixable: false — choosing a replacement CIDR requires human judgment
 */
function checkNsgOpenIngress(design: OcdDesign): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const rule of resourceList(design, 'network_security_group_security_rule')) {
        const direction = str(rule.direction).toUpperCase()
        const source = str(rule.source)
        if (direction === 'INGRESS' && (source === '0.0.0.0/0' || source === '::/0')) {
            findings.push({
                id: findingId('GOV-NET-03', rule.id),
                severity: 'high',
                category: 'network',
                title: 'NSG rule allows unrestricted ingress (0.0.0.0/0)',
                message: `NSG security rule "${resourceName(rule)}" allows ingress from any source (${source}). ` +
                         'Replace with the minimal required source CIDR.',
                resourceId: str(rule.id),
                resourceName: resourceName(rule),
                remediation: {
                    summary: 'Replace the 0.0.0.0/0 source with a specific CIDR block or NSG OCID. ' +
                             'The correct CIDR depends on your topology — no safe universal default exists.',
                    terraform: `resource "oci_core_network_security_group_security_rule" "example" {
  # ... other attributes ...
  direction   = "INGRESS"
  source      = "10.0.0.0/16"   # Replace with your trusted CIDR
  source_type = "CIDR_BLOCK"
  protocol    = "6"
}`,
                    autoFixable: false,
                },
            })
        }
    }
    return findings
}

/**
 * GOV-STG-01: Object Storage bucket with public access (accessType not NoPublicAccess).
 * Field: OciBucket.accessType
 * autoFixable: set accessType = 'NoPublicAccess'
 */
function checkPublicBuckets(design: OcdDesign): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const bucket of resourceList(design, 'bucket')) {
        const accessType = str(bucket.accessType)
        // 'NoPublicAccess' = fully private; '' = not set (default is ObjectRead in the API)
        if (accessType !== 'NoPublicAccess') {
            const severity: GovernanceSeverity = accessType === 'ObjectReadWithoutList' || accessType === 'ObjectRead'
                ? 'critical'
                : 'medium'
            findings.push({
                id: findingId('GOV-STG-01', bucket.id),
                severity,
                category: 'storage',
                title: accessType === '' ? 'Object Storage bucket access type unset' : 'Object Storage bucket is publicly accessible',
                message: accessType === ''
                    ? `Bucket "${resourceName(bucket)}" has no access type set. OCI defaults to ObjectRead (public object access). Set accessType to NoPublicAccess unless public access is intentional.`
                    : `Bucket "${resourceName(bucket)}" has accessType="${accessType}", allowing public read access. ` +
                      'Set accessType to NoPublicAccess and use Pre-Authenticated Requests or signed URLs for controlled sharing.',
                resourceId: str(bucket.id),
                resourceName: resourceName(bucket),
                remediation: {
                    summary: 'Set accessType to NoPublicAccess so the bucket rejects unauthenticated requests. ' +
                             'Use Pre-Authenticated Requests (PARs) for time-limited, controlled sharing.',
                    terraform: `resource "oci_objectstorage_bucket" "example" {
  # ... other attributes ...
  access_type = "NoPublicAccess"
}`,
                    autoFixable: true,
                },
            })
        }
    }
    return findings
}

/**
 * GOV-TAG-01: Costable resources (Instance, LB, DB, Bucket, Autonomous DB,
 * MySQL, DbSystem) are missing both freeform and defined tags.
 * Fields: OciResource.freeformTags, .definedTags
 * autoFixable: false — tag key/value pairs are organisation-specific
 */
const COSTABLE_RESOURCE_KEYS: ReadonlyArray<[string, string]> = [
    ['instance', 'Compute Instance'],
    ['load_balancer', 'Load Balancer'],
    ['autonomous_database', 'Autonomous Database'],
    ['db_system', 'DB System'],
    ['mysql_db_system', 'MySQL DB System'],
    ['bucket', 'Object Storage Bucket'],
    ['analytics_instance', 'Analytics Instance'],
]

function checkMissingTags(design: OcdDesign): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const [key, label] of COSTABLE_RESOURCE_KEYS) {
        for (const resource of resourceList(design, key)) {
            if (!hasTags(resource)) {
                findings.push({
                    id: findingId('GOV-TAG-01', resource.id),
                    severity: 'low',
                    category: 'tagging',
                    title: `${label} has no cost-tracking tags`,
                    message: `${label} "${resourceName(resource)}" has neither freeform nor defined tags. ` +
                             'Apply cost-centre, environment, and owner tags to enable chargeback, filtering, and budget alerts.',
                    resourceId: str(resource.id),
                    resourceName: resourceName(resource),
                    remediation: {
                        summary: 'Add at minimum cost-centre, environment, and owner tags. ' +
                                 'Tag keys and values are organisation-specific — set them in the resource panel.',
                        terraform: `resource "oci_core_instance" "example" {
  # ... other attributes ...
  freeform_tags = {
    "cost-centre" = "engineering"
    "environment" = "production"
    "owner"       = "platform-team"
  }
}`,
                        autoFixable: false,
                    },
                })
            }
        }
    }
    return findings
}

/**
 * GOV-CMPT-01: Design uses only the root compartment (single compartment =
 * no workload/environment segregation).
 * autoFixable: false — adding compartments and assigning resources requires user input
 */
function checkCompartmentSegmentation(design: OcdDesign): GovernanceFinding[] {
    const compartments = resourceList(design, 'compartment')
    if (compartments.length <= 1) {
        return [{
            id: 'GOV-CMPT-01::global',
            severity: 'medium',
            category: 'compartment',
            title: 'Single compartment — no workload segregation',
            message: 'The design contains only one compartment (the root). CIS OCI recommends separate compartments ' +
                     'for each workload, environment tier (Dev/Staging/Prod), or security zone to enforce least-privilege IAM, ' +
                     'budget boundaries, and blast-radius isolation.',
            remediation: {
                summary: 'Add child compartments for each workload or environment tier and move resources into them. ' +
                         'Compartment structure depends on your organisation — no safe single default exists.',
                terraform: `resource "oci_identity_compartment" "workload" {
  compartment_id = var.root_compartment_id
  name           = "workload-prod"
  description    = "Production workload compartment"
}

resource "oci_identity_compartment" "workload_dev" {
  compartment_id = var.root_compartment_id
  name           = "workload-dev"
  description    = "Development workload compartment"
}`,
                autoFixable: false,
            },
        }]
    }
    return []
}

/**
 * GOV-DB-01: Autonomous Database not placed in a private subnet.
 * Field: OciAutonomousDatabase.subnetId (empty = shared Exadata, public endpoint)
 * autoFixable: false — choosing a subnet requires user input
 */
function checkAutonomousDatabasePublicEndpoint(design: OcdDesign): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const db of resourceList(design, 'autonomous_database')) {
        if (!str(db.subnetId)) {
            findings.push({
                id: findingId('GOV-DB-01', db.id),
                severity: 'high',
                category: 'database',
                title: 'Autonomous Database has no private endpoint (public endpoint active)',
                message: `Autonomous Database "${resourceName(db)}" has no subnetId set, meaning it uses a public endpoint. ` +
                         'Assign a subnetId (private subnet) and set isMtlsConnectionRequired to enforce private connectivity.',
                resourceId: str(db.id),
                resourceName: resourceName(db),
                remediation: {
                    summary: 'Assign a private subnet to force private-endpoint-only connectivity, then enable mTLS. ' +
                             'The correct subnet OCID depends on your VCN layout — select it in the resource panel.',
                    terraform: `resource "oci_database_autonomous_database" "example" {
  # ... other attributes ...
  subnet_id                  = oci_core_subnet.private_db.id
  private_endpoint_label     = "adb-private"
  is_mtls_connection_required = true
}`,
                    autoFixable: false,
                },
            })
        }
    }
    return findings
}

/**
 * GOV-DB-02: MySQL DB System check — subnetId should always be set.
 * Field: OciMysqlDbSystem.subnetId
 * autoFixable: false — choosing a subnet requires user input
 */
function checkMysqlPrivateSubnet(design: OcdDesign): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const db of resourceList(design, 'mysql_db_system')) {
        if (!str(db.subnetId)) {
            findings.push({
                id: findingId('GOV-DB-02', db.id),
                severity: 'high',
                category: 'database',
                title: 'MySQL DB System has no subnet assignment',
                message: `MySQL DB System "${resourceName(db)}" has no subnetId set. ` +
                         'Assign a private subnet to ensure the database is not reachable from the internet.',
                resourceId: str(db.id),
                resourceName: resourceName(db),
                remediation: {
                    summary: 'Assign a private subnet so the MySQL DB System has no public endpoint. ' +
                             'Select the target subnet in the resource panel.',
                    terraform: `resource "oci_mysql_mysql_db_system" "example" {
  # ... other attributes ...
  subnet_id = oci_core_subnet.private_db.id
}`,
                    autoFixable: false,
                },
            })
        }
    }
    return findings
}

/**
 * GOV-DB-03: DB System (Exadata/VM/BM) with no NSG protection.
 * Field: OciDbSystem.nsgIds
 * autoFixable: false — creating/selecting an NSG requires user input
 */
function checkDbSystemNsg(design: OcdDesign): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const db of resourceList(design, 'db_system')) {
        if (arr(db.nsgIds).length === 0) {
            findings.push({
                id: findingId('GOV-DB-03', db.id),
                severity: 'medium',
                category: 'database',
                title: 'DB System has no NSG attached',
                message: `DB System "${resourceName(db)}" has no Network Security Groups (nsgIds is empty). ` +
                         'Attach one or more NSGs with restrictive rules to limit which compute and services can connect to this database.',
                resourceId: str(db.id),
                resourceName: resourceName(db),
                remediation: {
                    summary: 'Create an NSG with rules that allow only known application CIDRs/NSGs on the DB listener port, ' +
                             'then attach its OCID to this DB System. NSG selection requires user input.',
                    terraform: `resource "oci_core_network_security_group" "db_nsg" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "db-system-nsg"
}

resource "oci_database_db_system" "example" {
  # ... other attributes ...
  nsg_ids = [oci_core_network_security_group.db_nsg.id]
}`,
                    autoFixable: false,
                },
            })
        }
    }
    return findings
}

/**
 * GOV-LB-01: Public Load Balancer without any NSG.
 * Fields: OciLoadBalancer.isPrivate, .networkSecurityGroupIds
 * autoFixable: false — creating/selecting an NSG requires user input
 */
function checkLoadBalancerNsg(design: OcdDesign): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const lb of resourceList(design, 'load_balancer')) {
        const isPrivate = bool(lb.isPrivate)
        const nsgIds = arr(lb.networkSecurityGroupIds)
        if (!isPrivate && nsgIds.length === 0) {
            findings.push({
                id: findingId('GOV-LB-01', lb.id),
                severity: 'medium',
                category: 'network',
                title: 'Public Load Balancer has no NSG',
                message: `Load Balancer "${resourceName(lb)}" is public (isPrivate=false) but has no networkSecurityGroupIds. ` +
                         'Attach an NSG with rules that restrict inbound traffic to expected ports and source CIDRs.',
                resourceId: str(lb.id),
                resourceName: resourceName(lb),
                remediation: {
                    summary: 'Create an NSG that allows inbound traffic only on required ports (e.g., 443) ' +
                             'from known client CIDRs, then attach it to this Load Balancer.',
                    terraform: `resource "oci_core_network_security_group" "lb_nsg" {
  compartment_id = var.compartment_id
  vcn_id         = oci_core_vcn.main.id
  display_name   = "lb-nsg"
}

resource "oci_load_balancer_load_balancer" "example" {
  # ... other attributes ...
  network_security_group_ids = [oci_core_network_security_group.lb_nsg.id]
}`,
                    autoFixable: false,
                },
            })
        }
    }
    return findings
}

/**
 * GOV-COST-01: No Budget resource defined — spend is unguarded.
 * Key: 'budget' in design.model.oci.resources
 * autoFixable: false — budget amount and alert threshold are user decisions
 */
function checkNoBudgets(design: OcdDesign): GovernanceFinding[] {
    const budgets = resourceList(design, 'budget')
    if (budgets.length === 0) {
        return [{
            id: 'GOV-COST-01::global',
            severity: 'medium',
            category: 'cost',
            title: 'No OCI Budget defined',
            message: 'The design contains no Budget resources. Without a Budget, monthly OCI spend is uncapped ' +
                     'and there are no alert rules to notify the team when costs exceed a threshold. ' +
                     'Add at least one Budget with an alert rule for the root compartment.',
            remediation: {
                summary: 'Add a Budget resource with a monthly amount and at least one alert rule at 80% and 100% thresholds. ' +
                         'Budget amount is organisation-specific — set it in the resource panel.',
                terraform: `resource "oci_budget_budget" "root_budget" {
  compartment_id = var.tenancy_id
  target_type    = "COMPARTMENT"
  targets        = [var.root_compartment_id]
  amount         = 1000    # Replace with your monthly budget in USD
  reset_period   = "MONTHLY"
  display_name   = "root-monthly-budget"
}

resource "oci_budget_alert_rule" "budget_alert" {
  budget_id      = oci_budget_budget.root_budget.id
  type           = "ACTUAL"
  threshold      = 80
  threshold_type = "PERCENTAGE"
  recipients     = "cloud-finance@example.com"
}`,
                autoFixable: false,
            },
        }]
    }
    return []
}

/**
 * GOV-COMPUTE-01: Compute Instance with a public IP (assignPublicIp = true in createVnicDetails).
 * Field: OciInstance.createVnicDetails.assignPublicIp
 * autoFixable: set createVnicDetails.assignPublicIp = false
 */
function checkInstancePublicIp(design: OcdDesign): GovernanceFinding[] {
    const findings: GovernanceFinding[] = []
    for (const instance of resourceList(design, 'instance')) {
        const createVnicDetails = instance.createVnicDetails as Record<string, unknown> | undefined
        if (createVnicDetails && bool(createVnicDetails.assignPublicIp)) {
            findings.push({
                id: findingId('GOV-COMPUTE-01', instance.id),
                severity: 'high',
                category: 'compute',
                title: 'Compute Instance has a public IP address',
                message: `Instance "${resourceName(instance)}" assigns a public IP (createVnicDetails.assignPublicIp = true). ` +
                         'Place instances in private subnets and use a Bastion Service or Load Balancer for access. ' +
                         'Direct public IPs increase the attack surface.',
                resourceId: str(instance.id),
                resourceName: resourceName(instance),
                remediation: {
                    summary: 'Set createVnicDetails.assignPublicIp to false so the instance gets only a private IP. ' +
                             'Use OCI Bastion Service or a Load Balancer for external access.',
                    terraform: `resource "oci_core_instance" "example" {
  # ... other attributes ...
  create_vnic_details {
    assign_public_ip = false
    subnet_id        = oci_core_subnet.private_app.id
  }
}`,
                    autoFixable: true,
                },
            })
        }
    }
    return findings
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/** All rule functions in precedence / display order. */
const RULE_FUNCTIONS: ReadonlyArray<(design: OcdDesign) => GovernanceFinding[]> = [
    checkPublicBuckets,
    checkSecurityListOpenIngress,
    checkNsgOpenIngress,
    checkInstancePublicIp,
    checkAutonomousDatabasePublicEndpoint,
    checkMysqlPrivateSubnet,
    checkDbSystemNsg,
    checkLoadBalancerNsg,
    checkPublicSubnets,
    checkCompartmentSegmentation,
    checkNoBudgets,
    checkMissingTags,
]

/**
 * Run all governance checks against an OcdDesign.
 *
 * Pure function — no side effects, no mutation of the design.
 * Safe to call with a partially-initialised design (guards against missing keys).
 *
 * @param design - The OcdDesign to evaluate.
 * @returns A list of GovernanceFinding objects, empty when the design passes all checks.
 */
export function evaluateGovernance(design: OcdDesign): GovernanceFinding[] {
    if (!design?.model?.oci?.resources) return []
    return RULE_FUNCTIONS.flatMap((fn) => {
        try {
            return fn(design)
        } catch {
            // Graceful: a broken rule must never crash the panel
            return []
        }
    })
}

// ---------------------------------------------------------------------------
// Remediation applicator
// ---------------------------------------------------------------------------

/**
 * Apply a deterministic single-field fix to the design for auto-fixable findings.
 *
 * Pure function — returns a NEW OcdDesign via structuredClone; never mutates the input.
 * For non-auto-fixable findings returns the original design unchanged.
 * No-ops gracefully when the resourceId is not found in the expected resource list.
 *
 * Auto-fixable rules:
 *   GOV-NET-01  subnet → prohibitPublicIpOnVnic = true
 *   GOV-STG-01  bucket → accessType = 'NoPublicAccess'
 *   GOV-COMPUTE-01 instance → createVnicDetails.assignPublicIp = false
 *
 * @param design  - The current OcdDesign (not mutated).
 * @param finding - The GovernanceFinding to remediate.
 * @returns A new OcdDesign with the fix applied, or the original if not auto-fixable.
 */
export function applyRemediation(design: OcdDesign, finding: GovernanceFinding): OcdDesign {
    if (!finding.remediation?.autoFixable || !finding.resourceId) return design

    const ruleId = finding.id.split('::')[0]

    // Each branch: structuredClone the full design, then mutate ONLY the one
    // resource field in the cloned copy.  The original is untouched.
    if (ruleId === 'GOV-NET-01') {
        return applyToResource(design, 'subnet', finding.resourceId, (r) => ({
            ...r,
            prohibitPublicIpOnVnic: true,
        }))
    }

    if (ruleId === 'GOV-STG-01') {
        return applyToResource(design, 'bucket', finding.resourceId, (r) => ({
            ...r,
            accessType: 'NoPublicAccess',
        }))
    }

    if (ruleId === 'GOV-COMPUTE-01') {
        return applyToResource(design, 'instance', finding.resourceId, (r) => {
            const existingVnic = (r.createVnicDetails as Record<string, unknown> | undefined) ?? {}
            return {
                ...r,
                createVnicDetails: {
                    ...existingVnic,
                    assignPublicIp: false,
                },
            }
        })
    }

    return design
}

/**
 * Internal helper: clone the design and replace one resource in a named list.
 * No-ops if the resource list or the specific id is not found.
 */
function applyToResource(
    design: OcdDesign,
    resourceKey: string,
    resourceId: string,
    updater: (r: Record<string, unknown>) => Record<string, unknown>,
): OcdDesign {
    const resources = design?.model?.oci?.resources
    if (!resources) return design

    const list = resources[resourceKey]
    if (!Array.isArray(list)) return design

    const idx = list.findIndex((r) => (r as Record<string, unknown>).id === resourceId)
    if (idx === -1) return design

    // Deep-clone the whole design to guarantee immutability
    const cloned: OcdDesign = structuredClone(design)
    const clonedList = cloned.model.oci.resources[resourceKey] as Record<string, unknown>[]
    clonedList[idx] = updater(clonedList[idx])
    return cloned
}
