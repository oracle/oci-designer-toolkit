/*
** Copyright (c) 2020, 2023, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/

import { OcdIgnoreElements } from "../../types/OcdImporterData";

export const ignoreElements: OcdIgnoreElements = {
    "common": [
        "created_by",
        "id",
        "inactive_state",
        "is_accessible",
        "state",
        "system_tags",
        "time_created",
        "timeouts"
    ],
    "oci_containerengine_cluster": [
        "endpoints",
        "metadata"
    ],
    "oci_containerengine_node_pool": [
        "node_source",
        "nodes"
    ],
    "oci_core_drg": [
        "default_drg_route_tables",
        "default_export_drg_route_distribution_id"
    ],
    "oci_core_drg_attachment": [
        "remove_export_drg_route_distribution_trigger"
    ],
    "oci_core_instance": [
        "assign_private_dns_record",
        "availability_config",
        "baseline_ocpu_utilization",
        "boot_volume_id",
        "capacity_reservation_id",
        "compute_cluster_id",
        "dedicated_vm_host_id",
        "extended_metadata",
        "gpu_description",
        "gpus",
        "instance_configuration_id",
        "instance_options",
        "instance_source_image_filter_details",
        "ipxe_script",
        "launch_mode",
        "launch_options",
        "local_disk_description",
        "local_disks",
        "local_disks_total_size_in_gbs",
        "max_vnic_attachments",
        "networking_bandwidth_in_gbps",
        "nvmes",
        "platform_config",
        "preemptible_instance_config",
        "preserve_boot_volume",
        "private_ip",
        "processor_description",
        "public_ip",
        "time_maintenance_reboot_due",
        "update_operation_constraint",
        "vcpus",
        "vlan_id"
    ],
    "oci_core_nat_gateway": [
        "nat_ip",
        "public_ip_id"
    ],
    "oci_core_subnet": [
        "ipv6virtual_router_ip",
        "subnet_domain_name",
        "virtual_router_ip",
        "virtual_router_mac"
    ],
    "oci_core_volume": [
        "is_auto_tune_enabled",
        "size_in_mbs"
    ],
    "oci_core_volume_attachment": [
        "chap_secret",
        "chap_username",
        "ipv4",
        "iqn",
        "iscsi_login_state",
        "multipath_devices"
    ],
    "oci_core_vcn": [
        "byoipv6cidr_blocks",
        "byoipv6cidr_details",
        "cidr_block",
        "default_dhcp_options_id",
        "default_route_table_id",
        "default_security_list_id",
        "ipv6cidr_blocks",
        "ipv6public_cidr_block",
        "vcn_domain_name"
    ],
    "oci_database_autonomous_database": [
        "actual_used_data_storage_size_in_tbs",
        "allocated_storage_size_in_tbs",
        "available_upgrade_versions",
        "apex_details",
        "backup_config",
        "connection_strings",
        "connection_urls",
        "database_management_status",
        "dataguard_region_type",
        "db_name",
        "disaster_recovery_region_type",
        "failed_data_recovery_in_seconds",
        "infrastructure_type",
        "is_preview",
        "is_reconnect_clone_enabled",
        "is_refreshable_clone",
        "is_remote_data_guard_enabled",
        "is_shrink_only",
        "key_history_entry",
        "key_store_id",
        "key_store_wallet_name",
        "kms_key_lifecycle_details",
        "kms_key_version_id",
        "local_adg_auto_failover_max_data_loss_limit",
        "local_disaster_recovery_type",
        "local_standby_db",
        "long_term_backup_schedule",
        "memory_per_oracle_compute_unit_in_gbs",
        "next_long_term_backup_time_stamp",
        "open_mode",
        "operations_insights_status",
        "peer_db_ids",
        "permission_level",
        "private_endpoint_ip",
        "private_endpoint_label",
        "provisionable_cpus",
        "refreshable_status",
        "remote_disaster_recovery_configuration",
        "remote_disaster_recovery_type",
        "role",
        "rotate_key_trigger",
        "standby_db",
        "supported_regions_to_clone_to",
        "switchover_to",
        "switchover_to_remote_peer_id",
        "time_data_guard_role_changed",
        "time_deletion_of_free_autonomous_database",
        "time_disaster_recovery_role_changed",
        "time_local_data_guard_enabled",
        "time_until_reconnect_clone_enabled",
        "time_maintenance_begin",
        "time_maintenance_end",
        "time_of_last_failover",
        "time_of_last_refresh",
        "time_of_last_refresh_point",
        "time_of_last_switchover",
        "time_of_next_refresh",
        "time_reclamation_of_free_autonomous_database",
        "total_backup_storage_size_in_gbs",
        "used_data_storage_size_in_gbs",
        "used_data_storage_size_in_tbs",
        "scheduled_operations"
    ],
    "oci_database_db_system": [
        "connection_strings",
        "iorm_config_cache",
        "maintenance_window"
    ],
    "oci_file_storage_file_system": [
        "source_details"
    ],
    "oci_kms_key": [
        "replica_details"
    ],
    "oci_kms_vault": [
        "replica_details"
    ],
    "oci_load_balancer_load_balancer": [
        "ip_address_details"
    ],
    "oci_mysql_mysql_db_system": [
        "analytics_cluster",
        "channels",
        "current_placement",
        "endpoints",
        "heat_wave_cluster",
        "point_in_time_recovery_details"
    ],
    "oci_network_load_balancer_network_load_balancer": [
        "ip_addresses"
    ],
    "oci_nosql_table": [
        "schema"
    ],
    "oci_objectstorage_bucket": [
        "etag",
        "object_lifecycle_policy_etag"
    ]
}