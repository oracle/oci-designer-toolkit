#!/usr/bin/env python3
"""Generate OCI Observability Landing Zone reference designs for OCD/OKIT."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
LIBRARY_ROOT = ROOT / "ocd" / "library"
OCI_LIBRARY = LIBRARY_ROOT / "oci"
REFERENCE_ARCHITECTURES = LIBRARY_ROOT / "referenceArchitectures.json"
EXAMPLES_ROOT = ROOT / "examples" / "observability-landing-zone"
DEMO_DATA_ROOT = ROOT / "examples" / "demo-data"
BASELINES_ROOT = ROOT / "baselines"
ADDON_ROOT = ROOT / "addons" / "oci-observability-end-to-end"

SERVICE_PACKS = [
    "logging",
    "log_analytics",
    "management_agent",
    "db_observability",
    "apm",
    "alarms_dashboards",
]

OCI_LZ_BASELINE_REPOS = [
    {
        "name": "oci-landing-zone-operating-entities",
        "url": "https://github.com/oci-landing-zones/oci-landing-zone-operating-entities.git",
        "branch": "master",
        "purpose": "One-OE Landing Zone orchestration baseline and add-on workflow reference.",
        "local_path": "baselines/oci-landing-zones/oci-landing-zone-operating-entities",
    },
    {
        "name": "terraform-oci-core-landingzone",
        "url": "https://github.com/oci-landing-zones/terraform-oci-core-landingzone.git",
        "branch": "main",
        "purpose": "Core Landing Zone modules and variable conventions.",
        "local_path": "baselines/oci-landing-zones/terraform-oci-core-landingzone",
    },
    {
        "name": "terraform-oci-modules-orchestrator",
        "url": "https://github.com/oci-landing-zones/terraform-oci-modules-orchestrator.git",
        "branch": "main",
        "purpose": "JSON/YAML/HCL configuration orchestration conventions.",
        "local_path": "baselines/oci-landing-zones/terraform-oci-modules-orchestrator",
    },
    {
        "name": "oci-cis-landingzone-quickstart",
        "url": "https://github.com/oci-landing-zones/oci-cis-landingzone-quickstart.git",
        "branch": "main",
        "purpose": "CIS Landing Zone quickstart reference for legacy OKIT/OCI-LZ comparisons.",
        "local_path": "baselines/oci-landing-zones/oci-cis-landingzone-quickstart",
    },
]


def variable_definitions(profile: str) -> dict[str, dict[str, Any]]:
    enterprise = profile == "full-enterprise"
    return {
        "tenancy_ocid": {
            "type": "string",
            "description": "Tenancy OCID. Keep tenant-specific values outside source control.",
        },
        "region": {
            "type": "string",
            "description": "OCI region identifier.",
        },
        "parent_compartment_ocid": {
            "type": "string",
            "description": "Parent compartment OCID for generated landing-zone compartments. Defaults to tenancy_ocid when null.",
            "default": None,
        },
        "network_compartment_name": {
            "type": "string",
            "description": "Network shared-services compartment name.",
            "default": "cmp-lz-network",
        },
        "observability_compartment_name": {
            "type": "string",
            "description": "Observability shared-services compartment name.",
            "default": "cmp-lz-observability",
        },
        "vcn_cidr_blocks": {
            "type": "list(string)",
            "description": "CIDR blocks for the observability hub VCN.",
            "default": ["10.100.0.0/16"],
        },
        "private_subnet_cidr": {
            "type": "string",
            "description": "CIDR block for the private observability subnet.",
            "default": "10.100.10.0/24",
        },
        "hub_vcn_dns_label": {
            "type": "string",
            "description": "DNS label for the observability hub VCN.",
            "default": "obshub",
        },
        "private_subnet_dns_label": {
            "type": "string",
            "description": "DNS label for the private observability subnet.",
            "default": "obspriv",
        },
        "notification_topic_name": {
            "type": "string",
            "description": "Notifications topic name for observability alarms.",
            "default": "observability-alarm-topic",
        },
        "alarm_cpu_threshold": {
            "type": "number",
            "description": "Template CPU alarm threshold.",
            "default": 90,
        },
        "enable_streaming": {
            "type": "bool",
            "description": "Enable paid Streaming baseline resources for enterprise observability flows.",
            "default": enterprise,
        },
        "enable_apm": {
            "type": "bool",
            "description": "Enable APM service pack metadata and operator recipes.",
            "default": True,
        },
        "enable_log_analytics": {
            "type": "bool",
            "description": "Enable Log Analytics service pack metadata and importer recipes.",
            "default": True,
        },
        "enable_management_agent": {
            "type": "bool",
            "description": "Enable Management Agent installation and association recipes.",
            "default": True,
        },
        "enable_database_management": {
            "type": "bool",
            "description": "Enable DB Management Basic baseline. Full Management remains an explicit paid add-on outside this baseline.",
            "default": enterprise,
        },
        "enable_oke_monitoring": {
            "type": "bool",
            "description": "Enable OKE monitoring and logging Helm values in generated examples.",
            "default": enterprise,
        },
    }


def okit_vars(profile: str) -> list[dict[str, Any]]:
    vars_out = []
    for key, definition in variable_definitions(profile).items():
        default = definition.get("default", f"<{key.upper()}>")
        if default is None:
            default = f"<{key.upper()}_OR_NULL>"
        vars_out.append(
            {
                "key": key,
                "name": key,
                "default": default,
                "description": definition["description"],
            }
        )
    return vars_out


def variable_bindings(profile: str = "free-first") -> dict[str, dict[str, Any]]:
    bindings: dict[str, dict[str, Any]] = {}
    one_oe_mapping = {
        "tenancy_ocid": "One-OE root tenancy_ocid input.",
        "region": "One-OE region input.",
        "parent_compartment_ocid": "One-OE enclosing compartment or tenancy OCID input.",
        "network_compartment_name": "One-OE network shared-services compartment naming convention.",
        "observability_compartment_name": "Observability add-on shared-services compartment.",
        "vcn_cidr_blocks": "One-OE hub or add-on network CIDR baseline.",
        "private_subnet_cidr": "One-OE private subnet CIDR baseline for agents/connectors.",
        "hub_vcn_dns_label": "One-OE hub VCN DNS label convention.",
        "private_subnet_dns_label": "One-OE private subnet DNS label convention.",
        "notification_topic_name": "One-OE observability notifications topic.",
        "alarm_cpu_threshold": "One-OE Monitoring alarm threshold.",
        "enable_streaming": "Paid Streaming add-on toggle. Disabled in free-first.",
        "enable_apm": "APM service-pack toggle.",
        "enable_log_analytics": "Log Analytics service-pack toggle.",
        "enable_management_agent": "Management Agent service-pack toggle.",
        "enable_database_management": "Database Management service-pack toggle.",
        "enable_oke_monitoring": "OKE monitoring service-pack toggle.",
    }
    for name, definition in variable_definitions(profile).items():
        bindings[name] = {
            "description": definition["description"],
            "terraform_variable": f"var.{name}",
            "tf_json_path": f"variable.{name}",
            "tfvars_key": name,
            "okit_variable_key": name,
            "normalized_model_path": normalized_model_path_for_variable(name),
            "one_oe_baseline_mapping": one_oe_mapping[name],
        }
    return bindings


def normalized_model_path_for_variable(name: str) -> str:
    paths = {
        "tenancy_ocid": "landing_zone.tenancy_ocid",
        "region": "landing_zone.region",
        "parent_compartment_ocid": "landing_zone.parent_compartment_ocid",
        "network_compartment_name": "landing_zone.compartments.network",
        "observability_compartment_name": "landing_zone.compartments.observability",
        "vcn_cidr_blocks": "landing_zone.network.vcn_cidr_blocks",
        "private_subnet_cidr": "landing_zone.network.private_subnet_cidr",
        "hub_vcn_dns_label": "landing_zone.network.hub_vcn_dns_label",
        "private_subnet_dns_label": "landing_zone.network.private_subnet_dns_label",
        "notification_topic_name": "services.alarms_dashboards.notification_topic_name",
        "alarm_cpu_threshold": "services.alarms_dashboards.alarm_cpu_threshold",
        "enable_streaming": "services.streaming.enabled",
        "enable_apm": "services.apm.enabled",
        "enable_log_analytics": "services.log_analytics.enabled",
        "enable_management_agent": "services.management_agent.enabled",
        "enable_database_management": "services.db_observability.enabled",
        "enable_oke_monitoring": "services.oke_monitoring.enabled",
    }
    return paths[name]


def stable_json(data: Any) -> str:
    return json.dumps(data, ensure_ascii=True, indent=4, sort_keys=True) + "\n"


def profile_stem(profile: str) -> str:
    return "ObservabilityLandingZoneEnterprise" if profile == "full-enterprise" else "ObservabilityLandingZoneFreeFirst"


def profile_title(profile: str) -> str:
    return "OCI Observability Landing Zone - Full Enterprise" if profile == "full-enterprise" else "OCI Observability Landing Zone - Free First"


def okit_id(kind: str, name: str) -> str:
    digest = hashlib.sha1(f"{kind}:{name}".encode("utf-8")).hexdigest()[:12]
    return f"okit.{kind}.{digest}"


def gid(name: str) -> str:
    digest = hashlib.sha1(f"gid:{name}".encode("utf-8")).hexdigest()[:12]
    return f"gid-{digest}"


def resource(kind: str, resource_name: str, display_name: str, *, compartment_id: str = "", **extra: Any) -> dict[str, Any]:
    resource_type_name = "".join(part.capitalize() for part in kind.split("_"))
    return {
        "provider": "oci",
        "locked": False,
        "editLocked": False,
        "terraformResourceName": f"Okit{resource_type_name}{hashlib.sha1(resource_name.encode()).hexdigest()[:8]}",
        "okitReference": okit_id("ref", resource_name),
        "resourceType": resource_type_name,
        "resourceTypeName": resource_type_name.replace("_", " "),
        "id": okit_id(kind, resource_name),
        "region": "",
        "compartmentId": compartment_id,
        "displayName": display_name,
        "documentation": "",
        "description": "",
        **extra,
    }


def base_model(profile: str) -> dict[str, Any]:
    enterprise = profile == "full-enterprise"
    title = profile_title(profile)
    compartments = [
        ("cmp-lz-network", "Network Shared Services"),
        ("cmp-lz-security", "Security Shared Services"),
        ("cmp-lz-platform", "Platform Shared Services"),
        ("cmp-lz-observability", "Observability Shared Services"),
        ("cmp-lz-prod", "Production Workload Environment"),
        ("cmp-lz-nonprod", "Non-Production Workload Environment"),
    ]
    compartment_resources = [
        resource("compartment", name, name, description=description, name=name.replace("-", "_"))
        for name, description in compartments
    ]
    network_compartment_id = okit_id("compartment", "cmp-lz-network")
    observability_compartment_id = okit_id("compartment", "cmp-lz-observability")
    resources = {
        "compartment": compartment_resources,
        "vcn": [
            resource(
                "vcn",
                "observability-hub-vcn",
                "Observability Hub VCN",
                compartment_id=network_compartment_id,
                cidrBlocks=["10.100.0.0/16"],
                dnsLabel="obshub",
                ipv6cidrBlocks=[],
                isIpv6enabled=False,
                freeformTags={"ManagedBy": "okit-landing-zone-template"},
            )
        ],
        "subnet": [
            resource(
                "subnet",
                "observability-private-subnet",
                "Observability Private Subnet",
                compartment_id=network_compartment_id,
                vcnId=okit_id("vcn", "observability-hub-vcn"),
                cidrBlock="10.100.10.0/24",
                prohibitPublicIpOnVnic=True,
                dnsLabel="obspriv",
            )
        ],
        "service_gateway": [
            resource(
                "service_gateway",
                "observability-service-gateway",
                "OCI Services Gateway",
                compartment_id=network_compartment_id,
                vcnId=okit_id("vcn", "observability-hub-vcn"),
            )
        ],
        "route_table": [
            resource(
                "route_table",
                "observability-private-routes",
                "Observability Private Routes",
                compartment_id=network_compartment_id,
                vcnId=okit_id("vcn", "observability-hub-vcn"),
                routeRules=[
                    {
                        "description": "OCI service access",
                        "destination": "all-region-services-in-oracle-services-network",
                        "destinationType": "SERVICE_CIDR_BLOCK",
                        "networkEntityId": okit_id("service_gateway", "observability-service-gateway"),
                        "key": "oci-services",
                    }
                ],
            )
        ],
        "security_list": [
            resource(
                "security_list",
                "observability-private-security-list",
                "Observability Private Security List",
                compartment_id=network_compartment_id,
                vcnId=okit_id("vcn", "observability-hub-vcn"),
                egressSecurityRules=[
                    {
                        "destination": "0.0.0.0/0",
                        "destinationType": "CIDR_BLOCK",
                        "stateless": False,
                        "protocol": "all",
                        "description": "Controlled egress for agents and service connectors",
                        "key": "controlled-egress",
                    }
                ],
                ingressSecurityRules=[],
            )
        ],
    }
    return {
        "metadata": {
            "ocdVersion": "0.3.0",
            "ocdSchemaVersion": "0.1.0",
            "ocdModelId": okit_id("model", profile),
            "platform": "oci",
            "title": title,
            "documentation": "One-OE Landing Zone baseline with observability shared services. All tenant identifiers are placeholders.",
            "created": "2026-05-30T00:00:00+00:00",
            "updated": "",
            "separateIdentity": True,
        },
        "model": {
            "oci": {
                "tags": {"freeformTags": {"ManagedBy": "okit-landing-zone-template"}, "definedTags": {}},
                "vars": okit_vars(profile),
                "resources": resources,
            },
            "azure": {"vars": [], "resources": {}},
            "google": {"vars": [], "resources": {}},
            "general": {"vars": [], "resources": {}},
        },
        "view": {
            "id": "view-observability-lz",
            "pages": pages(compartment_resources, profile),
        },
        "userDefined": {
            "ociObservabilityLandingZone": {
                "schema_version": "oci.observability.okit_lz_template.v1",
                "profile": profile,
                "hub_model": "Hub Model A" if enterprise else "Hub Model E",
                "extension_mode": "multi-stack" if enterprise else "single-stack",
                "service_packs": [*SERVICE_PACKS, *(("oke_monitoring",) if enterprise else ())],
                "cost_estimate": cost_estimate(profile),
                "baseline_sources": OCI_LZ_BASELINE_REPOS,
                "generated_artifacts": [
                    "terraform/main.tf.json",
                    "terraform/hcl/main.tf",
                    "architecture.drawio",
                    "resourcemanager/okit-resource-manager-manifest.json",
                    "addons/oci-observability-end-to-end/observability.auto.tfvars.json",
                    "examples/observability-landing-zone/observability.model.json",
                    "cost/cost-estimate.json",
                ],
            }
        },
    }


def coord(name: str, ocid: str, title: str, klass: str, x: int, y: int, w: int, h: int, *, container: bool = False, coords: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    item = {
        "id": gid(name),
        "pgid": "",
        "ocid": ocid,
        "pocid": "",
        "x": x,
        "y": y,
        "w": w,
        "h": h,
        "title": title,
        "class": klass,
        "showParentConnection": True,
        "showConnections": True,
        "container": container,
    }
    if coords is not None:
        item["coords"] = coords
    return item


def page(page_id: str, title: str, layers: list[dict[str, Any]], coords: list[dict[str, Any]], documentation: str = "") -> dict[str, Any]:
    return {
        "id": page_id,
        "title": title,
        "documentation": documentation,
        "layers": layers,
        "coords": coords,
        "connectors": [],
        "selected": False,
        "grid": True,
        "transform": [1, 0, 0, 1, 0, 0],
    }


def pages(compartments: list[dict[str, Any]], profile: str) -> list[dict[str, Any]]:
    layers = [
        {"id": item["id"], "class": "oci-compartment", "visible": True, "selected": index == 0}
        for index, item in enumerate(compartments)
    ]
    vcn_id = okit_id("vcn", "observability-hub-vcn")
    subnet_id = okit_id("subnet", "observability-private-subnet")
    service_gateway_id = okit_id("service_gateway", "observability-service-gateway")
    route_table_id = okit_id("route_table", "observability-private-routes")
    security_list_id = okit_id("security_list", "observability-private-security-list")
    network_children = [
        coord("route-table", route_table_id, "Route Table", "oci-route-table", 35, 70, 32, 32),
        coord("security-list", security_list_id, "Security List", "oci-security-list", 35, 130, 32, 32),
        coord("service-gateway", service_gateway_id, "Service Gateway", "oci-service-gateway", 410, 70, 32, 32),
        coord("private-subnet", subnet_id, "Private Subnet", "oci-subnet", 210, 150, 270, 110, container=True),
    ]
    landing_coords = [
        coord("network-shared", okit_id("compartment", "cmp-lz-network"), "cmp-lz-network", "oci-compartment", 20, 25, 210, 78),
        coord("security-shared", okit_id("compartment", "cmp-lz-security"), "cmp-lz-security", "oci-compartment", 20, 125, 210, 78),
        coord("platform-shared", okit_id("compartment", "cmp-lz-platform"), "cmp-lz-platform", "oci-compartment", 20, 225, 210, 78),
        coord("observability-shared", okit_id("compartment", "cmp-lz-observability"), "cmp-lz-observability", "oci-compartment", 20, 325, 210, 78),
        coord("prod-env", okit_id("compartment", "cmp-lz-prod"), "cmp-lz-prod", "oci-compartment", 300, 90, 230, 110),
        coord("nonprod-env", okit_id("compartment", "cmp-lz-nonprod"), "cmp-lz-nonprod", "oci-compartment", 300, 260, 230, 110),
        coord("hub-vcn", vcn_id, "Observability Hub VCN", "oci-vcn", 600, 90, 520, 330, container=True, coords=network_children),
    ]
    runtime_coords = [
        coord("obs-compartment-runtime", okit_id("compartment", "cmp-lz-observability"), "Observability Shared Services", "oci-compartment", 30, 40, 260, 120),
        coord("runtime-vcn", vcn_id, "Hub / Service Access", "oci-vcn", 350, 40, 430, 260, container=True, coords=network_children),
    ]
    workflow_coords = [
        coord("wf-baseline", okit_id("compartment", "cmp-lz-network"), "1. One-OE baseline", "oci-compartment", 40, 80, 210, 80),
        coord("wf-addon", okit_id("compartment", "cmp-lz-observability"), "2. Observability add-on", "oci-compartment", 300, 80, 210, 80),
        coord("wf-assets", subnet_id, "3. Asset imports", "oci-subnet", 560, 80, 210, 80),
        coord("wf-targets", okit_id("compartment", "cmp-lz-prod"), "4. Target onboarding", "oci-compartment", 820, 80, 210, 80),
    ]
    service_coords = [
        coord("svc-logging", okit_id("compartment", "cmp-lz-observability"), "Logging", "oci-compartment", 40, 80, 190, 72),
        coord("svc-log-analytics", okit_id("subnet", "observability-private-subnet"), "Log Analytics", "oci-subnet", 280, 80, 190, 72),
        coord("svc-management-agent", okit_id("vcn", "observability-hub-vcn"), "Management Agent", "oci-vcn", 520, 80, 190, 72),
        coord("svc-apm", okit_id("service_gateway", "observability-service-gateway"), "APM + OTEL", "oci-service-gateway", 760, 80, 190, 72),
        coord("svc-db", okit_id("compartment", "cmp-lz-prod"), "DBM / OPSI Toggles", "oci-compartment", 160, 230, 230, 82),
        coord("svc-oke", okit_id("compartment", "cmp-lz-nonprod"), "OKE Monitoring", "oci-compartment", 460, 230, 230, 82),
        coord("svc-alarms", route_table_id, "Alarms + Dashboards", "oci-route-table", 760, 230, 230, 82),
    ]
    package_coords = [
        coord("pkg-okit", okit_id("model", profile), "OKIT Model", "oci-compartment", 40, 120, 180, 76),
        coord("pkg-tf-json", subnet_id, "Terraform JSON", "oci-subnet", 280, 120, 180, 76),
        coord("pkg-hcl", route_table_id, "Readable HCL", "oci-route-table", 520, 120, 180, 76),
        coord("pkg-rms", service_gateway_id, "Resource Manager ZIP", "oci-service-gateway", 760, 120, 220, 76),
    ]
    cost_coords = [
        coord("cost-free", okit_id("compartment", "cmp-lz-observability"), "Free-first defaults", "oci-compartment", 80, 120, 230, 90),
        coord("cost-paid", okit_id("vcn", "observability-hub-vcn"), "Explicit paid toggles", "oci-vcn", 380, 120, 230, 90),
        coord("cost-usage", okit_id("service_gateway", "observability-service-gateway"), "OCI Usage API actuals", "oci-service-gateway", 680, 120, 230, 90),
    ]
    return [
        page("page-landing-zone", "Landing Zone Baseline", layers, landing_coords, "One-OE compartment and network baseline for observability."),
        page("page-observability-runtime", "Observability Runtime", layers, runtime_coords, "Observability service packs and network access path."),
        page("page-service-packs", "Service Pack Architecture", layers, service_coords, "Logging, Log Analytics, agents, APM, OKE, database observability, alarms, and dashboards."),
        page("page-deployment-workflow", "Deployment Workflow", layers, workflow_coords, f"{profile} deployment workflow."),
        page("page-resource-manager-package", "Resource Manager Package", layers, package_coords, "Terraform export packaging for OCI Resource Manager ZIP_UPLOAD stacks."),
        page("page-cost-governance", "Cost And Governance", layers, cost_coords, "Free-first defaults, paid toggles, and OCI Usage API follow-up cost controls."),
    ]


def svg(title: str, enterprise: bool) -> str:
    service_label = "Full Enterprise" if enterprise else "Free First"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
  <rect width="960" height="540" fill="#fbfbfb"/>
  <rect x="30" y="30" width="900" height="480" rx="8" fill="#ffffff" stroke="#9b9b9b"/>
  <text x="54" y="72" font-family="Arial" font-size="26" font-weight="700" fill="#1f2937">{escape(title)}</text>
  <text x="54" y="104" font-family="Arial" font-size="15" fill="#667085">{service_label} One-OE observability baseline</text>
  <rect x="70" y="140" width="230" height="70" fill="#fffbd7" stroke="#111827" stroke-dasharray="4 4"/>
  <rect x="70" y="230" width="230" height="70" fill="#fffbd7" stroke="#111827" stroke-dasharray="4 4"/>
  <rect x="70" y="320" width="230" height="70" fill="#fffbd7" stroke="#111827" stroke-dasharray="4 4"/>
  <rect x="350" y="160" width="230" height="90" fill="#dcefd8" stroke="#111827" stroke-dasharray="4 4"/>
  <rect x="350" y="290" width="230" height="90" fill="#dcefd8" stroke="#111827" stroke-dasharray="4 4"/>
  <rect x="640" y="160" width="220" height="220" rx="8" fill="#eef7ff" stroke="#2aa198"/>
  <text x="92" y="182" font-family="Arial" font-size="16" font-weight="700" fill="#4f5660">Shared Services</text>
  <text x="378" y="210" font-family="Arial" font-size="16" font-weight="700" fill="#4f5660">Workload Environments</text>
  <text x="675" y="220" font-family="Arial" font-size="16" font-weight="700" fill="#1f2937">Observability Plane</text>
  <text x="675" y="252" font-family="Arial" font-size="13" fill="#475467">Logging / LA / APM</text>
  <text x="675" y="278" font-family="Arial" font-size="13" fill="#475467">Agents / DBM / OPSI</text>
  <text x="675" y="304" font-family="Arial" font-size="13" fill="#475467">Alarms / Dashboards</text>
</svg>
"""


def drawio(profile: str) -> str:
    title = profile_title(profile)
    service_label = "Full Enterprise" if profile == "full-enterprise" else "Free First"
    cells = [
        ('lz', 'Landing Zone Baseline', 30, 50, 210, 70, '#fffbd7'),
        ('addon', 'Observability Add-on', 300, 50, 230, 70, '#dcefd8'),
        ('network', 'Hub VCN + Private Subnet', 590, 50, 250, 70, '#eef7ff'),
        ('logging', 'Logging + Log Analytics', 60, 190, 230, 70, '#eef7ff'),
        ('agents', 'Management Agent', 350, 190, 200, 70, '#eef7ff'),
        ('apm', 'APM + OTEL', 610, 190, 200, 70, '#eef7ff'),
        ('alarms', 'Alarms + Dashboards', 190, 330, 230, 70, '#f4f3ff'),
        ('orm', 'Terraform / Resource Manager', 500, 330, 260, 70, '#f4f3ff'),
    ]
    vertices = []
    for cell_id, value, x, y, width, height, fill in cells:
        vertices.append(
            f'<mxCell id="{cell_id}" value="{escape(value)}" style="rounded=1;whiteSpace=wrap;html=1;fillColor={fill};strokeColor=#4b5563;" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{width}" height="{height}" as="geometry"/></mxCell>'
        )
    edges = [
        ('e1', 'lz', 'addon'),
        ('e2', 'addon', 'network'),
        ('e3', 'addon', 'logging'),
        ('e4', 'addon', 'agents'),
        ('e5', 'addon', 'apm'),
        ('e6', 'logging', 'alarms'),
        ('e7', 'addon', 'orm'),
    ]
    connectors = [
        f'<mxCell id="{edge_id}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#4b5563;" edge="1" parent="1" source="{source}" target="{target}"><mxGeometry relative="1" as="geometry"/></mxCell>'
        for edge_id, source, target in edges
    ]
    return f'''<mxfile host="OCI Designer Toolkit" agent="okit-observability-generator" version="22.1.16">
  <diagram id="observability-lz-{profile}" name="{escape(service_label)}">
    <mxGraphModel dx="1200" dy="760" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="title" value="{escape(title)}" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=22;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="30" y="10" width="620" height="30" as="geometry"/></mxCell>
        {''.join(vertices)}
        {''.join(connectors)}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
'''


def cost_estimate(profile: str) -> dict[str, Any]:
    enterprise = profile == "full-enterprise"
    return {
        "schema_version": "oci.okit.cost_estimate.v1",
        "profile": profile,
        "currency": "USD",
        "monthly_estimate": {
            "estimated_usd": 18.25 if enterprise else 0,
            "confidence": "medium" if enterprise else "low",
            "basis": "Template assumptions. Use OCI Usage API for actual costs after deployment.",
        },
        "usage_api": {
            "recommended": True,
            "summary": "Use OCI Usage API requestSummarizedUsages for historical actuals.",
            "query_template": f"ocd/library/oci/{profile_stem(profile)}UsageApiQuery.json",
        },
        "line_items": [
            {
                "id": "logging.log_group",
                "label": "Logging log group baseline",
                "estimated_usd": 0,
                "enabled": True,
            },
            {
                "id": "monitoring.alarm_topic",
                "label": "Notifications topic and Monitoring alarm baseline",
                "estimated_usd": 0,
                "enabled": True,
            },
            {
                "id": "streaming.enterprise_stream",
                "label": "Enterprise stream for service connector targets",
                "estimated_usd": 18.25 if enterprise else 0,
                "enabled": enterprise,
            },
        ],
    }


def usage_api_query(profile: str) -> dict[str, Any]:
    return {
        "schema_version": "oci.usage_api.query_template.v1",
        "profile": profile,
        "api": "UsageapiClient.request_summarized_usages",
        "cli": {
            "command": "oci usage-api usage-summary request-summarized-usages",
            "arguments": {
                "tenant-id": "<TENANCY_OCID>",
                "time-usage-start": "<UTC_START_TIMESTAMP>",
                "time-usage-ended": "<UTC_END_TIMESTAMP>",
                "granularity": "MONTHLY",
                "query-type": "COST",
                "group-by": ["service"],
                "compartment-depth": 6,
            },
        },
        "sdk_request": {
            "tenant_id": "<TENANCY_OCID>",
            "time_usage_started": "<UTC_START_TIMESTAMP>",
            "time_usage_ended": "<UTC_END_TIMESTAMP>",
            "granularity": "MONTHLY",
            "query_type": "COST",
            "group_by": ["service"],
            "compartment_depth": 6,
            "filter": {
                "operator": "AND",
                "dimensions": [
                    {
                        "key": "tagNamespace",
                        "value": "freeformTags",
                    },
                    {
                        "key": "tagKey",
                        "value": "ManagedBy",
                    },
                    {
                        "key": "tagValue",
                        "value": "okit-observability-landing-zone",
                    },
                ],
            },
        },
        "notes": [
            "Use this query after deployment to compare actual usage against the generated estimate.",
            "The filter assumes generated resources keep the ManagedBy freeform tag.",
            "Keep returned tenant-specific usage data out of source control.",
        ],
    }


def resource_manager_package(profile: str) -> dict[str, Any]:
    return {
        "schema_version": "oci.okit.resource_manager_package.v1",
        "profile": profile,
        "config_source_type": "ZIP_UPLOAD",
        "terraform_version": ">= 1.5.0",
        "readiness_checks": [
            "All Terraform files are generated without tenant-specific OCIDs.",
            "Provider configuration omits local user credentials for Resource Manager execution.",
            "The package includes okit-resource-manager-manifest.json for stack zip inspection.",
            "Plan jobs are the default; apply jobs require explicit operator selection.",
        ],
        "files": [
            "main.tf.json",
            "observability.auto.tfvars.json",
            "okit-resource-manager-manifest.json",
            "README_RESOURCE_MANAGER.md",
            "cost-estimate.json",
            "usage-api-query.json",
            "architecture.drawio",
        ],
    }


def auto_tfvars(profile: str) -> dict[str, Any]:
    definitions = variable_definitions(profile)
    values: dict[str, Any] = {}
    for key, definition in definitions.items():
        if key == "tenancy_ocid":
            values[key] = "<TENANCY_OCID>"
        elif key == "region":
            values[key] = "<OCI_REGION>"
        elif key == "parent_compartment_ocid":
            values[key] = None
        else:
            values[key] = definition.get("default")
    return values


def normalized_model(profile: str) -> dict[str, Any]:
    enterprise = profile == "full-enterprise"
    return {
        "schema_version": "oci.observability.addon.v1",
        "profile": profile,
        "landing_zone": {
            "source": "oci-landing-zones/oci-landing-zone-operating-entities",
            "integration_mode": "addon",
            "tenancy_ocid": "<TENANCY_OCID>",
            "region": "<OCI_REGION>",
            "parent_compartment_ocid": "<PARENT_COMPARTMENT_OCID_OR_NULL>",
            "compartments": {
                "network": "${var.network_compartment_name}",
                "observability": "${var.observability_compartment_name}",
            },
            "network": {
                "vcn_cidr_blocks": "${var.vcn_cidr_blocks}",
                "private_subnet_cidr": "${var.private_subnet_cidr}",
                "hub_vcn_dns_label": "${var.hub_vcn_dns_label}",
                "private_subnet_dns_label": "${var.private_subnet_dns_label}",
            },
        },
        "targets": {
            "oci_services": ["audit", "logging", "monitoring", "notifications"],
            "compute": ["demo-linux-fleet"],
            "oke_clusters": ["demo-oke-cluster"] if enterprise else [],
            "databases": ["demo-autonomous-database"] if enterprise else [],
            "applications": ["checkout-api", "inventory-api"],
        },
        "services": {
            "logging": {"enabled": True, "paid": False},
            "log_analytics": {"enabled": True, "paid": False},
            "management_agent": {"enabled": True, "paid": False},
            "db_observability": {"enabled": enterprise, "paid": enterprise, "mode": "basic" if not enterprise else "full"},
            "apm": {"enabled": True, "paid": False},
            "oke_monitoring": {"enabled": enterprise, "paid": False},
            "alarms_dashboards": {
                "enabled": True,
                "paid": False,
                "notification_topic_name": "${var.notification_topic_name}",
                "alarm_cpu_threshold": "${var.alarm_cpu_threshold}",
            },
            "streaming": {"enabled": enterprise, "paid": enterprise},
        },
        "assets": {
            "log_groups": ["observability-log-group"],
            "apm_domains": ["observability-apm-domain"],
            "dashboards": ["landing-zone-observability-overview"],
            "agent_recipes": ["linux-management-agent", "oke-helm-values"],
        },
        "exports": {
            "terraform_json": "ocd/library/oci/ObservabilityLandingZoneEnterpriseTerraform.tf.json" if enterprise else "ocd/library/oci/ObservabilityLandingZoneFreeFirstTerraform.tf.json",
            "terraform_hcl": "ocd/library/oci/ObservabilityLandingZoneEnterpriseTerraform.tf" if enterprise else "ocd/library/oci/ObservabilityLandingZoneFreeFirstTerraform.tf",
            "auto_tfvars": "observability.auto.tfvars.json",
            "drawio": "ocd/library/oci/ObservabilityLandingZoneEnterprise.drawio" if enterprise else "ocd/library/oci/ObservabilityLandingZoneFreeFirst.drawio",
            "okit": "ocd/library/oci/ObservabilityLandingZoneEnterprise.okit" if enterprise else "ocd/library/oci/ObservabilityLandingZoneFreeFirst.okit",
        },
        "variable_bindings": variable_bindings(profile),
    }


def okit_data(profile: str) -> dict[str, Any]:
    model = base_model(profile)
    resources = model["model"]["oci"]["resources"]
    pages_out = model["view"]["pages"]
    stem = profile_stem(profile)
    return {
        "schema_version": "oci.okit.template_data.v1",
        "profile": profile,
        "okit_file": f"ocd/library/oci/{stem}.okit",
        "svg_file": f"ocd/library/oci/{stem}.svg",
        "drawio_file": f"ocd/library/oci/{stem}.drawio",
        "resource_counts": {name: len(items) for name, items in resources.items()},
        "view_pages": [page["title"] for page in pages_out],
        "variables": variable_definitions(profile),
        "variable_bindings": variable_bindings(profile),
        "baseline_sources": OCI_LZ_BASELINE_REPOS,
    }


def okit_catalog() -> dict[str, Any]:
    return {
        "schema_version": "oci.okit.catalog.v1",
        "title": "OCI Observability Landing Zone OKIT Catalog",
        "baseline_sources": OCI_LZ_BASELINE_REPOS,
        "templates": [
            {
                "profile": "free-first",
                "title": "Observability Landing Zone - Free First",
                "okit_file": "ObservabilityLandingZoneFreeFirst.okit",
                "svg_file": "ObservabilityLandingZoneFreeFirst.svg",
                "terraform_json": "ObservabilityLandingZoneFreeFirstTerraform.tf.json",
                "terraform_hcl": "ObservabilityLandingZoneFreeFirstTerraform.tf",
                "drawio_file": "ObservabilityLandingZoneFreeFirst.drawio",
                "cost_estimate": "ObservabilityLandingZoneFreeFirstCostEstimate.json",
                "resource_manager_package": "ObservabilityLandingZoneFreeFirstResourceManagerPackage.json",
            },
            {
                "profile": "full-enterprise",
                "title": "Observability Landing Zone - Full Enterprise",
                "okit_file": "ObservabilityLandingZoneEnterprise.okit",
                "svg_file": "ObservabilityLandingZoneEnterprise.svg",
                "terraform_json": "ObservabilityLandingZoneEnterpriseTerraform.tf.json",
                "terraform_hcl": "ObservabilityLandingZoneEnterpriseTerraform.tf",
                "drawio_file": "ObservabilityLandingZoneEnterprise.drawio",
                "cost_estimate": "ObservabilityLandingZoneEnterpriseCostEstimate.json",
                "resource_manager_package": "ObservabilityLandingZoneEnterpriseResourceManagerPackage.json",
            },
        ],
        "variables": variable_definitions("free-first"),
        "variable_bindings": variable_bindings("free-first"),
    }


def demo_topology() -> dict[str, Any]:
    return {
        "schema_version": "oci.okit.demo_topology.v1",
        "name": "observability-landing-zone-demo",
        "redaction_policy": "all tenant-specific identifiers use placeholders",
        "landing_zone": {
            "tenancy_ocid": "<TENANCY_OCID>",
            "region": "<OCI_REGION>",
            "parent_compartment_ocid": "<PARENT_COMPARTMENT_OCID>",
        },
        "workloads": [
            {
                "name": "demo-linux-fleet",
                "type": "compute",
                "compartment": "cmp-lz-prod",
                "instance_ocids": ["<COMPUTE_INSTANCE_OCID_1>", "<COMPUTE_INSTANCE_OCID_2>"],
                "logs": ["syslog", "auth.log", "application.log"],
                "agent_recipe": "linux-management-agent",
            },
            {
                "name": "demo-oke-cluster",
                "type": "oke",
                "compartment": "cmp-lz-prod",
                "cluster_ocid": "<OKE_CLUSTER_OCID>",
                "namespaces": ["kube-system", "demo"],
                "helm_values": "assets/oke/values-observability.yaml",
            },
            {
                "name": "demo-autonomous-database",
                "type": "autonomous_database",
                "compartment": "cmp-lz-prod",
                "database_ocid": "<AUTONOMOUS_DATABASE_OCID>",
                "db_management": "basic",
                "operations_insights": "disabled_until_opt_in",
            },
        ],
        "applications": [
            {
                "name": "checkout-api",
                "runtime": "java",
                "apm": {"enabled": True, "data_key": "<APM_DATA_KEY_FROM_VAULT_OR_ENV>"},
                "otel_exporter": "<APM_OTEL_ENDPOINT>",
            },
            {
                "name": "inventory-api",
                "runtime": "python",
                "apm": {"enabled": True, "data_key": "<APM_DATA_KEY_FROM_VAULT_OR_ENV>"},
                "otel_exporter": "<APM_OTEL_ENDPOINT>",
            },
        ],
    }


def demo_assets() -> dict[str, Any]:
    return {
        "schema_version": "oci.okit.demo_assets.v1",
        "name": "observability-demo-assets",
        "redaction_policy": "all tenant-specific identifiers use placeholders",
        "log_analytics": {
            "namespace": "<LA_NAMESPACE>",
            "log_groups": ["observability-log-group"],
            "fields": [
                {"name": "demo_app", "type": "string"},
                {"name": "demo_trace_id", "type": "string"},
                {"name": "demo_severity", "type": "string"},
            ],
            "parsers": [
                {
                    "name": "demo-json-application-parser",
                    "type": "json",
                    "fields": ["demo_app", "demo_trace_id", "demo_severity"],
                }
            ],
            "sources": [
                {
                    "name": "demo-linux-syslog-source",
                    "parser": "demo-json-application-parser",
                    "entity_types": ["Host"],
                },
                {
                    "name": "demo-oke-container-source",
                    "parser": "demo-json-application-parser",
                    "entity_types": ["Kubernetes Cluster"],
                },
            ],
            "saved_searches": ["landing-zone-errors-by-service", "apm-trace-log-correlation"],
        },
        "apm": {
            "domain": "<APM_DOMAIN_ID>",
            "otel_endpoint": "<APM_OTEL_ENDPOINT>",
            "data_key_source": "vault-or-environment-placeholder",
            "recipes": ["java-otel-agent", "python-otel-sdk", "collector-otlp-to-oci-apm"],
        },
        "oke": {
            "helm_values": {
                "clusterOcid": "<OKE_CLUSTER_OCID>",
                "authType": "instance_principal",
                "collectKubeSystemLogs": True,
                "collectApplicationLogs": True,
                "logAnalyticsNamespace": "<LA_NAMESPACE>",
            }
        },
        "management_agent": {
            "install_key": "<MANAGEMENT_AGENT_INSTALL_KEY_FROM_VAULT_OR_ENV>",
            "recipes": ["linux-management-agent", "windows-management-agent"],
        },
    }


def baseline_manifest() -> dict[str, Any]:
    return {
        "schema_version": "oci.okit.landing_zone_baselines.v1",
        "sync_command": "python scripts/sync_oci_lz_baselines.py",
        "local_root": "baselines/oci-landing-zones",
        "gitignore": "baselines/oci-landing-zones/ is intentionally ignored; the manifest is versioned, cloned content is not.",
        "repositories": OCI_LZ_BASELINE_REPOS,
        "mapping": {
            "variables": {
                name: binding["one_oe_baseline_mapping"]
                for name, binding in variable_bindings("free-first").items()
            },
            "variable_bindings": variable_bindings("free-first"),
            "generated_examples": "examples/observability-landing-zone/*",
            "generated_okit_library": "ocd/library/oci/ObservabilityLandingZone*",
            "generated_one_oe_addon": "addons/oci-observability-end-to-end/*",
            "generated_terraform_packages": "addons/oci-observability-end-to-end/terraform/*",
            "generated_resource_manager_packages": "addons/oci-observability-end-to-end/resourcemanager/*",
            "baseline_files": {
                "one_oe_observability": [
                    "blueprints/one-oe/runtime/one-stack/oneoe_observability_cis1_pre.json",
                    "blueprints/one-oe/runtime/one-stack/oneoe_observability_cis1.json",
                    "blueprints/one-oe/runtime/one-stack/oneoe_observability_cis2_pre.json",
                    "blueprints/one-oe/runtime/one-stack/oneoe_observability_cis2.json",
                ],
                "orchestrator_observability": [
                    "observability.tf",
                    "variables.tf",
                    "rms-facade/variables.tf",
                ],
                "core_landing_zone_monitoring": [
                    "variables_monitoring.tf",
                    "mon_alarms.tf",
                    "mon_notifications.tf",
                    "mon_logging_analytics.tf",
                    "mon_service_connector.tf",
                ],
            },
        },
    }


def one_oe_addon_config(profile: str) -> dict[str, Any]:
    enterprise = profile == "full-enterprise"
    return {
        "schema_version": "oci.oneoe.addon.observability.v1",
        "profile": profile,
        "source_baselines": {
            "one_oe_observability": "baselines/oci-landing-zones/oci-landing-zone-operating-entities/blueprints/one-oe/runtime/one-stack",
            "orchestrator_observability": "baselines/oci-landing-zones/terraform-oci-modules-orchestrator/observability.tf",
            "core_landing_zone_monitoring": "baselines/oci-landing-zones/terraform-oci-core-landingzone/variables_monitoring.tf",
        },
        "variables": variable_definitions(profile),
        "variable_bindings": variable_bindings(profile),
        "configuration": {
            "notifications_configuration": {
                "default_compartment_id": "CMP-LZ-OBSERVABILITY-KEY",
                "topics": {
                    "TOPIC-OBSERVABILITY-ALARMS-KEY": {
                        "name": "${var.notification_topic_name}",
                        "description": "Landing-zone observability alarm topic.",
                    }
                },
            },
            "alarms_configuration": {
                "default_compartment_id": "CMP-LZ-OBSERVABILITY-KEY",
                "alarms": {
                    "ALARM-OBS-HIGH-CPU-KEY": {
                        "display_name": "observability-high-cpu-template",
                        "namespace": "oci_computeagent",
                        "query": "CpuUtilization[1m].mean() > ${var.alarm_cpu_threshold}",
                        "severity": "WARNING",
                        "destinations": ["TOPIC-OBSERVABILITY-ALARMS-KEY"],
                        "is_enabled": False,
                    }
                },
            },
            "logging_configuration": {
                "default_compartment_id": "CMP-LZ-OBSERVABILITY-KEY",
                "log_groups": {
                    "LOG-GROUP-OBSERVABILITY-KEY": {
                        "display_name": "observability-log-group",
                        "description": "Audit, service, and application logs for the observability add-on.",
                    }
                },
            },
            "streams_configuration": {
                "enabled": "${var.enable_streaming}",
                "default_compartment_id": "CMP-LZ-OBSERVABILITY-KEY",
                "streams": {
                    "STREAM-OBS-EVENTS-KEY": {
                        "name": "observability-events",
                        "partitions": 1,
                        "retention_in_hours": 24,
                    }
                },
            } if enterprise else None,
        },
        "service_packs": {
            "logging": True,
            "log_analytics": "${var.enable_log_analytics}",
            "management_agent": "${var.enable_management_agent}",
            "apm": "${var.enable_apm}",
            "database_management": "${var.enable_database_management}",
            "oke_monitoring": "${var.enable_oke_monitoring}",
        },
        "generated_artifacts": [
            "observability.auto.tfvars.json",
            "observability.enterprise.auto.tfvars.json",
            "addon_observability_free_first.json",
            "addon_observability_enterprise.json",
            "baseline-links.json",
            "variables.json",
            "terraform/free-first-hcl/main.tf",
            "terraform/free-first-json/main.tf.json",
            "terraform/full-enterprise-hcl/main.tf",
            "terraform/full-enterprise-json/main.tf.json",
            "resourcemanager/free-first/main.tf.json",
            "resourcemanager/full-enterprise/main.tf.json",
            "drawio/free-first.drawio",
            "drawio/full-enterprise.drawio",
            "cost/free-first-cost-estimate.json",
            "cost/full-enterprise-cost-estimate.json",
            "cost/free-first-usage-api-query.json",
            "cost/full-enterprise-usage-api-query.json",
            "operator-runbook.md",
        ],
    }


def terraform_json(profile: str) -> dict[str, Any]:
    enterprise = profile == "full-enterprise"
    suffix = "enterprise" if enterprise else "free_first"
    return {
        "terraform": {
            "required_version": ">= 1.5.0",
            "required_providers": {
                "oci": {
                    "source": "oracle/oci",
                    "version": ">= 6.0.0",
                }
            },
        },
        "provider": {
            "oci": {
                "tenancy_ocid": "${var.tenancy_ocid}",
                "region": "${var.region}",
            }
        },
        "variable": variable_definitions(profile),
        "locals": {
            "profile": profile,
            "managed_by": "okit-observability-landing-zone",
            "parent_compartment_id": "${coalesce(var.parent_compartment_ocid, var.tenancy_ocid)}",
            "enabled_service_packs": "${compact([\"logging\", var.enable_log_analytics ? \"log_analytics\" : \"\", var.enable_management_agent ? \"management_agent\" : \"\", var.enable_apm ? \"apm\" : \"\", var.enable_database_management ? \"db_observability\" : \"\", var.enable_oke_monitoring ? \"oke_monitoring\" : \"\", \"alarms_dashboards\"])}",
            "common_tags": {
                "ManagedBy": "okit-observability-landing-zone",
                "Profile": profile,
            },
        },
        "data": {
            "oci_core_services": {
                "all_region_services": {
                    "filter": [
                        {
                            "name": "name",
                            "values": ["All .* Services In Oracle Services Network"],
                            "regex": True,
                        }
                    ]
                }
            }
        },
        "resource": {
            "oci_identity_compartment": {
                "network_shared_services": {
                    "compartment_id": "${local.parent_compartment_id}",
                    "name": "${var.network_compartment_name}",
                    "description": "Network shared services compartment for the observability landing zone baseline.",
                    "enable_delete": True,
                    "freeform_tags": "${local.common_tags}",
                },
                "observability_shared_services": {
                    "compartment_id": "${local.parent_compartment_id}",
                    "name": "${var.observability_compartment_name}",
                    "description": "Observability shared services compartment.",
                    "enable_delete": True,
                    "freeform_tags": "${local.common_tags}",
                },
            },
            "oci_core_vcn": {
                "observability_hub": {
                    "compartment_id": "${oci_identity_compartment.network_shared_services.id}",
                    "display_name": f"observability-hub-vcn-{suffix}",
                    "cidr_blocks": "${var.vcn_cidr_blocks}",
                    "dns_label": "${var.hub_vcn_dns_label}",
                    "freeform_tags": "${local.common_tags}",
                }
            },
            "oci_core_service_gateway": {
                "oci_services": {
                    "compartment_id": "${oci_identity_compartment.network_shared_services.id}",
                    "display_name": "observability-oci-services-gateway",
                    "vcn_id": "${oci_core_vcn.observability_hub.id}",
                    "services": [
                        {
                            "service_id": "${data.oci_core_services.all_region_services.services[0].id}",
                        }
                    ],
                    "freeform_tags": "${local.common_tags}",
                }
            },
            "oci_core_route_table": {
                "private": {
                    "compartment_id": "${oci_identity_compartment.network_shared_services.id}",
                    "display_name": "observability-private-routes",
                    "vcn_id": "${oci_core_vcn.observability_hub.id}",
                    "route_rules": [
                        {
                            "description": "OCI service access for agents and service connectors.",
                            "destination": "all-region-services-in-oracle-services-network",
                            "destination_type": "SERVICE_CIDR_BLOCK",
                            "network_entity_id": "${oci_core_service_gateway.oci_services.id}",
                        }
                    ],
                    "freeform_tags": "${local.common_tags}",
                }
            },
            "oci_core_security_list": {
                "private": {
                    "compartment_id": "${oci_identity_compartment.network_shared_services.id}",
                    "display_name": "observability-private-security-list",
                    "vcn_id": "${oci_core_vcn.observability_hub.id}",
                    "egress_security_rules": [
                        {
                            "description": "Controlled egress for observability agents and service connectors.",
                            "destination": "0.0.0.0/0",
                            "destination_type": "CIDR_BLOCK",
                            "protocol": "all",
                            "stateless": False,
                        }
                    ],
                    "freeform_tags": "${local.common_tags}",
                }
            },
            "oci_core_subnet": {
                "observability_private": {
                    "compartment_id": "${oci_identity_compartment.network_shared_services.id}",
                    "display_name": "observability-private-subnet",
                    "vcn_id": "${oci_core_vcn.observability_hub.id}",
                    "cidr_block": "${var.private_subnet_cidr}",
                    "dns_label": "${var.private_subnet_dns_label}",
                    "prohibit_public_ip_on_vnic": True,
                    "route_table_id": "${oci_core_route_table.private.id}",
                    "security_list_ids": ["${oci_core_security_list.private.id}"],
                    "freeform_tags": "${local.common_tags}",
                }
            },
            "oci_logging_log_group": {
                "observability": {
                    "compartment_id": "${oci_identity_compartment.observability_shared_services.id}",
                    "display_name": "observability-log-group",
                    "description": "Landing-zone log group for audit, service, and application logs.",
                    "freeform_tags": "${local.common_tags}",
                }
            },
            "oci_ons_notification_topic": {
                "observability": {
                    "compartment_id": "${oci_identity_compartment.observability_shared_services.id}",
                    "name": "${var.notification_topic_name}",
                    "description": "Notification target for landing-zone observability alarms.",
                    "freeform_tags": "${local.common_tags}",
                }
            },
            "oci_monitoring_alarm": {
                "high_cpu_placeholder": {
                    "compartment_id": "${oci_identity_compartment.observability_shared_services.id}",
                    "display_name": "observability-high-cpu-template",
                    "destinations": ["${oci_ons_notification_topic.observability.id}"],
                    "is_enabled": True,
                    "metric_compartment_id": "${oci_identity_compartment.observability_shared_services.id}",
                    "namespace": "oci_computeagent",
                    "query": "CpuUtilization[1m].mean() > ${var.alarm_cpu_threshold}",
                    "severity": "WARNING",
                    "body": "Template alarm. Scope metric_compartment_id to the target workload compartment before production use.",
                    "freeform_tags": "${local.common_tags}",
                }
            },
            "oci_streaming_stream_pool": {
                "observability": {
                    "count": "${var.enable_streaming ? 1 : 0}",
                    "compartment_id": "${oci_identity_compartment.observability_shared_services.id}",
                    "name": "observability-stream-pool",
                    "freeform_tags": "${local.common_tags}",
                }
            },
            "oci_streaming_stream": {
                "observability_events": {
                    "count": "${var.enable_streaming ? 1 : 0}",
                    "name": "observability-events",
                    "partitions": 1,
                    "stream_pool_id": "${oci_streaming_stream_pool.observability[0].id}",
                    "freeform_tags": "${local.common_tags}",
                }
            },
        },
        "output": {
            "observability_compartment_id": {
                "value": "${oci_identity_compartment.observability_shared_services.id}",
            },
            "observability_log_group_id": {
                "value": "${oci_logging_log_group.observability.id}",
            },
            "notification_topic_id": {
                "value": "${oci_ons_notification_topic.observability.id}",
            },
            "enabled_service_packs": {
                "value": "${local.enabled_service_packs}",
            },
        },
    }


def terraform_hcl(profile: str) -> str:
    enterprise = profile == "full-enterprise"
    suffix = "enterprise" if enterprise else "free_first"
    streaming_default = "true" if enterprise else "false"
    return f'''terraform {{
  required_version = ">= 1.5.0"

  required_providers {{
    oci = {{
      source  = "oracle/oci"
      version = ">= 6.0.0"
    }}
  }}
}}

provider "oci" {{
  tenancy_ocid = var.tenancy_ocid
  region       = var.region
}}

variable "tenancy_ocid" {{
  type        = string
  description = "Tenancy OCID. Keep tenant-specific values outside source control."
}}

variable "region" {{
  type        = string
  description = "OCI region identifier."
}}

variable "parent_compartment_ocid" {{
  type        = string
  description = "Parent compartment OCID for generated landing-zone compartments. Defaults to tenancy_ocid when null."
  default     = null
}}

variable "network_compartment_name" {{
  type        = string
  description = "Network shared-services compartment name."
  default     = "cmp-lz-network"
}}

variable "observability_compartment_name" {{
  type        = string
  description = "Observability shared-services compartment name."
  default     = "cmp-lz-observability"
}}

variable "vcn_cidr_blocks" {{
  type        = list(string)
  description = "CIDR blocks for the observability hub VCN."
  default     = ["10.100.0.0/16"]
}}

variable "private_subnet_cidr" {{
  type        = string
  description = "CIDR block for the private observability subnet."
  default     = "10.100.10.0/24"
}}

variable "hub_vcn_dns_label" {{
  type        = string
  description = "DNS label for the observability hub VCN."
  default     = "obshub"
}}

variable "private_subnet_dns_label" {{
  type        = string
  description = "DNS label for the private observability subnet."
  default     = "obspriv"
}}

variable "notification_topic_name" {{
  type        = string
  description = "Notifications topic name for observability alarms."
  default     = "observability-alarm-topic"
}}

variable "alarm_cpu_threshold" {{
  type        = number
  description = "Template CPU alarm threshold."
  default     = 90
}}

variable "enable_streaming" {{
  type        = bool
  description = "Enable paid Streaming baseline resources for enterprise observability flows."
  default     = {streaming_default}
}}

variable "enable_apm" {{
  type        = bool
  description = "Enable APM service pack metadata and operator recipes."
  default     = true
}}

variable "enable_log_analytics" {{
  type        = bool
  description = "Enable Log Analytics service pack metadata and importer recipes."
  default     = true
}}

variable "enable_management_agent" {{
  type        = bool
  description = "Enable Management Agent installation and association recipes."
  default     = true
}}

variable "enable_database_management" {{
  type        = bool
  description = "Enable DB Management Basic baseline. Full Management remains an explicit paid add-on outside this baseline."
  default     = {"true" if enterprise else "false"}
}}

variable "enable_oke_monitoring" {{
  type        = bool
  description = "Enable OKE monitoring and logging Helm values in generated examples."
  default     = {"true" if enterprise else "false"}
}}

locals {{
  profile               = "{profile}"
  managed_by            = "okit-observability-landing-zone"
  parent_compartment_id = coalesce(var.parent_compartment_ocid, var.tenancy_ocid)
  enabled_service_packs = compact([
    "logging",
    var.enable_log_analytics ? "log_analytics" : "",
    var.enable_management_agent ? "management_agent" : "",
    var.enable_apm ? "apm" : "",
    var.enable_database_management ? "db_observability" : "",
    var.enable_oke_monitoring ? "oke_monitoring" : "",
    "alarms_dashboards"
  ])
  common_tags = {{
    ManagedBy = "okit-observability-landing-zone"
    Profile   = "{profile}"
  }}
}}

data "oci_core_services" "all_region_services" {{
  filter {{
    name   = "name"
    values = ["All .* Services In Oracle Services Network"]
    regex  = true
  }}
}}

resource "oci_identity_compartment" "network_shared_services" {{
  compartment_id = local.parent_compartment_id
  name           = var.network_compartment_name
  description    = "Network shared services compartment for the observability landing zone baseline."
  enable_delete  = true
  freeform_tags  = local.common_tags
}}

resource "oci_identity_compartment" "observability_shared_services" {{
  compartment_id = local.parent_compartment_id
  name           = var.observability_compartment_name
  description    = "Observability shared services compartment."
  enable_delete  = true
  freeform_tags  = local.common_tags
}}

resource "oci_core_vcn" "observability_hub" {{
  compartment_id = oci_identity_compartment.network_shared_services.id
  display_name   = "observability-hub-vcn-{suffix}"
  cidr_blocks    = var.vcn_cidr_blocks
  dns_label      = var.hub_vcn_dns_label
  freeform_tags  = local.common_tags
}}

resource "oci_core_service_gateway" "oci_services" {{
  compartment_id = oci_identity_compartment.network_shared_services.id
  display_name   = "observability-oci-services-gateway"
  vcn_id         = oci_core_vcn.observability_hub.id
  freeform_tags  = local.common_tags

  services {{
    service_id = data.oci_core_services.all_region_services.services[0].id
  }}
}}

resource "oci_core_route_table" "private" {{
  compartment_id = oci_identity_compartment.network_shared_services.id
  display_name   = "observability-private-routes"
  vcn_id         = oci_core_vcn.observability_hub.id
  freeform_tags  = local.common_tags

  route_rules {{
    description       = "OCI service access for agents and service connectors."
    destination       = "all-region-services-in-oracle-services-network"
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.oci_services.id
  }}
}}

resource "oci_core_security_list" "private" {{
  compartment_id = oci_identity_compartment.network_shared_services.id
  display_name   = "observability-private-security-list"
  vcn_id         = oci_core_vcn.observability_hub.id
  freeform_tags  = local.common_tags

  egress_security_rules {{
    description      = "Controlled egress for observability agents and service connectors."
    destination      = "0.0.0.0/0"
    destination_type = "CIDR_BLOCK"
    protocol         = "all"
    stateless        = false
  }}
}}

resource "oci_core_subnet" "observability_private" {{
  compartment_id             = oci_identity_compartment.network_shared_services.id
  display_name               = "observability-private-subnet"
  vcn_id                     = oci_core_vcn.observability_hub.id
  cidr_block                 = var.private_subnet_cidr
  dns_label                  = var.private_subnet_dns_label
  prohibit_public_ip_on_vnic = true
  route_table_id             = oci_core_route_table.private.id
  security_list_ids          = [oci_core_security_list.private.id]
  freeform_tags              = local.common_tags
}}

resource "oci_logging_log_group" "observability" {{
  compartment_id = oci_identity_compartment.observability_shared_services.id
  display_name   = "observability-log-group"
  description    = "Landing-zone log group for audit, service, and application logs."
  freeform_tags  = local.common_tags
}}

resource "oci_ons_notification_topic" "observability" {{
  compartment_id = oci_identity_compartment.observability_shared_services.id
  name           = var.notification_topic_name
  description    = "Notification target for landing-zone observability alarms."
  freeform_tags  = local.common_tags
}}

resource "oci_monitoring_alarm" "high_cpu_placeholder" {{
  compartment_id        = oci_identity_compartment.observability_shared_services.id
  display_name          = "observability-high-cpu-template"
  destinations          = [oci_ons_notification_topic.observability.id]
  is_enabled            = true
  metric_compartment_id = oci_identity_compartment.observability_shared_services.id
  namespace             = "oci_computeagent"
  query                 = "CpuUtilization[1m].mean() > ${{var.alarm_cpu_threshold}}"
  severity              = "WARNING"
  body                  = "Template alarm. Scope metric_compartment_id to the target workload compartment before production use."
  freeform_tags         = local.common_tags
}}

resource "oci_streaming_stream_pool" "observability" {{
  count          = var.enable_streaming ? 1 : 0
  compartment_id = oci_identity_compartment.observability_shared_services.id
  name           = "observability-stream-pool"
  freeform_tags  = local.common_tags
}}

resource "oci_streaming_stream" "observability_events" {{
  count          = var.enable_streaming ? 1 : 0
  name           = "observability-events"
  partitions     = 1
  stream_pool_id = oci_streaming_stream_pool.observability[0].id
  freeform_tags  = local.common_tags
}}

output "observability_compartment_id" {{
  value = oci_identity_compartment.observability_shared_services.id
}}

output "observability_log_group_id" {{
  value = oci_logging_log_group.observability.id
}}

output "notification_topic_id" {{
  value = oci_ons_notification_topic.observability.id
}}

output "enabled_service_packs" {{
  value = local.enabled_service_packs
}}
'''


def issue_plan() -> dict[str, Any]:
    return {
        "schema_version": "oci.okit.issue_resolution_plan.v1",
        "fork": "https://github.com/adibirzu/oci-designer-toolkit",
        "implemented": [
            {"issue": 143, "title": "Cost estimator baseline", "status": "implemented", "files": ["ocd/packages/react/src/pages/OcdBom.tsx", "ocd/library/oci/*CostEstimate.json"]},
            {"issue": 550, "title": "Landing Zone baseline", "status": "implemented", "files": ["ocd/library/oci/ObservabilityLandingZone*.okit"]},
            {"issue": 722, "title": "Resource Manager stack packaging", "status": "implemented", "files": ["ocd/packages/query/src/OciResourceManagerQuery.ts", "ocd/packages/react/src/components/dialogs/OcdExportToResourceManagerDialog.tsx"]},
            {"issue": 751, "title": "Resource Manager export workflow", "status": "implemented", "files": ["ocd/packages/desktop/src/main.ts", "ocd/packages/desktop/src/preload.ts"]},
            {"issue": 161, "title": "OKE node pool operator fields", "status": "partial", "files": ["ocd/packages/react/src/components/properties/provider/oci/resources/configs/OciOkeNodePool.ts", "ocd/packages/export/src/terraform/provider/oci/resources/OciOkeNodePool.ts"]},
            {"issue": 294, "title": "Load balancer listener validation", "status": "partial", "files": ["ocd/packages/react/src/components/properties/provider/oci/resources/configs/OciLoadBalancerListener.ts", "ocd/packages/model/src/validator/provider/oci/resources/OciLoadBalancerListener.ts"]},
            {"issue": 759, "title": "NSG-to-NSG rule selection and validation", "status": "partial", "files": ["ocd/packages/react/src/components/properties/provider/oci/resources/configs/OciNetworkSecurityGroupSecurityRule.ts", "ocd/packages/model/src/validator/provider/oci/resources/OciNetworkSecurityGroupSecurityRule.ts"]},
        ],
        "next": [
            {"issues": [741, 586, 599, 545], "title": "Query and import reliability"},
            {"issues": [781, 782], "title": "Provider schema refresh for latest OCI services and regions"},
            {"issues": [779, 775, 774, 773, 770, 763, 623], "title": "Packaging and runtime fixes"},
        ],
    }


def update_reference_architectures() -> None:
    current = json.loads(REFERENCE_ARCHITECTURES.read_text(encoding="utf-8")) if REFERENCE_ARCHITECTURES.exists() else {}
    oci_entries = [
        entry
        for entry in current.get("oci", [])
        if entry.get("okitFile") not in {"ObservabilityLandingZoneFreeFirst.okit", "ObservabilityLandingZoneEnterprise.okit"}
    ]
    oci_entries.extend(
        [
            {
                "title": "Observability Landing Zone - Free First",
                "description": "One-OE observability add-on baseline with free-first service posture and generated cost assumptions.",
                "okitFile": "ObservabilityLandingZoneFreeFirst.okit",
                "svgFile": "ObservabilityLandingZoneFreeFirst.svg",
            },
            {
                "title": "Observability Landing Zone - Full Enterprise",
                "description": "One-OE observability add-on baseline with explicit paid feature toggles and multi-stack workflow.",
                "okitFile": "ObservabilityLandingZoneEnterprise.okit",
                "svgFile": "ObservabilityLandingZoneEnterprise.svg",
            },
        ]
    )
    current["oci"] = oci_entries
    REFERENCE_ARCHITECTURES.write_text(stable_json(current), encoding="utf-8")


def write_example_outputs() -> None:
    for profile in ("free-first", "full-enterprise"):
        example_dir = EXAMPLES_ROOT / profile
        example_dir.mkdir(parents=True, exist_ok=True)
        (example_dir / "observability.model.json").write_text(stable_json(normalized_model(profile)), encoding="utf-8")
        (example_dir / "observability.auto.tfvars.json").write_text(stable_json(auto_tfvars(profile)), encoding="utf-8")
        (example_dir / "okit-data.json").write_text(stable_json(okit_data(profile)), encoding="utf-8")
        (example_dir / "README.md").write_text(
            f"""# OCI Observability Landing Zone - {profile}

This example is generated from `scripts/generate_observability_lz_library.py`.

Files:

- `observability.model.json` - normalized add-on model contract.
- `observability.auto.tfvars.json` - Terraform variable values with placeholders only.
- `okit-data.json` - OKIT template metadata, view pages, resource counts, and variable bindings.

Use the matching OKIT and Terraform library artifacts from `ocd/library/oci/`.
Replace placeholders locally before deploying through Terraform or OCI Resource Manager.
""",
            encoding="utf-8",
        )
    DEMO_DATA_ROOT.mkdir(parents=True, exist_ok=True)
    (DEMO_DATA_ROOT / "observability-demo-topology.json").write_text(stable_json(demo_topology()), encoding="utf-8")
    (DEMO_DATA_ROOT / "observability-demo-assets.json").write_text(stable_json(demo_assets()), encoding="utf-8")
    BASELINES_ROOT.mkdir(parents=True, exist_ok=True)
    (BASELINES_ROOT / "oci-landing-zones.json").write_text(stable_json(baseline_manifest()), encoding="utf-8")


def terraform_package_readme(profile: str, mode: str) -> str:
    artifact = "main.tf.json" if mode == "json" else "main.tf"
    return f"""# OCI Observability Landing Zone Terraform - {profile} {mode}

This generated folder is a standalone Terraform baseline for the `{profile}` profile.

Files:

- `{artifact}` - Terraform configuration.
- `observability.auto.tfvars.json` - placeholder variable values.

Replace `<TENANCY_OCID>` and `<OCI_REGION>` locally before running Terraform.
The JSON package is the canonical machine export; the HCL package is the operator-readable view.
"""


def resource_manager_manifest(profile: str) -> dict[str, Any]:
    return {
        "schema_version": "oci.okit.resource_manager_manifest.v1",
        "profile": profile,
        "config_source_type": "ZIP_UPLOAD",
        "terraform_entrypoint": "main.tf.json",
        "auto_tfvars": "observability.auto.tfvars.json",
        "contains_sensitive_values": False,
        "placeholders": ["<TENANCY_OCID>", "<OCI_REGION>"],
        "source_files": {
            "terraform_json": f"ocd/library/oci/{profile_stem(profile)}Terraform.tf.json",
            "cost_estimate": f"ocd/library/oci/{profile_stem(profile)}CostEstimate.json",
            "drawio": f"ocd/library/oci/{profile_stem(profile)}.drawio",
        },
        "operator_steps": [
            "Create a Resource Manager stack using ZIP_UPLOAD.",
            "Upload this folder as the stack zip source.",
            "Set tenancy_ocid and region through Resource Manager variables or update observability.auto.tfvars.json locally.",
            "Run plan first. Apply requires explicit operator approval.",
        ],
    }


def resource_manager_readme(profile: str) -> str:
    return f"""# OCI Resource Manager Package - {profile}

This folder is a generated ZIP_UPLOAD source for OCI Resource Manager.

Required operator inputs:

- `tenancy_ocid`
- `region`
- Optional `parent_compartment_ocid`

The package uses Terraform JSON as the deploy artifact and includes the DrawIO architecture plus cost-estimate metadata for review.
"""


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def addon_release_manifest() -> dict[str, Any]:
    files = []
    for path in sorted(ADDON_ROOT.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(ADDON_ROOT).as_posix()
        if relative == "release-manifest.json" or relative.startswith("dist/"):
            continue
        files.append(
            {
                "path": relative,
                "sha256": sha256_file(path),
                "size_bytes": path.stat().st_size,
            }
        )
    return {
        "schema_version": "oci.observability.addon.release_manifest.v1",
        "name": "oci-observability-end-to-end",
        "profiles": ["free-first", "full-enterprise"],
        "file_count": len(files),
        "files": files,
        "commands": {
            "generate": "python scripts/generate_observability_lz_library.py",
            "validate": "python scripts/validate_observability_lz_library.py",
            "validate_terraform": "python scripts/validate_observability_lz_terraform.py",
            "package": "python scripts/package_observability_lz_addon.py",
            "estimate_costs": "python scripts/estimate_observability_lz_costs.py --profile all",
        },
    }


def operator_runbook() -> str:
    return """# OCI Observability End-to-End Operator Runbook

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
"""


def write_addon_outputs() -> None:
    ADDON_ROOT.mkdir(parents=True, exist_ok=True)
    (ADDON_ROOT / "observability.auto.tfvars.json").write_text(stable_json(auto_tfvars("free-first")), encoding="utf-8")
    (ADDON_ROOT / "observability.enterprise.auto.tfvars.json").write_text(stable_json(auto_tfvars("full-enterprise")), encoding="utf-8")
    (ADDON_ROOT / "addon_observability_free_first.json").write_text(stable_json(one_oe_addon_config("free-first")), encoding="utf-8")
    (ADDON_ROOT / "addon_observability_enterprise.json").write_text(stable_json(one_oe_addon_config("full-enterprise")), encoding="utf-8")
    (ADDON_ROOT / "baseline-links.json").write_text(stable_json(baseline_manifest()), encoding="utf-8")
    (ADDON_ROOT / "variables.json").write_text(
        stable_json(
            {
                "schema_version": "oci.oneoe.addon.variables.v1",
                "profiles": {
                    "free-first": {
                        "variables": variable_definitions("free-first"),
                        "tfvars": auto_tfvars("free-first"),
                        "bindings": variable_bindings("free-first"),
                    },
                    "full-enterprise": {
                        "variables": variable_definitions("full-enterprise"),
                        "tfvars": auto_tfvars("full-enterprise"),
                        "bindings": variable_bindings("full-enterprise"),
                    },
                },
            }
        ),
        encoding="utf-8",
    )
    (ADDON_ROOT / "README.md").write_text(
        """# OCI Observability End-to-End Add-on

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
""",
        encoding="utf-8",
    )
    (ADDON_ROOT / "operator-runbook.md").write_text(operator_runbook(), encoding="utf-8")
    for profile in ("free-first", "full-enterprise"):
        hcl_dir = ADDON_ROOT / "terraform" / f"{profile}-hcl"
        json_dir = ADDON_ROOT / "terraform" / f"{profile}-json"
        rms_dir = ADDON_ROOT / "resourcemanager" / profile
        drawio_dir = ADDON_ROOT / "drawio"
        cost_dir = ADDON_ROOT / "cost"
        for directory in (hcl_dir, json_dir, rms_dir, drawio_dir, cost_dir):
            directory.mkdir(parents=True, exist_ok=True)

        tfvars_name = "observability.auto.tfvars.json"
        hcl_dir.joinpath("main.tf").write_text(terraform_hcl(profile), encoding="utf-8")
        hcl_dir.joinpath(tfvars_name).write_text(stable_json(auto_tfvars(profile)), encoding="utf-8")
        hcl_dir.joinpath("README.md").write_text(terraform_package_readme(profile, "hcl"), encoding="utf-8")

        json_dir.joinpath("main.tf.json").write_text(stable_json(terraform_json(profile)), encoding="utf-8")
        json_dir.joinpath(tfvars_name).write_text(stable_json(auto_tfvars(profile)), encoding="utf-8")
        json_dir.joinpath("README.md").write_text(terraform_package_readme(profile, "json"), encoding="utf-8")

        rms_dir.joinpath("main.tf.json").write_text(stable_json(terraform_json(profile)), encoding="utf-8")
        rms_dir.joinpath(tfvars_name).write_text(stable_json(auto_tfvars(profile)), encoding="utf-8")
        rms_dir.joinpath("okit-resource-manager-manifest.json").write_text(stable_json(resource_manager_manifest(profile)), encoding="utf-8")
        rms_dir.joinpath("README_RESOURCE_MANAGER.md").write_text(resource_manager_readme(profile), encoding="utf-8")
        rms_dir.joinpath("cost-estimate.json").write_text(stable_json(cost_estimate(profile)), encoding="utf-8")
        rms_dir.joinpath("usage-api-query.json").write_text(stable_json(usage_api_query(profile)), encoding="utf-8")
        rms_dir.joinpath("architecture.drawio").write_text(drawio(profile), encoding="utf-8")

        drawio_dir.joinpath(f"{profile}.drawio").write_text(drawio(profile), encoding="utf-8")
        cost_dir.joinpath(f"{profile}-cost-estimate.json").write_text(stable_json(cost_estimate(profile)), encoding="utf-8")
        cost_dir.joinpath(f"{profile}-usage-api-query.json").write_text(stable_json(usage_api_query(profile)), encoding="utf-8")
    (ADDON_ROOT / "release-manifest.json").write_text(stable_json(addon_release_manifest()), encoding="utf-8")


def main() -> None:
    OCI_LIBRARY.mkdir(parents=True, exist_ok=True)
    outputs = {
        "ObservabilityLandingZoneFreeFirst.okit": stable_json(base_model("free-first")),
        "ObservabilityLandingZoneEnterprise.okit": stable_json(base_model("full-enterprise")),
        "ObservabilityLandingZoneFreeFirst.svg": svg("Observability Landing Zone", False),
        "ObservabilityLandingZoneEnterprise.svg": svg("Observability Landing Zone", True),
        "ObservabilityLandingZoneFreeFirst.drawio": drawio("free-first"),
        "ObservabilityLandingZoneEnterprise.drawio": drawio("full-enterprise"),
        "ObservabilityLandingZoneFreeFirstCostEstimate.json": stable_json(cost_estimate("free-first")),
        "ObservabilityLandingZoneEnterpriseCostEstimate.json": stable_json(cost_estimate("full-enterprise")),
        "ObservabilityLandingZoneFreeFirstUsageApiQuery.json": stable_json(usage_api_query("free-first")),
        "ObservabilityLandingZoneEnterpriseUsageApiQuery.json": stable_json(usage_api_query("full-enterprise")),
        "ObservabilityLandingZoneFreeFirstResourceManagerPackage.json": stable_json(resource_manager_package("free-first")),
        "ObservabilityLandingZoneEnterpriseResourceManagerPackage.json": stable_json(resource_manager_package("full-enterprise")),
        "ObservabilityLandingZoneOkitCatalog.json": stable_json(okit_catalog()),
        "ObservabilityLandingZoneBaselineSources.json": stable_json(baseline_manifest()),
        "ObservabilityLandingZoneFreeFirstTerraform.tf.json": stable_json(terraform_json("free-first")),
        "ObservabilityLandingZoneEnterpriseTerraform.tf.json": stable_json(terraform_json("full-enterprise")),
        "ObservabilityLandingZoneFreeFirstTerraform.tf": terraform_hcl("free-first"),
        "ObservabilityLandingZoneEnterpriseTerraform.tf": terraform_hcl("full-enterprise"),
        "ObservabilityLandingZoneIssuePlan.json": stable_json(issue_plan()),
    }
    for name, contents in outputs.items():
        (OCI_LIBRARY / name).write_text(contents, encoding="utf-8")
    update_reference_architectures()
    write_example_outputs()
    write_addon_outputs()


if __name__ == "__main__":
    main()
