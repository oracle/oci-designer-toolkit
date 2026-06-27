terraform {
  required_version = ">= 1.5.0"

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 6.0.0"
    }
  }
}

provider "oci" {
  tenancy_ocid = var.tenancy_ocid
  region       = var.region
}

variable "tenancy_ocid" {
  type        = string
  description = "Tenancy OCID. Keep tenant-specific values outside source control."
}

variable "region" {
  type        = string
  description = "OCI region identifier."
}

variable "parent_compartment_ocid" {
  type        = string
  description = "Parent compartment OCID for generated landing-zone compartments. Defaults to tenancy_ocid when null."
  default     = null
}

variable "network_compartment_name" {
  type        = string
  description = "Network shared-services compartment name."
  default     = "cmp-lz-network"
}

variable "observability_compartment_name" {
  type        = string
  description = "Observability shared-services compartment name."
  default     = "cmp-lz-observability"
}

variable "vcn_cidr_blocks" {
  type        = list(string)
  description = "CIDR blocks for the observability hub VCN."
  default     = ["10.100.0.0/16"]
}

variable "private_subnet_cidr" {
  type        = string
  description = "CIDR block for the private observability subnet."
  default     = "10.100.10.0/24"
}

variable "hub_vcn_dns_label" {
  type        = string
  description = "DNS label for the observability hub VCN."
  default     = "obshub"
}

variable "private_subnet_dns_label" {
  type        = string
  description = "DNS label for the private observability subnet."
  default     = "obspriv"
}

variable "notification_topic_name" {
  type        = string
  description = "Notifications topic name for observability alarms."
  default     = "observability-alarm-topic"
}

variable "alarm_cpu_threshold" {
  type        = number
  description = "Template CPU alarm threshold."
  default     = 90
}

variable "enable_streaming" {
  type        = bool
  description = "Enable paid Streaming baseline resources for enterprise observability flows."
  default     = false
}

variable "enable_apm" {
  type        = bool
  description = "Enable APM service pack metadata and operator recipes."
  default     = true
}

variable "enable_log_analytics" {
  type        = bool
  description = "Enable Log Analytics service pack metadata and importer recipes."
  default     = true
}

variable "enable_management_agent" {
  type        = bool
  description = "Enable Management Agent installation and association recipes."
  default     = true
}

variable "enable_database_management" {
  type        = bool
  description = "Enable DB Management Basic baseline. Full Management remains an explicit paid add-on outside this baseline."
  default     = false
}

variable "enable_oke_monitoring" {
  type        = bool
  description = "Enable OKE monitoring and logging Helm values in generated examples."
  default     = false
}

locals {
  profile               = "free-first"
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
  common_tags = {
    ManagedBy = "okit-observability-landing-zone"
    Profile   = "free-first"
  }
}

data "oci_core_services" "all_region_services" {
  filter {
    name   = "name"
    values = ["All .* Services In Oracle Services Network"]
    regex  = true
  }
}

resource "oci_identity_compartment" "network_shared_services" {
  compartment_id = local.parent_compartment_id
  name           = var.network_compartment_name
  description    = "Network shared services compartment for the observability landing zone baseline."
  enable_delete  = true
  freeform_tags  = local.common_tags
}

resource "oci_identity_compartment" "observability_shared_services" {
  compartment_id = local.parent_compartment_id
  name           = var.observability_compartment_name
  description    = "Observability shared services compartment."
  enable_delete  = true
  freeform_tags  = local.common_tags
}

resource "oci_core_vcn" "observability_hub" {
  compartment_id = oci_identity_compartment.network_shared_services.id
  display_name   = "observability-hub-vcn-free_first"
  cidr_blocks    = var.vcn_cidr_blocks
  dns_label      = var.hub_vcn_dns_label
  freeform_tags  = local.common_tags
}

resource "oci_core_service_gateway" "oci_services" {
  compartment_id = oci_identity_compartment.network_shared_services.id
  display_name   = "observability-oci-services-gateway"
  vcn_id         = oci_core_vcn.observability_hub.id
  freeform_tags  = local.common_tags

  services {
    service_id = data.oci_core_services.all_region_services.services[0].id
  }
}

resource "oci_core_route_table" "private" {
  compartment_id = oci_identity_compartment.network_shared_services.id
  display_name   = "observability-private-routes"
  vcn_id         = oci_core_vcn.observability_hub.id
  freeform_tags  = local.common_tags

  route_rules {
    description       = "OCI service access for agents and service connectors."
    destination       = "all-region-services-in-oracle-services-network"
    destination_type  = "SERVICE_CIDR_BLOCK"
    network_entity_id = oci_core_service_gateway.oci_services.id
  }
}

resource "oci_core_security_list" "private" {
  compartment_id = oci_identity_compartment.network_shared_services.id
  display_name   = "observability-private-security-list"
  vcn_id         = oci_core_vcn.observability_hub.id
  freeform_tags  = local.common_tags

  egress_security_rules {
    description      = "Controlled egress for observability agents and service connectors."
    destination      = "0.0.0.0/0"
    destination_type = "CIDR_BLOCK"
    protocol         = "all"
    stateless        = false
  }
}

resource "oci_core_subnet" "observability_private" {
  compartment_id             = oci_identity_compartment.network_shared_services.id
  display_name               = "observability-private-subnet"
  vcn_id                     = oci_core_vcn.observability_hub.id
  cidr_block                 = var.private_subnet_cidr
  dns_label                  = var.private_subnet_dns_label
  prohibit_public_ip_on_vnic = true
  route_table_id             = oci_core_route_table.private.id
  security_list_ids          = [oci_core_security_list.private.id]
  freeform_tags              = local.common_tags
}

resource "oci_logging_log_group" "observability" {
  compartment_id = oci_identity_compartment.observability_shared_services.id
  display_name   = "observability-log-group"
  description    = "Landing-zone log group for audit, service, and application logs."
  freeform_tags  = local.common_tags
}

resource "oci_ons_notification_topic" "observability" {
  compartment_id = oci_identity_compartment.observability_shared_services.id
  name           = var.notification_topic_name
  description    = "Notification target for landing-zone observability alarms."
  freeform_tags  = local.common_tags
}

resource "oci_monitoring_alarm" "high_cpu_placeholder" {
  compartment_id        = oci_identity_compartment.observability_shared_services.id
  display_name          = "observability-high-cpu-template"
  destinations          = [oci_ons_notification_topic.observability.id]
  is_enabled            = true
  metric_compartment_id = oci_identity_compartment.observability_shared_services.id
  namespace             = "oci_computeagent"
  query                 = "CpuUtilization[1m].mean() > ${var.alarm_cpu_threshold}"
  severity              = "WARNING"
  body                  = "Template alarm. Scope metric_compartment_id to the target workload compartment before production use."
  freeform_tags         = local.common_tags
}

resource "oci_streaming_stream_pool" "observability" {
  count          = var.enable_streaming ? 1 : 0
  compartment_id = oci_identity_compartment.observability_shared_services.id
  name           = "observability-stream-pool"
  freeform_tags  = local.common_tags
}

resource "oci_streaming_stream" "observability_events" {
  count          = var.enable_streaming ? 1 : 0
  name           = "observability-events"
  partitions     = 1
  stream_pool_id = oci_streaming_stream_pool.observability[0].id
  freeform_tags  = local.common_tags
}

output "observability_compartment_id" {
  value = oci_identity_compartment.observability_shared_services.id
}

output "observability_log_group_id" {
  value = oci_logging_log_group.observability.id
}

output "notification_topic_id" {
  value = oci_ons_notification_topic.observability.id
}

output "enabled_service_packs" {
  value = local.enabled_service_packs
}
