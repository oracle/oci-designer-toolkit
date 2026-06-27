# OCI Observability End-to-End Add-on

This generated folder follows the OCI Open LZ add-on pattern used by One-OE baseline assets.

Files:

- `observability.auto.tfvars.json` - free-first Terraform variable values with placeholders only.
- `observability.enterprise.auto.tfvars.json` - enterprise Terraform variable values with paid toggles explicit.
- `addon_observability_free_first.json` - One-OE style observability overlay for the free-first profile.
- `addon_observability_enterprise.json` - One-OE style observability overlay for the enterprise profile.
- `baseline-links.json` - official OCI Landing Zones repository links, local baseline paths, and baseline files used.
- `variables.json` - full variable definitions, tfvars, and bindings for both profiles.
- `terraform/*` - standalone Terraform JSON and HCL folders for both profiles.
- `resourcemanager/*` - Resource Manager ZIP_UPLOAD source folders for both profiles.
- `drawio/*` - DrawIO architecture exports for both profiles.
- `cost/*` - static estimate and OCI Usage API query templates for both profiles.
- `operator-runbook.md` - local validation, packaging, cost, and deployment workflow.
- `release-manifest.json` - checksums for generated add-on source artifacts.

The folder is intended to be copied into an OCI Landing Zone checkout under `addons/oci-observability-end-to-end/`.
All tenant-specific identifiers remain placeholders and must be resolved locally before deployment.
