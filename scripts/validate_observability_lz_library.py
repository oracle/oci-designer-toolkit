#!/usr/bin/env python3
"""Validate generated OCI Observability Landing Zone OKIT library assets."""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
import hashlib
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LIBRARY_ROOT = ROOT / "ocd" / "library"
OCI_LIBRARY = LIBRARY_ROOT / "oci"
REFERENCE_ARCHITECTURES = LIBRARY_ROOT / "referenceArchitectures.json"
EXAMPLES_ROOT = ROOT / "examples" / "observability-landing-zone"
DEMO_DATA_ROOT = ROOT / "examples" / "demo-data"
BASELINES_MANIFEST = ROOT / "baselines" / "oci-landing-zones.json"
ADDON_ROOT = ROOT / "addons" / "oci-observability-end-to-end"

PROFILES = {
    "free-first": "ObservabilityLandingZoneFreeFirst",
    "full-enterprise": "ObservabilityLandingZoneEnterprise",
}

SENSITIVE_NAME_FRAGMENTS = [
    ("fr4z", "qfimuxtr"),
    ("aaaadhp5ewo4e", "aaaaaaaaafs7q"),
    ("axfo51", "x8x2ap"),
    ("axox", "dievda5j"),
    ("id9y6", "mi8tcky"),
]

EXPECTED_FILES = [
    "ObservabilityLandingZoneFreeFirst.okit",
    "ObservabilityLandingZoneFreeFirst.svg",
    "ObservabilityLandingZoneFreeFirst.drawio",
    "ObservabilityLandingZoneFreeFirstCostEstimate.json",
    "ObservabilityLandingZoneFreeFirstUsageApiQuery.json",
    "ObservabilityLandingZoneFreeFirstResourceManagerPackage.json",
    "ObservabilityLandingZoneFreeFirstTerraform.tf.json",
    "ObservabilityLandingZoneFreeFirstTerraform.tf",
    "ObservabilityLandingZoneEnterprise.okit",
    "ObservabilityLandingZoneEnterprise.svg",
    "ObservabilityLandingZoneEnterprise.drawio",
    "ObservabilityLandingZoneEnterpriseCostEstimate.json",
    "ObservabilityLandingZoneEnterpriseUsageApiQuery.json",
    "ObservabilityLandingZoneEnterpriseResourceManagerPackage.json",
    "ObservabilityLandingZoneEnterpriseTerraform.tf.json",
    "ObservabilityLandingZoneEnterpriseTerraform.tf",
    "ObservabilityLandingZoneOkitCatalog.json",
    "ObservabilityLandingZoneBaselineSources.json",
    "ObservabilityLandingZoneIssuePlan.json",
]

EXPECTED_EXAMPLE_FILES = [
    "free-first/observability.model.json",
    "free-first/observability.auto.tfvars.json",
    "free-first/okit-data.json",
    "free-first/README.md",
    "full-enterprise/observability.model.json",
    "full-enterprise/observability.auto.tfvars.json",
    "full-enterprise/okit-data.json",
    "full-enterprise/README.md",
]

EXPECTED_ADDON_FILES = [
    "README.md",
    "observability.auto.tfvars.json",
    "observability.enterprise.auto.tfvars.json",
    "addon_observability_free_first.json",
    "addon_observability_enterprise.json",
    "baseline-links.json",
    "variables.json",
    "operator-runbook.md",
    "release-manifest.json",
    "drawio/free-first.drawio",
    "drawio/full-enterprise.drawio",
    "cost/free-first-cost-estimate.json",
    "cost/full-enterprise-cost-estimate.json",
    "cost/free-first-usage-api-query.json",
    "cost/full-enterprise-usage-api-query.json",
    "terraform/free-first-hcl/main.tf",
    "terraform/free-first-hcl/observability.auto.tfvars.json",
    "terraform/free-first-hcl/README.md",
    "terraform/free-first-json/main.tf.json",
    "terraform/free-first-json/observability.auto.tfvars.json",
    "terraform/free-first-json/README.md",
    "terraform/full-enterprise-hcl/main.tf",
    "terraform/full-enterprise-hcl/observability.auto.tfvars.json",
    "terraform/full-enterprise-hcl/README.md",
    "terraform/full-enterprise-json/main.tf.json",
    "terraform/full-enterprise-json/observability.auto.tfvars.json",
    "terraform/full-enterprise-json/README.md",
    "resourcemanager/free-first/main.tf.json",
    "resourcemanager/free-first/observability.auto.tfvars.json",
    "resourcemanager/free-first/okit-resource-manager-manifest.json",
    "resourcemanager/free-first/README_RESOURCE_MANAGER.md",
    "resourcemanager/free-first/cost-estimate.json",
    "resourcemanager/free-first/usage-api-query.json",
    "resourcemanager/free-first/architecture.drawio",
    "resourcemanager/full-enterprise/main.tf.json",
    "resourcemanager/full-enterprise/observability.auto.tfvars.json",
    "resourcemanager/full-enterprise/okit-resource-manager-manifest.json",
    "resourcemanager/full-enterprise/README_RESOURCE_MANAGER.md",
    "resourcemanager/full-enterprise/cost-estimate.json",
    "resourcemanager/full-enterprise/usage-api-query.json",
    "resourcemanager/full-enterprise/architecture.drawio",
]

EXPECTED_VARIABLES = {
    "tenancy_ocid",
    "region",
    "parent_compartment_ocid",
    "network_compartment_name",
    "observability_compartment_name",
    "vcn_cidr_blocks",
    "private_subnet_cidr",
    "hub_vcn_dns_label",
    "private_subnet_dns_label",
    "notification_topic_name",
    "alarm_cpu_threshold",
    "enable_streaming",
    "enable_apm",
    "enable_log_analytics",
    "enable_management_agent",
    "enable_database_management",
    "enable_oke_monitoring",
}

REDACTION_PATTERNS = [
    re.compile(r"ocid1\.(tenancy|compartment|instance|cluster|networksecuritygroup|loadbalancer|subnet|vnic|bootvolume|loganalytics[a-z]+|user)\.oc1\.[a-z0-9.-]+", re.IGNORECASE),
    re.compile(r"\b(130\.61|161\.153|144\.24|129\.153|141\.147|82\.77|109\.166)\.[0-9]+\.[0-9]+\b"),
    re.compile(r"\b(10\.42|10\.0\.10)\.[0-9]+\.[0-9]+\b"),
    re.compile(r"\b(" + "|".join(re.escape("".join(parts)) for parts in SENSITIVE_NAME_FRAGMENTS) + r")\b", re.IGNORECASE),
    re.compile(r"\bisk_[a-f0-9]{40}\b", re.IGNORECASE),
]


class ValidationError(Exception):
    """Raised when generated assets do not match the expected contract."""


def read_json(path: Path) -> dict[str, Any]:
    try:
        with path.open(encoding="utf-8") as handle:
            data = json.load(handle)
    except json.JSONDecodeError as exc:
        raise ValidationError(f"{path.relative_to(ROOT)} is not valid JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise ValidationError(f"{path.relative_to(ROOT)} must contain a JSON object")
    return data


def assert_true(condition: bool, message: str) -> None:
    if not condition:
        raise ValidationError(message)


def scan_redactions(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    for pattern in REDACTION_PATTERNS:
        if pattern.search(text):
            raise ValidationError(f"{path.relative_to(ROOT)} contains a redaction-sensitive value matching {pattern.pattern}")


def validate_xml(path: Path, root_tag: str) -> None:
    try:
        root = ET.fromstring(path.read_text(encoding="utf-8"))
    except ET.ParseError as exc:
        raise ValidationError(f"{path.relative_to(ROOT)} is not valid XML: {exc}") from exc
    assert_true(root.tag == root_tag, f"{path.relative_to(ROOT)} root tag must be {root_tag}")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_okit(profile: str, stem: str) -> None:
    data = read_json(OCI_LIBRARY / f"{stem}.okit")
    validate_xml(OCI_LIBRARY / f"{stem}.drawio", "mxfile")
    assert_true(data.get("metadata", {}).get("platform") == "oci", f"{stem}.okit must be an OCI design")
    assert_true(data.get("userDefined", {}).get("ociObservabilityLandingZone", {}).get("profile") == profile, f"{stem}.okit profile metadata is wrong")

    model = data.get("model", {}).get("oci", {})
    resources = model.get("resources", {})
    assert_true(isinstance(resources, dict) and resources, f"{stem}.okit must include OCI resources")
    for required in ("compartment", "vcn", "subnet", "service_gateway", "route_table", "security_list"):
        assert_true(required in resources and len(resources[required]) > 0, f"{stem}.okit missing {required} resource")

    pages = data.get("view", {}).get("pages", [])
    assert_true(isinstance(pages, list) and len(pages) >= 6, f"{stem}.okit must include complete multi-page architecture views")
    assert_true(any(page.get("title") == "Landing Zone Baseline" for page in pages), f"{stem}.okit missing landing-zone page")
    assert_true(any(page.get("title") == "Deployment Workflow" for page in pages), f"{stem}.okit missing deployment workflow page")
    assert_true(any(page.get("title") == "Service Pack Architecture" for page in pages), f"{stem}.okit missing service-pack page")
    assert_true(any(page.get("title") == "Resource Manager Package" for page in pages), f"{stem}.okit missing Resource Manager package page")
    assert_true(any(page.get("title") == "Cost And Governance" for page in pages), f"{stem}.okit missing cost governance page")

    generated = data.get("userDefined", {}).get("ociObservabilityLandingZone", {}).get("generated_artifacts", [])
    assert_true(any("terraform/main.tf.json" in artifact for artifact in generated), f"{stem}.okit must advertise Terraform JSON export")


def validate_cost(profile: str, stem: str) -> None:
    data = read_json(OCI_LIBRARY / f"{stem}CostEstimate.json")
    assert_true(data.get("schema_version") == "oci.okit.cost_estimate.v1", f"{stem}CostEstimate.json schema mismatch")
    assert_true(data.get("profile") == profile, f"{stem}CostEstimate.json profile mismatch")
    assert_true(data.get("currency") == "USD", f"{stem}CostEstimate.json must use USD")
    assert_true("monthly_estimate" in data, f"{stem}CostEstimate.json missing monthly_estimate")
    assert_true(isinstance(data.get("line_items"), list) and data["line_items"], f"{stem}CostEstimate.json missing line_items")
    query = read_json(OCI_LIBRARY / f"{stem}UsageApiQuery.json")
    assert_true(query.get("schema_version") == "oci.usage_api.query_template.v1", f"{stem}UsageApiQuery.json schema mismatch")
    assert_true(query.get("api") == "UsageapiClient.request_summarized_usages", f"{stem}UsageApiQuery.json API mismatch")


def validate_terraform(stem: str) -> None:
    data = read_json(OCI_LIBRARY / f"{stem}Terraform.tf.json")
    resources = data.get("resource", {})
    assert_true(data.get("terraform", {}).get("required_providers", {}).get("oci", {}).get("source") == "oracle/oci", f"{stem}Terraform.tf.json missing OCI provider")
    for required in (
        "oci_identity_compartment",
        "oci_core_vcn",
        "oci_core_subnet",
        "oci_logging_log_group",
        "oci_ons_notification_topic",
        "oci_monitoring_alarm",
    ):
        assert_true(required in resources, f"{stem}Terraform.tf.json missing {required}")
    variables = set(data.get("variable", {}).keys())
    assert_true(EXPECTED_VARIABLES.issubset(variables), f"{stem}Terraform.tf.json missing expected variables: {sorted(EXPECTED_VARIABLES - variables)}")

    hcl = (OCI_LIBRARY / f"{stem}Terraform.tf").read_text(encoding="utf-8")
    for required in (
        'provider "oci"',
        'resource "oci_core_vcn" "observability_hub"',
        'resource "oci_logging_log_group" "observability"',
        'resource "oci_monitoring_alarm" "high_cpu_placeholder"',
    ):
        assert_true(required in hcl, f"{stem}Terraform.tf missing {required}")
    for variable in EXPECTED_VARIABLES:
        assert_true(f'variable "{variable}"' in hcl, f"{stem}Terraform.tf missing variable {variable}")
    for linked in (
        "local.parent_compartment_id",
        "var.network_compartment_name",
        "var.observability_compartment_name",
        "var.vcn_cidr_blocks",
        "var.private_subnet_cidr",
        "var.notification_topic_name",
        "var.alarm_cpu_threshold",
        "local.enabled_service_packs",
    ):
        assert_true(linked in hcl, f"{stem}Terraform.tf does not link {linked}")


def validate_resource_manager_package(profile: str, stem: str) -> None:
    data = read_json(OCI_LIBRARY / f"{stem}ResourceManagerPackage.json")
    assert_true(data.get("schema_version") == "oci.okit.resource_manager_package.v1", f"{stem}ResourceManagerPackage.json schema mismatch")
    assert_true(data.get("profile") == profile, f"{stem}ResourceManagerPackage.json profile mismatch")
    assert_true(data.get("config_source_type") == "ZIP_UPLOAD", f"{stem}ResourceManagerPackage.json must target ZIP_UPLOAD")
    assert_true(isinstance(data.get("readiness_checks"), list) and data["readiness_checks"], f"{stem}ResourceManagerPackage.json missing readiness checks")
    assert_true("okit-resource-manager-manifest.json" in data.get("files", []), f"{stem}ResourceManagerPackage.json missing manifest file")


def validate_reference_architectures() -> None:
    data = read_json(REFERENCE_ARCHITECTURES)
    oci_entries = data.get("oci", [])
    assert_true(isinstance(oci_entries, list), "referenceArchitectures.json must contain an OCI list")
    files = {entry.get("okitFile") for entry in oci_entries}
    assert_true("ObservabilityLandingZoneFreeFirst.okit" in files, "referenceArchitectures.json missing free-first entry")
    assert_true("ObservabilityLandingZoneEnterprise.okit" in files, "referenceArchitectures.json missing enterprise entry")


def validate_okit_catalog() -> None:
    data = read_json(OCI_LIBRARY / "ObservabilityLandingZoneOkitCatalog.json")
    assert_true(data.get("schema_version") == "oci.okit.catalog.v1", "OKIT catalog schema mismatch")
    assert_true(len(data.get("templates", [])) == 2, "OKIT catalog must include both observability templates")
    assert_true("baseline_sources" in data and data["baseline_sources"], "OKIT catalog missing OCI LZ baseline sources")
    bindings = data.get("variable_bindings", {})
    assert_true(EXPECTED_VARIABLES.issubset(set(bindings.keys())), "OKIT catalog missing complete variable bindings")
    for template in data.get("templates", []):
        assert_true(template.get("drawio_file", "").endswith(".drawio"), "OKIT catalog template missing DrawIO file")


def validate_baseline_sources() -> None:
    for path in (OCI_LIBRARY / "ObservabilityLandingZoneBaselineSources.json", BASELINES_MANIFEST):
        data = read_json(path)
        assert_true(data.get("schema_version") == "oci.okit.landing_zone_baselines.v1", f"{path.relative_to(ROOT)} schema mismatch")
        repos = data.get("repositories", [])
        assert_true(isinstance(repos, list) and len(repos) >= 3, f"{path.relative_to(ROOT)} must include OCI LZ repositories")
        urls = {repo.get("url") for repo in repos}
        assert_true("https://github.com/oci-landing-zones/oci-landing-zone-operating-entities.git" in urls, f"{path.relative_to(ROOT)} missing One-OE repo")
        bindings = data.get("mapping", {}).get("variable_bindings", {})
        assert_true(EXPECTED_VARIABLES.issubset(set(bindings.keys())), f"{path.relative_to(ROOT)} missing complete variable binding map")


def validate_examples() -> None:
    for name in EXPECTED_EXAMPLE_FILES:
        path = EXAMPLES_ROOT / name
        assert_true(path.exists(), f"missing: {path.relative_to(ROOT)}")
        scan_redactions(path)
    for profile in PROFILES:
        model = read_json(EXAMPLES_ROOT / profile / "observability.model.json")
        tfvars = read_json(EXAMPLES_ROOT / profile / "observability.auto.tfvars.json")
        okit_data = read_json(EXAMPLES_ROOT / profile / "okit-data.json")
        assert_true(model.get("schema_version") == "oci.observability.addon.v1", f"{profile} model schema mismatch")
        assert_true(EXPECTED_VARIABLES.issubset(set(tfvars.keys())), f"{profile} tfvars missing expected variables")
        assert_true(okit_data.get("schema_version") == "oci.okit.template_data.v1", f"{profile} OKIT data schema mismatch")
        assert_true(EXPECTED_VARIABLES.issubset(set(okit_data.get("variable_bindings", {}).keys())), f"{profile} OKIT data missing bindings")
    demo_path = DEMO_DATA_ROOT / "observability-demo-topology.json"
    assert_true(demo_path.exists(), f"missing: {demo_path.relative_to(ROOT)}")
    scan_redactions(demo_path)
    demo = read_json(demo_path)
    assert_true(demo.get("schema_version") == "oci.okit.demo_topology.v1", "demo topology schema mismatch")
    demo_assets_path = DEMO_DATA_ROOT / "observability-demo-assets.json"
    assert_true(demo_assets_path.exists(), f"missing: {demo_assets_path.relative_to(ROOT)}")
    scan_redactions(demo_assets_path)
    demo_assets = read_json(demo_assets_path)
    assert_true(demo_assets.get("schema_version") == "oci.okit.demo_assets.v1", "demo assets schema mismatch")


def validate_addon_folder() -> None:
    for name in EXPECTED_ADDON_FILES:
        path = ADDON_ROOT / name
        assert_true(path.exists(), f"missing: {path.relative_to(ROOT)}")
        scan_redactions(path)
        if path.suffix == ".drawio":
            validate_xml(path, "mxfile")

    for name, profile in (
        ("addon_observability_free_first.json", "free-first"),
        ("addon_observability_enterprise.json", "full-enterprise"),
    ):
        data = read_json(ADDON_ROOT / name)
        assert_true(data.get("schema_version") == "oci.oneoe.addon.observability.v1", f"{name} schema mismatch")
        assert_true(data.get("profile") == profile, f"{name} profile mismatch")
        assert_true(EXPECTED_VARIABLES.issubset(set(data.get("variables", {}).keys())), f"{name} missing variables")
        assert_true(EXPECTED_VARIABLES.issubset(set(data.get("variable_bindings", {}).keys())), f"{name} missing variable bindings")

    variables = read_json(ADDON_ROOT / "variables.json")
    assert_true(variables.get("schema_version") == "oci.oneoe.addon.variables.v1", "variables.json schema mismatch")
    for profile in PROFILES:
        profile_data = variables.get("profiles", {}).get(profile, {})
        assert_true(EXPECTED_VARIABLES.issubset(set(profile_data.get("variables", {}).keys())), f"variables.json missing variables for {profile}")
        assert_true(EXPECTED_VARIABLES.issubset(set(profile_data.get("tfvars", {}).keys())), f"variables.json missing tfvars for {profile}")
        assert_true(EXPECTED_VARIABLES.issubset(set(profile_data.get("bindings", {}).keys())), f"variables.json missing bindings for {profile}")

    for profile in PROFILES:
        for mode in ("hcl", "json"):
            tfvars = read_json(ADDON_ROOT / "terraform" / f"{profile}-{mode}" / "observability.auto.tfvars.json")
            assert_true(EXPECTED_VARIABLES.issubset(set(tfvars.keys())), f"terraform {profile}-{mode} tfvars missing expected variables")
        manifest = read_json(ADDON_ROOT / "resourcemanager" / profile / "okit-resource-manager-manifest.json")
        assert_true(manifest.get("schema_version") == "oci.okit.resource_manager_manifest.v1", f"Resource Manager manifest schema mismatch for {profile}")
        assert_true(manifest.get("terraform_entrypoint") == "main.tf.json", f"Resource Manager manifest entrypoint mismatch for {profile}")
        cost = read_json(ADDON_ROOT / "cost" / f"{profile}-cost-estimate.json")
        query = read_json(ADDON_ROOT / "cost" / f"{profile}-usage-api-query.json")
        assert_true(cost.get("schema_version") == "oci.okit.cost_estimate.v1", f"cost estimate schema mismatch for {profile}")
        assert_true(query.get("schema_version") == "oci.usage_api.query_template.v1", f"usage query schema mismatch for {profile}")

    manifest = read_json(ADDON_ROOT / "release-manifest.json")
    assert_true(manifest.get("schema_version") == "oci.observability.addon.release_manifest.v1", "release manifest schema mismatch")
    files = manifest.get("files", [])
    assert_true(isinstance(files, list) and files, "release manifest missing files")
    for item in files:
        relative = item.get("path")
        assert_true(isinstance(relative, str) and relative, "release manifest file missing path")
        path = ADDON_ROOT / relative
        assert_true(path.exists(), f"release manifest references missing file: {relative}")
        assert_true(item.get("sha256") == sha256_file(path), f"release manifest checksum mismatch: {relative}")
        assert_true(item.get("size_bytes") == path.stat().st_size, f"release manifest size mismatch: {relative}")


def validate_issue_plan() -> None:
    data = read_json(OCI_LIBRARY / "ObservabilityLandingZoneIssuePlan.json")
    assert_true(data.get("schema_version") == "oci.okit.issue_resolution_plan.v1", "Issue plan schema mismatch")
    implemented = data.get("implemented", [])
    next_items = data.get("next", [])
    assert_true(isinstance(implemented, list) and implemented, "Issue plan missing implemented items")
    assert_true(isinstance(next_items, list) and next_items, "Issue plan missing next items")
    assert_true(any(item.get("issue") == 143 for item in implemented), "Issue plan missing cost estimator issue coverage")
    assert_true(any(item.get("issue") == 550 for item in implemented), "Issue plan missing landing-zone issue coverage")
    assert_true(any(item.get("issue") == 722 for item in implemented), "Issue plan missing Resource Manager stack packaging coverage")
    assert_true(any(item.get("issue") == 759 for item in implemented), "Issue plan missing NSG rule coverage")


def main() -> int:
    missing = [name for name in EXPECTED_FILES if not (OCI_LIBRARY / name).exists()]
    if missing:
        for name in missing:
            print(f"missing: ocd/library/oci/{name}", file=sys.stderr)
        return 1

    for path in [OCI_LIBRARY / name for name in EXPECTED_FILES] + [REFERENCE_ARCHITECTURES]:
        scan_redactions(path)

    for profile, stem in PROFILES.items():
        validate_okit(profile, stem)
        validate_cost(profile, stem)
        validate_resource_manager_package(profile, stem)
        validate_terraform(stem)

    validate_reference_architectures()
    validate_okit_catalog()
    validate_baseline_sources()
    validate_examples()
    validate_addon_folder()
    validate_issue_plan()
    print("Observability Landing Zone OKIT library validation passed.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValidationError as exc:
        print(f"validation failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
