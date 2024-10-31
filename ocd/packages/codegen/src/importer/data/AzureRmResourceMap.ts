/*
** Copyright (c) 2020, 2024, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdIncludedElements, OcdResourceMap } from "../../types/OcdImporterData.js";

export const resourceMap: OcdResourceMap = {
    "azurerm_application_load_balancer": "load_balancer",
    "azurerm_container_registry": "container_registry",
    "azurerm_dns_zone": "dns_zone",
    "azurerm_kubernetes_cluster": "kubernetes_cluster",
    "azurerm_resource_group": "resource_group",
    "azurerm_mssql_server": "mssql_server",
    "azurerm_oracle_exadata_infrastructure": "oracle_exadata_infrastructure",
    "azurerm_oracle_autonomous_database": "oracle_autonomous_database",
    "azurerm_oracle_cloud_vm_cluster": "oracle_cloud_vm_cluster",
    "azurerm_subnet": "subnet",
    "azurerm_virtual_machine": "virtual_machine",
    "azurerm_virtual_network": "virtual_network",
}

export const dataMap: OcdResourceMap = {}

export const resourceAttributes: OcdIncludedElements = {
    "common": [
        "location",
        "name",
        "resource_group_name",
        "tags"
    ],
    "azurerm_application_load_balancer": [
        "primary_configuration_endpoint"
    ],
    "azurerm_container_registry": [
        "admin_enabled",
        "admin_password",
        "admin_username"
    ],
    "azurerm_dns_zone": [
        "max_number_of_record_sets",
        "name_servers"
    ],
    "azurerm_kubernetes_cluster":[
        "kubernetes_version",
        "private_dns_zone_id"
    ],
    "azurerm_resource_group": [
        "managed_by"
    ],
    "azurerm_mssql_server": [
        "administrator_login",
        "administrator_login_password",
        "version"
    ],
    "azurerm_oracle_exadata_infrastructure": [
        "compute_count",
        "display_name",
        "shape"
    ],
    "azurerm_oracle_autonomous_database": [
        "admin_password",
        "auto_scaling_enabled",
        "auto_scaling_for_storage_enabled",
        "backup_retention_period_in_days",
        "cpu_core_count",
        "data_storage_size_in_tbs",
        "db_name",
        "db_version",
        "db_workload",
        "display_name",
        "in_memory_area_in_gbs",
        "in_memory_percentage",
        "is_data_guard_enabled",
        "is_dedicated",
        "is_local_data_guard_enabled",
        "is_mtls_connection_required",
        "kms_key_id",
        "license_model",
        "subnet_id",
        "virtual_network_id",
    ],
    "azurerm_oracle_cloud_vm_cluster": [
        "backup_subnet_cidr",
        "cluster_name",
        "cpu_core_count"
    ],
    "azurerm_subnet": [
        "virtual_network_name"
    ],
    "azurerm_virtual_machine": [
        "license_type"
    ],
    "azurerm_virtual_network": [
        "address_space",
        "dns_servers",
    ]
}
