# OCI Observability Landing Zone Enhancements

## Implemented In This Fork

This fork adds concrete OKIT/OCD baseline assets for OCI Landing Zone observability design work:

- Adds OCI reference architectures:
  - `ObservabilityLandingZoneFreeFirst.okit`
  - `ObservabilityLandingZoneEnterprise.okit`
- Adds preview SVGs for both templates.
- Adds generated cost estimate JSON files for both templates.
- Adds generated Terraform JSON and readable `.tf` baselines for both templates.
- Adds Resource Manager package metadata for both templates.
- Adds normalized model examples, `.auto.tfvars.json` examples, demo topology data, and an OKIT catalog.
- Adds generated OKIT data JSON, demo observability asset data, and a One-OE-style add-on folder at `addons/oci-observability-end-to-end/`.
- Adds generated DrawIO architecture files and deployable Terraform/Resource Manager package folders for both profiles.
- Adds Resource Manager ZIP packaging and offline cost-estimate helper scripts.
- Adds an audit command and generated release manifest with checksums for add-on source artifacts.
- Adds a versioned OCI Landing Zones baseline manifest and sync workflow.
- Adds an OKIT issue resolution plan JSON that maps upstream issue themes to implementation work.
- Re-enables the cost estimate toolbar icon in OCD.
- Replaces the placeholder BoM page with a real resource-count and cost-estimate view.
- Wires Resource Manager stack create/update actions to real ZIP_UPLOAD stack packages and plan/apply jobs.
- Adds bounded OCI UI/validation coverage for OKE node pools, NSG-to-NSG rules, and load balancer listeners.

## Upstream Issue Coverage

| Issue | Status in this fork | Notes |
|---:|---|---|
| #143 Export to OCI Cost Estimator | Implemented (live pricing) | The BoM page now computes live monthly estimates from Oracle's public list-pricing API (`apexapps.oracle.com/.../cetools/api/v1/products/`) with currency selection, an offline snapshot fallback, and a desktop IPC + web proxy fetch path. Compute shape→SKU precision and OCI Usage API actuals remain follow-ups. |
| #550 OKIT and CIS OCI Landing Zones | Implemented baseline | One-OE observability Landing Zone templates are in the OCI reference architecture library. |
| #722/#751 Resource Manager export | Implemented baseline | Resource Manager dialog now creates or updates ZIP_UPLOAD stacks and submits plan/apply jobs through the OCI SDK. |
| #741/#586/#599/#545 Query/import reliability | Planned | Needs SDK timeout/error handling, redaction, and import regression fixtures. |
| #781/#782 New OCI resource/region coverage | Planned | Needs provider schema/codegen update and dedicated-region handling tests. |
| #161/#759/#294 OKE/network feature gaps | Partial | Adds OKE node pool guardrails and initial-label Terraform rendering, NSG-to-NSG type options, and LB listener port/protocol validation. |

## Regeneration

Run:

```bash
python scripts/generate_observability_lz_library.py
```

This updates the generated reference architectures and `ocd/library/referenceArchitectures.json`.

You can also run the OCD workspace wrapper:

```bash
cd ocd
npm run generate-observability-lz
```

## OCI Landing Zones Baselines

The baseline manifest is versioned at `baselines/oci-landing-zones.json`. It links this fork to the official OCI Landing Zones repositories used as the One-OE, core module, orchestrator, and CIS quickstart references.

Run:

```bash
python scripts/sync_oci_lz_baselines.py
```

This shallow-clones the baseline repositories into `baselines/oci-landing-zones/`, which is intentionally ignored by git. The sync writes `baselines/oci-landing-zones.lock.json` with the resolved branches, commits, and baseline file list.

The generated baseline manifest also maps every add-on variable to its Terraform variable, `.auto.tfvars.json` key, OKIT variable key, normalized model path, and OCI Landing Zone baseline convention.

## One-OE Add-on Folder

Generated One-OE-style add-on files live under:

- `addons/oci-observability-end-to-end/observability.auto.tfvars.json`
- `addons/oci-observability-end-to-end/observability.enterprise.auto.tfvars.json`
- `addons/oci-observability-end-to-end/addon_observability_free_first.json`
- `addons/oci-observability-end-to-end/addon_observability_enterprise.json`
- `addons/oci-observability-end-to-end/baseline-links.json`
- `addons/oci-observability-end-to-end/variables.json`
- `addons/oci-observability-end-to-end/drawio/free-first.drawio`
- `addons/oci-observability-end-to-end/drawio/full-enterprise.drawio`
- `addons/oci-observability-end-to-end/terraform/free-first-hcl/main.tf`
- `addons/oci-observability-end-to-end/terraform/free-first-json/main.tf.json`
- `addons/oci-observability-end-to-end/terraform/full-enterprise-hcl/main.tf`
- `addons/oci-observability-end-to-end/terraform/full-enterprise-json/main.tf.json`
- `addons/oci-observability-end-to-end/resourcemanager/free-first/main.tf.json`
- `addons/oci-observability-end-to-end/resourcemanager/full-enterprise/main.tf.json`
- `addons/oci-observability-end-to-end/cost/free-first-cost-estimate.json`
- `addons/oci-observability-end-to-end/cost/full-enterprise-usage-api-query.json`
- `addons/oci-observability-end-to-end/operator-runbook.md`
- `addons/oci-observability-end-to-end/release-manifest.json`

The folder mirrors the official OCI Open LZ add-on workflow: keep guidance and generated overlay JSON together, copy the folder into a One-OE checkout when needed, and resolve placeholders locally.

## Packaging

Build Resource Manager ZIP_UPLOAD packages:

```bash
python scripts/package_observability_lz_addon.py
```

The generated archives are written under `addons/oci-observability-end-to-end/dist/`, which is ignored by git.
The packaging script also writes `addons/oci-observability-end-to-end/dist/checksums.sha256`.

## Cost Estimation

Print the generated static estimates:

```bash
python scripts/estimate_observability_lz_costs.py --profile all
```

For actuals after deployment, use the generated OCI Usage API query templates:

- `addons/oci-observability-end-to-end/cost/free-first-usage-api-query.json`
- `addons/oci-observability-end-to-end/cost/full-enterprise-usage-api-query.json`

## Examples And Demo Data

Generated examples live under:

- `examples/observability-landing-zone/free-first/observability.model.json`
- `examples/observability-landing-zone/free-first/observability.auto.tfvars.json`
- `examples/observability-landing-zone/free-first/okit-data.json`
- `examples/observability-landing-zone/full-enterprise/observability.model.json`
- `examples/observability-landing-zone/full-enterprise/observability.auto.tfvars.json`
- `examples/observability-landing-zone/full-enterprise/okit-data.json`
- `examples/demo-data/observability-demo-topology.json`
- `examples/demo-data/observability-demo-assets.json`

All examples use placeholders for tenancy OCIDs, workload OCIDs, APM data keys, and endpoints.

## Generated Terraform

The generated Terraform artifacts live next to the OKIT templates:

- `ocd/library/oci/ObservabilityLandingZoneFreeFirstTerraform.tf.json`
- `ocd/library/oci/ObservabilityLandingZoneFreeFirstTerraform.tf`
- `ocd/library/oci/ObservabilityLandingZoneFreeFirst.drawio`
- `ocd/library/oci/ObservabilityLandingZoneEnterpriseTerraform.tf.json`
- `ocd/library/oci/ObservabilityLandingZoneEnterpriseTerraform.tf`
- `ocd/library/oci/ObservabilityLandingZoneEnterprise.drawio`

The JSON form is the canonical machine export. The `.tf` files are operator-readable views that include the same baseline resources: compartments, VCN, private subnet, service gateway, route table, security list, Logging log group, Notifications topic, Monitoring alarm, and optional enterprise Streaming resources.

All variables are defined in both generated Terraform formats and mirrored in the generated `.auto.tfvars.json` examples. The deployment variables are linked to resource names, compartment placement, CIDR blocks, DNS labels, alarm thresholds, notification topics, and service-pack outputs.

## Resource Manager

The desktop Resource Manager export now packages generated Terraform as a ZIP_UPLOAD config source, adds `okit-resource-manager-manifest.json`, and submits a plan job by default. Apply remains explicit in the dialog.

## Verification

Run:

```bash
python scripts/validate_observability_lz_library.py
python scripts/validate_observability_lz_terraform.py
python scripts/audit_observability_lz_addon.py
npm run build --workspace=packages/react
```

Or from the OCD workspace:

```bash
cd ocd
npm run validate-observability-lz
npm run validate-observability-lz-terraform
npm run audit-observability-lz
```
