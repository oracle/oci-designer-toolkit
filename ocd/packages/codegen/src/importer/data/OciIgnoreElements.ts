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
        "lifecycle_details",
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
    "oci_core_boot_volume_attachments": [
        "boot_volume_attachments",
        "filter"
    ],
    "oci_core_drg": [
        "default_drg_route_tables",
        "default_export_drg_route_distribution_id",
        "redundancy_status"
    ],
    "oci_core_drg_attachment": [
        "remove_export_drg_route_distribution_trigger"
    ],
    "oci_core_instance": [
        "assign_private_dns_record",
        "async",
        "availability_config",
        "baseline_ocpu_utilization",
        "boot_volume_id",
        "boot_volume_vpus_per_gb",
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
        "is_cross_numa_node",
        "launch_mode",
        "launch_options",
        "local_disk_description",
        "local_disks",
        "local_disks_total_size_in_gbs",
        "max_vnic_attachments",
        "networking_bandwidth_in_gbps",
        "nvmes",
        "platform_config",
        "plugins_config",
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
    "oci_core_internet_gateway": [
        "route_table_id"
    ],
    "oci_core_local_peering_gateway": [
        "is_cross_tenancy_peering",
        "peer_advertised_cidr",
        "peer_advertised_cidr_details",
        "peering_status",
        "peering_status_details"
    ],
    "oci_core_nat_gateway": [
        "nat_ip",
        "public_ip_id",
        "route_table_id"
    ],
    "oci_core_network_security_group_security_rule": [
        "is_valid"
    ],
    "oci_core_route_table": [
        "route_type"
    ],
    "oci_core_subnet": [
        "ipv6virtual_router_ip",
        "subnet_domain_name",
        "virtual_router_ip",
        "virtual_router_mac"
    ],
    "oci_core_volume": [
        "auto_tuned_vpus_per_gb",
        "autotune_policies",
        "block_volume_replicas",
        "block_volume_replicas_deletion",
        "is_auto_tune_enabled",
        "is_hydrated",
        "size_in_mbs",
        "source_details",
        "volume_backup_id",
        "volume_group_id"
    ],
    "oci_core_volume_attachment": [
        "availability_domain",
        "chap_secret",
        "chap_username",
        "encryption_in_transit_type",
        "ipv4",
        "iqn",
        "iscsi_login_state",
        "is_multipath",
        "multipath_devices",
        "port"
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
        "is_oracle_gua_allocation_enabled",
        "vcn_domain_name"
    ],
    "oci_database_autonomous_database": [
        "actual_used_data_storage_size_in_tbs",
        "allocated_storage_size_in_tbs",
        "are_primary_whitelisted_ips_used",
        "autonomous_container_database_id",
        "autonomous_database_backup_id",
        "autonomous_database_id",
        "autonomous_maintenance_schedule_type",
        "available_upgrade_versions",
        "apex_details",
        "backup_config",
        "character_set",
        "clone_type",
        "compute_count",
        "compute_model",
        "connection_strings",
        "connection_urls",
        "customer_contacts",
        "database_edition",
        "database_management_status",
        "dataguard_region_type",
        "data_safe_status",
        "data_storage_size_in_gb",
        "disaster_recovery_region_type",
        "failed_data_recovery_in_seconds",
        "infrastructure_type",
        "is_access_control_enabled",
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
        "lifecycle_details",
        "local_adg_auto_failover_max_data_loss_limit",
        "local_disaster_recovery_type",
        "local_standby_db",
        "long_term_backup_schedule",
        "max_cpu_core_count",
        "memory_per_oracle_compute_unit_in_gbs",
        "ncharacter_set",
        "next_long_term_backup_time_stamp",
        "ocpu_count",
        "open_mode",
        "operations_insights_status",
        "peer_db_ids",
        "permission_level",
        "private_endpoint_ip",
        "private_endpoint_label",
        "provisionable_cpus",
        "refreshable_mode",
        "refreshable_status",
        "remote_disaster_recovery_configuration",
        "remote_disaster_recovery_type",
        "role",
        "rotate_key_trigger",
        "source_id",
        "source",
        "standby_db",
        "standby_whitelisted_ips",
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
        "timestamp",
        "total_backup_storage_size_in_gbs",
        "use_latest_available_backup_time_stamp",
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
        "is_clone_parent",
        "is_hydrated",
        "is_targetable",
        "lifecycle_details",
        "metered_bytes",
        "replication_target_id",
        "source_details",
        "source_snapshot_id"
    ],
    "oci_file_storage_mount_target": [
        "idmap_type",
        "kerberos",
        "ldap_idmap",
        "private_ip"
    ],
    "oci_kms_key": [
        "replica_details"
    ],
    "oci_kms_vault": [
        "replica_details"
    ],
    "oci_load_balancer_load_balancer": [
        "ip_address_details",
        "reserved_ips"
    ],
    "oci_load_balancer_backend": [
    ],
    "oci_load_balancer_backend_set": [
        "backend",
        "lb_cookie_session_persistence_configuration",
        "session_persistence_configuration",
        "ssl_configuration"
    ],
    "oci_load_balancer_listener": [
        "connection_configuration",
        "ssl_configuration"
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
    "oci_network_load_balancer_backend": [
    ],
    "oci_network_load_balancer_backend_set": [
        "backend"
    ],
    "oci_nosql_table": [
        "schema"
    ],
    "oci_objectstorage_bucket": [
        "etag",
        "object_lifecycle_policy_etag"
    ]
}