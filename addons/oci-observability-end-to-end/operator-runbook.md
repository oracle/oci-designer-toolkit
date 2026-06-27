# OCI Observability End-to-End Operator Runbook

## Validate Locally

Run from the repository root:

```bash
python scripts/validate_observability_lz_library.py
```

To validate the standalone Terraform folders:

```bash
python scripts/validate_observability_lz_terraform.py
```

## Package For Resource Manager

```bash
python scripts/package_observability_lz_addon.py
```

The script writes ZIP_UPLOAD packages under `addons/oci-observability-end-to-end/dist/`.

## Estimate Cost

Offline estimate:

```bash
python scripts/estimate_observability_lz_costs.py --profile free-first
python scripts/estimate_observability_lz_costs.py --profile full-enterprise
```

After deployment, use the generated Usage API query templates in `cost/` to compare actual tenant usage with the template estimate.

## Deploy

1. Replace `<TENANCY_OCID>` and `<OCI_REGION>` locally or set Resource Manager variables.
2. Upload the generated Resource Manager ZIP for the selected profile.
3. Run plan first.
4. Apply only after reviewing compartments, network ranges, paid toggles, and estimated cost.

Never commit resolved OCIDs, APM data keys, tenant namespaces, public/private IPs, or Usage API result data.
