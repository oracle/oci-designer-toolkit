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
    "oci_analytics_analytics_instance":[
    ],
    "oci_containerengine_cluster": [
        "endpoints",
        "metadata"
    ],
    "oci_containerengine_node_pool": [
        "node_source",
        "nodes"
    ],
    "oci_core_boot_volume": [
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
        "remove_export_drg_route_distribution_trigger",
        "network_details.ipsec_connection_id",
        "vcn_id"
    ],
    "oci_core_instance": [
        "async",
        "availability_config",
        "boot_volume_id",
        "capacity_reservation_id",
        "compute_cluster_id",
        "create_vnic_details.assign_private_dns_record",
        "create_vnic_details.private_ip",
        "create_vnic_details.vlan_id",
        "dedicated_vm_host_id",
        "extended_metadata",
        "shape_config.gpu_description",
        "shape_config.gpus",
        "instance_configuration_id",
        "instance_options",
        "ipxe_script",
        "is_cross_numa_node",
        "launch_mode",
        "launch_options",
        "launch_volume_attachments",
        "platform_config",
        "plugins_config",
        "preemptible_instance_config",
        "preserve_boot_volume",
        "public_ip",
        "shape_config.baseline_ocpu_utilization",
        "shape_config.processor_description",
        "shape_config.local_disk_description",
        "shape_config.local_disks",
        "shape_config.local_disks_total_size_in_gbs",
        "shape_config.max_vnic_attachments",
        "shape_config.networking_bandwidth_in_gbps",
        "shape_config.nvmes",
        "shape_config.vcpus",
        "source_details.boot_volume_vpus_per_gb",
        "source_details.instance_source_image_filter_details",
        "time_maintenance_reboot_due",
        "update_operation_constraint"
    ],
    "oci_core_internet_gateway": [
        "route_table_id"
    ],
    "oci_core_ipsec": [
        "cpe_local_identifier",
        "cpe_local_identifier_type"
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
    "oci_core_remote_peering_connection": [
        "is_cross_tenancy_peering",
        "peering_status"
    ],
    "oci_core_route_table": [
        "route_rules.route_type"
    ],
    "oci_core_service_gateway": [
        "block_traffic",
        "services.service_name"
    ],
    "oci_core_subnet": [
        "ipv6virtual_router_ip",
        "prohibit_internet_ingress",
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
        "auto_refresh_frequency_in_seconds",
        "auto_refresh_point_lag_in_seconds",
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
        "db_tools_details",
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
        "resource_pool_summary",
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
        "backup_network_nsg_ids",
        "backup_subnet_id",

        "db_home.database.backup_id",
        "db_home.database.backup_tde_password",
        "db_home.database.character_set",
        "db_home.database.connection_strings",
        "db_home.database.database_id",
        "db_home.database.db_backup_config",
        "db_home.database.db_unique_name",
        "db_home.database.db_workload",
        "db_home.database.defined_tags",
        "db_home.database.freeform_tags",
        "db_home.database.id",
        "db_home.database.kms_key_version_id",
        "db_home.database.ncharacter_set",
        "db_home.database.lifecycle_details",
        "db_home.database.software_image_id",
        "db_home.database.state",
        "db_home.database.time_created",
        "db_home.database.time_stamp_for_point_in_time_recovery",

        "db_home.create_async",
        "db_home.db_home_location",
        "db_home.defined_tags",
        "db_home.freeform_tags",
        "db_home.id",
        "db_home.last_patch_history_entry_id",
        "db_home.lifecycle_details",
        "db_home.state",
        "db_home.time_created",

        "db_system_options",
        "disk_redundancy",
        "iorm_config_cache",
        "kms_key_version_id",
        "last_maintenance_run_id",
        "last_patch_history_entry_id",
        "listener_port",
        "maintenance_window",
        "maintenance_window_details",
        "memory_size_in_gbs",
        "next_maintenance_run_id",
        "os_version",
        "private_ip",
        "point_in_time_data_disk_clone_timestamp",
        "reco_storage_size_in_gb",
        "scan_dns_name",
        "scan_dns_record_id",
        "scan_ip_ids",
        "source",
        "source_db_system_id",
        "sparse_diskgroup",
        "storage_volume_performance_mode",
        "time_zone",
        "version",
        "vip_ids",
        "zone_id"
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
    "oci_identity_user": [
        "capabilities",
        "db_user_name",
        "email_verified",
        "external_identifier",
        "identity_provider_id",
        "last_successful_login_time",
        "previous_successful_login_time"
    ],
    "oci_kms_key": [
        "auto_key_rotation_details",
        "current_key_version",
        "desired_state",
        "external_key_reference",
        "external_key_reference_details",
        "is_auto_rotation_enabled",
        "replica_details",
        "restore_trigger",
        "restored_from_key_id",
        "time_of_deletion",
        "restore_from_file",
        "restore_from_object_store"
    ],
    "oci_kms_vault": [
        "crypto_endpoint",
        "external_key_manager_metadata",
        "external_key_manager_metadata_summary",
        "replica_details",
        "management_endpoint",
        "restore_trigger",
        "restored_from_vault_id",
        "time_of_deletion",
        "restore_from_file",
        "restore_from_object_store"
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
        "point_in_time_recovery_details",
        "secure_connections"
    ],
    "oci_network_load_balancer_network_load_balancer": [
        "ip_addresses",
        "reserved_ips"
    ],
    "oci_network_load_balancer_backend": [
    ],
    "oci_network_load_balancer_backend_set": [
        "backend"
    ],
    "oci_nosql_table": [
        "replicas",
        "schema"
    ],
    "oci_objectstorage_bucket": [
        "etag",
        "object_lifecycle_policy_etag",
        "retention_rules.time_created"
    ],
    "oci_vault_secret": [
        "current_version_number",
        "metadata",
        "rotation_config",
        "secret_content.stage",
        "secret_rules",
        "time_of_current_version_expiry",
        "time_of_deletion"
    ],
}