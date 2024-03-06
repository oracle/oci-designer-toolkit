/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdResourceMap } from "../../types/OcdImporterData";

export const resourceMap: OcdResourceMap = {
    "oci_analytics_analytics_instance": "analytics_instance",
    "oci_bastion_bastion": "bastion",
    "oci_containerengine_cluster": "oke_cluster",
    "oci_containerengine_node_pool": "oke_node_pool",
    "oci_core_boot_volume": "boot_volume",
    "oci_core_boot_volume_attachments": "boot_volume_attachment",
    "oci_core_cpe": "cpe",
    "oci_core_dhcp_options": "dhcp_options",
    "oci_core_drg": "drg",
    "oci_core_drg_attachment": "drg_attachment",
    "oci_core_drg_route_distribution": "drg_route_distribution",
    "oci_core_drg_route_distribution_statement": "drg_route_distribution_statement",
    "oci_core_drg_route_table": "drg_route_table",
    "oci_core_drg_route_table_route_rule": "drg_route_table_route_rule",
    "oci_core_instance": "instance",
    "oci_core_internet_gateway": "internet_gateway",
    "oci_core_ipsec": "ipsec",
    "oci_core_local_peering_gateway": "local_peering_gateway",
    "oci_core_nat_gateway": "nat_gateway",
    "oci_core_network_security_group": "network_security_group",
    "oci_core_network_security_group_security_rule": "network_security_group_security_rule",
    "oci_core_remote_peering_connection": "remote_peering_connection",
    "oci_core_route_table": "route_table",
    "oci_core_security_list": "security_list",
    "oci_core_service_gateway": "service_gateway",
    "oci_core_subnet": "subnet",
    "oci_core_vcn": "vcn",
    "oci_core_vnic": "vnic",
    "oci_core_vnic_attachment": "vnic_attachment",
    "oci_core_volume": "volume",
    "oci_core_volume_attachment": "volume_attachment",
    "oci_database_autonomous_database": "autonomous_database",
    "oci_database_db_system": "db_system",
    "oci_file_storage_file_system": "file_system",
    "oci_file_storage_mount_target": "mount_target",
    "oci_identity_compartment": "compartment",
    "oci_identity_policy": "policy",
    "oci_kms_key": "key",
    "oci_kms_vault": "vault",
    "oci_load_balancer_load_balancer": "load_balancer",
    "oci_load_balancer_backend": "load_balancer_backend",
    "oci_load_balancer_backend_set": "load_balancer_backend_set",
    "oci_load_balancer_listener": "load_balancer_listener",
    "oci_mysql_mysql_db_system": "mysql_db_system",
    "oci_network_load_balancer_network_load_balancer": "network_load_balancer",
    // "oci_network_load_balancer_backend_set": "network_load_balancer_backend_set",
    // "oci_network_load_balancer_listener": "network_load_balancer_listener",
    "oci_nosql_index": "nosql_index",
    "oci_nosql_table": "nosql_table",
    "oci_objectstorage_bucket": "bucket",
    "oci_vault_secret": "secret"
}

export const dataMap: OcdResourceMap = {
    "oci_core_boot_volume_attachments": "boot_volume_attachment"
}
